import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const prerender = false;

const RESEND = 'https://api.resend.com/emails';

const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 2000;

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
				html: `<p><strong>Nama:</strong> ${escape(name)}</p>
<p><strong>Email:</strong> ${escape(email)}</p>
<p><strong>Pesan:</strong></p>
<p>${escape(message).replace(/\n/g, '<br>')}</p>`
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
