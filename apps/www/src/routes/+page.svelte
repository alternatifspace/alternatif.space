<script lang="ts">
	// PROTOTYPE route — toggles the three design candidates from PRD §6.
	// The winner gets named in PRD v0.2; the switcher and losing variants
	// are deleted then.
	import VariantManifesto from '$lib/prototype/VariantManifesto.svelte';
	import VariantCivic from '$lib/prototype/VariantCivic.svelte';
	import VariantActivist from '$lib/prototype/VariantActivist.svelte';

	const variants = [
		{ id: 'manifesto', label: 'Manifesto', component: VariantManifesto },
		{ id: 'civic', label: 'Civic', component: VariantCivic },
		{ id: 'activist', label: 'Activist', component: VariantActivist }
	] as const;

	let active = $state<(typeof variants)[number]['id']>('manifesto');
	const ActiveVariant = $derived(variants.find((v) => v.id === active)!.component);
</script>

<svelte:head>
	<title>alternatif.space — Politik soal posisi, bukan persona.</title>
	<meta
		name="description"
		content="Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai."
	/>
	<!-- W0-06: canonical link target for anything platform-level. OG image is
	     a static platform-level share card — party cards (P0-13) are separate. -->
	<link rel="canonical" href="https://alternatif.space/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alternatif.space/" />
	<meta property="og:title" content="alternatif.space — Politik soal posisi, bukan persona." />
	<meta
		property="og:description"
		content="Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai."
	/>
	<meta property="og:image" content="https://alternatif.space/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="alternatif.space — Politik soal posisi, bukan persona." />
	<meta
		name="twitter:description"
		content="Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai."
	/>
	<meta name="twitter:image" content="https://alternatif.space/og-card.png" />
</svelte:head>

<ActiveVariant />

<!-- prototype chrome — not part of any design -->
<div
	class="fixed right-4 bottom-4 z-50 flex items-center gap-1 rounded-full border border-dashed border-yellow-500 bg-neutral-900/90 p-1 font-mono text-xs text-white shadow-lg backdrop-blur"
>
	<span class="px-2 text-yellow-500">proto</span>
	{#each variants as variant (variant.id)}
		<button
			type="button"
			class="rounded-full px-3 py-1.5 {active === variant.id
				? 'bg-yellow-500 font-bold text-neutral-900'
				: 'hover:bg-neutral-700'}"
			onclick={() => (active = variant.id)}
		>
			{variant.label}
		</button>
	{/each}
</div>
