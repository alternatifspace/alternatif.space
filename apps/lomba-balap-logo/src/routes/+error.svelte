<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head><title>Aduh · Lomba Balap Logo</title></svelte:head>

<div class="mx-auto max-w-md py-16 text-center">
	<p class="font-display text-6xl text-amber">{$page.status}</p>
	<h1 class="mt-2 text-2xl">
		{$page.status === 404 ? 'Halaman nggak ketemu' : 'Ada yang error'}
	</h1>
	<p class="mt-2 text-ink/60">{$page.error?.message ?? 'Coba balik ke beranda dulu.'}</p>
	<a href="/" class="mt-6 inline-block rounded-lg bg-ink px-5 py-2.5 font-semibold text-paper">Ke beranda</a>
</div>
