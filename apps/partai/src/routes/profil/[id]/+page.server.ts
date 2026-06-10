import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import type { PageServerLoad } from './$types';

// User profile (P0-02, 5.41/5.42). The TRD route map says /profil/[username],
// but the schema defines no username column and display_name is not unique —
// the route keys on the user id instead (documented TRD gap).
export const load: PageServerLoad = async (event) => {
	const db = supabaseServer(event);

	const { data: profile } = await db
		.from('users')
		.select('id, display_name, bio, last_active_at')
		.eq('id', event.params.id)
		.maybeSingle();
	if (!profile) error(404, 'Pengguna tidak ditemukan');

	// Current party badge (P0-02).
	const { data: m } = await db
		.from('party_members')
		.select('party_id, parties(slug, name, logo_url)')
		.eq('user_id', profile.id)
		.neq('status', 'removed')
		.maybeSingle();
	const currentPartyBadge = m?.parties
		? (m.parties as unknown as { slug: string; name: string; logo_url: string | null })
		: null;

	// Party history log — append-only record, visible to all (P0-02, P0-11).
	const { data: history } = await db
		.from('party_membership_history')
		.select('id, joined_at, left_at, leave_reason, parties(slug, name)')
		.eq('user_id', profile.id)
		.order('joined_at', { ascending: false });

	return {
		profile,
		currentPartyBadge,
		history: (history ?? []).map((h) => ({
			id: h.id,
			joined_at: h.joined_at,
			left_at: h.left_at,
			leave_reason: h.leave_reason,
			party: (h.parties as unknown as { slug: string; name: string }) ?? null
		}))
	};
};
