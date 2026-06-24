import { sequence } from '@sveltejs/kit/hooks';
import { redirect, type Handle } from '@sveltejs/kit';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { env } from '$env/dynamic/public';

// Supabase Auth session resolution on every request (TRD §2). @supabase/ssr
// reads/writes the session cookie; auth.uid() is then available to RLS.
const supabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(env.PUBLIC_SUPABASE_URL!, env.PUBLIC_SUPABASE_ANON_KEY!, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
				cookiesToSet.forEach(({ name, value, options }) => {
					event.cookies.set(name, value, { ...options, path: '/' });
				});
			}
		}
	});

	// getSession() alone trusts the cookie without verifying the JWT; we
	// re-validate via getUser() against the Auth server, the documented safe
	// pattern. getClaims() would also work but getUser() keeps it simple.
	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) return { session: null, user: null };

		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) return { session: null, user: null };

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};

// Resolve session + admin flag once per request, and gate /moderasi.
const authGuard: Handle = async ({ event, resolve }) => {
	const { session, user } = await event.locals.safeGetSession();
	event.locals.session = session;
	event.locals.user = user;
	event.locals.isAdmin = false;

	if (user) {
		// One cheap lookup; lbl_is_admin() is also enforced server-side on the
		// moderation actions themselves (TRD §7) — this only drives routing/UI.
		const { data } = await event.locals.supabase
			.from('lbl_admins')
			.select('user_id')
			.eq('user_id', user.id)
			.maybeSingle();
		event.locals.isAdmin = !!data;
	}

	const { pathname } = event.url;
	if (pathname === '/moderasi' || pathname.startsWith('/moderasi/')) {
		if (!user) redirect(303, `/masuk?redirect=${encodeURIComponent(pathname)}`);
		if (!event.locals.isAdmin) redirect(303, '/');
	}

	return resolve(event);
};

export const handle = sequence(supabase, authGuard);
