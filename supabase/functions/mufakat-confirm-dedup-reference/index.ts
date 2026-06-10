import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { isAdmin } from '../_shared/membership.ts';
import { executeGoodQuestionSplit } from '../_shared/mufakat.ts';

// mufakat-confirm-dedup-reference (TRD §9.2 step 1, M0-09): the good-question
// threshold was met but a canonical thread for the question may already exist.
// Phase 0: an admin confirms (seed comment → moved scar pointing at the
// existing thread; no new thread) or rejects (proceed to split execution,
// dedup skipped). A split is pending while its seed comment is still visible.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { split_id, action } = await req.json();
  if (!split_id || !['confirm', 'reject'].includes(action)) {
    return json({ error: 'split_id and action (confirm|reject) required' }, 400);
  }

  const db = serviceClient();
  if (!(await isAdmin(db, userId))) return json({ error: 'admin_only' }, 403);

  const { data: split } = await db
    .from('mufakat_splits')
    .select(
      'id, type, source_comment_id, target_thread_id, reaction_count_at_split, participants_at_split, threshold_at_split',
    )
    .eq('id', split_id)
    .maybeSingle();
  if (!split || split.type !== 'dedup_reference') return json({ error: 'split_not_found' }, 404);

  const { data: seed } = await db
    .from('mufakat_comments')
    .select('id, thread_id, author_id, author_party_id, content, html, body_text, state')
    .eq('id', split.source_comment_id)
    .single();
  if (!seed || seed.state !== 'visible') {
    return json({ error: 'not_pending', seed_state: seed?.state ?? null }, 409);
  }

  if (action === 'confirm') {
    // Seed becomes the scar pointing at the existing canonical thread (§9.2).
    const { error } = await db
      .from('mufakat_comments')
      .update({ state: 'moved', moved_to_thread_id: split.target_thread_id })
      .eq('id', seed.id);
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true, outcome: 'confirmed', target_thread_id: split.target_thread_id });
  }

  // Reject: the candidate was not the same question — proceed to step 2.
  // The dedup row is replaced by the good_question audit row the split creates
  // (one split row per seed comment; mufakat-react relies on that).
  const { error: delErr } = await db.from('mufakat_splits').delete().eq('id', split.id);
  if (delErr) return json({ error: delErr.message }, 500);

  const result = await executeGoodQuestionSplit(
    db,
    seed,
    {
      reactions: split.reaction_count_at_split ?? 0,
      participants: split.participants_at_split ?? 0,
      threshold: split.threshold_at_split ?? 0,
    },
    { skipDedup: true },
  );

  return json({ ok: true, outcome: 'rejected_and_split', new_thread_id: result.thread_id });
});
