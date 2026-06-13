<script>
	import '@alternatif/ui/landing.css';
</script>

<svelte:head>
	<title>Bergabung — alternatif.space</title>
</svelte:head>

<div class="lp flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center sm:px-10">
	<header class="max-w-lg">
		<p class="lp-mono text-sm tracking-[0.18em] uppercase opacity-60">
			Kamu belum <span class="lp-amber font-bold">bawa bendera.</span>
		</p>
		<h1 class="lp-display-sm mt-4">Pasang benderamu dulu.</h1>
		<p class="mt-6 leading-relaxed text-lg font-medium">
			Kamu belum tergabung dalam partai mana pun. Untuk ikut berdiskusi di mufakat, pilih partai
			yang posisinya kamu yakini — atau dirikan partaimu sendiri.
		</p>
	</header>

	<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
		<a href="/" class="lp-btn inline-block">Jelajahi partai →</a>
		<a href="/buat-partai" class="lp-btn-outline inline-block">Dirikan partai baru</a>
	</div>
</div>
