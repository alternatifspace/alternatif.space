import { supabaseServer } from '$lib/supabase';
import type { RequestHandler } from './$types';

// Public sitemap (TRD v1.5 addendum §3): landing + feed + every non-hidden
// thread + the public moderation log. Threads are the primary SEO surface
// (the X-style "content URLs stay crawlable" model). SSR, edge-cached.
const BASE = 'https://mufakat.alternatif.space';
const STATIC = ['', '/jelajah', '/moderasi/log'];

export const GET: RequestHandler = async (event) => {
	const db = supabaseServer(event);
	const { data: threads } = await db
		.from('mufakat_threads')
		.select('slug')
		.eq('hidden', false)
		.limit(5000);

	const locs = [
		...STATIC.map((p) => `${BASE}${p}`),
		...(threads ?? []).map((t) => `${BASE}/diskusi/${t.slug}`)
	];

	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		locs.map((loc) => `  <url><loc>${loc}</loc></url>`).join('\n') +
		'\n</urlset>\n';

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
