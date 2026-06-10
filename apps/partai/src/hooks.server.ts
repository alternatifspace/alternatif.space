import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { withClerkHandler } from 'svelte-clerk/server';

// Routes that require a signed-in user (checklist 5.3). Browse and party
// profiles stay public; creation and onboarding do not.
const PROTECTED_PREFIXES = ['/buat-partai', '/onboarding', '/bergabung'];

const authGate: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	if (PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
		const { userId } = event.locals.auth();
		if (!userId) {
			redirect(303, `/masuk?redirect_url=${encodeURIComponent(pathname)}`);
		}
	}
	return resolve(event);
};

// Clerk session resolution on every request (TRD §5). The session cookie is
// scoped to .alternatif.space (Clerk dashboard: production instance on the
// root domain) so one login covers every subdomain.
export const handle = sequence(withClerkHandler(), authGate);
