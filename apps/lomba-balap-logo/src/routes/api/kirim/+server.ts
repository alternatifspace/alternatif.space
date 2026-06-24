import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyTurnstile } from '$lib/server/turnstile';

const MAX_UPLOAD_BYTES = 400 * 1024; // hard server-side backstop (L0-08); client outputs tens of KB.
const DAILY_SUBMISSION_CAP = 3; // mirrors lbl_config.rate_limits default (TRD §3/§9).

// WebP RIFF signature check — never trust the client's Content-Type alone.
function isWebp(buf: ArrayBuffer): boolean {
	const b = new Uint8Array(buf);
	return (
		b.length >= 12 &&
		b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // "RIFF"
		b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50 // "WEBP"
	);
}

// Submission upload (TRD §6). Order matters: bot check + rate limit BEFORE the
// R2 write, which is the step that actually costs quota. RLS (§5) re-checks the
// same guards on the insert as defence in depth.
export const POST: RequestHandler = async ({ locals, request, platform, getClientAddress }) => {
	const user = locals.user;
	if (!user) error(401, 'Masuk dulu buat ngirim logo.');

	const form = await request.formData();

	const okBot = await verifyTurnstile(form.get('cf-turnstile-response'), getClientAddress());
	if (!okBot) error(403, 'Verifikasi anti-bot gagal. Muat ulang halaman dan coba lagi.');

	// Pre-write rate limit (TRD §9): stop hammering before paying R2 cost.
	const { data: attempts } = await locals.supabase.rpc('lbl_submissions_today', { uid: user.id });
	if (typeof attempts === 'number' && attempts >= DAILY_SUBMISSION_CAP) {
		error(429, 'Kamu sudah mencoba beberapa kali hari ini. Coba lagi besok.');
	}

	const title = ((form.get('title') as string | null) ?? '').trim();
	const caption = ((form.get('caption') as string | null) ?? '').trim();
	if (!title) error(400, 'Judul wajib diisi.');
	if (title.length > 80) error(400, 'Judul maksimal 80 karakter.');
	if (caption.length > 280) error(400, 'Caption maksimal 280 karakter.');

	const file = form.get('image');
	if (!(file instanceof Blob)) error(400, 'Gambar wajib diunggah.');
	if (file.size > MAX_UPLOAD_BYTES) error(413, 'Ukuran gambar terlalu besar.');
	const buf = await file.arrayBuffer();
	if (!isWebp(buf.slice(0, 16))) error(415, 'Format gambar tidak valid.');

	const bucket = platform?.env?.LBL_LOGOS;
	if (!bucket) error(500, 'Penyimpanan gambar belum dikonfigurasi.');

	const key = `${user.id}/${crypto.randomUUID()}.webp`;
	await bucket.put(key, buf, { httpMetadata: { contentType: 'image/webp' } });

	// Insert via the RLS-bound client (TRD §5): status forced to 'pending',
	// one-live-submission + open-window + rate caps all enforced in policy.
	const { error: insErr } = await locals.supabase.from('lbl_submissions').insert({
		user_id: user.id,
		image_key: key,
		title,
		caption: caption || null,
		status: 'pending'
	});
	if (insErr) {
		// Roll back the orphaned R2 object so a rejected insert doesn't leak storage.
		await bucket.delete(key).catch(() => {});
		if (insErr.code === '23505') error(409, 'Kamu masih punya satu logo yang aktif. Tarik dulu sebelum kirim lagi.');
		error(400, insErr.message);
	}

	return json({ ok: true });
};
