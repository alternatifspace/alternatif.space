<!-- mufakat.alternatif.space root (TRD v1.5 addendum; copy:
     docs/prd/subdomain-landings-v0.1.md Part B).
       signed-in  → the chronological feed (ThreadFeed, "like before")
       signed-out → the Pamflet × Arena landing (how it works + why not social media)
     The public feed also lives at /jelajah. -->
<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
	import { reveal } from '@alternatif/ui';
	import ThreadFeed from '$lib/components/ThreadFeed.svelte';
	import { PARTAI_URL } from '$lib/links';

	let { data } = $props();

	const langkah = [
		[
			'Buka diskusi',
			'Anggota partai mana pun bisa mulai diskusi. Pas kamu nulis judul, sistem nunjukin diskusi serupa yang udah ada — bukan buat ngeblok, tapi biar kamu nggak ngulang yang udah dibahas.'
		],
		[
			'Adu argumen, bawa bendera',
			'Tiap tulisan dan balasan nampilin bendera partaimu. Posisimu kelihatan dari mana kamu berdiri, bukan dari siapa kamu. Beda pendapat? Balas. Di sini, nggak setuju itu isi diskusi — bukan sesuatu yang ditenggelamin.'
		],
		[
			'Pertanyaan tajam naik kelas',
			'Komentar yang banyak dapat "Pertanyaan bagus" otomatis jadi diskusi tersendiri. Komunitas yang nentuin sebuah pertanyaan layak digali — bukan algoritma, bukan si penulis.'
		]
	] as const;

	const status = [
		['Aktif', 'Lagi jalan, terbuka buat dibahas.'],
		['Selesai', 'Udah ada kesimpulan, ditutup dengan ringkasan.'],
		[
			'Pertanyaan Terbuka',
			'Udah dibahas tuntas tapi belum ketemu jawaban. Ini bukan gagal: "Pertanyaan ini masih terbuka, dan kamu bukan yang pertama menemukannya."'
		],
		['Dialihkan', 'Ternyata duplikat; diarahkan ke diskusi aslinya.']
	] as const;
</script>

