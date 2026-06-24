import { env } from '$env/dynamic/public';

/**
 * Build the public URL for an R2 object key. Reads bypass the app entirely and
 * load straight from the bucket's public custom domain (TRD §6) — zero egress
 * cost, zero load on the SvelteKit app.
 */
export function imageUrl(key: string): string {
	const host = env.PUBLIC_R2_PUBLIC_HOST;
	return `https://${host}/${key}`;
}
