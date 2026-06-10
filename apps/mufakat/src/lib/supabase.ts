import { createBrowserClient, createServerClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Supabase carries no auth state of its own here: every request presents the
// Clerk-issued JWT (template 'supabase', sub = user UUID — TRD §5) and RLS
// resolves auth.uid() from it. Writes that touch multiple tables go through
// Edge Functions, never these clients (TRD §9, §10).

/** Server-side client for load functions and form actions. */
export function supabaseServer(event: RequestEvent): SupabaseClient {
	return createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) =>
				cookies.forEach(({ name, value, options }) =>
					event.cookies.set(name, value, { ...options, path: options?.path ?? '/' })
				)
		},
		accessToken: async () =>
			(await event.locals.auth().getToken({ template: 'supabase' })) ?? ''
	});
}

/**
 * Browser client. `getToken` comes from the Clerk session at the call site
 * (e.g. `session.getToken({ template: 'supabase' })`).
 */
export function supabaseBrowser(getToken: () => Promise<string | null>): SupabaseClient {
	return createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		accessToken: async () => (await getToken()) ?? ''
	});
}