<svelte:head>
	{#if data.signedIn}
		<title>Diskusi — mufakat.alternatif.space</title>
	{:else}
		<title>mufakat.alternatif.space — Beda pendapat jadi bahan, bukan ribut.</title>
		<meta
			name="description"
			content="Ruang adu argumen tertulis antar-partai. Tiap tulisan bawa bendera partaimu, yang dinilai argumenmu — bukan jumlah pengikutmu. Bukan media sosial."
		/>
		<link rel="canonical" href="https://mufakat.alternatif.space/" />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="https://mufakat.alternatif.space/" />
		<meta property="og:title" content="mufakat.alternatif.space — Beda pendapat jadi bahan, bukan ribut." />
		<meta
			property="og:description"
			content="Adu argumen tertulis antar-partai. Argumen, bukan pengikut. Bukan media sosial."
		/>
		<meta property="og:locale" content="id_ID" />
	{/if}
</svelte:head>

{#if data.signedIn}
	<main class="mx-auto max-w-3xl px-5 py-10">
		<h1 class="lp-display-sm">Diskusi</h1>
		<ThreadFeed threads={data.threads} />
	</main>
{:else}
	<div class="lp min-h-screen">
		<!-- Hero -->
		<header class="lp-hero relative flex min-h-screen flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10">
			<div class="lp-halftone" aria-hidden="true"></div>

			<div
				class="lp-mono relative flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
				style="border-color: var(--lp-ink)"
			>
				<span class="font-bold">mufakat.alternatif.space</span>
				<a href={PARTAI_URL} class="lp-link">Masuk lewat partai</a>
			</div>

			<div class="relative my-auto py-12">
				<p class="lp-mono text-sm tracking-[0.18em] uppercase">
					Capek ribut tanpa ujung? <span class="lp-amber-bg">Kamu nggak sendirian.</span>
				</p>
				<h1 class="lp-display mt-4">
					Beda pendapat<br />jadi <span class="lp-underline">bahan.</span>
				</h1>
				<div class="mt-10 max-w-2xl">
					<p class="text-lg leading-snug font-medium">
						mufakat itu ruang adu argumen tertulis antar-partai. Tiap tulisanmu bawa bendera
						partaimu, dan yang dinilai argumenmu — bukan jumlah pengikutmu. Nggak ada like buat
						dikejar, nggak ada algoritma buat dipancing.
					</p>
					<div class="mt-8 flex flex-wrap items-center gap-4">
						<a href={PARTAI_URL} class="lp-btn inline-block">Ambil Posisi →</a>
						<a href="/jelajah" class="lp-btn-ghost inline-block">Lihat Diskusi</a>
					</div>
					<span class="lp-stamp mt-8" aria-hidden="true">BAWA BENDERA</span>
				</div>
			</div>

			<div class="lp-mono relative flex items-baseline justify-between text-xs tracking-[0.2em] uppercase opacity-60">
				<span>(Gulir buat lihat cara kerjanya)</span>
				<span>id • 2026</span>
			</div>
		</header>

		<!-- 01 — Cara kerjanya -->
		<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">01</span> — Cara kerjanya
			</p>
			<div class="mt-10 grid gap-0 md:grid-cols-3">
				{#each langkah as [title, body], i (title)}
					<article
						class="lp-reveal border-t-2 py-8 md:border-t-0 md:border-l-2 md:px-8 md:first:border-l-0 md:first:pl-0"
						style="border-color: var(--lp-ink); --d: {i * 70}ms"
						use:reveal
					>
						<p class="lp-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
						<h2 class="lp-h2 mt-4">{title}</h2>
						<p class="mt-3 leading-relaxed">{body}</p>
					</article>
				{/each}
			</div>
		</section>

		<!-- 02 — Ini bukan media sosial (inverted band) -->
		<section class="lp-invert border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-70">
				<span class="lp-amber font-bold">02</span> — Bedanya di mana
			</p>
			<h2 class="lp-display mt-4">Ini bukan<br />media sosial.</h2>
			<div class="mt-10 max-w-3xl overflow-x-auto">
				<table class="lp-table">
					<thead>
						<tr>
							<th>Di media sosial</th>
							<th>Di mufakat</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>Yang viral yang menang</td>
							<td>Urutan kronologis. Nggak ada yang di-boost.</td>
						</tr>
						<tr>
							<td>Pengikut = pengaruh</td>
							<td>Argumen = pengaruh. Bendera, bukan follower.</td>
						</tr>
						<tr>
							<td>Beda pendapat ditenggelamin</td>
							<td>Beda pendapat dibalas. Itu bahan bakunya.</td>
						</tr>
					</tbody>
				</table>
			</div>
			<p class="mt-8 max-w-2xl text-lg leading-relaxed opacity-90">
				Nggak ada tombol "tidak suka". Nggak setuju? Kamu balas dan jelasin kenapa — itu kerjanya.
				Nggak ada timeline yang diatur algoritma; diskusi diurut waktu, karena ruang ini wasit, bukan
				pengeras suara. Dan tiap orang bawa bendera, jadi yang kamu timbang itu posisi, bukan persona.
			</p>
		</section>

		<!-- 03 — Empat keadaan diskusi -->
		<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">03</span> — Empat keadaan diskusi
			</p>
			<h2 class="lp-display-sm mt-4 max-w-2xl">Diskusi nggak selalu harus selesai.</h2>
			<dl class="mt-10">
				{#each status as [title, body] (title)}
					<div
						class="lp-reveal border-t-2 py-6 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-8"
						style="border-color: var(--lp-ink)"
						use:reveal
					>
						<dt class="lp-h2 text-xl">{title}</dt>
						<dd class="mt-2 max-w-xl leading-relaxed sm:mt-0">{body}</dd>
					</div>
				{/each}
			</dl>
			<p class="mt-8 max-w-2xl text-lg leading-relaxed">
				Kesimpulan yang terbuka itu hasil yang sah. Nggak semua hal harus ada pemenangnya hari ini.
			</p>
		</section>

		<!-- 04 — Kenapa bawa bendera -->
		<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">04</span> — Kenapa bawa bendera
			</p>
			<h2 class="lp-display-sm mt-4 max-w-2xl">
				Yang ditimbang posisimu, <span class="lp-amber-bg">bukan kamunya.</span>
			</h2>
			<p class="mt-6 max-w-2xl text-lg leading-relaxed">
				Tiap tulisan nempel ke partai tempatmu berdiri pas kamu nulis. Pindah partai nanti nggak
				ngehapus jejak itu — biar rekam posisi tetap jujur. Ini bikin diskusi soal apa yang dibilang,
				bukan siapa yang ngomong.
			</p>
		</section>

		<!-- Closing -->
		<section class="border-t-2 px-5 py-24 text-center sm:px-10" style="border-color: var(--lp-ink)">
			<p class="lp-display">
				Bawa posisimu.<br />Bawa <span class="lp-underline">benderamu.</span>
			</p>
			<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
				<a href={PARTAI_URL} class="lp-btn inline-block">Ambil Posisi →</a>
				<a href="/jelajah" class="lp-btn-ghost inline-block">Lihat Diskusi</a>
			</div>
		</section>

		<footer class="border-t-2" style="border-color: var(--lp-ink)">
			<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 px-5 py-8 text-xs tracking-[0.2em] uppercase sm:px-10">
				<span class="font-bold">mufakat.alternatif.space</span>
				<span>
					<a href="https://alternatif.space" class="lp-link">alternatif.space</a> /
					<a href="/jelajah" class="lp-link">diskusi</a> /
					<a href="https://alternatif.space/kontak" class="lp-link">kontak</a>
				</span>
				<span class="opacity-50">id • 2026</span>
			</div>
		</footer>
	</div>
{/if}
