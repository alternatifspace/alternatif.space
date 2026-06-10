import { serviceClient, callerUserId, json, handleOptions } from '../_shared/client.ts';

// ITE constraints surfaced as pedagogy at the point of friction (M0-16):
// the confirmation copy explains *why* each category exists in Indonesian law,
// never as a wall of rules at onboarding.
const CATEGORY_PEDAGOGY: Record<string, string> = {
  sara:
    'Ujaran kebencian berbasis suku, agama, ras, dan antargolongan (SARA) dilarang oleh UU ITE Pasal 28 ayat (2). Kategori ini ada karena platform wajib menindak konten yang menyebarkan kebencian terhadap kelompok.',
  defamation:
    'Pencemaran nama baik diatur dalam UU ITE Pasal 27A. Kategori ini ada karena tuduhan terhadap pribadi seseorang punya konsekuensi hukum — kritik terhadap gagasan tetap bebas, serangan terhadap nama baik tidak.',
  threat:
    'Ancaman kekerasan atau menakut-nakuti diatur dalam UU ITE Pasal 29. Kategori ini ada karena ruang deliberasi hanya berfungsi bila tidak ada yang merasa terancam secara fisik.',
  spam:
    'Spam bukan pelanggaran UU ITE, tetapi merusak kualitas deliberasi. Kategori ini adalah aturan platform untuk menjaga setiap diskusi tetap bermakna.',
};

// mufakat-report-content (TRD §10, §15, M0-16): report intake — category
// (ITE-relevant classes plus spam) + optional note. Post-moderation: content
// stays visible until an admin reviews (mufakat-review-report).
Deno.serve(async (req) => {
  const opts = handleOptions(req);
  if (opts) return opts;

  const userId = await callerUserId(req);
  if (!userId) return json({ error: 'unauthenticated' }, 401);

  const { subject_type, subject_id, category, note } = await req.json();
  if (!['thread', 'comment'].includes(subject_type) || !subject_id) {
    return json({ error: 'subject_type (thread|comment) and subject_id required' }, 400);
  }
  if (!(category in CATEGORY_PEDAGOGY)) {
    return json({ error: 'invalid_category', categories: Object.keys(CATEGORY_PEDAGOGY) }, 400);
  }
  if (note && note.length > 500) return json({ error: 'note_too_long', max: 500 }, 400);

  const db = serviceClient();

  const table = subject_type === 'thread' ? 'mufakat_threads' : 'mufakat_comments';
  const { data: subject } = await db.from(table).select('id').eq('id', subject_id).maybeSingle();
  if (!subject) return json({ error: 'subject_not_found' }, 404);

  const { error } = await db.from('mufakat_reports').insert({
    subject_type,
    subject_id,
    reported_by: userId,
    category,
    note: note ?? null,
  });
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, confirmation: CATEGORY_PEDAGOGY[category] });
});
