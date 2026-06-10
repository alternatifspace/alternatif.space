import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership, notify } from '../_shared/membership.ts';

// review-application (TRD §10): leader approves or rejects.
// On approval triggers join flow. Caller must be party leader.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { application_id, decision } = await req.json();
  if (!application_id || !['approved', 'rejected'].includes(decision)) {
    return json({ error: 'application_id and decision (approved|rejected) required' }, 400);
  }

  const db = serviceClient();

  const { data: app } = await db
    .from('party_applications')
    .select('id, party_id, user_id, status')
    .eq('id', application_id)
    .maybeSingle();
  if (!app) return json({ error: 'not_found' }, 404);
  if (app.status !== 'pending') return json({ error: 'already_reviewed' }, 409);

  const { data: party } = await db
    .from('parties')
    .select('leader_id')
    .eq('id', app.party_id)
    .single();
  if (party?.leader_id !== userId) return json({ error: 'not_party_leader' }, 403);

  const now = new Date().toISOString();

  if (decision === 'approved') {
    const existing = await currentMembership(db, app.user_id);
    if (existing) {
      await db
        .from('party_applications')
        .update({ status: 'rejected', reviewed_by: userId, reviewed_at: now })
        .eq('id', app.id);
      return json({ error: 'applicant_already_member_elsewhere' }, 409);
    }
    await db
      .from('party_members')
      .insert({ party_id: app.party_id, user_id: app.user_id, status: 'active', joined_at: now });
    await db.from('party_membership_history').insert({
      user_id: app.user_id,
      party_id: app.party_id,
      joined_at: now,
    });
  }

  await db
    .from('party_applications')
    .update({ status: decision, reviewed_by: userId, reviewed_at: now })
    .eq('id', app.id);

  await notify(db, app.user_id, 'application_reviewed', {
    party_id: app.party_id,
    decision,
  });

  return json({ ok: true, decision });
});
