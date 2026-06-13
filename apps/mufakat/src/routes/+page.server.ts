import { loadThreads } from '$lib/server/feed';
import type { PageServerLoad } from './$types';

// mufakat root (TRD v1.5 addendum §2):
//   signed-out → landing (no feed query runs)
//   signed-in  → the chronological feed (unchanged behavior, "like before")
// The public feed also lives at /jelajah for signed-out humans + crawlers.
export const load: PageServerLoad = async (event) => {
	// `/` serves different content per auth state (landing when signed-out, the
	// feed when signed-in), so it must never be shared-cached at the edge —
	// otherwise a stale homepage is served to the wrong audience (the cause of
	// the post-deploy stale-`/` we saw on Cloudflare).
	event.setHeaders({ 'cache-control': 'private, no-store' });

	const { signedIn } = await event.parent();

	if (signedIn) {
		return { signedIn: true, threads: await loadThreads(event) };
	}

	return { signedIn: false, threads: [] };
};
