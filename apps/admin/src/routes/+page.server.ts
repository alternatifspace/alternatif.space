import { fail } from '@sveltejs/kit';
import { adminDb } from '$lib/server/admin';
import type { Actions, PageServerLoad } from './$types';

// Party approval queue. The whole tool: list pending_review parties, approve
// (→ active) or reject (→ dissolved). Service-role client bypasses RLS.

interface PendingParty {
	id: string;
	slug: string;
	name: string;
	tagline: string | null;
	manifesto_html: string | null;
	council_enabled: boolean | null;
	created_at: string;
	leader_id: string;
	leader_name: string;
}

export const load: PageServerLoad = async () => {
	let db;
	try {
		db = adminDb();
	} catch (e) {
		// Missing .env — show the styled page with guidance, not a 500.
		return { parties: [] as PendingParty[], loadError: (e as Error).message };
	}

	const { data: parties, error: partiesErr } = await db
		.from('parties')
		.select('id, slug, name, tagline, manifesto_html, council_enabled, created_at, leader_id')
		.eq('status', 'pending_review')
		.order('created_at', { ascending: true });

	if (partiesErr) {
		return { parties: [] as PendingParty[], loadError: partiesErr.message };
	}

	// Resolve founder names in one query (parties has two FKs to users —
	// leader_id and deputy_id — so a PostgREST embed would be ambiguous;
	// a separate lookup keyed by leader_id is simpler and unambiguous).
	const leaderIds = [...new Set((parties ?? []).map((p) => p.leader_id))];
	const nameById = new Map<string, string>();
	if (leaderIds.length) {
		const { data: users } = await db
			.from('users')
			.select('id, display_name')
			.in('id', leaderIds);
		for (const u of users ?? []) nameById.set(u.id, u.display_name);
	}

	const result: PendingParty[] = (parties ?? []).map((p) => ({
		...p,
		leader_name: nameById.get(p.leader_id) ?? p.leader_id
	}));

	return { parties: result, loadError: null };
};

async function setStatus(
	partyId: string,
	patch: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
	const db = adminDb();
	// The status guard makes the action idempotent and prevents clobbering a
	// party someone already decided on (e.g. an active or dissolved party).
	const { data, error: err } = await db
		.from('parties')
		.update(patch)
		.eq('id', partyId)
		.eq('status', 'pending_review')
		.select('id');
	if (err) return { ok: false, error: err.message };
	if (!data || data.length === 0) {
		return { ok: false, error: 'Partai tidak lagi berstatus pending_review (mungkin sudah diproses).' };
	}
	return { ok: true };
}

export const actions: Actions = {
	approve: async ({ request }) => {
		const form = await request.formData();
		const partyId = form.get('party_id') as string | null;
		if (!partyId) return fail(400, { error: 'party_id wajib diisi.' });

		const res = await setStatus(partyId, { status: 'active' });
		if (!res.ok) return fail(400, { error: res.error });
		return { approved: true };
	},

	reject: async ({ request }) => {
		const form = await request.formData();
		const partyId = form.get('party_id') as string | null;
		if (!partyId) return fail(400, { error: 'party_id wajib diisi.' });

		const res = await setStatus(partyId, {
			status: 'dissolved',
			dissolved_at: new Date().toISOString()
		});
		if (!res.ok) return fail(400, { error: res.error });
		return { rejected: true };
	}
};
