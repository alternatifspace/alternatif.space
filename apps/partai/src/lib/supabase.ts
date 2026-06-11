import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Supabase carries no auth state of its own here: every request presents the
// Clerk-issued JWT (template 'supabase', sub = Clerk user id — TRD §5) and RLS
// resolves clerk_uid() from it. Writes that touch multiple tables go through
// Edge Functions, never these clients (TRD §9, §10).
//
// Plain createClient + accessToken (the documented Clerk pattern). Not
// @supabase/ssr: its createServerClient/createBrowserClient manage Supabase
// Auth sessions internally, which supabase-js forbids combining with the
// accessToken option ("accessing supabase.auth.onAuthStateChange is not
// possible"). Clerk owns the session; Supabase never sets cookies.

const NO_AUTH = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };

/** Server-side client for load functions and form actions. */
export function supabaseServer(event: RequestEvent): SupabaseClient {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: NO_AUTH,
		// null falls back to the anon key (public reads for signed-out visitors).
		accessToken: async () => (await event.locals.auth().getToken({ template: 'supabase' })) ?? null
	});
}

/**
 * Browser client. `getToken` comes from the Clerk session at the call site
 * (e.g. `session.getToken({ template: 'supabase' })`).
 */
export function supabaseBrowser(getToken: () => Promise<string | null>): SupabaseClient {
	return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		auth: NO_AUTH,
		accessToken: async () => (await getToken()) ?? null
	});
}
