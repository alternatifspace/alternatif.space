import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership } from '../_shared/membership.ts';

// use-invite-token (TRD §10): validates token (exists, not used, not expired),
// triggers join flow, marks token used.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { token } = await req.json();
  if (!token) return json({ error: 'token required' }, 400);

  const db = serviceClient();

  const { data: invite } = await db
    .from('party_invites')
    .select('id, party_id, used_by, expires_at')
    .eq('token', token)
    .maybeSingle();
  if (!invite) return json({ error: 'invalid_token' }, 404);
  if (invite.used_by) return json({ error: 'token_already_used' }, 409);
  if (new Date(invite.expires_at) < new Date()) return json({ error: 'token_expired' }, 410);

  const existing = await currentMembership(db, userId);
  if (existing) return json({ error: 'already_member', party_id: existing.party_id }, 409);

  const joinedAt = new Date().toISOString();
  const { error: memberErr } = await db
    .from('party_members')
    .insert({ party_id: invite.party_id, user_id: userId, status: 'active', joined_at: joinedAt });
  if (memberErr) return json({ error: memberErr.message }, 500);

  await db.from('party_membership_history').insert({
    user_id: userId,
    party_id: invite.party_id,
    joined_at: joinedAt,
  });

  await db
    .from('party_invites')
    .update({ used_by: userId, used_at: joinedAt })
    .eq('id', invite.id);

  return json({ ok: true, party_id: invite.party_id });
});
