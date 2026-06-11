import { error, fail, redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import { invokeEdge } from '$lib/server/edge';
import type { CommentRow } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

export interface SpinoffRow {
	id: string;
	parent_id: string | null;
	depth: number;
	state: CommentRow['state'];
	html: string | null;
	author_name: string;
	created_at: string;
	/** Descendant of ?dari= — preselected as the chain to move. */
	inChain: boolean;
}

// /moderasi/spinoff/[id] (M0-13, 6.38): admin selects a contiguous reply
// chain to move. [id] is the source thread; ?dari= is the triggering comment —
// it STAYS, its descendants are preselected (§9.3, D0).
export const load: PageServerLoad = async (event) => {
	const { isAdmin } = await event.parent();
	if (!isAdmin) error(404, 'Halaman tidak ditemukan');

	const db = supabaseServer(event);
	const { data: thread } = await db
		.from('mufakat_threads')
		.select('id, slug, title, status')
		.eq('id', event.params.id)
		.maybeSingle();
	if (!thread) error(404, 'Diskusi tidak ditemukan');

	const { data: commentRows } = await db
		.from('mufakat_comments_public')
		.select('id, parent_id, depth, state, html, author_id, created_at')
		.eq('thread_id', thread.id)
		.order('created_at');
	const comments = commentRows ?? [];

	const authorIds = [...new Set(comments.map((c) => c.author_id))];
	const { data: authors } = authorIds.length
		? await db.from('users').select('id, display_name').in('id', authorIds)
		: { data: [] };
	const nameById = new Map((authors ?? []).map((a) => [a.id, a.display_name as string]));

	// DFS flatten so the list mirrors the thread's nesting order.
	const byParent = new Map<string | null, typeof comments>();
	for (const c of comments) {
		const key = comments.some((p) => p.id === c.parent_id) ? c.parent_id : null;
		const list = byParent.get(key) ?? [];
		list.push(c);
		byParent.set(key, list);
	}
	const dari = event.url.searchParams.get('dari');
	const rows: SpinoffRow[] = [];
	const walk = (parentId: string | null, inChain: boolean) => {
		for (const c of byParent.get(parentId) ?? []) {
			rows.push({
				id: c.id,
				parent_id: c.parent_id,
				depth: c.depth,
				state: c.state,
				html: c.html,
				author_name: nameById.get(c.author_id) ?? '—',
				created_at: c.created_at,
				inChain
			});
			walk(c.id, inChain || c.id === dari);
		}
	};
	walk(null, false);

	return { thread, rows, dari };
};

export const actions: Actions = {
	// Execution is entirely in mufakat-admin-spinoff: dedup check, thread
	// creation (or reference to an existing one), move, marker, log.
	default: async (event) => {
		const form = await event.request.formData();
		let commentIds: string[];
		try {
			commentIds = JSON.parse(form.get('comment_ids') as string);
		} catch {
			return fail(400, { error: 'invalid_selection' });
		}
		const label = ((form.get('label') as string) ?? '').trim();
		if (!commentIds.length || !label) {
			return fail(400, { error: 'label_and_selection_required' });
		}

		const res = await invokeEdge<{ target_thread_id: string; moved_to_existing: boolean }>(
			event,
			'mufakat-admin-spinoff',
			{
				thread_id: event.params.id,
				comment_ids: commentIds,
				label,
				title: ((form.get('title') as string) ?? '').trim() || null
			}
		);
		if (!res.ok) return fail(res.status, { error: res.data.error });

		const db = supabaseServer(event);
		const { data: target } = await db
			.from('mufakat_threads')
			.select('slug')
			.eq('id', res.data.target_thread_id)
			.single();
		redirect(303, `/diskusi/${target!.slug}`);
	}
};
