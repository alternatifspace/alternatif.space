<!-- alternatif.space /tentang — the soul doc as an about-us page.
     Faithful condensation of docs/brand/the-soul-of-alternatif-space.md into
     the Pamflet × Arena system. Order follows the doc: penolakan isolasi →
     partai = kelompok (KBBI) → beda = bahan baku → anatomi empat ruang →
     apa yang dijaga → ukuran keberhasilan → catatan terakhir.
     Arena voice (santai-serius, "nggak", kamu). Prerendered via +layout.ts. -->
<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
	import { reveal } from '@alternatif/ui';
	import { PARTAI_URL, SUBDOMAINS } from '$lib/urls';

	// Anatomi: empat momen dari satu dinamika sosial (soul §Anatomi Jiwa).
	const anatomi = [
		[
			'partai',
			'P',
			'Identitas',
			'Tempat identitas terbentuk. Kamu nemu atau dirikan kelompok seasas, pakai benderanya, lalu ngomong sebagai representasi posisi — bukan individu anonim.',
			SUBDOMAINS.partai,
			false
		],
		[
			'mufakat',
			'M',
			'Pertemuan',
			'Tempat bendera-bendera ketemu. Identitas yang dibangun di partai dibawa ke hadapan identitas lain. Di sini gesekan terjadi — beda jadi percakapan, bukan sekadar jarak.',
			SUBDOMAINS.mufakat,
			false
		],
		[
			'simposium',
			'S',
			'Deliberasi',
			'Tempat gesekan dikanalisasi. Deliberasi terstruktur yang ngubah argumen jadi pemahaman — nggak selalu sepakat, tapi peta yang lebih jelas soal di mana bedanya.',
			SUBDOMAINS.simposium,
			true
		],
		[
			'perpus',
			'P',
			'Dokumentasi',
			'Memori kolektif. Apa yang udah diperdebatkan, apa yang disepakati, apa yang masih terbuka. "Kita belum tahu" itu kesimpulan yang sah dan berharga.',
			SUBDOMAINS.perpus,
			true
		]
	] as const;

	// Apa yang dijaga — guardrails (soul §Apa yang Harus Dilindungi).
	const jaga = [
		[
			'Jangan bersihin gesekannya',
			'Produk yang kebanyakan ngejar aman dan tenang bakal buang yang paling berharga: ketegangan produktif. Mekanisme split di mufakat — ngasih beda ruang sendiri, bukan meredam — ekspresi langsung dari jiwa ini.',
			'GESEKAN'
		],
		[
			'Jangan biarin partai jadi gema',
			'Rasa kolektif bisa cepat berubah jadi tribalisme kalau partai cuma ngomong ke dalam. Desain lintas-partai di mufakat bukan fitur opsional — itu syarat eksistensial.',
			'LINTAS'
		],
		[
			'Jangan takut kesimpulan terbuka',
			'Ini bukan mesin konsensus. Kadang hasil paling jujur dari mikir bareng adalah: "ini lebih rumit dari yang kita kira." Pertanyaan yang belum terjawab sama pentingnya dengan kesepakatan.',
			'TERBUKA'
		],
		[
			'Jangan biarin persona ngalahin posisi',
			'Penyakit demokrasi kita: politik berpusat pada figur, bukan gagasan. Bendera yang muncul di tiap komentar bukan estetika — itu pengingat bahwa yang ngomong adalah posisi, bukan persona.',
			'POSISI'
		]
	] as const;
</script>

