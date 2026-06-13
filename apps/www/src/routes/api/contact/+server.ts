import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const prerender = false;

const RESEND = 'https://api.resend.com/emails';
const TURNSTILE_VERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;

// HTML-escape for safe interpolation into the notification email. (The previous
// code used the deprecated global escape(), which URL-encodes — it mangled
// legitimate text and is the wrong tool for HTML contexts.)
function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

// Cloudflare Turnstile (bot protection). No-op until TURNSTILE_SECRET_KEY is
// set, so local dev and unconfigured deploys keep working (honeypot still
// applies). Once the secret is set, a valid token becomes mandatory.
async function turnstileOk(token: unknown, remoteIp: string | null): Promise<boolean> {
	const secret = env.TURNSTILE_SECRET_KEY;
	if (!secret) return true;
	if (typeof token !== 'string' || !token) return false;
	try {
		const form = new FormData();
		form.append('secret', secret);
		form.append('response', token);
		if (remoteIp) form.append('remoteip', remoteIp);
		const res = await fetch(TURNSTILE_VERIFY, { method: 'POST', body: form });
		const data = (await res.json()) as { success?: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}

function validate(body: Record<string, unknown>) {
	const errors: string[] = [];

	const name = typeof body.name === 'string' ? body.name.trim() : '';
	const email = typeof body.email === 'string' ? body.email.trim() : '';
	const message = typeof body.message === 'string' ? body.message.trim() : '';
	const gotcha = typeof body._gotcha === 'string' ? body._gotcha : '';

	if (!name) errors.push('Nama wajib diisi.');
	else if (name.length > MAX_NAME) errors.push(`Nama maksimal ${MAX_NAME} karakter.`);

	if (!email) errors.push('Email wajib diisi.');
	else if (email.length > MAX_EMAIL) errors.push(`Email maksimal ${MAX_EMAIL} karakter.`);
	else if (!/.+@.+\..+/.test(email)) errors.push('Format email tidak valid.');

	if (!message) errors.push('Pesan wajib diisi.');
	else if (message.length > MAX_MESSAGE) errors.push(`Pesan maksimal ${MAX_MESSAGE} karakter.`);

	return { name, email, message, gotcha, errors };
}

export async function POST({ request }) {
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') {
		return json({ error: 'Invalid body' }, { status: 400 });
	}

	const { name, email, message, gotcha, errors } = validate(body);

	if (gotcha) {
		return json({ ok: true });
	}

	const remoteIp = request.headers.get('cf-connecting-ip');
	if (!(await turnstileOk((body as Record<string, unknown>).turnstileToken, remoteIp))) {
		return json({ error: 'Verifikasi anti-bot gagal. Muat ulang halaman dan coba lagi.' }, { status: 403 });
	}

	if (errors.length > 0) {
		return json({ error: errors.join(' ') }, { status: 400 });
	}

	const key = env.RESEND_API_KEY;
	if (!key) {
		return json({ error: 'Server configuration error' }, { status: 500 });
	}

	try {
		const res = await fetch(RESEND, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${key}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: `Kontak alternatif.space <noreply@alternatif.space>`,
				to: 'sapa@alternatif.space',
				reply_to: email,
				subject: `Pesan dari ${name} via alternatif.space`,
				html: `<p><strong>Nama:</strong> ${escapeHtml(name)}</p>
<p><strong>Email:</strong> ${escapeHtml(email)}</p>
<p><strong>Pesan:</strong></p>
<p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>`
			})
		});

		if (!res.ok) {
			const err = await res.text();
			console.error('Resend error:', res.status, err);
			return json({ error: 'Gagal mengirim pesan. Coba lagi nanti.' }, { status: 502 });
		}

		return json({ ok: true });
	} catch (e) {
		console.error('Resend fetch error:', e);
		return json({ error: 'Gagal mengirim pesan. Coba lagi nanti.' }, { status: 502 });
	}
}
