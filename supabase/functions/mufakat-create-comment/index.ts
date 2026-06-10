import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership, mufakatPartyFlag, getConfig } from '../_shared/membership.ts';
import { tiptapToText } from '../_shared/mufakat.ts';

interface RateLimits {
  new_account_hours: number;
  new_account_comments_per_day: number;
}

// mufakat-create-comment (TRD §10): rate-limit check, thread aktif check,
// depth computation + max-depth enforcement, scar-redirect rejection.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { thread_id, parent_id, content, html } = await req.json();
  if (!thread_id || !content) return json({ error: 'thread_id and content required' }, 400);

  const db = serviceClient();

  const membership = await currentMembership(db, userId);
  const flag = mufakatPartyFlag(membership);
  if (!flag.ok) return json({ error: 'party_membership_required' }, 403);

  const { data: thread } = await db
    .from('mufakat_threads')
    .select('id, status, redirect_to')
    .eq('id', thread_id)
    .maybeSingle();
  if (!thread) return json({ error: 'thread_not_found' }, 404);
  if (thread.status !== 'aktif') {
    return json({ error: 'thread_not_active', status: thread.status, redirect_to: thread.redirect_to }, 409);
  }

  let depth = 0;
  if (parent_id) {
    const { data: parent } = await db
      .from('mufakat_comments')
      .select('id, thread_id, depth, state, moved_to_thread_id')
      .eq('id', parent_id)
      .maybeSingle();
    if (!parent || parent.thread_id !== thread_id) return json({ error: 'parent_not_found' }, 404);
    if (parent.state === 'moved') {
      // Scar: reply attempts redirect to the target thread (TRD §6, Q10).
      return json({ error: 'comment_moved', moved_to_thread_id: parent.moved_to_thread_id }, 409);
    }
    depth = parent.depth + 1;
    if (depth > 3) {
      // Deeper exchanges are spin-off candidates, not infinite nesting (M0-05).
      return json({ error: 'max_depth_reached', max_depth: 3 }, 409);
    }
  }

  // Rate limiting (M0-17) — comment cap applies to new accounts.
  const limits = await getConfig<RateLimits>(db, 'mufakat_rate_limits');
  const { data: user } = await db.from('users').select('created_at').eq('id', userId).single();
  const isNewAccount =
    user && Date.now() - new Date(user.created_at).getTime() < limits.new_account_hours * 3600_000;
  if (isNewAccount) {
    const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
    const { count } = await db
      .from('mufakat_comments')
      .select('id', { count: 'exact', head: true })
      .eq('author_id', userId)
      .gte('created_at', dayAgo);
    if ((count ?? 0) >= limits.new_account_comments_per_day) {
      return json({
        error: 'rate_limited',
        explanation: `Akun baru dibatasi ${limits.new_account_comments_per_day} komentar per hari. Coba lagi besok.`,
      }, 429);
    }
  }

  const { data: comment, error } = await db
    .from('mufakat_comments')
    .insert({
      thread_id,
      author_id: userId,
      author_party_id: flag.partyId,   // NULL when muted (M0-06)
      parent_id: parent_id ?? null,
      depth,
      content,
      html: html ?? null,
      body_text: tiptapToText(content),
    })
    .select('id')
    .single();
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, id: comment.id, depth });
});
