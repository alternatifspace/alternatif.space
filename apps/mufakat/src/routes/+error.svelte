<script lang="ts">
	import { page } from '$app/state';

	// Root error boundary (9.7): catches 404s, load failures, and network
	// errors from any route without its own +error.svelte.
	const is404 = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'} — mufakat.alternatif.space</title>
</svelte:head>

<main class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
	<p class="lp-num" style="font-size: 4rem">{page.status}</p>
	{#if is404}
		<h1 class="lp-h2">Halaman tidak ditemukan</h1>
		<p class="opacity-70">Tautan mungkin salah, atau diskusi ini sudah dipindahkan.</p>
	{:else}
		<h1 class="lp-h2">Terjadi kesalahan</h1>
		<p class="opacity-70">
			{page.error?.message ?? 'Permintaan tidak dapat diproses. Periksa koneksi lalu coba lagi.'}
		</p>
		<button type="button" onclick={() => location.reload()} class="lp-btn inline-block">
			Coba lagi
		</button>
	{/if}
	<a href="/" class="lp-link text-sm">Kembali ke beranda</a>
</main>
