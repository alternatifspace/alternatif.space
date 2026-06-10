import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { isAdmin } from '../_shared/membership.ts';
import { tiptapToText } from '../_shared/mufakat.ts';

// mufakat-close-thread (TRD §10, M0-03): OP or admin sets selesai (with a
// closing summary) or pertanyaan_terbuka. Parent markers and placeholder cards
// reflect the change automatically via live read — no write-back (§9.4, M0-15).
// Community-raised threads have no OP and are admin-stewarded (M0-09).
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { thread_id, status, closing_summary } = await req.json();
  if (!thread_id || !['selesai', 'pertanyaan_terbuka'].includes(status)) {
    return json({ error: 'thread_id and status (selesai|pertanyaan_terbuka) required' }, 400);
  }
  if (status === 'selesai' && !closing_summary) {
    // Selesai is a resolution artifact — it requires a record of the conclusion.
    return json({ error: 'closing_summary_required' }, 400);
  }
  if (status === 'selesai' && !tiptapToText(closing_summary).trim()) {
    return json({ error: 'closing_summary_empty' }, 400);
  }

  const db = serviceClient();

  const { data: thread } = await db
    .from('mufakat_threads')
    .select('id, op_id, status')
    .eq('id', thread_id)
    .maybeSingle();
  if (!thread) return json({ error: 'thread_not_found' }, 404);
  if (thread.status !== 'aktif') {
    return json({ error: 'thread_not_active', status: thread.status }, 409);
  }

  if (thread.op_id !== userId && !(await isAdmin(db, userId))) {
    return json({ error: 'op_or_admin_only' }, 403);
  }

  const { error } = await db
    .from('mufakat_threads')
    .update({
      status,
      closing_summary: status === 'selesai' ? closing_summary : null,
      closed_at: new Date().toISOString(),
    })
    .eq('id', thread_id);
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, status });
});
