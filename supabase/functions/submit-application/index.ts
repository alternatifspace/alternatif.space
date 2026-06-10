import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership } from '../_shared/membership.ts';

// submit-application (TRD §10): inserts application; rejects if the user
// already has a pending application for the same party.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { party_id, message } = await req.json();
  if (!party_id) return json({ error: 'party_id required' }, 400);
  if (message && message.length > 500) return json({ error: 'message_too_long' }, 400);

  const db = serviceClient();

  const existing = await currentMembership(db, userId);
  if (existing) return json({ error: 'already_member', party_id: existing.party_id }, 409);

  const { data: pending } = await db
    .from('party_applications')
    .select('id')
    .eq('party_id', party_id)
    .eq('user_id', userId)
    .eq('status', 'pending')
    .maybeSingle();
  if (pending) return json({ error: 'application_already_pending' }, 409);

  const { error } = await db.from('party_applications').insert({
    party_id,
    user_id: userId,
    message: message ?? null,
  });
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true });
});
