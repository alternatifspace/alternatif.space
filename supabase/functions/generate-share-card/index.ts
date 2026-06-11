import { ImageResponse } from 'https://deno.land/x/og_edge@0.0.6/mod.ts';
import { serviceClient, json, handleOptions } from '../_shared/client.ts';

// generate-share-card (P0-13, TRD §13): composes the party OG share card
// (logo + name + tagline + alternatif.space branding) as a 1200×630 PNG,
// stores it at party-share-cards/{party_id}/share.png and writes
// parties.share_card_url.
//
// Trigger model: party approval is a manual dashboard action (TRD §15 — no
// custom partai admin UI), so there is no code path that runs "at approval".
// Instead the function is idempotent and lazily invoked on first visit to
// /partai/[slug]/bagikan (the page the approval notification links to). It can
// also be called manually or from a cron with the service key. Repeat calls
// return the existing URL unless { force: true }.

const FONT_BASE = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.16/files';

// Module-scope cache: fonts survive across warm invocations.
let fontsPromise: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | null = null;
function loadFonts() {
  fontsPromise ??= (async () => {
    const [regular, bold] = await Promise.all([
      fetch(`${FONT_BASE}/inter-latin-400-normal.woff`).then((r) => r.arrayBuffer()),
      fetch(`${FONT_BASE}/inter-latin-700-normal.woff`).then((r) => r.arrayBuffer()),
    ]);
    return { regular, bold };
  })();
  return fontsPromise;
}

/** Fetch the party logo and inline it as a data URL; null if unavailable. */
async function logoDataUrl(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const type = res.headers.get('content-type') ?? 'image/png';
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
    }
    return `data:${type};base64,${btoa(binary)}`;
  } catch {
    return null;
  }
}

// Plain satori element nodes — no JSX in Deno entrypoints.
function el(type: string, style: Record<string, unknown>, children?: unknown, extra?: Record<string, unknown>) {
  return { type, props: { style, ...extra, children } };
}

function card(party: { name: string; tagline: string | null }, logo: string | null) {
  const children: unknown[] = [];
  if (logo) {
    children.push(
      el('img', { width: 160, height: 160, borderRadius: 24, objectFit: 'cover' }, undefined, {
        src: logo,
        width: 160,
        height: 160,
      }),
    );
  }
  children.push(
    el(
      'div',
      {
        fontSize: party.name.length > 28 ? 56 : 68,
        fontWeight: 700,
        color: '#ffffff',
        textAlign: 'center',
        marginTop: 36,
        maxWidth: 1040,
      },
      party.name,
    ),
  );
  if (party.tagline) {
    children.push(
      el(
        'div',
        { fontSize: 32, color: '#cbd5e1', textAlign: 'center', marginTop: 20, maxWidth: 980 },
        party.tagline,
      ),
    );
  }
  children.push(
    el(
      'div',
      { fontSize: 24, color: '#94a3b8', letterSpacing: 10, marginTop: 48 },
      'ALTERNATIF.SPACE',
    ),
  );

  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1e293b',
      padding: 60,
      fontFamily: 'Inter',
    },
    children,
  );
}

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  let body: { party_id?: string; slug?: string; force?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Body JSON tidak valid' }, 400);
  }
  if (!body.party_id && !body.slug) return json({ error: 'party_id atau slug wajib diisi' }, 400);

  const db = serviceClient();
  let query = db
    .from('parties')
    .select('id, slug, name, tagline, logo_url, status, share_card_url');
  query = body.party_id ? query.eq('id', body.party_id) : query.eq('slug', body.slug!);
  const { data: party, error: partyError } = await query.maybeSingle();
  if (partyError) return json({ error: partyError.message }, 500);
  if (!party) return json({ error: 'Partai tidak ditemukan' }, 404);

  // Mirrors the bagikan-page rule: no card for parties under review or dissolved.
  if (party.status === 'pending_review' || party.status === 'dissolved') {
    return json({ error: 'Partai belum aktif' }, 409);
  }

  // Idempotent: a generated card is final unless explicitly forced.
  if (party.share_card_url && !body.force) {
    return json({ share_card_url: party.share_card_url, generated: false });
  }

  const [fonts, logo] = await Promise.all([loadFonts(), logoDataUrl(party.logo_url)]);

  const image = new ImageResponse(card(party, logo) as Parameters<typeof ImageResponse>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });
  const png = await image.arrayBuffer();

  const path = `${party.id}/share.png`;
  const { error: uploadError } = await db.storage
    .from('party-share-cards')
    .upload(path, png, { contentType: 'image/png', upsert: true });
  if (uploadError) return json({ error: uploadError.message }, 500);

  const { data: pub } = db.storage.from('party-share-cards').getPublicUrl(path);
  const shareCardUrl = pub.publicUrl;

  const { error: updateError } = await db
    .from('parties')
    .update({ share_card_url: shareCardUrl })
    .eq('id', party.id);
  if (updateError) return json({ error: updateError.message }, 500);

  return json({ share_card_url: shareCardUrl, generated: true });
});
