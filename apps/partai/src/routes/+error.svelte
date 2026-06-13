<script lang="ts">
	import { page } from '$app/state';
	import '@alternatif/ui/landing.css';

	const is404 = $derived(page.status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Halaman tidak ditemukan' : 'Terjadi kesalahan'} — partai.alternatif.space</title>
</svelte:head>

<div class="lp flex min-h-[60vh] flex-col items-center justify-center px-5 py-20 text-center sm:px-10">
	<p class="lp-num" aria-hidden="true">{page.status}</p>

	{#if is404}
		<h1 class="lp-h2 mt-4">Halaman tidak ditemukan</h1>
		<p class="mt-3 max-w-sm leading-relaxed opacity-60">
			Tautan mungkin salah, atau halaman ini sudah dipindahkan.
		</p>
	{:else}
		<h1 class="lp-h2 mt-4">Terjadi kesalahan</h1>
		<p class="mt-3 max-w-sm leading-relaxed opacity-60">
			{page.error?.message ?? 'Permintaan tidak dapat diproses. Periksa koneksi lalu coba lagi.'}
		</p>
		<button
			type="button"
			onclick={() => location.reload()}
			class="lp-btn mt-6 inline-block"
		>
			Coba lagi
		</button>
	{/if}

	<a href="/" class="lp-mono mt-8 text-xs tracking-[0.2em] uppercase lp-amber">Kembali ke beranda →</a>
</div>
