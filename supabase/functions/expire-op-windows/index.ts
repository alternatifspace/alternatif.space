import { serviceClient, json } from '../_shared/client.ts';
import { notify } from '../_shared/membership.ts';

// expire-op-windows (TRD §9.2, §10, §12): called every 15 minutes by GitHub
// Actions cron. Two jobs:
//   1. No author response within the window → OP-ship confirmed silently
//      (M0-09: "If the author takes no action within 24 hours").
//   2. 4h before expiry → one reminder notification to the author (TRD §12).
Deno.serve(async (_req) => {
  const db = serviceClient();
  const now = new Date();

  const { data: expired, error } = await db
    .from('mufakat_splits')
    .update({ op_status: 'auto_confirmed' })
    .eq('type', 'good_question')
    .eq('op_status', 'pending')
    .lt('op_window_ends_at', now.toISOString())
    .select('id');
  if (error) return json({ error: error.message }, 500);

  // Reminder window: still pending, expires within 4h. The cron fires every
  // 15 minutes, so dedupe against already-sent reminders by split_id.
  const { data: expiring } = await db
    .from('mufakat_splits')
    .select('id, target_thread_id')
    .eq('type', 'good_question')
    .eq('op_status', 'pending')
    .gte('op_window_ends_at', now.toISOString())
    .lt('op_window_ends_at', new Date(now.getTime() + 4 * 3600_000).toISOString());

  let reminded = 0;
  if (expiring?.length) {
    const { data: sent } = await db
      .from('notifications')
      .select('payload')
      .eq('type', 'mufakat_split_op_reminder')
      .in('payload->>split_id', expiring.map((s) => s.id));
    const sentIds = new Set((sent ?? []).map((n) => n.payload?.split_id));

    const pending = expiring.filter((s) => !sentIds.has(s.id));
    if (pending.length) {
      const { data: threads } = await db
        .from('mufakat_threads')
        .select('id, slug, op_id')
        .in('id', pending.map((s) => s.target_thread_id));
      const threadById = new Map((threads ?? []).map((t) => [t.id, t]));

      for (const split of pending) {
        const thread = threadById.get(split.target_thread_id);
        if (!thread?.op_id) continue;
        await notify(db, thread.op_id, 'mufakat_split_op_reminder', {
          split_id: split.id,
          thread_id: thread.id,
          thread_slug: thread.slug,
          message: 'Sisa kurang dari 4 jam untuk merespons OP-ship',
        });
        reminded += 1;
      }
    }
  }

  return json({ ok: true, auto_confirmed: expired?.length ?? 0, reminded });
});
