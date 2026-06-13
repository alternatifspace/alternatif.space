import { error, fail, redirect } from '@sveltejs/kit';
import { tiptapToHtml } from '@alternatif/ui/tiptap';
import { supabaseServer } from '$lib/supabase';
import { invokeEdge } from '$lib/server/edge';
import type { CommentNodeData, CommentRow, MarkerData, PartyRef, Thread } from '$lib/types';
import type { ThreadStatus } from '@alternatif/ui';
import type { Actions, PageServerLoad } from './$types';

// Summary HTML is rendered from the trusted JSON via the shared safe
// serializer — never from a stored/client HTML string (prevents stored XSS;
// @tiptap/html would emit `javascript:` link hrefs verbatim).
function tiptapHtml(json: unknown): string | null {
	return tiptapToHtml(json);
}

// Thread page (M0-04, TRD §11): interleaves three positionally anchored row
// types — comments by state, placeholder cards (moved scars), and spin-off
// markers whose status/summary are read LIVE from the target thread (§9.4).
export const load: PageServerLoad = async (event) => {
	const db = supabaseServer(event);
	const { userId } = event.locals.auth();

	const { data: thread } = await db
		.from('mufakat_threads')
		.select('*')
		.eq('slug', event.params.slug)
		.maybeSingle<Thread>();
	if (!thread) error(404, 'Diskusi tidak ditemukan');

	// Redirected duplicates point home permanently (M0-02).
	let redirectTarget: { slug: string; title: string } | null = null;
	if (thread.status === 'dialihkan' && thread.redirect_to) {
		const { data: target } = await db
			.from('mufakat_threads')
			.select('slug, title')
			.eq('id', thread.redirect_to)
			.maybeSingle();
		redirectTarget = target;
	}

	// Comments come ONLY from the public view (TRD §7, Q12).
	const { data: commentRows } = await db
		.from('mufakat_comments_public')
		.select('*')
		.eq('thread_id', thread.id)
		.order('created_at');
	const comments = (commentRows ?? []) as CommentRow[];
	const commentIds = comments.map((c) => c.id);

	const authorIds = [...new Set(comments.map((c) => c.author_id))];
	const authorPartyIds = [
		...new Set([
			...comments.map((c) => c.author_party_id).filter(Boolean),
			...(thread.op_party_id ? [thread.op_party_id] : [])
		])
	];
	const movedTargetIds = [
		...new Set(comments.map((c) => c.moved_to_thread_id).filter(Boolean))
	] as string[];

	const [
		{ data: authors },
		{ data: parties },
		{ data: reactions },
		{ data: markers },
		{ data: splits },
		{ data: opPendingSplit }
	] = await Promise.all([
		authorIds.length
			? db.from('users').select('id, display_name').in('id', authorIds)
			: Promise.resolve({ data: [] }),
		authorPartyIds.length
			? db.from('parties').select('id, slug, name, logo_url').in('id', authorPartyIds)
			: Promise.resolve({ data: [] }),
		commentIds.length || true
			? db
					.from('mufakat_reactions')
					.select('comment_id, thread_id, user_id, type')
					.or(
						commentIds.length
							? `thread_id.eq.${thread.id},comment_id.in.(${commentIds.join(',')})`
							: `thread_id.eq.${thread.id}`
					)
			: Promise.resolve({ data: [] }),
		db
			.from('mufakat_markers')
			.select('id, after_comment_id, split_id, kind, label')
			.eq('thread_id', thread.id)
			.order('created_at'),
		db
			.from('mufakat_splits')
			.select('id, type, source_comment_id, target_thread_id, reaction_count_at_split, op_status')
			.eq('source_thread_id', thread.id),
		// OP-ship window (M0-09): pending split targeting THIS thread.
		db
			.from('mufakat_splits')
			.select('id, op_status, op_window_ends_at')
			.eq('target_thread_id', thread.id)
			.eq('type', 'good_question')
			.eq('op_status', 'pending')
			.maybeSingle()
	]);

	// Live reads for placeholder cards and markers (one batch).
	const markerSplitIds = (markers ?? []).map((m) => m.split_id);
	const markerSplits = (splits ?? []).filter((s) => markerSplitIds.includes(s.id));
	const liveTargetIds = [
		...new Set([...movedTargetIds, ...markerSplits.map((s) => s.target_thread_id)])
	];
	const { data: liveTargets } = liveTargetIds.length
		? await db
				.from('mufakat_threads')
				.select('id, slug, title, status, closing_summary')
				.in('id', liveTargetIds)
		: { data: [] };
	const liveById = new Map((liveTargets ?? []).map((t) => [t.id, t]));

	const authorById = new Map((authors ?? []).map((a) => [a.id, a.display_name as string]));
	const partyById = new Map(
		(parties ?? []).map((p) => [p.id, { slug: p.slug, name: p.name, logo_url: p.logo_url } as PartyRef])
	);
	const splitByComment = new Map((splits ?? []).map((s) => [s.source_comment_id, s]));

	// Reaction tallies + the caller's own rows (for un-react, M0-07).
	const counts = new Map<string, { setuju: number; pertanyaan_bagus: number }>();
	const mine = new Map<string, { setuju: boolean; pertanyaan_bagus: boolean }>();
	let threadSetuju = 0;
	let myThreadSetuju = false;
	for (const r of reactions ?? []) {
		if (r.thread_id === thread.id && !r.comment_id) {
			threadSetuju += 1;
			if (r.user_id === userId) myThreadSetuju = true;
			continue;
		}
		if (!r.comment_id) continue;
		const c = counts.get(r.comment_id) ?? { setuju: 0, pertanyaan_bagus: 0 };
		c[r.type as 'setuju' | 'pertanyaan_bagus'] += 1;
		counts.set(r.comment_id, c);
		if (r.user_id === userId) {
			const m = mine.get(r.comment_id) ?? { setuju: false, pertanyaan_bagus: false };
			m[r.type as 'setuju' | 'pertanyaan_bagus'] = true;
			mine.set(r.comment_id, m);
		}
	}

	// Comment tree, depth ≤ 3 by schema.
	const nodes = new Map<string, CommentNodeData>();
	for (const c of comments) {
		const live = c.moved_to_thread_id ? liveById.get(c.moved_to_thread_id) : null;
		nodes.set(c.id, {
			...c,
			author_name: authorById.get(c.author_id) ?? '—',
			author_party: c.author_party_id ? (partyById.get(c.author_party_id) ?? null) : null,
			replies: [],
			reactions: counts.get(c.id) ?? { setuju: 0, pertanyaan_bagus: 0 },
			myReactions: mine.get(c.id) ?? { setuju: false, pertanyaan_bagus: false },
			movedTo: live
				? {
						slug: live.slug,
						status: live.status as ThreadStatus,
						reaction_count: splitByComment.get(c.id)?.reaction_count_at_split ?? 0
					}
				: null
		});
	}
	const roots: CommentNodeData[] = [];
	for (const node of nodes.values()) {
		if (node.parent_id && nodes.has(node.parent_id)) {
			nodes.get(node.parent_id)!.replies.push(node);
		} else {
			roots.push(node);
		}
	}

	// Markers anchor after their top-level ancestor row (TRD §11).
	const topAncestor = (id: string | null): string | null => {
		let current = id ? nodes.get(id) : undefined;
		while (current?.parent_id && nodes.has(current.parent_id)) {
			current = nodes.get(current.parent_id);
		}
		return current?.id ?? null;
	};
	const markerData: MarkerData[] = (markers ?? []).map((m) => {
		const split = (splits ?? []).find((s) => s.id === m.split_id);
		const target = split ? liveById.get(split.target_thread_id) : null;
		return {
			id: m.id,
			after_comment_id: topAncestor(m.after_comment_id),
			kind: m.kind as MarkerData['kind'],
			label: m.label,
			target: target
				? {
						slug: target.slug,
						title: target.title,
						status: target.status as ThreadStatus,
						// Summary-back (M0-15): rendered live, never stored in the parent.
						closing_summary_html:
							target.status === 'selesai' ? tiptapHtml(target.closing_summary) : null
					}
				: null
		};
	});

	const { membership, isAdmin } = await event.parent();
	const opPrompt =
		opPendingSplit && userId && thread.op_id === userId
			? { split_id: opPendingSplit.id, ends_at: opPendingSplit.op_window_ends_at }
			: null;

	let parentThread: { slug: string; title: string } | null = null;
	if (thread.parent_thread_id) {
		const { data: parent } = await db
			.from('mufakat_threads')
			.select('slug, title')
			.eq('id', thread.parent_thread_id)
			.maybeSingle();
		parentThread = parent;
	}

	return {
		thread: {
			...thread,
			closing_summary_html: thread.status === 'selesai' ? tiptapHtml(thread.closing_summary) : null
		},
		opParty: thread.op_party_id ? (partyById.get(thread.op_party_id) ?? null) : null,
		opName: thread.op_id ? (authorById.get(thread.op_id) ?? null) : null,
		redirectTarget,
		parentThread,
		roots,
		markers: markerData,
		threadSetuju,
		myThreadSetuju,
		opPrompt,
		canWrite: !!membership && ['active', 'muted'].includes(membership.status),
		isOP: !!userId && thread.op_id === userId,
		isAdmin,
		userId
	};
};

