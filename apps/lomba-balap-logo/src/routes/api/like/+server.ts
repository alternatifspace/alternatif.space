import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Toggle a like (L0-07). Insert/delete go through the request-scoped,
// RLS-bound client — every guard (signed-in, contest open, rate limit, no
// self-like, one-per-submission) is enforced in the policies (TRD §5), so this
// route stays thin and cannot bypass them.
export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) error(401, 'Masuk dulu buat nge-like.');

	const { submission_id, liked } = (await request.json()) as {
		submission_id?: string;
		liked?: boolean;
	};
	if (!submission_id) error(400, 'submission_id wajib diisi.');

	if (liked) {
		// Currently liked -> unlike.
		const { error: delErr } = await locals.supabase
			.from('lbl_likes')
			.delete()
			.eq('user_id', locals.user.id)
			.eq('submission_id', submission_id);
		if (delErr) error(400, delErr.message);
		return json({ liked: false });
	}

	const { error: insErr } = await locals.supabase
		.from('lbl_likes')
		.insert({ user_id: locals.user.id, submission_id });
	if (insErr) {
		// Unique violation = already liked (double-tap race); treat as success.
		if (insErr.code === '23505') return json({ liked: true });
		error(400, insErr.message);
	}
	return json({ liked: true });
};
