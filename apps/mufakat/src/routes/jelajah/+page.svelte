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

<main class="mx-auto max-w-3xl p-4">
	<h1 class="text-2xl font-bold">Diskusi</h1>
	<ThreadFeed threads={data.threads} />
</main>
