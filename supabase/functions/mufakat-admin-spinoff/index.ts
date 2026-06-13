import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { isAdmin } from '../_shared/membership.ts';
import { slugify, moveCommentSet } from '../_shared/mufakat.ts';
import { escapeHtml } from '../_shared/tiptap-html.ts';

// mufakat-admin-spinoff (TRD §9.3, M0-13): admin selects a contiguous reply
// chain constituting a semantic sub-debate. Triggering comments STAY (unlike
// good-question seeds); selected replies MOVE (D0). Dedup check runs first —
// if a canonical thread for the disputed concept exists, replies move there
// and the marker links to it instead of a new thread.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { thread_id, comment_ids, label, title, after_comment_id } = await req.json();
  if (!thread_id || !Array.isArray(comment_ids) || comment_ids.length === 0 || !label) {
    return json({ error: 'thread_id, comment_ids and label required' }, 400);
  }

  const db = serviceClient();
  if (!(await isAdmin(db, userId))) return json({ error: 'admin_only' }, 403);

  const { data: sourceThread } = await db
    .from('mufakat_threads')
    .select('id, slug, title, body_text')
    .eq('id', thread_id)
    .maybeSingle();
  if (!sourceThread) return json({ error: 'thread_not_found' }, 404);

  const { data: selected } = await db
    .from('mufakat_comments')
    .select('id, thread_id, parent_id, state')
    .in('id', comment_ids);
  if (
    !selected ||
    selected.length !== comment_ids.length ||
    selected.some((c) => c.thread_id !== thread_id || c.state !== 'visible')
  ) {
    return json({ error: 'invalid_selection' }, 400);
  }

  // The triggering comment is the parent of the chain head — it stays (§9.3 step 3).
  const ids = new Set(selected.map((c) => c.id));
  const head = selected.find((c) => !c.parent_id || !ids.has(c.parent_id));
  const triggeringCommentId = head?.parent_id && !ids.has(head.parent_id) ? head.parent_id : null;

  // Step 2 — dedup check against existing canonical threads.
  const { data: candidates } = await db.rpc('search_similar_threads', { q: label });
  const candidate = (candidates ?? []).find(
    (c: { id: string; sim: number }) => c.sim > 0.5 && c.id !== thread_id,
  );

  let targetThreadId: string;
  let markerKind: 'spinoff' | 'dedup_reference';
  if (candidate) {
    targetThreadId = candidate.id;
    markerKind = 'dedup_reference';
  } else {
    const threadTitle = (title ?? label).slice(0, 200);
    const contextText = `Konteks dari diskusi asal "${sourceThread.title}": ${
      (sourceThread.body_text ?? '').slice(0, 280)
    }`;
    const { data: newThread, error: threadErr } = await db
      .from('mufakat_threads')
      .insert({
        slug: slugify(threadTitle),
        title: threadTitle,
        body_html: `<blockquote data-context-block><p>${escapeHtml(contextText)}</p><p><a href="/diskusi/${encodeURIComponent(sourceThread.slug)}">← diskusi asal</a></p></blockquote>`,
        body_text: contextText,
        op_id: null,                       // admin-stewarded sub-debate, no individual OP
        origin: 'spinoff',
        parent_thread_id: thread_id,
        seed_comment_id: triggeringCommentId,
      })
      .select('id')
      .single();
    if (threadErr) return json({ error: threadErr.message }, 500);
    targetThreadId = newThread.id;
    markerKind = 'spinoff';
  }

  // Replies MOVE (D0); depths recomputed relative to the target thread.
  await moveCommentSet(db, selected, targetThreadId);

  const { data: split, error: splitErr } = await db
    .from('mufakat_splits')
    .insert({
      type: 'spinoff',
      source_thread_id: thread_id,
      source_comment_id: triggeringCommentId,
      target_thread_id: targetThreadId,
      op_status: 'n_a',
      created_by: userId,
    })
    .select('id')
    .single();
  if (splitErr) return json({ error: splitErr.message }, 500);

  const { error: markerErr } = await db.from('mufakat_markers').insert({
    thread_id,
    after_comment_id: after_comment_id ?? triggeringCommentId,
    split_id: split.id,
    kind: markerKind,
    label,
  });
  if (markerErr) return json({ error: markerErr.message }, 500);

  // Resolve any semantic flags on the chain (M0-14: M0-13 is the resolution action).
  const flagged = [...comment_ids, ...(triggeringCommentId ? [triggeringCommentId] : [])];
  await db
    .from('mufakat_semantic_flags')
    .update({ status: 'actioned' })
    .in('comment_id', flagged)
    .eq('status', 'pending');

  await db.from('mufakat_moderation_log').insert({
    action: 'spinoff_executed',
    subject_type: 'thread',
    subject_id: thread_id,
  });

  return json({
    ok: true,
    target_thread_id: targetThreadId,
    split_id: split.id,
    moved_to_existing: !!candidate,
  });
});
