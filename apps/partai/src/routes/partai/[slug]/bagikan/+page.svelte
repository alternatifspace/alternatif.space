<script lang="ts">
	import { page } from '$app/state';

	let { data } = $props();

	let copied = $state(false);
	// Web Share API support decides the primary CTA (P0-13); detection must
	// run client-side, so default to the copy fallback during SSR.
	let canShare = $state(false);
	$effect(() => {
		canShare = typeof navigator !== 'undefined' && !!navigator.share;
	});

	const shareUrl = $derived(`${page.url.origin}/partai/${data.party.slug}`);

	async function share() {
		await navigator.share({
			title: data.party.name,
			text: data.party.tagline ?? `Partai ${data.party.name} di alternatif.space`,
			url: shareUrl
		});
	}

	async function copyLink() {
		await navigator.clipboard.writeText(shareUrl);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<svelte:head>
	<title>Bagikan {data.party.name} — partai.alternatif.space</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
	<!-- The pre-composed card (generated at approval); falls back to identity block -->
	{#if data.party.share_card_url}
		<img src={data.party.share_card_url} alt="Kartu partai {data.party.name}" class="w-full rounded-xl shadow" />
	{:else}
		<div class="flex w-full flex-col items-center gap-3 rounded-xl bg-slate-800 p-8 text-white shadow">
			{#if data.party.logo_url}
				<img src={data.party.logo_url} alt="" class="h-20 w-20 rounded-lg object-cover" />
			{/if}
			<p class="text-2xl font-bold">{data.party.name}</p>
			{#if data.party.tagline}<p class="text-slate-300">{data.party.tagline}</p>{/if}
			<p class="mt-2 text-xs tracking-widest text-slate-400 uppercase">alternatif.space</p>
		</div>
	{/if}

	<h1 class="text-xl font-bold">
		{data.isMember ? 'Ajak orang lain melihat posisimu.' : `Bagikan ${data.party.name}.`}
	</h1>

	{#if canShare}
		<button
			type="button"
			onclick={share}
			class="min-h-11 w-full rounded-md bg-slate-800 px-6 font-semibold text-white hover:bg-slate-700"
		>
			Bagikan
		</button>
	{/if}
	<!-- Fallback for browsers without Web Share API (5.39) -->
	<button
		type="button"
		onclick={copyLink}
		class="min-h-11 w-full rounded-md border border-slate-300 px-6 font-semibold text-slate-800 hover:bg-slate-50"
	>
		{copied ? 'Tersalin ✓' : 'Salin tautan'}
	</button>

	<a href="/partai/{data.party.slug}" class="text-sm text-gray-500 hover:underline">Kembali ke partai</a>
</main>
