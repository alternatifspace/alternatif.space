import { supabaseServer } from '$lib/supabase';
import type { RequestHandler } from './$types';

// Public sitemap (TRD v1.5 addendum §3): landing + browse + every public party
// profile. pending_review parties are excluded (never public). SSR (depends on
// DB), cached an hour at the edge.
const BASE = 'https://partai.alternatif.space';
const STATIC = ['', '/cara-kerja', '/jelajah'];

export const GET: RequestHandler = async (event) => {
	const db = supabaseServer(event);
	const { data: parties } = await db
		.from('parties')
		.select('slug')
		.in('status', ['active', 'dormant']);

	const locs = [
		...STATIC.map((p) => `${BASE}${p}`),
		...(parties ?? []).flatMap((p) => [
			`${BASE}/partai/${p.slug}`,
			`${BASE}/partai/${p.slug}/anggota`
		])
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
