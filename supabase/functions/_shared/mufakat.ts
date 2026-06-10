import { SupabaseClient } from 'npm:@supabase/supabase-js@2';
import { getConfig, notify } from './membership.ts';

/** Plain-text extraction from TipTap JSON (feeds body_text → search_tsv). */
export function tiptapToText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as Record<string, unknown>;
  if (n.type === 'text' && typeof n.text === 'string') return n.text;
  if (Array.isArray(n.content)) {
    return n.content.map(tiptapToText).join(n.type === 'doc' ? '\n' : ' ').trim();
  }
  return '';
}

export function slugify(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

interface ThresholdConfig {
  floor: number;
  ceiling: number;
  ratio: number;
}

/**
 * Threshold evaluation (TRD §9.1, M0-08).
 * unique participants = OP + distinct comment authors (excluding moved scars).
 * The threshold value is never returned to clients (Q9).
 */
export async function evaluateThreshold(
  db: SupabaseClient,
  threadId: string,
): Promise<{ threshold: number; participants: number }> {
  const cfg = await getConfig<ThresholdConfig>(db, 'mufakat_split_threshold');

  const { data: thread } = await db
    .from('mufakat_threads')
    .select('op_id')
    .eq('id', threadId)
    .single();

  const { data: authors } = await db
    .from('mufakat_comments')
    .select('author_id')
    .eq('thread_id', threadId)
    .neq('state', 'moved');

  const uids = new Set((authors ?? []).map((a) => a.author_id));
  if (thread?.op_id) uids.add(thread.op_id);
  const participants = uids.size;

  const threshold = Math.max(
    cfg.floor,
    Math.min(cfg.ceiling, Math.ceil(cfg.ratio * participants)),
  );
  return { threshold, participants };
}

/** Collect all descendant comment ids of a seed comment within a thread. */
async function descendantsOf(
  db: SupabaseClient,
  threadId: string,
  seedId: string,
): Promise<Map<string, string | null>> {
  const { data: all } = await db
    .from('mufakat_comments')
    .select('id, parent_id')
    .eq('thread_id', threadId);
  const children = new Map<string, string[]>();
  for (const c of all ?? []) {
    if (!c.parent_id) continue;
    const list = children.get(c.parent_id) ?? [];
    list.push(c.id);
    children.set(c.parent_id, list);
  }
  // moved subtree: id → new parent_id (seed's children become top-level)
  const moved = new Map<string, string | null>();
  const queue: Array<{ id: string; newParent: string | null }> = (children.get(seedId) ?? [])
    .map((id) => ({ id, newParent: null }));
  while (queue.length) {
    const { id, newParent } = queue.shift()!;
    moved.set(id, newParent);
    for (const childId of children.get(id) ?? []) {
      queue.push({ id: childId, newParent: id });
    }
  }
  return moved;
}

/** Recompute depth for moved comments relative to the new thread (TRD §9.2 step 3). */
function recomputeDepths(moved: Map<string, string | null>): Map<string, number> {
  const depths = new Map<string, number>();
  const depthOf = (id: string): number => {
    if (depths.has(id)) return depths.get(id)!;
    const parent = moved.get(id);
    const d = parent === null || parent === undefined ? 0 : Math.min(3, depthOf(parent) + 1);
    depths.set(id, d);
    return d;
  };
  for (const id of moved.keys()) depthOf(id);
  return depths;
}

/**
 * Good-question split execution (TRD §9.2, M0-09/10/11).
 * D0: "Move, leave a scar" — replies MOVE, the seed row is frozen as the scar.
 * Returns the new thread id, or the dedup-pending split id if a candidate exists.
 */
export async function executeGoodQuestionSplit(
  db: SupabaseClient,
  comment: {
    id: string;
    thread_id: string;
    author_id: string;
    author_party_id: string | null;
    content: unknown;
    html: string | null;
    body_text: string | null;
  },
  snapshot: { reactions: number; participants: number; threshold: number },
): Promise<{ outcome: 'dedup_pending' | 'split'; thread_id?: string; split_id: string }> {
  const bodyText = comment.body_text ?? '';

  // Step 1 — dedup check: an existing canonical thread for this question?
  const { data: candidates } = await db.rpc('search_similar_threads', { q: bodyText.slice(0, 200) });
  const candidate = (candidates ?? []).find(
    (c: { id: string; sim: number }) => c.sim > 0.5 && c.id !== comment.thread_id,
  );
  if (candidate) {
    // Phase 0: requires admin confirmation before executing (M0-09).
    const { data: split, error } = await db
      .from('mufakat_splits')
      .insert({
        type: 'dedup_reference',
        source_thread_id: comment.thread_id,
        source_comment_id: comment.id,
        target_thread_id: candidate.id,
        reaction_count_at_split: snapshot.reactions,
        participants_at_split: snapshot.participants,
        threshold_at_split: snapshot.threshold,
        op_status: 'n_a',
      })
      .select('id')
      .single();
    if (error) throw error;
    return { outcome: 'dedup_pending', split_id: split.id };
  }

  // Step 2 — new thread: seed comment content + auto-generated context block.
  const { data: parent } = await db
    .from('mufakat_threads')
    .select('id, slug, title, body_text')
    .eq('id', comment.thread_id)
    .single();

  const title = bodyText.slice(0, 197) + (bodyText.length > 197 ? '…' : '');
  const contextText = `Konteks dari diskusi asal "${parent?.title ?? ''}": ${
    (parent?.body_text ?? '').slice(0, 280)
  }`;
  const { data: newThread, error: threadErr } = await db
    .from('mufakat_threads')
    .insert({
      slug: slugify(title),
      title,
      body_content: comment.content,
      body_html: `${comment.html ?? ''}<blockquote data-context-block><p>${contextText}</p><p><a href="/diskusi/${parent?.slug}">← diskusi asal</a></p></blockquote>`,
      body_text: `${bodyText}\n\n${contextText}`,
      op_id: comment.author_id,
      op_party_id: comment.author_party_id,
      origin: 'split',
      parent_thread_id: comment.thread_id,
      seed_comment_id: comment.id,
    })
    .select('id')
    .single();
  if (threadErr) throw threadErr;

  // Step 3 — replies MOVE (nothing duplicated), depths recomputed.
  const moved = await descendantsOf(db, comment.thread_id, comment.id);
  const depths = recomputeDepths(moved);
  for (const [id, newParent] of moved) {
    await db
      .from('mufakat_comments')
      .update({ thread_id: newThread.id, parent_id: newParent, depth: depths.get(id) ?? 0 })
      .eq('id', id);
  }

  // Step 4 — freeze the seed comment as the scar.
  await db
    .from('mufakat_comments')
    .update({ state: 'moved', moved_to_thread_id: newThread.id })
    .eq('id', comment.id);

  // Step 5 — split audit row with OP-ship window (D2).
  const opWindowHours = await getConfig<number>(db, 'mufakat_op_window_hours');
  const { data: split, error: splitErr } = await db
    .from('mufakat_splits')
    .insert({
      type: 'good_question',
      source_thread_id: comment.thread_id,
      source_comment_id: comment.id,
      target_thread_id: newThread.id,
      reaction_count_at_split: snapshot.reactions,
      participants_at_split: snapshot.participants,
      threshold_at_split: snapshot.threshold,
      op_status: 'pending',
      op_window_ends_at: new Date(Date.now() + opWindowHours * 3600_000).toISOString(),
    })
    .select('id')
    .single();
  if (splitErr) throw splitErr;

  // Step 6 — notify the author ("Komentarmu jadi diskusi baru").
  await notify(db, comment.author_id, 'mufakat_split_op_window', {
    split_id: split.id,
    thread_id: newThread.id,
    message: 'Komentarmu jadi diskusi baru',
  });

  return { outcome: 'split', thread_id: newThread.id, split_id: split.id };
}
