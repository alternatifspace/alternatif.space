<script lang="ts">
	import ThreadFeed from '$lib/components/ThreadFeed.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Diskusi — mufakat.alternatif.space</title>
	<meta
		name="description"
		content="Diskusi tertulis lintas partai, diurut kronologis. Satu pertanyaan, satu rumah."
	/>
	<link rel="canonical" href="https://mufakat.alternatif.space/jelajah" />
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10">
	<h1 class="lp-display-sm">Diskusi</h1>
	<ThreadFeed threads={data.threads} />
</main>
