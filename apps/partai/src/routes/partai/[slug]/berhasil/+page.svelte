<script lang="ts">
	// Two full-screen moments, in sequence (not modals — P0-12: "The moment
	// should feel like something"): membership confirmation, then the nudge
	// that carries the new flag into mufakat.
	let { data } = $props();
	let stage: 'confirmation' | 'nudge' = $state('confirmation');
</script>

<svelte:head>
	<title>Selamat bergabung — partai.alternatif.space</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 p-6 text-center">
	{#if stage === 'confirmation'}
		{#if data.joinedParty.logo_url}
			<img src={data.joinedParty.logo_url} alt="" class="h-24 w-24 rounded-xl object-cover" />
		{/if}
		<h1 class="max-w-md text-3xl font-bold">
			Kamu sekarang anggota {data.joinedParty.name}.
		</h1>
		<p class="max-w-md text-gray-600">Bendera partaimu sekarang terlihat di seluruh platform.</p>
		<button
			type="button"
			class="min-h-11 rounded-md bg-slate-800 px-8 font-semibold text-white hover:bg-slate-700"
			onclick={() => (stage = 'nudge')}
		>
			Lanjut
		</button>
	{:else}
		<h1 class="max-w-md text-3xl font-bold">Bendera kamu sudah terpasang.</h1>
		<p class="max-w-md text-gray-600">Sekarang bawa posisimu ke diskusi.</p>
		<a
			href="https://mufakat.alternatif.space"
			class="min-h-11 rounded-md bg-slate-800 px-8 py-3 font-semibold text-white hover:bg-slate-700"
		>
			Pergi ke Mufakat
		</a>
		<a href="/partai/{data.joinedParty.slug}" class="text-sm text-gray-500 hover:underline">
			Nanti saja — lihat halaman partai
		</a>
	{/if}
</main>
