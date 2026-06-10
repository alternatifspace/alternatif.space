import { supabaseServer } from '$lib/supabase';
import type { PartyCardData } from '$lib/types';
import type { PageServerLoad } from './$types';

// Browse parties (P0-03): default sort by recent leader activity; filters by
// membership model + activity status; name search; dissolved hidden unless
// toggled. pending_review parties are never listed (TRD §15).
export const load: PageServerLoad = async (event) => {
	const { url } = event;
	const model = url.searchParams.get('model'); // open | application | invite_only
	const status = url.searchParams.get('status'); // active | dormant
	const q = url.searchParams.get('q')?.trim() ?? '';
	const showDissolved = url.searchParams.get('dibubarkan') === '1';

	const db = supabaseServer(event);
	let query = db
		.from('parties')
		.select(
			'id, slug, name, tagline, logo_url, status, governance_config, leader_last_active_at, party_members(count)'
		)
		.order('leader_last_active_at', { ascending: false })
		.limit(60);

	if (status === 'active' || status === 'dormant') {
		query = query.eq('status', status);
	} else {
		query = showDissolved
			? query.in('status', ['active', 'dormant', 'dissolved'])
			: query.in('status', ['active', 'dormant']);
	}
	if (model) query = query.eq('governance_config->>membership_model', model);
	if (q) query = query.ilike('name', `%${q}%`);

	const { data } = await query;

	const parties: PartyCardData[] = (data ?? []).map((p) => ({
		id: p.id,
		slug: p.slug,
		name: p.name,
		tagline: p.tagline,
		logo_url: p.logo_url,
		status: p.status,
		governance_config: p.governance_config,
		leader_last_active_at: p.leader_last_active_at,
		member_count: (p.party_members as unknown as Array<{ count: number }>)[0]?.count ?? 0
	}));

	return { parties, filters: { model, status, q, showDissolved } };
};
