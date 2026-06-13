<!-- partai.alternatif.space — signed-out landing (TRD v1.5 addendum; copy:
     docs/prd/subdomain-landings-v0.1.md Part A). Pamflet × Arena system,
     shared with the apex via $lib/landing.css. Signed-in users never reach
     this render (the server load redirects them). -->
<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
	import { reveal } from '@alternatif/ui';

	const beda = [
		[
			'Manifesto dulu, baru partai',
			'Nggak ada partai kosong. Posisi ditulis di depan, bukan ditebak belakangan.'
		],
		[
			'Ketua bisa diganti',
			'Ketua nggak nempel seumur hidup. Anggota bisa mulai petisi dan voting buat ganti — aturannya ditetapkan partai itu sendiri.'
		],
		[
			'Aturannya kebuka semua',
			'Siapa boleh masuk, siapa suara resmi, gimana ketua diganti — semua keliatan di halaman partai, bukan rahasia pengurus.'
		]
	] as const;
</script>

<svelte:head>
	<title>partai.alternatif.space — Bikin partai. Bukan nunggu izin.</title>
	<meta
		name="description"
		content="Di sini partai balik ke arti aslinya: sekelompok orang yang searah. Tulis posisimu, kumpulkan yang sepaham, jalan dengan aturan yang kalian tetapkan sendiri."
	/>
	<link rel="canonical" href="https://partai.alternatif.space/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://partai.alternatif.space/" />
	<meta property="og:title" content="partai.alternatif.space — Bikin partai. Bukan nunggu izin." />
	<meta
		property="og:description"
		content="Partai = sekelompok orang yang searah. Tulis posisimu, kumpulkan yang sepaham, atur aturan mainmu sendiri."
	/>
	<meta property="og:locale" content="id_ID" />
</svelte:head>