<svelte:head>
	<title>Tentang — alternatif.space</title>
	<meta
		name="description"
		content="Kenapa ruang ini ada. Bukan produk — eksperimen demokrasi. Penolakan terhadap isolasi, partai sebagai kelompok, dan perbedaan sebagai bahan baku."
	/>
	<link rel="canonical" href="https://alternatif.space/tentang" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alternatif.space/tentang" />
	<meta property="og:title" content="Tentang — alternatif.space" />
	<meta
		property="og:description"
		content="Kenapa ruang ini ada. Bukan produk — eksperimen demokrasi. Penolakan terhadap isolasi, partai sebagai kelompok, dan perbedaan sebagai bahan baku."
	/>
	<meta property="og:image" content="https://alternatif.space/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Tentang — alternatif.space" />
	<meta
		name="twitter:description"
		content="Kenapa ruang ini ada. Bukan produk — eksperimen demokrasi."
	/>
	<meta name="twitter:image" content="https://alternatif.space/og-card.png" />
</svelte:head>

<div class="lp min-h-screen">
	<!-- Hero -->
	<header class="lp-hero relative flex min-h-[72vh] flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10">
		<div class="lp-halftone" aria-hidden="true"></div>

		<div
			class="lp-mono relative flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
			style="border-color: var(--lp-ink)"
		>
			<a href="/" class="font-bold">alternatif.space</a>
			<a href={PARTAI_URL} class="lp-btn-nav">
				Lanjut ke partai <span class="lp-amber" aria-hidden="true">→</span>
			</a>
		</div>

		<div class="relative my-auto py-8">
			<p class="lp-mono text-sm tracking-[0.18em] uppercase">
				Bukan produk — <span class="lp-amber-bg">eksperimen demokrasi.</span>
			</p>
			<h1 class="lp-display mt-4">
				Kenapa ruang<br />
				ini <span class="lp-underline">ada.</span>
			</h1>
			<p class="mt-5 max-w-xl text-lg leading-snug font-medium">
				Setiap produk punya spesifikasi — fitur, arsitektur, alur. Tapi nggak ada yang njelasin
				<em>kenapa</em> semuanya ada. Ini jawabannya: jiwa yang mestinya kerasa di tiap tombol, tiap
				kata, tiap aturan.
			</p>
			<span class="lp-stamp mt-8 inline-block" aria-hidden="true">JIWA</span>
		</div>

		<div class="lp-mono relative flex items-baseline justify-between text-xs tracking-[0.2em] uppercase opacity-60">
			<span>(Gulir buat baca selengkapnya)</span>
			<span>id · 2026</span>
		</div>
	</header>

	<!-- tally divider -->
	<div class="lp-tally" aria-hidden="true">
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
		<span class="lp-mono lp-tally-label">jiwa tinggal di detail</span>
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
	</div>

	<!-- 01 — Penolakan terhadap isolasi (Premis Pertama) -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">01</span> — Premis pertama
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Kita nggak dirancang buat sendirian.</h2>
		<div class="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
			<p class="max-w-xl text-lg leading-relaxed font-medium">
				Kamu tahu apa yang kamu percaya sebagian besar karena pernah berhadapan sama orang yang
				percaya hal beda. Pengetahuan, nilai, identitas — semua produk kolektif. Tapi media
				sosial malah bangun isolasi: algoritma nyortir kamu ke gelembung, feed cuma nampilin yang
				udah kamu setujui. Hasilnya, jutaan orang merasa sendirian secara politik — punya pandangan,
				tapi nggak punya ruang buat bawanya ke hadapan pandangan lain. Alternatif Space mulai dari
				penolakan terhadap isolasi itu.
			</p>
			<blockquote class="lp-pull self-start">
				Beranda jadi cermin, bukan jendela. Kolektif bukan berarti sepakat — kolektif berarti
				<span class="lp-amber-bg">hadir bersama.</span>
			</blockquote>
		</div>
	</section>

	<!-- 02 — Partai = kelompok (Premis Kedua), inverted KBBI band -->
	<section class="lp-kbbi border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-70">
				<span class="lp-amber font-bold">02</span> — Premis kedua
			</p>
			<span class="lp-stamp lp-stamp-bone" aria-hidden="true">MENURUT KAMUS</span>
		</div>
		<p class="lp-kbbi-word mt-10">par·tai</p>
		<p class="lp-kbbi-def mt-6 max-w-3xl">
			<em class="lp-kbbi-class">/n/</em> perkumpulan (segolongan orang) yang
			<span class="lp-kbbi-mark">seasas</span>, <span class="lp-kbbi-mark">sehaluan</span>, dan
			<span class="lp-kbbi-mark">setujuan</span>.
		</p>
		<p class="mt-10 max-w-2xl text-lg leading-relaxed font-medium">
			Kata "partai" di Indonesia terlanjur berarti satu hal: mesin pemilu, patronase, kuasa elit.
			Banyak yang dengar "partai" langsung mundur — bukan karena nggak peduli, tapi karena terlalu
			sering kecewa. Padahal KBBI nggak pernah beranjak dari makna aslinya: sekelompok orang yang
			searah. Komunitas lingkungan itu partai. Sekelompok pemuda yang frustasi sama sistem pendidikan
			itu partai. Di sini, kata itu balik ke artinya — kelompok yang terbentuk karena orang nemu
			sesamanya, didirikan dengan manifesto. Ini bukan rebranding; ini argumen: bentuk paling organik
			dari partisipasi politik adalah orang yang nemu kesamaan lalu jalan bareng.
		</p>
	</section>

	<!-- 03 — Perbedaan = bahan baku (Premis Ketiga) -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">03</span> — Premis ketiga
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">
			Beda itu <span class="lp-amber-bg">fitur,</span> bukan bug.
		</h2>
		<div class="mt-8 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-16">
			<p class="max-w-xl text-lg leading-relaxed font-medium">
				Begitu orang ngumpul, mereka bakal beda — nggak terhindarkan. Aplikasi lain mandang beda
				sebagai masalah yang perlu dikelola: ditengahi, diredam, dipisah biar nggak meledak.
				Hasilnya diskusi steril, atau konflik yang nggak produktif. Di sini, beda itu bahan baku. Ia
				bukti orang sungguh-sungguh percaya pada sesuatu, dan tempat pengetahuan baru lahir — bukan
				dengan ngalahin satu pihak, tapi dengan nemu apa yang nggak bisa dibereskan satu perspektif
				aja.
			</p>
			<blockquote class="lp-pull self-start">
				Terlalu banyak keteraturan bunuh inovasi. Terlalu banyak kekacauan hancurin kepercayaan. Yang
				dibutuhin: <span class="lp-amber-bg">wadah yang cukup kuat</span> buat nampung kekacauan yang
				bermakna.
			</blockquote>
		</div>
	</section>

	<!-- 04 — Anatomi: empat ruang, satu siklus -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">04</span> — Anatomi jiwa
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Satu gagasan, empat momen.</h2>
		<p class="mt-3 max-w-2xl leading-relaxed opacity-80">
			Empat subdomain bukan empat produk. Mereka satu gagasan yang dipecah jadi empat momen dari
			dinamika sosial yang sama:
			<span class="lp-mono text-sm tracking-[0.05em] uppercase">
				identitas → pertemuan → deliberasi → dokumentasi.</span
			> Sebuah siklus yang bisa diulang — dan tiap ulangan bangun kapasitas yang lebih dalam.
		</p>
		<div class="mt-10 grid gap-0 border-2 sm:grid-cols-2" style="border-color: var(--lp-ink)">
			{#each anatomi as [name, initial, tag, desc, url, segera], i (name)}
				{#if segera}
					<div class="lp-cell relative">
						<span class="lp-cell-ghost" aria-hidden="true">{initial}</span>
						<div class="relative">
							<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-50">
								{String(i + 1).padStart(2, '0')} · {tag}
							</p>
							<h3 class="lp-h2 mt-3">{name}</h3>
							<p class="mt-2 max-w-[18rem] text-sm leading-relaxed opacity-80">{desc}</p>
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
							<p class="mt-2 max-w-[18rem] text-sm leading-relaxed opacity-80">{desc}</p>
							<p class="lp-cell-cta lp-mono mt-5 text-xs font-bold tracking-[0.2em] uppercase">
								Buka ruang <span aria-hidden="true">→</span>
							</p>
						</div>
					</a>
				{/if}
			{/each}
		</div>
	</section>

	<!-- 05 — Apa yang dijaga (guardrails) -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">05</span> — Apa yang dijaga
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">
			Jiwa ini <span class="lp-amber-bg">gampang hilang.</span>
		</h2>
		<dl class="mt-12">
			{#each jaga as [title, body, stamp] (title)}
				<div
					class="lp-reveal relative border-t-2 py-7 pr-28 sm:grid sm:grid-cols-[18rem_1fr] sm:gap-8"
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

	<!-- 06 — Ukuran keberhasilan, inverted band -->
	<section class="lp-invert border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-70">
			<span class="lp-amber font-bold">06</span> — Ukuran keberhasilan
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Bukan jumlah. Bukan viral.</h2>
		<p class="mt-6 max-w-2xl text-lg leading-relaxed font-medium">
			Keberhasilan itu: seseorang masuk dengan pandangan tertentu, berdebat sama yang nggak setuju,
			lalu keluar dengan pemahaman yang lebih dalam — entah karena pandangannya berubah, atau karena
			dia sekarang tahu <em>persis</em> di mana bedanya sama orang lain, dan <em>kenapa.</em>
		</p>
		<p class="mt-5 max-w-2xl text-lg leading-relaxed font-medium opacity-90">
			Keberhasilan itu: partai digital yang mulai sebagai eksperimen, bertahun kemudian jadi gerakan
			nyata. Keberhasilan itu: anak muda yang pertama kali ngerasain mikir bareng orang yang beda —
			dan nemu itu nggak nyeremin, malah hidup.
		</p>
	</section>

	<!-- 07 — Catatan terakhir + closing CTA -->
	<section class="lp-closing border-t-2 px-5 py-24 text-center sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">07</span> — Catatan terakhir
		</p>
		<p class="mx-auto mt-6 max-w-2xl text-lg leading-relaxed font-medium">
			Ruang ini mungkin gagal. Mungkin nggak ada yang datang. Mungkin yang datang cuma troll. Tapi
			jiwa ini nggak boleh gagal karena kita nggak pernah coba serius bangunnya.
		</p>
		<p class="lp-display mt-8">
			Selama hidup — ia harus<br /><span class="lp-underline">sungguh-sungguh hidup.</span>
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a href="/daftar" class="lp-btn">Mulai Latihan</a>
			<a href="/" class="lp-btn-outline">Balik ke beranda</a>
		</div>
	</section>

	<footer class="border-t-2" style="border-color: var(--lp-ink)">
		<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 px-5 py-8 text-xs tracking-[0.2em] uppercase sm:px-10">
			<a href="/" class="font-bold">alternatif.space</a>
			<span>
				<a href={SUBDOMAINS.partai} class="lp-link">partai</a>
				&nbsp;/&nbsp;
				<a href={SUBDOMAINS.mufakat} class="lp-link">mufakat</a>
				&nbsp;/&nbsp;
				<span class="opacity-50">simposium</span>
				&nbsp;/&nbsp;
				<span class="opacity-50">perpus</span>
			</span>
			<span>
				<a href="/tentang" class="lp-link">tentang</a> ·
				<a href="/contribute" class="lp-link">kontribusi</a> ·
				<a href="/kontak" class="lp-link">kontak</a>
			</span>
		</div>
	</footer>
</div>

<style>
	/* inverted dictionary band — shared shape with the apex landing's W0-07 */
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

	/* pull-quote — poster aside, ink rule on the left */
	.lp-pull {
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(1.25rem, 2.6vw, 1.6rem);
		line-height: 1.25;
		border-left: 4px solid var(--lp-ink);
		padding-left: 1.25rem;
	}
</style>
