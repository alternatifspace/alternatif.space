import { env } from '$env/dynamic/private';

/**
 * Verify a Cloudflare Turnstile token server-side (TRD §6, §9). Gate the
 * submission route on this before any R2 write or DB insert, to filter out
 * headless-browser bots flooding the moderation queue.
 */
export async function verifyTurnstile(token: FormDataEntryValue | null, ip?: string | null): Promise<boolean> {
	const secret = env.TURNSTILE_SECRET_KEY;
	// Fail closed in production if the secret is missing; allow through only when
	// explicitly unset locally (dev convenience). Use the dummy keys for local.
	if (!secret) return false;
	if (typeof token !== 'string' || !token) return false;

	const body = new FormData();
	body.append('secret', secret);
	body.append('response', token);
	if (ip) body.append('remoteip', ip);

	try {
		const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
			method: 'POST',
			body
		});
		const data = (await res.json()) as { success: boolean };
		return data.success === true;
	} catch {
		return false;
	}
}
