import type { RequestEvent } from '@sveltejs/kit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

interface EdgeResult<T> {
	ok: boolean;
	status: number;
	data: T & { error?: string };
}

/**
 * Invoke a Supabase Edge Function with the caller's Clerk JWT. All multi-table
 * writes (join/leave/apply/invite/review) go through Edge Functions, never
 * direct table writes (TRD §10).
 */
export async function invokeEdge<T = Record<string, unknown>>(
	event: RequestEvent,
	fn: string,
	body: unknown
): Promise<EdgeResult<T>> {
	const token = await event.locals.auth().getToken({ template: 'supabase' });
	const res = await event.fetch(`${PUBLIC_SUPABASE_URL}/functions/v1/${fn}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
			apikey: PUBLIC_SUPABASE_ANON_KEY
		},
		body: JSON.stringify(body)
	});
	const data = await res.json().catch(() => ({ error: 'invalid_response' }));
	return { ok: res.ok, status: res.status, data };
}
