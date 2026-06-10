import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// Onboarding gate (5.4, TRD §11): users without a party land here and are
// directed to browse or create. Users with a party have nothing to gate.
export const load: PageServerLoad = async ({ parent }) => {
	const { membership } = await parent();
	if (membership) redirect(303, '/');
};
