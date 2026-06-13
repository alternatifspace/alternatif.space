import { redirect } from '@sveltejs/kit';
import { buildClerkProps } from 'svelte-clerk/server';
import { supabaseServer } from '$lib/supabase';
import type { CurrentMembership, UserRow } from '$lib/types';
import type { LayoutServerLoad } from './$types';

// Routes a signed-in user may visit before their users row exists.
const PRE_ONBOARDING = ['/onboarding', '/masuk', '/daftar'];

const STALE_ACTIVITY_MS = 60 * 60 * 1000;

export const load: LayoutServerLoad = async (event) => {
	const { locals, url } = event;
	const { userId } = locals.auth();

	let user: UserRow | null = null;
	let membership: CurrentMembership | null = null;
	let unreadCount = 0;

	if (userId) {
		const db = supabaseServer(event);

		const { data } = await db
			.from('users')
			.select('id, display_name, bio, last_active_at')
			.eq('id', userId)
			.maybeSingle();
		user = data;

		// First login: provision the profile before anything else (P0-01).
		if (!user && !PRE_ONBOARDING.some((p) => url.pathname.startsWith(p))) {
			redirect(303, '/onboarding');
		}

		if (user) {
			// Party membership flag — the single query from TRD §5 (5.36).
			const { data: m } = await db
				.from('party_members')
				.select('party_id, status, parties(id, slug, name, logo_url, status, leader_id)')
				.eq('user_id', userId)
				.maybeSingle();
			if (m?.parties) {
				const p = m.parties as unknown as {
					id: string;
					slug: string;
					name: string;
					logo_url: string | null;
					status: CurrentMembership['party']['status'];
					leader_id: string;
				};
				membership = {
					party_id: m.party_id,
					status: m.status as CurrentMembership['status'],
					role: p.leader_id === userId ? 'leader' : 'member',
					party: { id: p.id, slug: p.slug, name: p.name, logo_url: p.logo_url, status: p.status }
				};
			}

			// Activity touches (cheap, throttled to once an hour): users row for
			// the profile indicator; parties row drives the dormant trigger (TRD §8).
			const stale =
				!user.last_active_at || Date.now() - new Date(user.last_active_at).getTime() > STALE_ACTIVITY_MS;
			if (stale) {
				const now = new Date().toISOString();
				await db.from('users').update({ last_active_at: now }).eq('id', userId);
				if (membership?.role === 'leader') {
					await db.from('parties').update({ leader_last_active_at: now }).eq('id', membership.party_id);
				}
			}

			// Unread notification count drives the navbar bell badge (TRD §12).
			const { count } = await db
				.from('notifications')
				.select('id', { count: 'exact', head: true })
				.eq('user_id', userId)
				.is('read_at', null);
			unreadCount = count ?? 0;
		}
	}

	return {
		signedIn: !!userId,
		user,
		membership,
		unreadCount,
		...buildClerkProps(locals.auth())
	};
};
