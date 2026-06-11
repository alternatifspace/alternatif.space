import { redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import { PARTAI_URL } from '$lib/links';
import type { Actions, PageServerLoad } from './$types';

// In-app notification list (TRD §12: bell only at Phase 0). The OP-ship
// window (M0-09) depends on this surface.
export const load: PageServerLoad = async (event) => {
	const { userId } = event.locals.auth();
	if (!userId) redirect(303, PARTAI_URL);

	const db = supabaseServer(event);
	const { data: notifications } = await db
		.from('notifications')
		.select('id, type, payload, read_at, created_at')
		.eq('user_id', userId)
		.order('created_at', { ascending: false })
		.limit(50);

	return { notifications: notifications ?? [] };
};

export const actions: Actions = {
	markAllRead: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) redirect(303, PARTAI_URL);
		const db = supabaseServer(event);
		await db
			.from('notifications')
			.update({ read_at: new Date().toISOString() })
			.eq('user_id', userId)
			.is('read_at', null);
		return { ok: true };
	}
};
