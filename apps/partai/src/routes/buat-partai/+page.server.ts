import { fail, redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import { invokeEdge } from '$lib/server/edge';
import { validateConfig } from '$lib/governance';
import { slugify } from '$lib/slug';
import type { GovernanceConfig } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

const HONEYMOON_MONTHS = 3;
const MANIFESTO_MIN_WORDS = 50;

export const load: PageServerLoad = async ({ parent }) => {
	// One party at a time — members cannot found a second party (5.31).
	const { membership } = await parent();
	if (membership) redirect(303, `/partai/${membership.party.slug}`);
};

export const actions: Actions = {
	// Step 5 publish (P0-05): the only database write of the whole wizard.
	// Config locks permanently here; honeymoon = now() + 3 months. The logo is
	// uploaded client-side after this returns (storage policy needs the row).
	publish: async (event) => {
		const { userId } = event.locals.auth();
		if (!userId) redirect(303, '/masuk');

		const form = await event.request.formData();
		const name = ((form.get('name') as string | null) ?? '').trim();
		const tagline = ((form.get('tagline') as string | null) ?? '').trim();
		const councilEnabled = form.get('council_enabled') === 'true';

		let config: Partial<GovernanceConfig>;
		let manifesto: unknown;
		try {
			config = JSON.parse(form.get('config') as string);
			manifesto = JSON.parse(form.get('manifesto') as string);
		} catch {
			return fail(400, { error: 'Data formulir tidak valid.' });
		}
		const manifestoHtml = (form.get('manifesto_html') as string | null) ?? '';
		const manifestoText = ((form.get('manifesto_text') as string | null) ?? '').trim();

		if (!name) return fail(400, { error: 'Nama partai wajib diisi.' });
		if (name.length > 80) return fail(400, { error: 'Nama partai maksimal 80 karakter.' });
		const wordCount = manifestoText.split(/\s+/).filter(Boolean).length;
		if (wordCount < MANIFESTO_MIN_WORDS) {
			return fail(400, { error: `Manifesto minimal ${MANIFESTO_MIN_WORDS} kata.` });
		}
		if (!validateConfig(config)) {
			return fail(400, { error: 'Parameter tata kelola belum lengkap atau di luar rentang.' });
		}

		const db = supabaseServer(event);
		const honeymoonEndsAt = new Date();
		honeymoonEndsAt.setMonth(honeymoonEndsAt.getMonth() + HONEYMOON_MONTHS);

		const row = {
			slug: slugify(name),
			name,
			tagline: tagline || null,
			manifesto_content: manifesto,
			manifesto_html: manifestoHtml,
			governance_config: config, // locked — never updated after this
			council_enabled: councilEnabled,
			honeymoon_ends_at: honeymoonEndsAt.toISOString()
		};

		// A pending_review party led by this user means a previous publish got
		// the row in but failed before founder membership — reuse it instead of
		// stranding it behind the slug unique constraint.
		const { data: stranded } = await db
			.from('parties')
			.select('id')
			.eq('leader_id', userId)
			.eq('status', 'pending_review')
			.maybeSingle();

		const { data: party, error: insertErr } = stranded
			? await db.from('parties').update(row).eq('id', stranded.id).select('id, slug').single()
			: await db
					.from('parties')
					.insert({
						...row,
						status: 'pending_review', // moderation queue (TRD §15)
						leader_id: userId
					})
					.select('id, slug')
					.single();
		if (insertErr || !party) {
			return fail(500, { error: 'Gagal menerbitkan partai. Coba lagi.' });
		}

		// Founder membership + history (TRD §10) — join-party handles the
		// founder case for pending_review parties.
		const joinRes = await invokeEdge(event, 'join-party', { party_id: party.id });
		if (!joinRes.ok && joinRes.data.error !== 'already_member') {
			console.error('join-party failed at publish', joinRes.status, joinRes.data);
			return fail(500, {
				error: `Partai terbit, tapi keanggotaan pendiri gagal (${joinRes.data.error ?? joinRes.status}). Coba terbitkan ulang.`
			});
		}

		// No redirect: the client still uploads the logo against this row.
		return { published: true, partyId: party.id, slug: party.slug };
	}
};
