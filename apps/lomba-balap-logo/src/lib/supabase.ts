import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env as publicEnv } from '$env/dynamic/public';
import { env as privateEnv } from '$env/dynamic/private';

// Supabase Auth owns the session here (not Clerk, unlike partai/mufakat —
// TRD §2). The request-scoped, RLS-bound client lives in hooks.server.ts
// (@supabase/ssr cookie store). This module exposes only the privileged
// service-role client used for moderation + withdraw writes (TRD §7).

/**
 * Service-role client — server-only, bypasses RLS. Used exclusively for the
 * privileged moderation writes (approve/reject) and owner-checked withdraws
 * (TRD §7). NEVER import this into anything that ships to the browser. The key
 * comes from a Cloudflare Pages Secret at runtime via $env/dynamic/private
 * (not baked into the build).
 */
export function supabaseServiceRole(): SupabaseClient {
	const key = privateEnv.SUPABASE_SERVICE_ROLE_KEY;
	if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
	return createClient(publicEnv.PUBLIC_SUPABASE_URL!, key, {
		auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
	});
}
