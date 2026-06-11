import { supabaseServer } from '$lib/supabase';
import type { PartyRef, ThreadListItem } from '$lib/types';
import type { PageServerLoad } from './$types';

// Thread list (M0-04, 6.1–6.3): chronological only — the platform is a
// referee, not an amplifier. No engagement-ranked default exists.
export const load: PageServerLoad = async (event) => {
	const db = supabaseServer(event);

	const { data: threads } = await db
		.from('mufakat_threads')
		.select('id, slug, title, status, community_raised, created_at, op_id, op_party_id')
		.eq('hidden', false)
		.order('created_at', { ascending: false })
		.limit(50);

	const threadIds = (threads ?? []).map((t) => t.id);
	const partyIds = [...new Set((threads ?? []).map((t) => t.op_party_id).filter(Boolean))];

	const [{ data: parties }, { data: commentAuthors }] = await Promise.all([
		partyIds.length
			? db.from('parties').select('id, slug, name, logo_url').in('id', partyIds)
			: Promise.resolve({ data: [] as Array<{ id: string } & PartyRef> }),
		threadIds.length
			? db
					.from('mufakat_comments')
					.select('thread_id, author_id')
					.in('thread_id', threadIds)
					.neq('state', 'moved')
			: Promise.resolve({ data: [] as Array<{ thread_id: string; author_id: string }> })
	]);

	const partyById = new Map((parties ?? []).map((p) => [p.id, p]));

	// participant count = OP + distinct comment authors (consistent with §9.1)
	const participants = new Map<string, Set<string>>();
	for (const c of commentAuthors ?? []) {
		const set = participants.get(c.thread_id) ?? new Set<string>();
		set.add(c.author_id);
		participants.set(c.thread_id, set);
	}

	const list: ThreadListItem[] = (threads ?? []).map((t) => {
		const set = participants.get(t.id) ?? new Set<string>();
		if (t.op_id) set.add(t.op_id);
		const party = t.op_party_id ? partyById.get(t.op_party_id) : null;
		return {
			id: t.id,
			slug: t.slug,
			title: t.title,
			status: t.status,
			community_raised: t.community_raised,
			created_at: t.created_at,
			op_party: party ? { slug: party.slug, name: party.name, logo_url: party.logo_url } : null,
			participant_count: set.size
		};
	});

	return { threads: list };
};
