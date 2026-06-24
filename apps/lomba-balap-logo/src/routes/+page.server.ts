import type { PageServerLoad } from './$types';
import type { FeedItem, FeedSort } from '$lib/types';

// Public feed (L0-04): approved submissions only, with a Terpopuler/Terbaru
// toggle (L0-09). Both orderings are backed by partial indexes (TRD §4).
export const load: PageServerLoad = async ({ locals, url }) => {
	const sort: FeedSort = url.searchParams.get('sort') === 'terbaru' ? 'terbaru' : 'populer';

	let query = locals.supabase
		.from('lbl_submissions')
		.select('id, user_id, image_key, title, caption, like_count, created_at, approved_at')
		.eq('status', 'approved');

	query =
		sort === 'terbaru'
			? query.order('created_at', { ascending: false })
			: query.order('like_count', { ascending: false }).order('created_at', { ascending: false });

	const { data: subs } = await query.limit(200);
	const rows = subs ?? [];

	// Author display names: one batched lookup against lbl_profiles (no FK embed
	// — both reference auth.users, so we join in app code, TRD §2/§4).
	const userIds = [...new Set(rows.map((r) => r.user_id))];
	const nameById = new Map<string, string | null>();
	if (userIds.length) {
		const { data: profiles } = await locals.supabase
			.from('lbl_profiles')
			.select('id, display_name')
			.in('id', userIds);
		for (const p of profiles ?? []) nameById.set(p.id, p.display_name);
	}

	// Which of these the current viewer has liked (drives the filled heart).
	const likedIds = new Set<string>();
	if (locals.user && rows.length) {
		const { data: likes } = await locals.supabase
			.from('lbl_likes')
			.select('submission_id')
			.eq('user_id', locals.user.id)
			.in(
				'submission_id',
				rows.map((r) => r.id)
			);
		for (const l of likes ?? []) likedIds.add(l.submission_id);
	}

	const items: FeedItem[] = rows.map((r) => ({
		id: r.id,
		image_key: r.image_key,
		title: r.title,
		caption: r.caption,
		like_count: r.like_count,
		created_at: r.created_at,
		approved_at: r.approved_at,
		author_id: r.user_id,
		author_name: nameById.get(r.user_id) ?? null,
		liked_by_me: likedIds.has(r.id)
	}));

	return { items, sort, signedIn: !!locals.user };
};
