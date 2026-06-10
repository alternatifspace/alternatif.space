import { fail, redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import type { Actions, PageServerLoad } from './$types';

// First-login onboarding (P0-01/P0-02): platform explanation + profile
// creation, then the join-or-create gate.
export const load: PageServerLoad = async (event) => {
	const { userId } = event.locals.auth();
	if (!userId) redirect(303, '/masuk');

	const db = supabaseServer(event);
	const { data: user } = await db.from('users').select('id').eq('id', userId).maybeSingle();
	if (user) redirect(303, '/bergabung');
};

export const actions: Actions = {
	default: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) redirect(303, '/masuk');

		const form = await event.request.formData();
		const displayName = (form.get('display_name') as string | null)?.trim() ?? '';
		const bio = (form.get('bio') as string | null)?.trim() || null;

		if (!displayName) return fail(400, { error: 'Nama tampilan wajib diisi.' });
		if (displayName.length > 60) return fail(400, { error: 'Nama tampilan maksimal 60 karakter.' });
		if (bio && bio.length > 160) return fail(400, { error: 'Bio maksimal 160 karakter.' });

		const db = supabaseServer(event);
		const { error } = await db.from('users').insert({ id: userId, display_name: displayName, bio });
		if (error && error.code !== '23505') {
			return fail(500, { error: 'Gagal menyimpan profil. Coba lagi.' });
		}

		redirect(303, '/bergabung');
	}
};
