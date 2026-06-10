import { serviceClient, json } from '../_shared/client.ts';

// update-dormant-status (TRD §8, §10): called by daily GitHub Actions cron.
// Handles the cold case — leaders who go silent and never fire the activity trigger.
Deno.serve(async (_req) => {
  const db = serviceClient();

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: dormanted, error } = await db
    .from('parties')
    .update({ status: 'dormant' })
    .eq('status', 'active')
    .lt('leader_last_active_at', cutoff)
    .select('id');
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, dormanted: dormanted?.length ?? 0 });
});
