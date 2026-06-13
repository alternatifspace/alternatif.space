import { loadThreads } from '$lib/server/feed';
import type { PageServerLoad } from './$types';

// Public chronological feed (TRD v1.5 addendum §2): crawlable, no auth wall.
// The signed-out landing's "Lihat diskusi" CTA points here.
export const load: PageServerLoad = async (event) => {
	return { threads: await loadThreads(event) };
};
