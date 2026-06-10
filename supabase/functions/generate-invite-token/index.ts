import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';

// generate-invite-token (TRD §10): cryptographically random token, 7-day expiry.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { party_id } = await req.json();
  if (!party_id) return json({ error: 'party_id required' }, 400);

  const db = serviceClient();

  const { data: member } = await db
    .from('party_members')
    .select('id')
    .eq('user_id', userId)
    .eq('party_id', party_id)
    .eq('status', 'active')
    .maybeSingle();
  if (!member) return json({ error: 'not_an_active_member' }, 403);

  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const token = btoa(String.fromCharCode(...bytes))
    .replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await db.from('party_invites').insert({
    party_id,
    created_by: userId,
    token,
    expires_at: expiresAt,
  });
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, token, expires_at: expiresAt });
});
