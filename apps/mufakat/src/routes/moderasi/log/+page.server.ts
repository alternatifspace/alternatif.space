import { supabaseServer } from '$lib/supabase';
import type { PageServerLoad } from './$types';

// /moderasi/log (TRD §15, M0-16, 6.39): PUBLIC aggregate moderation log —
// action type + date only. Reporter and moderator identity never appear here
// (the table doesn't even store them). No admin gate, by design.
export const load: PageServerLoad = async (event) => {
	const db = supabaseServer(event);
	const { data: entries } = await db
		.from('mufakat_moderation_log')
		.select('id, action, subject_type, created_at')
		.order('created_at', { ascending: false })
		.limit(200);

	return { entries: entries ?? [] };
};
