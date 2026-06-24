import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Kick off Google OAuth (TRD §2, L0-01). Supabase returns the provider URL we
// redirect the browser to; Google then sends the user back to /auth/callback.
export const GET: RequestHandler = async ({ locals, url }) => {
	const next = url.searchParams.get('redirect') ?? '/';
	const redirectTo = `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`;

	const { data, error: err } = await locals.supabase.auth.signInWithOAuth({
		provider: 'google',
		options: { redirectTo }
	});

	if (err || !data.url) error(500, 'Tidak bisa memulai proses masuk. Coba lagi.');
	redirect(303, data.url);
};
