import { buildClerkProps } from 'svelte-clerk/server';
import type { LayoutServerLoad } from './$types';

// Passes the server-resolved Clerk auth state to ClerkProvider for hydration.
export const load: LayoutServerLoad = ({ locals }) => {
	return {
		...buildClerkProps(locals.auth())
	};
};
