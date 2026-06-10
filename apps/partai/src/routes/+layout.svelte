<script lang="ts">
	import { ClerkProvider, UserButton } from 'svelte-clerk';
	import { currentUser, currentParty, PartyBadge } from '@alternatif/ui';
	import '../app.css';

	let { data, children } = $props();

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

<ClerkProvider>
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
