<script lang="ts">
	import { navigating, page } from '$app/state';
	import { goto, afterNavigate } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { ClerkProvider, UserButton } from 'svelte-clerk';
	import { currentUser, currentParty, PartyBadge, NotificationBell } from '@alternatif/ui';
	import { MUFAKAT_URL } from '$lib/links';
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
	import '../app.css';

	let { data, children } = $props();

	// The signed-out landing surfaces (/, /cara-kerja) carry their own Pamflet
	// header, so the plain app chrome is hidden there to keep one visual system
	// (TRD v1.5 addendum §5). Signed-in users always get the app header.
	const onLanding = $derived(
		!data.signedIn && (page.url.pathname === '/' || page.url.pathname === '/cara-kerja')
	);

	// Mobile nav drawer: the secondary links (Jelajahi, Mufakat, Profil,
	// Bergabung) collapse behind a hamburger below md; the bell and avatar
	// stay inline so notifications are always one tap away.
	let menuOpen = $state(false);
	afterNavigate(() => (menuOpen = false));

	// Lock background scroll while the drawer is open.
	$effect(() => {
		if (typeof document === 'undefined') return;
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => (document.body.style.overflow = '');
	});

	// Offline indicator (9.7): the service worker serves cached pages; the
	// banner tells the user why content may be stale.
	let offline = $state(false);
	$effect(() => {
		offline = typeof navigator !== 'undefined' && !navigator.onLine;
	});

	// Stores are the read surface for components (TRD §11) — populated here
	// from the server-resolved session, never fetched by components.
	$effect(() => {
		currentUser.set(data.user ?? null);
		currentParty.set(
			data.membership
				? {
						id: data.membership.party.id,
						slug: data.membership.party.slug,
						name: data.membership.party.name,
						logo_url: data.membership.party.logo_url,
						status: data.membership.party.status,
						role: data.membership.role
					}
				: null
		);
	});
</script>

<svelte:window
	ononline={() => (offline = false)}
	onoffline={() => (offline = true)}
	onkeydown={(e) => e.key === 'Escape' && (menuOpen = false)}
/>

<!-- Navigation progress bar (9.6): client-side transitions show immediate feedback -->
{#if navigating.to}
	<div class="loading-bar" role="status" aria-label="Memuat halaman"></div>
{/if}

<ClerkProvider>
	<div class="lp min-h-screen">
		{#if offline}
			<div class="bg-amber-100 py-1.5 text-center text-sm text-amber-900">
				Sedang offline — menampilkan konten tersimpan.
			</div>
		{/if}
		{#if !onLanding}
		<header class="border-b-2" style="border-color: var(--lp-ink)">
			<nav class="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
				<!-- Hamburger: mobile only, far left -->
				<button
					type="button"
					class="inline-flex h-11 w-11 items-center justify-center md:hidden"
					aria-label="Menu navigasi"
					aria-expanded={menuOpen}
					onclick={() => (menuOpen = !menuOpen)}
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6">
						<path stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M4 12h16M4 17h16" />
					</svg>
				</button>

				<!-- Wordmark: desktop only (mobile shows it inside the drawer) -->
				<a href="/" class="lp-mono hidden text-base font-bold tracking-[0.15em] uppercase md:inline-block">partai<span class="lp-amber">.alternatif.space</span></a>

				<!-- Secondary links: inline on md+, collapsed into the drawer below md -->
				<div class="ml-auto hidden items-center gap-3 md:flex">
					<a href="/jelajah" class="lp-link text-sm font-medium">Jelajahi</a>
					<a href={MUFAKAT_URL} class="lp-link text-sm font-medium">Mufakat</a>
					{#if data.membership}
						<PartyBadge party={data.membership.party} partaiBaseUrl="" />
					{:else if data.signedIn}
						<a href="/bergabung" class="lp-link text-sm font-medium">Bergabung</a>
					{/if}
					{#if data.signedIn && data.user}
						<a href="/profil/{data.user.id}" class="lp-link text-sm">Profil</a>
					{/if}
				</div>

				<!-- Always-visible cluster: notifications + identity stay one tap away -->
				<div class="ml-auto flex items-center gap-2 md:ml-3">
					{#if data.signedIn}
						<NotificationBell count={data.unreadCount} onclick={() => goto('/notifikasi')} />
						<UserButton />
					{:else}
						<a href="/masuk" class="lp-link text-sm font-medium">Masuk</a>
						<a href="/daftar" class="lp-btn-nav inline-block whitespace-nowrap">Daftar</a>
					{/if}
				</div>
			</nav>
		</header>
		{/if}

		<!-- Mobile drawer -->
		{#if menuOpen}
			<button
				type="button"
				class="fixed inset-0 z-40 bg-[#141210]/40 md:hidden"
				aria-label="Tutup menu"
				onclick={() => (menuOpen = false)}
				transition:fade={{ duration: 150 }}
			></button>
			<div
				class="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80%] flex-col border-r-2 p-5 md:hidden"
				style="background: var(--lp-bone); border-color: var(--lp-ink)"
				transition:fly={{ x: -288, duration: 200 }}
			>
				<a href="/" class="lp-mono text-base font-bold tracking-[0.15em] uppercase">partai<span class="lp-amber">.alternatif.space</span></a>
				<nav class="mt-6 flex flex-col">
					<a href="/jelajah" class="lp-link flex min-h-11 items-center text-sm font-medium">Jelajahi partai</a>
					<a href={MUFAKAT_URL} class="lp-link flex min-h-11 items-center text-sm font-medium">Mufakat</a>
					{#if data.membership}
						<a href="/partai/{data.membership.party.slug}" class="lp-link flex min-h-11 items-center text-sm font-medium">Partaiku</a>
					{:else if data.signedIn}
						<a href="/bergabung" class="lp-link flex min-h-11 items-center text-sm font-medium">Bergabung</a>
					{/if}
					{#if data.signedIn && data.user}
						<a href="/profil/{data.user.id}" class="lp-link flex min-h-11 items-center text-sm font-medium">Profil</a>
					{/if}
				</nav>
			</div>
		{/if}
		{@render children()}
	</div>
</ClerkProvider>

<style>
	.loading-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 50;
		background: linear-gradient(90deg, #141210, #c17d0f, #141210);
		background-size: 200% 100%;
		animation: loading-slide 1s linear infinite;
	}
	@keyframes loading-slide {
		from {
			background-position: 200% 0;
		}
		to {
			background-position: 0% 0;
		}
	}
</style>
