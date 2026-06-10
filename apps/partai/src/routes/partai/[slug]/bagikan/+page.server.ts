import { error, redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import type { PageServerLoad } from './$types';

// Post-approval share flow (P0-13): members share the party page; the link
// preview renders the pre-composed OG card. Linked from the approval
// notification and the party page.
export const load: PageServerLoad = async (event) => {
	const { membership } = await event.parent();

	const db = supabaseServer(event);
	const { data: party } = await db
		.from('parties')
		.select('id, slug, name, tagline, logo_url, share_card_url, status')
		.eq('slug', event.params.slug)
		.maybeSingle();
	if (!party) error(404, 'Partai tidak ditemukan');

	// Sharing a party under review or dissolved makes no sense.
	if (party.status === 'pending_review' || party.status === 'dissolved') {
		redirect(303, `/partai/${party.slug}`);
	}

	return { party, isMember: membership?.party_id === party.id };
};
