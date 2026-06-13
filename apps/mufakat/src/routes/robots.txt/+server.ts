import type { RequestHandler } from './$types';

// robots (TRD v1.5 addendum §3): threads + feed + the public log are crawlable;
// write surfaces, notifications, and the admin queues are kept out. The public
// moderation log under /moderasi is re-allowed explicitly. Static — prerendered.
export const prerender = true;

const BASE = 'https://mufakat.alternatif.space';

export const GET: RequestHandler = () => {
	const body = `User-agent: *
Allow: /
Disallow: /buat
Disallow: /notifikasi
Disallow: /moderasi
Allow: /moderasi/log

Sitemap: ${BASE}/sitemap.xml
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
