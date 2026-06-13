import { loadThreads } from '$lib/server/feed';
import type { PageServerLoad } from './$types';

// mufakat root (TRD v1.5 addendum §2):
//   signed-out → landing (no feed query runs)
//   signed-in  → the chronological feed (unchanged behavior, "like before")
// The public feed also lives at /jelajah for signed-out humans + crawlers.
export const load: PageServerLoad = async (event) => {
	const { signedIn } = await event.parent();

	if (signedIn) {
		return { signedIn: true, threads: await loadThreads(event) };
	}

	return { signedIn: false, threads: [] };
};
