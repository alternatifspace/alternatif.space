import { fail, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import type { Submission } from '$lib/types';
import { supabaseServiceRole } from '$lib/supabase';

// Admin moderation queue (TRD §7, L0-02). Route access is already gated to
// admins in hooks.server.ts; every action re-checks isAdmin as defence in depth.
export const load: PageServerLoad = async ({ locals }) => {
	// Pending first (the work), then a tail of recently decided rows for context.
	const { data: pending } = await locals.supabase
		.from('lbl_submissions')
		.select('id, user_id, image_key, title, caption, status, rejection_reason, like_count, created_at, approved_at')
		.eq('status', 'pending')
		.order('created_at', { ascending: true });

	const { data: decided } = await locals.supabase
		.from('lbl_submissions')
		.select('id, user_id, image_key, title, caption, status, rejection_reason, like_count, created_at, approved_at')
		.in('status', ['approved', 'rejected'])
		.order('created_at', { ascending: false })
		.limit(20);

	return {
		pending: (pending as Submission[]) ?? [],
		decided: (decided as Submission[]) ?? []
	};
};

function ensureAdmin(locals: App.Locals) {
	if (!locals.user) redirect(303, '/masuk?redirect=/moderasi');
	if (!locals.isAdmin) redirect(303, '/');
}

export const actions: Actions = {
	approve: async ({ locals, request }) => {
		ensureAdmin(locals);
		const id = (await request.formData()).get('id');
		if (typeof id !== 'string') return fail(400, { error: 'id wajib diisi.' });

		const { error } = await supabaseServiceRole()
			.from('lbl_submissions')
			.update({ status: 'approved', approved_at: new Date().toISOString() })
			.eq('id', id)
			.eq('status', 'pending'); // idempotent: only acts on a still-pending row
		if (error) return fail(400, { error: error.message });
		return { ok: true };
	},

	reject: async ({ locals, request, platform }) => {
		ensureAdmin(locals);
		const form = await request.formData();
		const id = form.get('id');
		const reason = ((form.get('reason') as string | null) ?? '').trim();
		if (typeof id !== 'string') return fail(400, { error: 'id wajib diisi.' });
		if (!reason) return fail(400, { error: 'Alasan penolakan wajib diisi (ditampilkan ke pengirim).' });

		const admin = supabaseServiceRole();
		// Grab the image key before flipping status, so we can free the R2 object.
		const { data: row } = await admin
			.from('lbl_submissions')
			.select('image_key')
			.eq('id', id)
			.eq('status', 'pending')
			.maybeSingle();

		const { error } = await admin
			.from('lbl_submissions')
			.update({ status: 'rejected', rejection_reason: reason })
			.eq('id', id)
			.eq('status', 'pending');
		if (error) return fail(400, { error: error.message });

		// A rejected logo never appears in the feed and its blob is dead weight —
		// delete it from R2 so storage only ever holds approved + pending images
		// (keeps usage comfortably inside the free tier). The row is kept for the
		// rejection_reason; the /kirim screen shows the reason as text, not the image.
		if (row?.image_key) {
			await platform?.env?.LBL_LOGOS?.delete(row.image_key).catch(() => {});
		}
		return { ok: true };
	}
};
