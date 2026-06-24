import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// OAuth return: exchange the code for a session. @supabase/ssr writes the
// session cookie via the setAll handler wired in hooks.server.ts.
export const GET: RequestHandler = async ({ locals, url }) => {
	const code = url.searchParams.get('code');
	const next = url.searchParams.get('next') ?? '/';

	if (code) {
		const { error } = await locals.supabase.auth.exchangeCodeForSession(code);
		if (!error) redirect(303, next.startsWith('/') ? next : '/');
	}

	// Anything missing/failed: send back to sign-in with a flag.
	redirect(303, '/masuk?error=auth');
};
