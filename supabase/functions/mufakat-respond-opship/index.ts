import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';

// mufakat-respond-opship (TRD §9.2, §10, M0-09/D2): the split happened
// regardless — within the 24h window the seed author decides only whether
// to carry OP-ship. Decline → "Diangkat komunitas": op_id NULL,
// community_raised, admin-stewarded; seed attribution untouched.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { split_id, action } = await req.json();
  if (!split_id || !['confirm', 'decline'].includes(action)) {
    return json({ error: 'split_id and action (confirm|decline) required' }, 400);
  }

  const db = serviceClient();

  const { data: split } = await db
    .from('mufakat_splits')
    .select('id, type, op_status, op_window_ends_at, source_comment_id, target_thread_id')
    .eq('id', split_id)
    .maybeSingle();
  if (!split || split.type !== 'good_question') return json({ error: 'split_not_found' }, 404);
  if (split.op_status !== 'pending') {
    return json({ error: 'op_window_closed', op_status: split.op_status }, 409);
  }
  if (split.op_window_ends_at && new Date(split.op_window_ends_at).getTime() < Date.now()) {
    // Past the window but the cron hasn't swept yet — same outcome, silently confirmed.
    return json({ error: 'op_window_closed', op_status: 'auto_confirmed' }, 409);
  }

  // Only the seed comment's author holds the decision.
  const { data: seed } = await db
    .from('mufakat_comments')
    .select('author_id')
    .eq('id', split.source_comment_id)
    .single();
  if (seed?.author_id !== userId) return json({ error: 'not_seed_author' }, 403);

  if (action === 'confirm') {
    const { error } = await db
      .from('mufakat_splits')
      .update({ op_status: 'confirmed' })
      .eq('id', split.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, op_status: 'confirmed' });
  }

  const { error: splitErr } = await db
    .from('mufakat_splits')
    .update({ op_status: 'declined' })
    .eq('id', split.id);
  if (splitErr) return json({ error: splitErr.message }, 500);

  const { error: threadErr } = await db
    .from('mufakat_threads')
    .update({ op_id: null, op_party_id: null, community_raised: true })
    .eq('id', split.target_thread_id);
  if (threadErr) return json({ error: threadErr.message }, 500);

  return json({ ok: true, op_status: 'declined', community_raised: true });
});
