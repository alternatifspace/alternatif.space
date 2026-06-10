<script lang="ts">
	// Party card (P0-03 v0.3): logo, name, tagline, membership model, activity
	// status, member count. Archetype label is NEVER shown anywhere (Q7).
	import { MEMBERSHIP_MODEL_LABELS } from '$lib/governance';
	import type { PartyCardData } from '$lib/types';

	let { party }: { party: PartyCardData } = $props();
</script>

<a
	href="/partai/{party.slug}"
	class="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm"
	class:opacity-60={party.status === 'dissolved'}
>
	<div class="flex items-center gap-3">
		{#if party.logo_url}
			<img src={party.logo_url} alt="" class="h-12 w-12 rounded-md object-cover" />
		{:else}
			<div class="flex h-12 w-12 items-center justify-center rounded-md bg-slate-200 text-lg font-bold text-slate-500">
				{party.name.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div class="min-w-0">
			<h2 class="truncate font-semibold text-gray-900">{party.name}</h2>
			{#if party.tagline}
				<p class="truncate text-sm text-gray-500">{party.tagline}</p>
			{/if}
		</div>
	</div>

	<div class="mt-auto flex flex-wrap items-center gap-2 text-xs">
		<span class="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">
			{MEMBERSHIP_MODEL_LABELS[party.governance_config.membership_model]}
		</span>
		{#if party.status === 'dormant'}
			<!-- 30+ days inactive leader (5.9, TRD §8) -->
			<span class="rounded-full bg-yellow-100 px-2 py-0.5 font-medium text-yellow-800">Dorman</span>
		{:else if party.status === 'dissolved'}
			<span class="rounded-full bg-gray-200 px-2 py-0.5 font-medium text-gray-600">Dibubarkan</span>
		{:else}
			<span class="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-800">Aktif</span>
		{/if}
		<span class="ml-auto text-gray-500">{party.member_count} anggota</span>
	</div>
</a>
