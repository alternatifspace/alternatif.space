import { error, redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import type { PageServerLoad } from './$types';

// Post-join confirmation (P0-08) + nudge to mufakat (P0-12). Only reachable
// as an actual member of this party.
export const load: PageServerLoad = async (event) => {
	const { membership } = await event.parent();
	if (!membership) redirect(303, `/partai/${event.params.slug}`);

	const db = supabaseServer(event);
	const { data: party } = await db
		.from('parties')
		.select('id, slug, name, logo_url')
		.eq('slug', event.params.slug)
		.maybeSingle();
	if (!party) error(404, 'Partai tidak ditemukan');
	if (membership.party_id !== party.id) redirect(303, `/partai/${party.slug}`);

	return { joinedParty: party };
};
