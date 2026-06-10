import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { isAdmin } from '../_shared/membership.ts';

// mufakat-review-report (TRD §10, §15, M0-16): admin reviews a pending report —
// dismiss / hide / escalate. Hide preserves structure: comments get
// state='hidden' (rendered "[disembunyikan moderator]" by the public view);
// threads get hidden=true (migration 00005). Every action is logged; the log
// is publicly viewable in aggregate (action type + date, no identities).
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { report_id, action } = await req.json();
  if (!report_id || !['dismiss', 'hide', 'escalate'].includes(action)) {
    return json({ error: 'report_id and action (dismiss|hide|escalate) required' }, 400);
  }

  const db = serviceClient();
  if (!(await isAdmin(db, userId))) return json({ error: 'admin_only' }, 403);

  const { data: report } = await db
    .from('mufakat_reports')
    .select('id, subject_type, subject_id, status')
    .eq('id', report_id)
    .maybeSingle();
  if (!report) return json({ error: 'report_not_found' }, 404);
  if (report.status !== 'pending') {
    return json({ error: 'already_reviewed', status: report.status }, 409);
  }

  let logAction: string;
  if (action === 'hide') {
    if (report.subject_type === 'comment') {
      const { error } = await db
        .from('mufakat_comments')
        .update({ state: 'hidden' })
        .eq('id', report.subject_id);
      if (error) return json({ error: error.message }, 500);
      logAction = 'hide_comment';
    } else {
      const { error } = await db
        .from('mufakat_threads')
        .update({ hidden: true })
        .eq('id', report.subject_id);
      if (error) return json({ error: error.message }, 500);
      logAction = 'hide_thread';
    }
  } else {
    logAction = action === 'dismiss' ? 'dismiss_report' : 'escalate_report';
  }

  const reportStatus = action === 'dismiss' ? 'dismissed' : action === 'hide' ? 'hidden' : 'escalated';
  const { error: reportErr } = await db
    .from('mufakat_reports')
    .update({ status: reportStatus, reviewed_by: userId, reviewed_at: new Date().toISOString() })
    .eq('id', report.id);
  if (reportErr) return json({ error: reportErr.message }, 500);

  await db.from('mufakat_moderation_log').insert({
    action: logAction,
    subject_type: report.subject_type,
    subject_id: report.subject_id,
  });

  return json({ ok: true, status: reportStatus });
});
