import { error, redirect } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import { supabaseServer } from '$lib/supabase';
import type { PageServerLoad } from './$types';

// Party approval is a manual dashboard action (TRD §15), so the share card is
// generated lazily on first visit here — the page the approval notification
// links to. Idempotent; failures fall back to the CSS-only card.
async function ensureShareCard(slug: string): Promise<string | null> {
	try {
		const res = await fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/generate-share-card`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${PUBLIC_SUPABASE_ANON_KEY}`,
				apikey: PUBLIC_SUPABASE_ANON_KEY
			},
			body: JSON.stringify({ slug }),
			signal: AbortSignal.timeout(8000)
		});
		if (!res.ok) return null;
		const body = (await res.json()) as { share_card_url?: string };
		return body.share_card_url ?? null;
	} catch {
		return null;
	}
}

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

	// Lazy generation (5.40): first visit composes and stores the OG card.
	if (!party.share_card_url) {
		party.share_card_url = await ensureShareCard(party.slug);
	}

	return { party, isMember: membership?.party_id === party.id };
};
