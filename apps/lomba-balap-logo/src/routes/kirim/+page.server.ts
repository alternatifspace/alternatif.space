import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Submission } from '$lib/types';
import { supabaseServiceRole } from '$lib/supabase';

// Submit screen (L0-05/L0-10). Requires sign-in; surfaces the user's current
// live submission (one at a time) or their last rejection so they can resubmit.
export const load: PageServerLoad = async ({ locals, parent, url }) => {
	if (!locals.user) redirect(303, `/masuk?redirect=${encodeURIComponent(url.pathname)}`);

	const { config } = await parent();

	// Most recent submission of any status, to drive the screen state.
	const { data } = await locals.supabase
		.from('lbl_submissions')
		.select('id, image_key, title, caption, status, rejection_reason, like_count, created_at, approved_at')
		.eq('user_id', locals.user.id)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	const latest = (data as Submission | null) ?? null;
	const hasLive = latest?.status === 'pending' || latest?.status === 'approved';

	return {
		latest,
		hasLive,
		canSubmit: config.is_open && config.submissions_open && !hasLive
	};
};

export const actions: Actions = {
	// Withdraw the user's current live submission (L0-05/L0-10): resubmission is
	// "withdraw + submit again". Regular users have no DELETE policy (TRD §5), so
	// this runs server-side with the service role after an ownership check —
	// same pattern as moderation (TRD §7). lbl_likes cascade-delete with the row.
	withdraw: async ({ locals, request, platform }) => {
		if (!locals.user) redirect(303, '/masuk?redirect=/kirim');

		const id = (await request.formData()).get('id');
		if (typeof id !== 'string' || !id) return fail(400, { error: 'id wajib diisi.' });

		const admin = supabaseServiceRole();
		// Ownership + live-status check: only the owner can withdraw, only a live row.
		const { data: row } = await admin
			.from('lbl_submissions')
			.select('id, user_id, image_key, status')
			.eq('id', id)
			.maybeSingle();

		if (!row || row.user_id !== locals.user.id) return fail(403, { error: 'Bukan milikmu.' });
		if (row.status === 'rejected') return fail(400, { error: 'Sudah tidak aktif.' });

		const { error: delErr } = await admin.from('lbl_submissions').delete().eq('id', id);
		if (delErr) return fail(400, { error: delErr.message });

		// Best-effort R2 cleanup so withdrawn images don't linger in the bucket.
		await platform?.env?.LBL_LOGOS?.delete(row.image_key).catch(() => {});

		redirect(303, '/kirim');
	}
};
