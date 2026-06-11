/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// PWA service worker (TRD §14, 9.1/9.2): precaches the app shell and keeps a
// runtime cache of visited pages so recently viewed threads remain browsable
// offline. Cross-origin requests (Supabase, Clerk) are never intercepted.

import { build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const STATIC_CACHE = `static-${version}`;
const PAGES_CACHE = 'pages';
const ASSETS = [...build, ...files];

// Session-bound routes make no sense offline and must never serve stale.
const NEVER_CACHE = [/^\/buat/, /^\/moderasi/, /^\/notifikasi/];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) =>
				Promise.all(keys.filter((k) => k !== STATIC_CACHE && k !== PAGES_CACHE).map((k) => caches.delete(k)))
			)
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	const { request } = event;
	if (request.method !== 'GET') return;

	const url = new URL(request.url);
	if (url.origin !== sw.location.origin) return;

	// App shell: immutable, cache-first.
	if (ASSETS.includes(url.pathname)) {
		event.respondWith(
			caches.open(STATIC_CACHE).then(async (cache) => (await cache.match(url.pathname)) ?? fetch(request))
		);
		return;
	}

	if (NEVER_CACHE.some((re) => re.test(url.pathname))) return;

	// Pages + SvelteKit data: network-first, cache fallback (offline browsing).
	const isPage = request.mode === 'navigate' || url.pathname.endsWith('/__data.json');
	if (!isPage) return;

	event.respondWith(
		(async () => {
			const cache = await caches.open(PAGES_CACHE);
			try {
				const response = await fetch(request);
				if (response.ok) cache.put(request, response.clone());
				return response;
			} catch {
				const cached = await cache.match(request);
				if (cached) return cached;
				// Last resort for navigations: the cached start page.
				if (request.mode === 'navigate') {
					const home = await cache.match('/');
					if (home) return home;
				}
				return new Response('Sedang offline dan halaman ini belum pernah dibuka.', {
					status: 503,
					headers: { 'Content-Type': 'text/plain; charset=utf-8' }
				});
			}
		})()
	);
});
