<script lang="ts">
	import { navigating } from '$app/state';
	import { ClerkProvider, UserButton } from 'svelte-clerk';
	import { currentUser, currentParty, PartyBadge } from '@alternatif/ui';
	import '../app.css';

	let { data, children } = $props();

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

<svelte:window ononline={() => (offline = false)} onoffline={() => (offline = true)} />

<!-- Navigation progress bar (9.6): client-side transitions show immediate feedback -->
{#if navigating.to}
	<div class="loading-bar" role="status" aria-label="Memuat halaman"></div>
{/if}

<ClerkProvider>
	{#if offline}
		<div class="bg-amber-100 py-1.5 text-center text-sm text-amber-900">
			Sedang offline — menampilkan konten tersimpan.
		</div>
	{/if}
	<header class="border-b border-gray-200 bg-white">
		<nav class="mx-auto flex max-w-5xl items-center gap-4 px-4 py-3">
			<a href="/" class="text-lg font-bold tracking-tight">partai<span class="text-gray-400">.alternatif.space</span></a>
			<div class="ml-auto flex items-center gap-3">
				{#if data.membership}
					<PartyBadge party={data.membership.party} partaiBaseUrl="" />
				{:else if data.signedIn}
					<a href="/bergabung" class="text-sm font-medium text-slate-700 hover:underline">Bergabung</a>
				{/if}
				{#if data.signedIn}
					{#if data.user}
						<a href="/profil/{data.user.id}" class="text-sm text-gray-600 hover:underline">Profil</a>
					{/if}
					<UserButton />
				{:else}
					<a href="/masuk" class="text-sm font-medium text-slate-700 hover:underline">Masuk</a>
					<a
						href="/daftar"
						class="rounded-md bg-slate-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700"
					>
						Daftar
					</a>
				{/if}
			</div>
		</nav>
	</header>
	{@render children()}
</ClerkProvider>

<style>
	.loading-bar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		z-index: 50;
		background: linear-gradient(90deg, #334155, #94a3b8, #334155);
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
