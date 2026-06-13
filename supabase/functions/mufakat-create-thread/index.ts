import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';
import { currentMembership, mufakatPartyFlag, getConfig } from '../_shared/membership.ts';
import { tiptapToText, slugify } from '../_shared/mufakat.ts';
import { tiptapToHtml } from '../_shared/tiptap-html.ts';

interface RateLimits {
  new_account_hours: number;
  new_account_threads_per_day: number;
  new_account_comments_per_day: number;
  threads_per_day: number;
}

// mufakat-create-thread (TRD §10): rate-limit check, party-membership check,
// slug generation, plain-text extraction, insert. Dedup suggestions happen
// client-side pre-submit via search_similar_threads.
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  // body_html is intentionally NOT read from the request: display HTML is
  // always re-derived server-side from the trusted JSON to prevent stored XSS.
  const { title, body_content } = await req.json();
  if (!title || title.length > 200) return json({ error: 'title required (≤200 chars)' }, 400);

  const db = serviceClient();

  const membership = await currentMembership(db, userId);
  const flag = mufakatPartyFlag(membership);
  if (!flag.ok) return json({ error: 'party_membership_required' }, 403);

  // Rate limiting (M0-17): invisible until hit, then explained plainly.
  const limits = await getConfig<RateLimits>(db, 'mufakat_rate_limits');
  const { data: user } = await db.from('users').select('created_at').eq('id', userId).single();
  const isNewAccount =
    user && Date.now() - new Date(user.created_at).getTime() < limits.new_account_hours * 3600_000;
  const dayAgo = new Date(Date.now() - 24 * 3600_000).toISOString();
  const { count } = await db
    .from('mufakat_threads')
    .select('id', { count: 'exact', head: true })
    .eq('op_id', userId)
    .gte('created_at', dayAgo);
  const limit = isNewAccount ? limits.new_account_threads_per_day : limits.threads_per_day;
  if ((count ?? 0) >= limit) {
    return json({
      error: 'rate_limited',
      explanation: `Untuk menjaga kualitas diskusi, ${
        isNewAccount ? 'akun baru' : 'setiap anggota'
      } dibatasi ${limit} diskusi baru per hari. Coba lagi besok.`,
    }, 429);
  }

  const bodyText = body_content ? tiptapToText(body_content) : null;
  const { data: thread, error } = await db
    .from('mufakat_threads')
    .insert({
      slug: slugify(title),
      title,
      body_content: body_content ?? null,
      body_html: tiptapToHtml(body_content),
      body_text: bodyText,
      op_id: userId,
      op_party_id: flag.partyId,   // NULL when muted — flagless posting (M0-06)
    })
    .select('id, slug')
    .single();
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, id: thread.id, slug: thread.slug });
});
