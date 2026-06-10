import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership } from '../_shared/membership.ts';

// join-party (TRD §10): checks user has no current active membership,
// inserts into party_members, writes to party_membership_history.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { party_id } = await req.json();
  if (!party_id) return json({ error: 'party_id required' }, 400);

  const db = serviceClient();

  const existing = await currentMembership(db, userId);
  if (existing) return json({ error: 'already_member', party_id: existing.party_id }, 409);

  const { data: party } = await db
    .from('parties')
    .select('id, status, governance_config')
    .eq('id', party_id)
    .maybeSingle();
  if (!party || !['active', 'dormant'].includes(party.status)) {
    return json({ error: 'party_not_joinable' }, 404);
  }
  if (party.governance_config?.membership_model === 'application') {
    return json({ error: 'application_required' }, 403);
  }

  const joinedAt = new Date().toISOString();
  const { error: memberErr } = await db
    .from('party_members')
    .insert({ party_id, user_id: userId, status: 'active', joined_at: joinedAt });
  if (memberErr) return json({ error: memberErr.message }, 500);

  await db.from('party_membership_history').insert({
    user_id: userId,
    party_id,
    joined_at: joinedAt,
  });

  return json({ ok: true, party_id });
});
