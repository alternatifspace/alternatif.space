import { serviceClient, json } from '../_shared/client.ts';

// expire-op-windows (TRD §9.2, §10): called every 15 minutes by GitHub Actions
// cron. No author response within the window → OP-ship is confirmed silently
// (M0-09: "If the author takes no action within 24 hours").
Deno.serve(async (_req) => {
  const db = serviceClient();

  const { data: expired, error } = await db
    .from('mufakat_splits')
    .update({ op_status: 'auto_confirmed' })
    .eq('type', 'good_question')
    .eq('op_status', 'pending')
    .lt('op_window_ends_at', new Date().toISOString())
    .select('id');
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, auto_confirmed: expired?.length ?? 0 });
});
