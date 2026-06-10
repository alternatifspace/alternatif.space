import { error } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import type { PageServerLoad } from './$types';

// Current member list — display names only (5.18, P0-04).
export const load: PageServerLoad = async (event) => {
	const db = supabaseServer(event);

	const { data: party } = await db
		.from('parties')
		.select('id, slug, name, status, leader_id')
		.eq('slug', event.params.slug)
		.maybeSingle();
	if (!party || party.status === 'pending_review') error(404, 'Partai tidak ditemukan');

	const { data: members } = await db
		.from('party_members')
		.select('user_id, joined_at, users(display_name)')
		.eq('party_id', party.id)
		.neq('status', 'removed')
		.order('joined_at');

	return {
		party: { slug: party.slug, name: party.name, leader_id: party.leader_id },
		members: (members ?? []).map((m) => ({
			user_id: m.user_id,
			display_name: (m.users as unknown as { display_name: string })?.display_name ?? '—',
			is_leader: m.user_id === party.leader_id
		}))
	};
};
