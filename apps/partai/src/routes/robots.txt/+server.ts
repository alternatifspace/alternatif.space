import type { RequestHandler } from './$types';

// robots (TRD v1.5 addendum §3): content is crawlable; auth + create + the
// (future) dashboard are kept out of the index. Static — safe to prerender.
export const prerender = true;

const BASE = 'https://partai.alternatif.space';

export const GET: RequestHandler = () => {
	const body = `User-agent: *
Allow: /
Disallow: /masuk
Disallow: /daftar
Disallow: /onboarding
Disallow: /buat-partai
Disallow: /dashboard

Sitemap: ${BASE}/sitemap.xml
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
