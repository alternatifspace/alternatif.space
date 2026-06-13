import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private';

/**
 * Service-role client for the production Supabase project. Bypasses RLS — this
 * is the whole point: it lets the local operator approve any founder's party
 * without the leader-only `parties_leader_update` policy getting in the way,
 * and without needing a production schema change.
 *
 * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY come from a gitignored `apps/admin/.env`
 * (see .env.example). They are read at request time via $env/dynamic/private so
 * the key is never baked into any build artifact.
 */
export function adminDb(): SupabaseClient {
	const url = env.SUPABASE_URL;
	const key = env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !key) {
		throw new Error(
			'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. Copy apps/admin/.env.example to apps/admin/.env and fill in the production values.'
		);
	}
	return createClient(url, key, {
		auth: { persistSession: false, autoRefreshToken: false }
	});
}