<div class="lp min-h-screen">
	<!-- Hero -->
	<header class="lp-hero relative flex min-h-screen flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10">
		<div class="lp-halftone" aria-hidden="true"></div>

		<div
			class="lp-mono relative flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
			style="border-color: var(--lp-ink)"
		>
			<span class="font-bold">partai.alternatif.space</span>
			<a href="/masuk" class="lp-link">Masuk</a>
		</div>

		<div class="relative my-auto py-12">
			<p class="lp-mono text-sm tracking-[0.18em] uppercase">
				Punya pendapat, belum punya barisan? <span class="lp-amber-bg">Kamu nggak sendirian.</span>
			</p>
			<h1 class="lp-display mt-4">
				Bikin partai.<br />
				Bukan <span class="lp-underline">nunggu izin.</span>
			</h1>
			<div class="mt-10 max-w-2xl">
				<p class="text-lg leading-snug font-medium">
					Di sini "partai" balik ke arti aslinya: sekelompok orang yang searah. Bukan soal pemilu,
					bukan soal elit. Kamu nulis posisimu, orang yang sepaham berkumpul, dan kalian jalan dengan
					aturan yang kalian tetapkan sendiri.
				</p>
				<div class="mt-8 flex flex-wrap items-center gap-4">
					<a href="/buat-partai" class="lp-btn inline-block">Dirikan Partai →</a>
					<a href="/jelajah" class="lp-btn-ghost inline-block">Cari Partai</a>
				</div>
				<span class="lp-stamp mt-8" aria-hidden="true">TANPA IZIN</span>
			</div>
		</div>

		<div class="lp-mono relative flex items-baseline justify-between text-xs tracking-[0.2em] uppercase opacity-60">
			<span>(Gulir buat lihat cara kerjanya)</span>
			<span>id • 2026</span>
		</div>
	</header>

	<!-- 01 — Apa itu partai di sini -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">01</span> — Bukan partai yang itu
		</p>
		<h2 class="lp-display-sm mt-4 max-w-3xl">Sebuah partai itu satu posisi yang ditulis, lalu dijaga.</h2>
		<p class="mt-6 max-w-2xl text-lg leading-relaxed">
			Tiap partai mulai dari satu hal: <strong>manifesto</strong>. Bukan formalitas — itu syaratnya.
			Kalau kamu nggak bisa nulis apa yang kamu perjuangkan, partaimu belum ada. Setelah manifesto
			jadi, dua hal ikut: orang yang sepaham bisa gabung, dan cara kalian ambil keputusan jadi
			terbuka buat semua orang lihat.
		</p>
	</section>

	<!-- 02 — Tiga hal yang bikin beda -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">02</span> — Aturannya beda, dan itu intinya
		</p>
		<div class="mt-10 grid gap-0 md:grid-cols-3">
			{#each beda as [title, body], i (title)}
				<article
					class="lp-reveal border-t-2 py-8 md:border-t-0 md:border-l-2 md:px-8 md:first:border-l-0 md:first:pl-0"
					style="border-color: var(--lp-ink); --d: {i * 70}ms"
					use:reveal
				>
					<p class="lp-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</p>
					<h3 class="lp-h2 mt-4">{title}</h3>
					<p class="mt-3 leading-relaxed">{body}</p>
				</article>
			{/each}
		</div>
		<a
			href="/cara-kerja"
			class="lp-mono lp-amber mt-10 inline-block text-sm font-bold tracking-[0.15em] uppercase"
		>
			Lihat cara kerjanya lengkap →
		</a>
	</section>

	<!-- 03 — Dua pintu -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">03</span> — Dua pintu masuk
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Ada dua cara masuk.</h2>
		<div class="mt-10 grid gap-0 border-2 sm:grid-cols-2" style="border-color: var(--lp-ink)">
			<a href="/buat-partai" class="lp-cell lp-cell-live relative block">
				<span class="lp-cell-ghost" aria-hidden="true">D</span>
				<div class="relative">
					<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-50">01 · Dirikan</p>
					<h3 class="lp-h2 mt-3">Belum ada yang cocok?</h3>
					<p class="mt-2 max-w-[18rem] text-sm leading-relaxed opacity-80">
						Dirikan sendiri. Tulis manifesto, atur aturan main, undang orang.
					</p>
					<p class="lp-cell-cta lp-mono mt-5 text-xs font-bold tracking-[0.2em] uppercase">
						Dirikan Partai <span aria-hidden="true">→</span>
					</p>
				</div>
			</a>
			<a href="/jelajah" class="lp-cell lp-cell-live relative block">
				<span class="lp-cell-ghost" aria-hidden="true">G</span>
				<div class="relative">
					<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-50">02 · Gabung</p>
					<h3 class="lp-h2 mt-3">Udah ada yang searah?</h3>
					<p class="mt-2 max-w-[18rem] text-sm leading-relaxed opacity-80">
						Baca manifesto dan aturannya, lalu gabung barisannya.
					</p>
					<p class="lp-cell-cta lp-mono mt-5 text-xs font-bold tracking-[0.2em] uppercase">
						Cari Partai <span aria-hidden="true">→</span>
					</p>
				</div>
			</a>
		</div>
	</section>

	<!-- Closing -->
	<section class="border-t-2 px-5 py-24 text-center sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">04</span> — Penutup
		</p>
		<p class="lp-display mt-6">
			Posisi yang nggak ditulis,<br />nggak <span class="lp-underline">ngitung.</span>
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a href="/buat-partai" class="lp-btn inline-block">Dirikan Partai →</a>
		</div>
		<p class="lp-mono mt-4 text-sm opacity-70">Udah punya partai? <a href="/masuk" class="lp-link">Masuk</a></p>
	</section>

	<footer class="border-t-2" style="border-color: var(--lp-ink)">
		<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 px-5 py-8 text-xs tracking-[0.2em] uppercase sm:px-10">
			<span class="font-bold">partai.alternatif.space</span>
			<span>
				<a href="https://alternatif.space" class="lp-link">alternatif.space</a> /
				<a href="/cara-kerja" class="lp-link">cara kerja</a> /
				<a href="/jelajah" class="lp-link">jelajah</a> /
				<a href="https://alternatif.space/kontak" class="lp-link">kontak</a>
			</span>
			<span class="opacity-50">id • 2026</span>
		</div>
	</footer>
</div>
