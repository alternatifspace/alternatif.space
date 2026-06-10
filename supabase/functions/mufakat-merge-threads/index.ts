import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { isAdmin } from '../_shared/membership.ts';

// mufakat-merge-threads (TRD §10, M0-02): admin closes a hard duplicate
// discovered post-creation — status dialihkan, permanent redirect to the
// canonical thread, optional comment move, moderation log entry.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { duplicate_thread_id, canonical_thread_id, move_comments } = await req.json();
  if (!duplicate_thread_id || !canonical_thread_id) {
    return json({ error: 'duplicate_thread_id and canonical_thread_id required' }, 400);
  }
  if (duplicate_thread_id === canonical_thread_id) {
    return json({ error: 'threads_identical' }, 400);
  }

  const db = serviceClient();
  if (!(await isAdmin(db, userId))) return json({ error: 'admin_only' }, 403);

  const { data: duplicate } = await db
    .from('mufakat_threads')
    .select('id, status')
    .eq('id', duplicate_thread_id)
    .maybeSingle();
  if (!duplicate) return json({ error: 'duplicate_thread_not_found' }, 404);
  if (duplicate.status === 'dialihkan') return json({ error: 'already_redirected' }, 409);

  const { data: canonical } = await db
    .from('mufakat_threads')
    .select('id, status')
    .eq('id', canonical_thread_id)
    .maybeSingle();
  if (!canonical) return json({ error: 'canonical_thread_not_found' }, 404);
  if (canonical.status === 'dialihkan') {
    // Never chain redirects — the canonical thread must be a real destination.
    return json({ error: 'canonical_is_redirected' }, 409);
  }

  let movedCount = 0;
  if (move_comments) {
    // Whole structure moves intact: parent links and depths are unchanged.
    const { data: moved, error: moveErr } = await db
      .from('mufakat_comments')
      .update({ thread_id: canonical_thread_id })
      .eq('thread_id', duplicate_thread_id)
      .select('id');
    if (moveErr) return json({ error: moveErr.message }, 500);
    movedCount = moved?.length ?? 0;
  }

  const { error } = await db
    .from('mufakat_threads')
    .update({
      status: 'dialihkan',
      redirect_to: canonical_thread_id,
      closed_at: new Date().toISOString(),
    })
    .eq('id', duplicate_thread_id);
  if (error) return json({ error: error.message }, 500);

  await db.from('mufakat_moderation_log').insert({
    action: 'merge_threads',
    subject_type: 'thread',
    subject_id: duplicate_thread_id,
  });

  return json({ ok: true, redirect_to: canonical_thread_id, comments_moved: movedCount });
});
