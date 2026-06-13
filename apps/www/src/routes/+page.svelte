<!-- alternatif.space landing — PRD v0.3 WINNER (2026-06-13).
     Direction: PAMFLET visual system × ARENA copy register (user decision).
     Bone paper + Archivo Black poster type + cap-stempel vermilion (stamps
     only) + AMBER accent layer (continuity with the partai app identity).
     Marquee removed; tally-mark divider instead (latihan = reps). Arena
     voice throughout: santai-serius, "nggak" register, Mulai Latihan CTAs.
     W0-07 KBBI poster band sits directly after Cara kerjanya (user call).
     Auth: inline Clerk on desktop, /daftar on mobile (W-Q1: both).
     Motion: reveal fades + hover cuts, gated on scripting/reduced-motion. -->
<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import { useClerkContext } from 'svelte-clerk/client';
	import AuthArea from '$lib/auth/AuthArea.svelte';
	import '@alternatif/ui/landing.css';
	import { reveal } from '@alternatif/ui';
	import { PARTAI_URL, SUBDOMAINS } from '$lib/urls';

	const ctx = useClerkContext();
	const signedIn = $derived(Boolean(ctx.auth.userId));

	const steps = [
		[
			'Pilih bendera',
			'Gabung partai yang sesuai posisimu — atau dirikan sendiri kalau belum ada yang cocok. Manifesto itu syarat, bukan formalitas.'
		],
		[
			'Turun ke arena',
			'Tulisanmu di mufakat selalu bawa bendera. Yang dinilai argumenmu, bukan jumlah pengikutmu.'
		],
		[
			'Naik level',
			'Pertanyaan paling tajam naik jadi deliberasi langsung di simposium. Posisi terbaik lahir dari latihan.'
		]
	] as const;

	const ruang = [
		['partai', 'P', 'Bentuk kelompokmu', 'Pembentukan & tata kelola partai', SUBDOMAINS.partai, false],
		['mufakat', 'M', 'Adu argumen', 'Deliberasi tertulis lintas-partai', SUBDOMAINS.mufakat, false],
		['simposium', 'S', 'Naik panggung', 'Deliberasi langsung', SUBDOMAINS.simposium, true],
		['perpus', 'P', 'Ingat semuanya', 'Dokumentasi & memori kolektif', SUBDOMAINS.perpus, true]
	] as const;

	const aturan = [
		['Manifesto wajib', 'Mau bikin partai? Tulis dulu posisimu. Tanpa manifesto, nggak jalan.', 'WAJIB'],
		[
			'Ketua bisa di-recall',
			'Ketua nggak nempel seumur hidup. Anggota bisa ganti lewat petisi dan suara.',
			'DICATAT'
		],
		[
			'Konfigurasi terbuka',
			'Aturan tiap partai kebuka semua: siapa boleh masuk, siapa suara resmi, gimana ketua diganti.',
			'TERBUKA'
		],
		[
			'Honeymoon 3 bulan',
			'Partai baru dapat tiga bulan masa tenang buat membangun, sebelum recall aktif.',
			'3 BULAN'
		]
	] as const;

	// "Apa ini" — three premises compressing the soul doc; full version at /tentang.
	const premis = [
		[
			'Kita makhluk kolektif',
			'Kamu tahu apa yang kamu percaya karena pernah ketemu yang percaya hal beda. Sendirian, posisimu nggak ke mana-mana.'
		],
		[
			'Partai itu kelompok',
			'Bukan mesin pemilu, bukan elit. Sekelompok orang yang searah, ngumpul karena nemu sesamanya. Kata itu kita ambil balik.'
		],
		[
			'Beda itu bahan baku',
			'Perbedaan bukan masalah yang harus diberesin. Itu tempat pemahaman baru lahir. Kita kasih ruang — bukan diredam.'
		]
	] as const;
</script>

