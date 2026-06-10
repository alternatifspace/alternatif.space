import { error, fail, redirect } from '@sveltejs/kit';
import { supabaseServer } from '$lib/supabase';
import { invokeEdge } from '$lib/server/edge';
import type { Party } from '$lib/types';
import type { Actions, PageServerLoad } from './$types';

// Party public profile (P0-04) + all join flows (P0-08/09/10/11).
export const load: PageServerLoad = async (event) => {
	const { params, url, locals, parent } = event;
	const db = supabaseServer(event);

	const { data: party } = await db
		.from('parties')
		.select('*')
		.eq('slug', params.slug)
		.maybeSingle<Party>();
	if (!party) error(404, 'Partai tidak ditemukan');

	const { userId } = locals.auth();
	const isLeader = !!userId && party.leader_id === userId;

	// pending_review parties are visible only to their founder (TRD §15).
	if (party.status === 'pending_review' && !isLeader) error(404, 'Partai tidak ditemukan');

	const { count: memberCount } = await db
		.from('party_members')
		.select('id', { count: 'exact', head: true })
		.eq('party_id', party.id)
		.neq('status', 'removed');

	const { data: leader } = await db
		.from('users')
		.select('id, display_name')
		.eq('id', party.leader_id)
		.maybeSingle();

	const { membership } = await parent();

	// Leader management panel data (P0-09): pending applications.
	let pendingApplications: Array<{
		id: string;
		message: string | null;
		created_at: string;
		applicant: { id: string; display_name: string } | null;
	}> = [];
	if (isLeader) {
		const { data: apps } = await db
			.from('party_applications')
			.select('id, message, created_at, users(id, display_name)')
			.eq('party_id', party.id)
			.eq('status', 'pending')
			.order('created_at');
		pendingApplications = (apps ?? []).map((a) => ({
			id: a.id,
			message: a.message,
			created_at: a.created_at,
			applicant: (a.users as unknown as { id: string; display_name: string }) ?? null
		}));
	}

	// Pending application by the visitor (avoid duplicate submissions in UI).
	let hasPendingApplication = false;
	if (userId && !membership) {
		const { data: own } = await db
			.from('party_applications')
			.select('id')
			.eq('party_id', party.id)
			.eq('user_id', userId)
			.eq('status', 'pending')
			.maybeSingle();
		hasPendingApplication = !!own;
	}

	return {
		party,
		memberCount: memberCount ?? 0,
		leader,
		isLeader,
		inviteToken: url.searchParams.get('invite'), // P0-10 redemption landing
		pendingApplications,
		hasPendingApplication
	};
};

const partyIdBySlug = async (event: Parameters<NonNullable<Actions[string]>>[0]) => {
	const db = supabaseServer(event);
	const { data: party } = await db
		.from('parties')
		.select('id, slug')
		.eq('slug', event.params.slug as string)
		.maybeSingle();
	if (!party) error(404, 'Partai tidak ditemukan');
	return party;
};

export const actions: Actions = {
	// Open join (P0-08) — instant, then the post-join screen.
	join: async (event) => {
		const party = await partyIdBySlug(event);
		const res = await invokeEdge(event, 'join-party', { party_id: party.id });
		if (!res.ok) {
			if (res.data.error === 'already_member') return fail(409, { gate: 'already_member' });
			return fail(res.status, { error: res.data.error });
		}
		redirect(303, `/partai/${party.slug}/berhasil`);
	},

	// Application join (P0-09) — 500-char free text.
	apply: async (event) => {
		const party = await partyIdBySlug(event);
		const form = await event.request.formData();
		const message = ((form.get('message') as string | null) ?? '').trim();
		if (message.length > 500) return fail(400, { error: 'Maksimal 500 karakter.' });

		const res = await invokeEdge(event, 'submit-application', { party_id: party.id, message });
		if (!res.ok) {
			if (res.data.error === 'already_member') return fail(409, { gate: 'already_member' });
			return fail(res.status, { error: res.data.error });
		}
		return { applied: true };
	},

	// Leader review (P0-09): approve / reject.
	review: async (event) => {
		const form = await event.request.formData();
		const applicationId = form.get('application_id') as string;
		const decision = form.get('decision') as string;
		if (!applicationId || !['approve', 'reject'].includes(decision)) {
			return fail(400, { error: 'invalid_review' });
		}
		const res = await invokeEdge(event, 'review-application', {
			application_id: applicationId,
			decision
		});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		return { reviewed: true };
	},

	// Invite generation (P0-10) — members only, single-use, 7-day expiry.
	invite: async (event) => {
		const party = await partyIdBySlug(event);
		const res = await invokeEdge<{ token: string }>(event, 'generate-invite-token', {
			party_id: party.id
		});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		return { inviteUrl: `${event.url.origin}/partai/${party.slug}?invite=${res.data.token}` };
	},

	// Invite redemption (P0-10).
	redeem: async (event) => {
		const party = await partyIdBySlug(event);
		const form = await event.request.formData();
		const token = form.get('token') as string;
		if (!token) return fail(400, { error: 'token required' });

		const res = await invokeEdge(event, 'use-invite-token', { token });
		if (!res.ok) {
			if (res.data.error === 'already_member') return fail(409, { gate: 'already_member' });
			return fail(res.status, { inviteError: res.data.error });
		}
		redirect(303, `/partai/${party.slug}/berhasil`);
	},

	// Leave party (P0-11) — confirmation handled client-side before submit.
	leave: async (event) => {
		const res = await invokeEdge(event, 'leave-party', {});
		if (!res.ok) return fail(res.status, { error: res.data.error });
		redirect(303, '/bergabung');
	}
};
