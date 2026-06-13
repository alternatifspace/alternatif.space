<script lang="ts">
	// Party card (P0-03 v0.3): logo, name, tagline, membership model, activity
	// status, member count. Archetype label is NEVER shown anywhere (Q7).
	import { MEMBERSHIP_MODEL_LABELS } from '$lib/governance';
	import type { PartyCardData } from '$lib/types';

	let { party }: { party: PartyCardData } = $props();
</script>

<a
	href="/partai/{party.slug}"
	class="lp-card flex flex-col gap-3 p-4"
	class:opacity-50={party.status === 'dissolved'}
>
	<div class="flex items-center gap-3">
		{#if party.logo_url}
			<img src={party.logo_url} alt="" class="h-12 w-12 border object-cover" style="border-color: var(--lp-ink)" />
		{:else}
			<div
				class="flex h-12 w-12 items-center justify-center border text-lg"
				style="border-color: var(--lp-ink); font-family: 'Archivo Black', sans-serif; color: var(--lp-amber)"
			>
				{party.name.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div class="min-w-0">
			<h2 class="truncate text-base" style="font-family: 'Archivo Black', sans-serif">{party.name}</h2>
			{#if party.tagline}
				<p class="truncate text-sm opacity-60">{party.tagline}</p>
			{/if}
		</div>
	</div>

	<div class="mt-auto flex flex-wrap items-center gap-2">
		<span class="lp-tag">
			{MEMBERSHIP_MODEL_LABELS[party.governance_config.membership_model]}
		</span>
		{#if party.status === 'dormant'}
			<!-- 30+ days inactive leader (5.9, TRD §8) -->
			<span class="lp-tag lp-tag-muted">Dorman</span>
		{:else if party.status === 'dissolved'}
			<span class="lp-tag lp-tag-muted">Dibubarkan</span>
		{:else}
			<span class="lp-tag lp-tag-amber">Aktif</span>
		{/if}
		<span class="lp-mono ml-auto text-xs opacity-60">{party.member_count} anggota</span>
	</div>
</a>
