import type { RequestHandler } from './$types';

export const prerender = true;

const BASE = 'https://alternatif.space';

const PAGES = [
	{ path: '', priority: '1.0', changefreq: 'weekly' },
	{ path: '/tentang', priority: '0.8', changefreq: 'monthly' },
	{ path: '/contribute', priority: '0.6', changefreq: 'monthly' },
	{ path: '/kontak', priority: '0.6', changefreq: 'yearly' }
];

export const GET: RequestHandler = () => {
	const body =
		'<?xml version="1.0" encoding="UTF-8"?>\n' +
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
		PAGES.map(
			(p) =>
				`  <url><loc>${BASE}${p.path}</loc><changefreq>${p.changefreq}</changefreq><priority>${p.priority}</priority></url>`
		).join('\n') +
		'\n</urlset>\n';

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
