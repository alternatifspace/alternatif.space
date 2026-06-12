import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5.9.6';

/**
 * Service-role client. Bypasses RLS — used for the multi-table side-effecting
 * writes that the TRD mandates live in Edge Functions (§9, §10).
 */
export function serviceClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );
}

// The gateway's verify_jwt only accepts Supabase-signed JWTs and rejects
// Clerk's RS256 tokens, so user-facing functions deploy with verify_jwt
// disabled (config.toml) and signature verification happens here, against
// Clerk's JWKS. CLERK_ISSUER (e.g. https://clerk.alternatif.space) must be
// set via `supabase secrets set` / supabase/functions/.env — without it every
// caller is rejected (fail closed).
const CLERK_ISSUER = Deno.env.get('CLERK_ISSUER');
const clerkJwks = CLERK_ISSUER
  ? createRemoteJWKSet(new URL(`${CLERK_ISSUER}/.well-known/jwks.json`))
  : null;

/**
 * Resolve the calling user's id from the request JWT (Clerk-issued:
 * `sub` = the Clerk user id — TRD §5, migration 00009).
 * Returns null for anonymous/invalid/expired tokens.
 */
export async function callerUserId(req: Request): Promise<string | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ') || !clerkJwks) return null;
  const token = authHeader.slice('Bearer '.length);
  try {
    const { payload } = await jwtVerify(token, clerkJwks, { issuer: CLERK_ISSUER });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  return null;
}
