import type { RequestHandler } from './$types';

export const prerender = true;

const BASE = 'https://alternatif.space';

export const GET: RequestHandler = () => {
	const body = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${BASE}/sitemap.xml
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
