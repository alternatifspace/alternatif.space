<script lang="ts">
	// Two full-screen moments, in sequence (not modals — P0-12: "The moment
	// should feel like something"): membership confirmation, then the nudge
	// that carries the new flag into mufakat.
	import { MUFAKAT_URL } from '$lib/links';

	let { data } = $props();
	let stage: 'confirmation' | 'nudge' = $state('confirmation');
</script>

<svelte:head>
	<title>Selamat bergabung — partai.alternatif.space</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
	{#if stage === 'confirmation'}
		{#if data.joinedParty.logo_url}
			<img src={data.joinedParty.logo_url} alt="" class="h-24 w-24 object-cover" style="border: 2px solid var(--lp-ink)" />
		{/if}
		<h1 class="lp-display-sm max-w-md">
			Kamu sekarang anggota {data.joinedParty.name}.
		</h1>
		<p class="max-w-md opacity-70">Bendera partaimu sekarang terlihat di semua ruang.</p>
		<button type="button" class="lp-btn inline-block" onclick={() => (stage = 'nudge')}>
			Lanjut
		</button>
	{:else}
		<h1 class="lp-display-sm max-w-md">Bendera kamu sudah terpasang.</h1>
		<p class="max-w-md opacity-70">Sekarang bawa posisimu ke diskusi.</p>
		<a href={MUFAKAT_URL} class="lp-btn inline-block">Pergi ke Mufakat</a>
		<a href="/partai/{data.joinedParty.slug}" class="lp-link text-sm">
			Nanti saja — lihat halaman partai
		</a>
	{/if}
</main>
