import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership } from '../_shared/membership.ts';

// leave-party (TRD §10): removes from party_members, writes leave record
// to party_membership_history. Historical mufakat flags are untouched (M0-06).
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const db = serviceClient();
  const membership = await currentMembership(db, userId);
  if (!membership) return json({ error: 'not_a_member' }, 404);

  const { data: party } = await db
    .from('parties')
    .select('leader_id')
    .eq('id', membership.party_id)
    .single();
  if (party?.leader_id === userId) {
    // Leaders transfer leadership or dissolve; they don't simply walk away.
    return json({ error: 'leader_cannot_leave' }, 409);
  }

  await db.from('party_members').delete().eq('user_id', userId);

  await db
    .from('party_membership_history')
    .update({ left_at: new Date().toISOString(), leave_reason: 'voluntary' })
    .eq('user_id', userId)
    .eq('party_id', membership.party_id)
    .is('left_at', null);

  return json({ ok: true });
});
