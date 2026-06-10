import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership, mufakatPartyFlag } from '../_shared/membership.ts';
import { evaluateThreshold, executeGoodQuestionSplit } from '../_shared/mufakat.ts';

// mufakat-react (TRD §10, Q9): inserts reaction. On pertanyaan_bagus, evaluates
// the split threshold (§9.1) and, if met, executes the split (§9.2) within the
// same invocation. Threshold math never reaches the client.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { comment_id, thread_id, type } = await req.json();
  if (!['setuju', 'pertanyaan_bagus'].includes(type)) return json({ error: 'invalid_type' }, 400);
  if ((comment_id ? 1 : 0) + (thread_id ? 1 : 0) !== 1) {
    return json({ error: 'exactly one of comment_id or thread_id required' }, 400);
  }
  if (type === 'pertanyaan_bagus' && !comment_id) {
    return json({ error: 'pertanyaan_bagus only applies to comments' }, 400);
  }

  const db = serviceClient();

  const membership = await currentMembership(db, userId);
  if (!mufakatPartyFlag(membership).ok) return json({ error: 'party_membership_required' }, 403);

  const { error: insertErr } = await db.from('mufakat_reactions').insert({
    comment_id: comment_id ?? null,
    thread_id: thread_id ?? null,
    user_id: userId,
    type,
  });
  if (insertErr) {
    if (insertErr.code === '23505') return json({ error: 'already_reacted' }, 409);
    return json({ error: insertErr.message }, 500);
  }

  if (type !== 'pertanyaan_bagus') return json({ ok: true });

  // Threshold evaluation (§9.1) on every successful pertanyaan_bagus insert.
  const { data: comment } = await db
    .from('mufakat_comments')
    .select('id, thread_id, author_id, author_party_id, content, html, body_text, state')
    .eq('id', comment_id)
    .single();
  if (!comment || comment.state !== 'visible') return json({ ok: true });

  const { count: reactions } = await db
    .from('mufakat_reactions')
    .select('id', { count: 'exact', head: true })
    .eq('comment_id', comment_id)
    .eq('type', 'pertanyaan_bagus');

  const { threshold, participants } = await evaluateThreshold(db, comment.thread_id);

  if ((reactions ?? 0) < threshold) return json({ ok: true });

  // No split if one already exists for this comment.
  const { data: existingSplit } = await db
    .from('mufakat_splits')
    .select('id')
    .eq('source_comment_id', comment_id)
    .maybeSingle();
  if (existingSplit) return json({ ok: true });

  const result = await executeGoodQuestionSplit(db, comment, {
    reactions: reactions ?? 0,
    participants,
    threshold,
  });

  // Only the fact of the split is public — never the threshold value.
  return json({ ok: true, split: result.outcome === 'split', new_thread_id: result.thread_id ?? null });
});
