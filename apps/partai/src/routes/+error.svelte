<script lang="ts">
	import { page } from '$app/state';

	// Root error boundary (9.7): catches 404s, load failures, and network
	// errors from any route without its own +error.svelte.
	const is404 = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'} — partai.alternatif.space</title>
</svelte:head>

<main class="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 p-6 text-center">
	<p class="text-5xl font-bold text-slate-300">{page.status}</p>
	{#if is404}
		<h1 class="text-xl font-bold">Halaman tidak ditemukan</h1>
		<p class="text-gray-600">Tautan mungkin salah, atau halaman ini sudah dipindahkan.</p>
	{:else}
		<h1 class="text-xl font-bold">Terjadi kesalahan</h1>
		<p class="text-gray-600">
			{page.error?.message ?? 'Permintaan tidak dapat diproses. Periksa koneksi lalu coba lagi.'}
		</p>
		<button
			type="button"
			onclick={() => location.reload()}
			class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white hover:bg-slate-700"
		>
			Coba lagi
		</button>
	{/if}
	<a href="/" class="text-sm text-gray-500 hover:underline">Kembali ke beranda</a>
</main>
