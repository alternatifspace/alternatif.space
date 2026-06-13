import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// partai root (TRD v1.5 addendum §2):
//   signed-out  → landing (this page renders it)
//   signed-in   → the selected party's home. In Phase 0 there is no /dashboard
//                 yet, so we route to the party's public profile as the stand-in
//                 (swap the target to /dashboard when Phase 1 ships).
//   signed-in, no party → /jelajah to find one. (A user with no users-row is
//                 already redirected to /onboarding by +layout.server.ts.)
// The signed-in branch is a redirect, not a render, so crawlers hitting / get
// the indexable landing HTML.
export const load: PageServerLoad = async (event) => {
	const { signedIn, membership } = await event.parent();

	if (signedIn) {
		if (membership) redirect(303, `/partai/${membership.party.slug}`);
		redirect(303, '/jelajah');
	}

	return {};
};