<svelte:head>
	<title>alternatif.space — Demokrasi itu otot.</title>
	<meta
		name="description"
		content="Nggak cukup dihafal — harus dilatih. Dirikan partai, angkat posisimu, adu argumen lintas-bendera. Ini ruang latihannya."
	/>
	<!-- W0-06: canonical link target for anything platform-level. OG image is
	     a static platform-level share card — party cards (P0-13) are separate. -->
	<link rel="canonical" href="https://alternatif.space/" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alternatif.space/" />
	<meta property="og:title" content="alternatif.space — Demokrasi itu otot." />
	<meta
		property="og:description"
		content="Nggak cukup dihafal — harus dilatih. Dirikan partai, angkat posisimu, adu argumen lintas-bendera."
	/>
	<meta property="og:image" content="https://alternatif.space/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="alternatif.space — Demokrasi itu otot." />
	<meta
		name="twitter:description"
		content="Nggak cukup dihafal — harus dilatih. Dirikan partai, angkat posisimu, adu argumen lintas-bendera."
	/>
	<meta name="twitter:image" content="https://alternatif.space/og-card.png" />
</svelte:head>

<div class="lp min-h-screen">
	<!-- W0-01 hero -->
	<header class="lp-hero relative flex min-h-screen flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10">
		<!-- halftone accent field, top-right (decorative) -->
		<div class="lp-halftone" aria-hidden="true"></div>

		<div
			class="lp-mono relative flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
			style="border-color: var(--lp-ink)"
		>
			<span class="font-bold">alternatif.space</span>
			{#if signedIn}
				<!-- signed-in state gets a real CTA, not a bland text link -->
				<a href={PARTAI_URL} class="lp-btn-nav">
					Lanjut ke partai <span class="lp-amber" aria-hidden="true">→</span>
				</a>
			{:else}
				<a href="/masuk" class="lp-link">Masuk</a>
			{/if}
		</div>

		<div class="relative my-auto py-6">
			<!-- belonging before rigor (soul §2.1) -->
			<p class="lp-mono text-sm tracking-[0.18em] uppercase">
				Capek cuma jadi penonton? <span class="lp-amber-bg">Kamu nggak sendirian.</span>
			</p>
			<div class="grid items-start gap-10 lg:grid-cols-[1fr_minmax(20rem,26rem)]">
				<div>
					<h1 class="lp-display mt-4">
				Demokrasi<br />
				itu <span class="lp-underline">otot.</span>
			</h1>
					<p class="max-w-md text-lg leading-snug font-medium">
						Nggak cukup dihafal — harus dilatih. Dirikan partai, angkat posisimu, adu argumen
						lintas-bendera. Ini ruang latihannya.
					</p>
					<span class="lp-stamp mt-8 inline-block" aria-hidden="true">RUANG LATIHAN</span>
				</div>
				<!-- W-Q1 both: inline Clerk on desktop, /daftar route on mobile -->
				{#if signedIn}
					<div class="lp-welcome">
						<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-60">Bendera sudah di tangan</p>
						<a href={PARTAI_URL} class="lp-btn mt-4 inline-block">Lanjut ke partai →</a>
					</div>
				{:else}
					<div id="daftar" class="hidden lg:block">
						<AuthArea ctaClass="lp-btn inline-block" noteClass="lp-mono mt-3 text-sm opacity-70" />
					</div>
					<div class="lg:hidden">
						<a href="/daftar" class="lp-btn inline-block">Mulai Latihan</a>
						<p class="lp-mono mt-3 text-sm opacity-70">
							Sudah punya akun? <a href="/masuk" class="lp-link">Masuk</a>
						</p>
					</div>
				{/if}
			</div>
		</div>

		<div class="lp-mono relative flex items-baseline justify-between text-xs tracking-[0.2em] uppercase opacity-60">
			<span>(Gulir buat lihat aturan mainnya)</span>
			<span>id • 2026</span>
		</div>
	</header>

	<!-- tally divider — reps, not a marquee -->
	<div class="lp-tally" aria-hidden="true">
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
		<span class="lp-mono lp-tally-label">latihan ke-berapa pun, tetap latihan</span>
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
	</div>

	<!-- Apa ini — brief soul statement (intro before cara mainnya). Compresses
	     docs/brand/the-soul-of-alternatif-space.md into three premises; the full
	     version lives at /tentang. Belonging-before-rigor: feed = cermin → ruang. -->
	<section id="apa-ini" class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">01</span> — Apa ini
		</p>
		<div class="mt-4 grid gap-12 lg:grid-cols-[1fr_minmax(20rem,27rem)] lg:gap-16">
			<div>
				<h2 class="lp-display-sm max-w-2xl">
					Ruang buat ketemu yang <span class="lp-amber-bg">nggak sepikiran.</span>
				</h2>
				<p class="mt-6 max-w-xl text-lg leading-relaxed font-medium">
					Feed-mu nunjukin yang udah kamu setujui — beranda jadi cermin, bukan jendela. Di sini
					kebalikannya: kamu ketemu orang yang berangkat dari posisi beda, lalu ngobrol beneran.
					Bukan biar sepakat. Biar tahu persis di mana bedanya, dan kenapa.
				</p>
				<a href="/tentang" class="lp-btn-outline mt-8 inline-block">Kenapa ruang ini ada →</a>
			</div>
			<dl class="self-start">
				{#each premis as [title, body], i (title)}
					<div
						class="lp-reveal border-l-2 py-3 pl-5"
						style="border-color: var(--lp-amber); --d: {i * 70}ms"
						use:reveal
					>
						<dt class="lp-h2 text-lg">{title}</dt>
						<dd class="mt-2 leading-relaxed opacity-80">{body}</dd>
					</div>
				{/each}
			</dl>
		</div>
	</section>

	<!-- W0-02 cara kerjanya -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">02</span> — Cara mainnya
		</p>
		<div class="mt-10 grid gap-0 md:grid-cols-3">
			{#each steps as [title, body], i (title)}
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

	<!-- W0-07 — buka kamus (PRD v0.2.2 W-Q5: the loudest band on the page,
	     placed right after Cara kerjanya per v0.3 decision) -->
	<section class="lp-kbbi border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-70">
				<span class="lp-amber font-bold">03</span> — Buka kamus dulu
			</p>
			<span class="lp-stamp lp-stamp-bone" aria-hidden="true">MENURUT KAMUS</span>
		</div>
		<p class="lp-kbbi-word mt-10">par·tai</p>
		<p class="lp-kbbi-def mt-6 max-w-3xl">
			<em class="lp-kbbi-class">/n/</em> perkumpulan (segolongan orang) yang
			<span class="lp-kbbi-mark">seasas</span>, <span class="lp-kbbi-mark">sehaluan</span>, dan
			<span class="lp-kbbi-mark">setujuan</span>.
		</p>
		<div class="mt-10 flex flex-wrap items-end justify-between gap-6">
			<p class="max-w-md text-lg leading-snug font-medium">
				Nggak ada soal pemilu di situ. Nggak ada soal elit. Partai itu artinya kelompok —
				orang-orang yang searah. Di sini, kata itu balik ke artinya.
			</p>
			<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-60">
				— Kamus Besar Bahasa Indonesia
			</p>
		</div>
	</section>

	<!-- W0-03 empat ruang — poster cells, not plain cards -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">04</span> — Empat ruang
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Satu siklus, empat ruang.</h2>
		<div class="mt-10 grid gap-0 border-2 sm:grid-cols-2" style="border-color: var(--lp-ink)">
			{#each ruang as [name, initial, tag, desc, url, segera], i (name)}
				{#if segera}
					<div class="lp-cell relative">
						<span class="lp-cell-ghost" aria-hidden="true">{initial}</span>
						<div class="relative">
							<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-50">
								{String(i + 1).padStart(2, '0')} · {tag}
							</p>
							<h3 class="lp-h2 mt-3">{name}</h3>
							<p class="mt-2 max-w-[16rem] text-sm leading-relaxed opacity-80">{desc}</p>
						</div>
						<span class="lp-stamp lp-stamp-sm absolute top-5 right-5" aria-label="segera">SEGERA</span>
					</div>
				{:else}
					<a href={url} class="lp-cell lp-cell-live relative block">
						<span class="lp-cell-ghost" aria-hidden="true">{initial}</span>
						<div class="relative">
							<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-50">
								{String(i + 1).padStart(2, '0')} · {tag}
							</p>
							<h3 class="lp-h2 mt-3">{name}</h3>
							<p class="mt-2 max-w-[16rem] text-sm leading-relaxed opacity-80">{desc}</p>
							<p class="lp-cell-cta lp-mono mt-5 text-xs font-bold tracking-[0.2em] uppercase">
								Buka ruang <span aria-hidden="true">→</span>
							</p>
						</div>
					</a>
				{/if}
			{/each}
		</div>
	</section>

	<!-- W0-04 aturan mainnya beda -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">05</span> — Aturan main
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">
			Aturan mainnya beda — dan itu <span class="lp-amber-bg">intinya.</span>
		</h2>
		<dl class="mt-12">
			{#each aturan as [title, body, stamp] (title)}
				<div
					class="lp-reveal relative border-t-2 py-7 pr-28 sm:grid sm:grid-cols-[16rem_1fr] sm:gap-8"
					style="border-color: var(--lp-ink)"
					use:reveal
				>
					<dt class="lp-h2 text-xl">{title}</dt>
					<dd class="mt-2 max-w-xl leading-relaxed sm:mt-0">{body}</dd>
					<span class="lp-stamp lp-stamp-sm absolute top-7 right-0" aria-hidden="true">{stamp}</span>
				</div>
			{/each}
		</dl>
	</section>

	<!-- W0-05 closing -->
	<section class="lp-closing border-t-2 px-5 py-24 text-center sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">06</span> — Penutup
		</p>
		<p class="lp-display mt-6">
			Otot nggak tumbuh<br />dari <span class="lp-underline">nonton.</span>
		</p>
		<a href="/daftar" class="lp-btn mt-10 inline-block">Mulai Latihan</a>
	</section>

	<footer class="border-t-2" style="border-color: var(--lp-ink)">
		<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 px-5 py-8 text-xs tracking-[0.2em] uppercase sm:px-10">
			<span class="font-bold">alternatif.space</span>
			<span>
				{#each ruang as [name, , , , url, segera], i (name)}
					{#if i > 0}&nbsp;/&nbsp;{/if}
					{#if segera}<span class="opacity-50">{name}</span>{:else}<a href={url} class="lp-link">{name}</a>{/if}
				{/each}
			</span>
			<a href="/tentang" class="lp-link">tentang</a> /
			<a href="/contribute" class="lp-link">kontribusi</a> /
			<a href="/kontak" class="lp-link">kontak</a>
		</div>
	</footer>
</div>

<style>
	/* W0-07 inverted dictionary band — apex-only */
	.lp-kbbi {
		background: var(--lp-ink);
		color: var(--lp-bone);
	}
	.lp-kbbi-word {
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(3.4rem, 16vw, 11rem);
		line-height: 0.95;
		letter-spacing: -0.01em;
	}
	.lp-kbbi-def {
		font-size: clamp(1.3rem, 3.8vw, 2.1rem);
		line-height: 1.35;
		font-weight: 500;
	}
	.lp-kbbi-class {
		font-style: italic;
		color: var(--lp-amber-hi);
		margin-right: 0.2em;
	}
	.lp-kbbi-mark {
		box-shadow: inset 0 -0.34em 0 0 rgba(245, 166, 35, 0.35);
	}
</style>
