import { buildClerkProps } from 'svelte-clerk/server';
import { supabaseServer } from '$lib/supabase';
import type { LayoutServerLoad } from './$types';

export interface MufakatMembership {
	party_id: string;
	status: 'active' | 'muted' | 'suspended' | 'removed';
	party: { slug: string; name: string; logo_url: string | null };
}

// mufakat is public-read: no onboarding redirects here. The party gate only
// bites on write surfaces (/buat, composer) — non-members are sent to partai.
export const load: LayoutServerLoad = async (event) => {
	const { locals } = event;
	const { userId } = locals.auth();

	let user: { id: string; display_name: string } | null = null;
	let membership: MufakatMembership | null = null;
	let isAdmin = false;
	let unreadCount = 0;

	if (userId) {
		const db = supabaseServer(event);

		const [{ data: u }, { data: m }, { data: adminRow }, { count }] = await Promise.all([
			db.from('users').select('id, display_name').eq('id', userId).maybeSingle(),
			db
				.from('party_members')
				.select('party_id, status, parties(slug, name, logo_url)')
				.eq('user_id', userId)
				.maybeSingle(),
			// RLS: the row comes back only when the caller is an admin.
			db.from('platform_admins').select('user_id').eq('user_id', userId).maybeSingle(),
			db
				.from('notifications')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', userId)
				.is('read_at', null)
		]);

		user = u;
		if (m?.parties) {
			membership = {
				party_id: m.party_id,
				status: m.status as MufakatMembership['status'],
				party: m.parties as unknown as MufakatMembership['party']
			};
		}
		isAdmin = !!adminRow;
		unreadCount = count ?? 0;
	}

	return {
		signedIn: !!userId,
		user,
		membership,
		isAdmin,
		unreadCount,
		...buildClerkProps(locals.auth())
	};
};
