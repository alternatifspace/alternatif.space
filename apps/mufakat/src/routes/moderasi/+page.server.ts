import { error, fail } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import { invokeEdge } from '$lib/server/edge';
import type { Actions, PageServerLoad } from './$types';

export interface QueueSubject {
	thread_slug: string;
	thread_title: string;
	comment_id: string | null;
	excerpt: string | null;
}

function excerptFromHtml(html: string | null): string | null {
	if (!html) return null;
	const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	return text ? text.slice(0, 160) : null;
}

// /moderasi (TRD §11, §15, 6.34): admin dashboard — report queue, semantic
// flag queue, pending dedup-reference confirmations. The gate lives here, not
// in a layout: /moderasi/log below stays public.
export const load: PageServerLoad = async (event) => {
	const { isAdmin } = await event.parent();
	if (!isAdmin) error(404, 'Halaman tidak ditemukan');

	const db = supabaseServer(event);

	// RLS: admins read all reports/flags (00005); reads return [] otherwise.
	const [{ data: reports }, { data: flags }, { data: dedupSplits }] = await Promise.all([
		db
			.from('mufakat_reports')
			.select('id, subject_type, subject_id, category, note, created_at')
			.eq('status', 'pending')
			.order('created_at'),
		db
			.from('mufakat_semantic_flags')
			.select('comment_id, created_at')
			.eq('status', 'pending')
			.order('created_at'),
		db
			.from('mufakat_splits')
			.select(
				'id, source_thread_id, source_comment_id, target_thread_id, reaction_count_at_split, created_at'
			)
			.eq('type', 'dedup_reference')
			.order('created_at')
	]);

	// Flags group by comment chain head; 3+ on one chain = elevated (M0-14).
	const flagCounts = new Map<string, { count: number; oldest: string }>();
	for (const f of flags ?? []) {
		const entry = flagCounts.get(f.comment_id);
		if (entry) entry.count += 1;
		else flagCounts.set(f.comment_id, { count: 1, oldest: f.created_at });
	}

	const commentIds = [
		...new Set([
			...(reports ?? []).filter((r) => r.subject_type === 'comment').map((r) => r.subject_id),
			...flagCounts.keys(),
			...(dedupSplits ?? []).map((s) => s.source_comment_id).filter(Boolean)
		])
	] as string[];

	// Content ONLY via the public view (Q12) — pending subjects are visible.
	const { data: comments } = commentIds.length
		? await db
				.from('mufakat_comments_public')
				.select('id, thread_id, html, state')
				.in('id', commentIds)
		: { data: [] };
	const commentById = new Map((comments ?? []).map((c) => [c.id, c]));

	const threadIds = [
		...new Set([
			...(reports ?? []).filter((r) => r.subject_type === 'thread').map((r) => r.subject_id),
			...(comments ?? []).map((c) => c.thread_id),
			...(dedupSplits ?? []).flatMap((s) => [s.source_thread_id, s.target_thread_id])
		])
	] as string[];
	const { data: threads } = threadIds.length
		? await db.from('mufakat_threads').select('id, slug, title').in('id', threadIds)
		: { data: [] };
	const threadById = new Map((threads ?? []).map((t) => [t.id, t]));

	const subjectFor = (type: string, id: string): QueueSubject | null => {
		if (type === 'thread') {
			const t = threadById.get(id);
			return t
				? { thread_slug: t.slug, thread_title: t.title, comment_id: null, excerpt: null }
				: null;
		}
		const c = commentById.get(id);
		const t = c ? threadById.get(c.thread_id) : null;
		return c && t
			? {
					thread_slug: t.slug,
					thread_title: t.title,
					comment_id: c.id,
					excerpt: excerptFromHtml(c.html)
				}
			: null;
	};

	return {
		reports: (reports ?? []).map((r) => ({
			id: r.id,
			subject_type: r.subject_type as 'thread' | 'comment',
			category: r.category as string,
			note: r.note as string | null,
			created_at: r.created_at as string,
			subject: subjectFor(r.subject_type, r.subject_id)
		})),
		flagQueue: [...flagCounts.entries()]
			.map(([comment_id, { count, oldest }]) => {
				const c = commentById.get(comment_id);
				const t = c ? threadById.get(c.thread_id) : null;
				return {
					comment_id,
					count,
					oldest,
					thread_id: c?.thread_id ?? null,
					thread_slug: t?.slug ?? null,
					thread_title: t?.title ?? null,
					excerpt: excerptFromHtml(c?.html ?? null)
				};
			})
			// 3+ flags on the same chain → elevated priority (M0-14, 6.33).
			.sort((a, b) => b.count - a.count || a.oldest.localeCompare(b.oldest)),
		// A dedup split is pending while its seed comment is still visible.
		dedupQueue: (dedupSplits ?? [])
			.filter((s) => commentById.get(s.source_comment_id)?.state === 'visible')
			.map((s) => ({
				id: s.id,
				created_at: s.created_at as string,
				reaction_count: (s.reaction_count_at_split as number) ?? 0,
				excerpt: excerptFromHtml(commentById.get(s.source_comment_id)?.html ?? null),
				source: threadById.get(s.source_thread_id) ?? null,
				target: threadById.get(s.target_thread_id) ?? null
			}))
	};
};

export const actions: Actions = {
	// Report review (M0-16, 6.35): dismiss / hide / escalate via Edge Function —
	// it writes the moderation log and flips the content state.
	review: async (event) => {
		const form = await event.request.formData();
		const res = await invokeEdge(event, 'mufakat-review-report', {
			report_id: form.get('report_id') as string,
			action: form.get('action') as string
		});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		return { reviewed: true };
	},

	// Dedup-reference confirmation (M0-09, 6.37): confirm → seed becomes a scar
	// to the existing thread; reject → full good-question split executes.
	dedup: async (event) => {
		const form = await event.request.formData();
		const res = await invokeEdge(event, 'mufakat-confirm-dedup-reference', {
			split_id: form.get('split_id') as string,
			action: form.get('action') as string
		});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		return { dedupResolved: true };
	},

	// Flag dismissal (M0-14): direct update under the admin RLS policy (00008).
	// Resolution-by-spinoff happens on /moderasi/spinoff/[id] instead.
	dismissFlags: async (event) => {
		const form = await event.request.formData();
		const db = supabaseServer(event);
		const { error: err } = await db
			.from('mufakat_semantic_flags')
			.update({ status: 'dismissed' })
			.eq('comment_id', form.get('comment_id') as string)
			.eq('status', 'pending');
		if (err) return fail(500, { error: err.message });
		return { flagsDismissed: true };
	}
};