async function threadBySlug(event: Parameters<NonNullable<Actions[string]>>[0]) {
	const db = supabaseServer(event);
	const { data: thread } = await db
		.from('mufakat_threads')
		.select('id, slug, status')
		.eq('slug', event.params.slug as string)
		.maybeSingle();
	if (!thread) error(404, 'Diskusi tidak ditemukan');
	return thread;
}

export const actions: Actions = {
	// Threaded reply, max depth 3 (M0-05) — enforced server-side by the
	// Edge Function; scar replies are redirected by it (Q10).
	comment: async (event) => {
		const thread = await threadBySlug(event);
		const form = await event.request.formData();
		let content: unknown;
		try {
			content = JSON.parse(form.get('content') as string);
		} catch {
			return fail(400, { error: 'invalid_content' });
		}
		const res = await invokeEdge(event, 'mufakat-create-comment', {
			thread_id: thread.id,
			parent_id: (form.get('parent_id') as string) || null,
			content,
			html: (form.get('html') as string) || null
		});
		if (!res.ok) {
			if (res.data.error === 'comment_moved') {
				return fail(409, { movedTo: res.data.moved_to_thread_id as string });
			}
			return fail(res.status, { error: res.data.error, explanation: res.data.explanation });
		}
		return { commented: true };
	},

	// 15-minute edit window (M0-05) — enforced by RLS; zero rows = window shut.
	edit: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) return fail(401, { error: 'unauthenticated' });
		const form = await event.request.formData();
		const commentId = form.get('comment_id') as string;
		let content: unknown;
		try {
			content = JSON.parse(form.get('content') as string);
		} catch {
			return fail(400, { error: 'invalid_content' });
		}
		// Display HTML is re-derived from the trusted JSON, never the client's
		// `html` field (prevents stored XSS via a forged form post).
		const html = tiptapToHtml(content);
		const text = (form.get('text') as string) || null;

		const db = supabaseServer(event);
		const { data: updated, error: err } = await db
			.from('mufakat_comments')
			.update({ content, html, body_text: text, edited_at: new Date().toISOString() })
			.eq('id', commentId)
			.select('id');
		if (err) return fail(500, { error: err.message });
		if (!updated?.length) return fail(403, { error: 'edit_window_closed' });
		return { edited: true };
	},

	// Soft delete (M0-05): body becomes "[dihapus]", structure preserved.
	delete: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) return fail(401, { error: 'unauthenticated' });
		const form = await event.request.formData();
		const db = supabaseServer(event);
		const { data: updated, error: err } = await db
			.from('mufakat_comments')
			.update({ state: 'deleted' })
			.eq('id', form.get('comment_id') as string)
			.select('id');
		if (err) return fail(500, { error: err.message });
		if (!updated?.length) return fail(403, { error: 'not_deletable' });
		return { deleted: true };
	},

	// Reactions go through the Edge Function — the split threshold is
	// evaluated there and never reaches this client (M0-08).
	react: async (event) => {
		const thread = await threadBySlug(event);
		const form = await event.request.formData();
		const commentId = (form.get('comment_id') as string) || null;
		const res = await invokeEdge(event, 'mufakat-react', {
			comment_id: commentId,
			thread_id: commentId ? null : thread.id,
			type: form.get('type') as string
		});
		if (!res.ok && res.data.error !== 'already_reacted') {
			return fail(res.status, { error: res.data.error });
		}
		return { reacted: true };
	},

	// Un-react = own-row delete (M0-07), allowed directly by RLS.
	unreact: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) return fail(401, { error: 'unauthenticated' });
		const thread = await threadBySlug(event);
		const form = await event.request.formData();
		const commentId = (form.get('comment_id') as string) || null;
		const db = supabaseServer(event);
		let del = db.from('mufakat_reactions').delete().eq('user_id', userId).eq('type', form.get('type') as string);
		del = commentId ? del.eq('comment_id', commentId) : del.eq('thread_id', thread.id);
		const { error: err } = await del;
		if (err) return fail(500, { error: err.message });
		return { unreacted: true };
	},

	// OP-ship response (M0-09): confirm or decline within the 24h window.
	opship: async (event) => {
		const form = await event.request.formData();
		const res = await invokeEdge(event, 'mufakat-respond-opship', {
			split_id: form.get('split_id') as string,
			action: form.get('decision') as string
		});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		return { opship: res.data.op_status };
	},

	// Report (M0-16): the response carries the legal-basis confirmation copy.
	report: async (event) => {
		const form = await event.request.formData();
		const res = await invokeEdge<{ confirmation: string }>(event, 'mufakat-report-content', {
			subject_type: form.get('subject_type') as string,
			subject_id: form.get('subject_id') as string,
			category: form.get('category') as string,
			note: (form.get('note') as string) || null
		});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		return { reportConfirmation: res.data.confirmation };
	},

	// Semantic flag (M0-14): clarification, not reporting — direct insert.
	flag: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) return fail(401, { error: 'unauthenticated' });
		const form = await event.request.formData();
		const db = supabaseServer(event);
		const { error: err } = await db.from('mufakat_semantic_flags').insert({
			comment_id: form.get('comment_id') as string,
			flagged_by: userId
		});
		if (err && err.code !== '23505') return fail(500, { error: err.message });
		return { flagged: true };
	},

	// Close (M0-03): OP/admin → selesai (with summary) or pertanyaan_terbuka.
	close: async (event) => {
		const thread = await threadBySlug(event);
		const form = await event.request.formData();
		const status = form.get('status') as string;
		let closingSummary: unknown = null;
		const raw = form.get('closing_summary') as string | null;
		if (raw) {
			try {
				closingSummary = JSON.parse(raw);
			} catch {
				return fail(400, { error: 'invalid_summary' });
			}
		}
		const res = await invokeEdge(event, 'mufakat-close-thread', {
			thread_id: thread.id,
			status,
			closing_summary: closingSummary
		});
		if (!res.ok) return fail(res.status, { closeError: res.data.error });
		return { closed: status };
	},

	// Merge duplicate (M0-02): admin only — enforced by the Edge Function.
	merge: async (event) => {
		const thread = await threadBySlug(event);
		const form = await event.request.formData();
		const res = await invokeEdge<{ redirect_to: string }>(event, 'mufakat-merge-threads', {
			duplicate_thread_id: thread.id,
			canonical_thread_id: form.get('canonical_thread_id') as string,
			move_comments: form.get('move_comments') === 'on'
		});
		if (!res.ok) return fail(res.status, { mergeError: res.data.error });
		redirect(303, `/diskusi/${event.params.slug}`);
	}
};
