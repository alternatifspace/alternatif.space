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
	{#if !data.shareable}
		<!-- Pending review or dissolved: explain instead of silently redirecting. -->
		<p class="lp-mono lp-amber text-xs tracking-[0.2em] uppercase">
			{data.party.status === 'dissolved' ? 'Partai telah bubar' : 'Masih ditinjau'}
		</p>
		<h1 class="lp-h2">
			{data.party.status === 'dissolved'
				? `${data.party.name} sudah tidak aktif.`
				: 'Belum bisa dibagikan.'}
		</h1>
		<p class="opacity-70">
			{data.party.status === 'dissolved'
				? 'Partai yang sudah bubar tidak bisa dibagikan.'
				: 'Partai masih menunggu persetujuan. Setelah disetujui, kamu bisa membagikannya dari sini.'}
		</p>
		<a href="/partai/{data.party.slug}" class="lp-btn-ghost block w-full text-center">Lihat halaman partai</a>
	{:else}
	<!-- The pre-composed card (generated at approval); falls back to identity block -->
	{#if data.party.share_card_url}
		<img src={data.party.share_card_url} alt="Kartu partai {data.party.name}" class="w-full" style="border: 2px solid var(--lp-ink)" />
	{:else}
		<div class="lp-invert flex w-full flex-col items-center gap-3 p-8" style="border: 2px solid var(--lp-ink)">
			{#if data.party.logo_url}
				<img src={data.party.logo_url} alt="" class="h-20 w-20 object-cover" />
			{/if}
			<p class="lp-h2">{data.party.name}</p>
			{#if data.party.tagline}<p class="opacity-70">{data.party.tagline}</p>{/if}
			<p class="lp-mono lp-amber mt-2 text-xs tracking-[0.2em] uppercase">alternatif.space</p>
		</div>
	{/if}

	<h1 class="lp-h2">
		{data.isMember ? 'Ajak orang lain melihat posisimu.' : `Bagikan ${data.party.name}.`}
	</h1>

	{#if canShare}
		<button type="button" onclick={share} class="lp-btn block w-full text-center">Bagikan</button>
	{/if}
	<!-- Fallback for browsers without Web Share API (5.39) -->
	<button type="button" onclick={copyLink} class="lp-btn-ghost block w-full text-center">
		{copied ? 'Tersalin ✓' : 'Salin tautan'}
	</button>

	<a href="/partai/{data.party.slug}" class="lp-link text-sm">Kembali ke partai</a>
	{/if}
</main>
