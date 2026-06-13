<!-- partai /cara-kerja — mechanics deep-dive (TRD v1.5 addendum; copy:
     docs/prd/subdomain-landings-v0.1.md §A2). Public, SSR (crawlable). Every
     governance number here is PRD-locked (P0-05, P1-08, P1-09) — keep in sync
     if Phase 1 retunes the ranges. -->
<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
</script>

<svelte:head>
	<title>Cara kerja partai — partai.alternatif.space</title>
	<meta
		name="description"
		content="Satu partai dari nol sampai bisa di-recall: manifesto, konfigurasi tata kelola yang terbuka, masa honeymoon, dan alur petisi recall."
	/>
	<link rel="canonical" href="https://partai.alternatif.space/cara-kerja" />
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Cara kerja partai — partai.alternatif.space" />
	<meta property="og:locale" content="id_ID" />
</svelte:head>

<div class="lp min-h-screen">
	<!-- Hero -->
	<header class="px-5 pt-8 pb-14 sm:px-10">
		<div
			class="lp-mono flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
			style="border-color: var(--lp-ink)"
		>
			<a href="/" class="lp-link font-bold">← partai.alternatif.space</a>
			<span class="opacity-60">Cara kerja</span>
		</div>
		<p class="lp-mono mt-12 text-sm tracking-[0.18em] uppercase opacity-70">Cara kerja partai</p>
		<h1 class="lp-display mt-4">Dari nol<br />sampai bisa <span class="lp-underline">di-recall.</span></h1>
		<p class="mt-8 max-w-2xl text-lg leading-snug font-medium">
			Empat tahap: tulis posisi, atur aturan main, kumpulkan orang, lalu pertanggungjawaban. Ini
			detail tiap tahapnya — termasuk angka-angka yang ngatur semuanya.
		</p>
	</header>

	<!-- 01 — Manifesto -->
	<section class="border-t-2 px-5 py-16 sm:px-10" style="border-color: var(--lp-ink)">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">01</span> — Manifesto: posisi yang ditulis
			</p>
			<span class="lp-stamp lp-stamp-sm" aria-hidden="true">WAJIB</span>
		</div>
		<div class="mt-8 max-w-2xl space-y-4 text-lg leading-relaxed">
			<p>
				Tiap partai berdiri di atas satu manifesto — dokumen yang menyatakan apa yang partai itu
				perjuangkan, ditulis di editor teks, bukan diisi formulir. Tanpa manifesto, partai nggak bisa
				terbit.
			</p>
			<p>
				Setelah partai jalan, manifesto nggak beku. Tapi cara ngubahnya <strong>diatur sejak awal</strong>
				(lihat Konfigurasi): bisa ketua langsung, bisa lewat ratifikasi anggota, bisa lewat voting penuh.
			</p>
		</div>
	</section>

	<!-- 02 — Konfigurasi -->
	<section class="border-t-2 px-5 py-16 sm:px-10" style="border-color: var(--lp-ink)">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">02</span> — Konfigurasi: aturan main yang terbuka
			</p>
			<span class="lp-stamp lp-stamp-sm" aria-hidden="true">TERBUKA</span>
		</div>
		<p class="mt-8 max-w-2xl text-lg leading-relaxed">
			Sebelum partai terbit, pendirinya nyetel beberapa parameter. Inilah "aturan main" partai — dan
			semuanya <strong>keliatan publik</strong> di halaman partai. Nggak ada aturan tersembunyi.
		</p>
		<div class="mt-8 overflow-x-auto">
			<table class="lp-table">
				<thead>
					<tr>
						<th>Parameter</th>
						<th>Pilihan / rentang</th>
						<th>Artinya</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Cara gabung</td>
						<td>terbuka / lewat lamaran / undangan saja</td>
						<td>Siapa yang boleh jadi anggota</td>
					</tr>
					<tr>
						<td>Ambang petisi recall</td>
						<td>10%–50% anggota</td>
						<td>Berapa banyak tanda tangan buat mulai recall ketua</td>
					</tr>
					<tr>
						<td>Ambang suara recall</td>
						<td>50%+1 sampai 75%</td>
						<td>Berapa suara buat recall benar-benar lolos</td>
					</tr>
					<tr>
						<td>Ubah manifesto</td>
						<td>ketua saja → ratifikasi → voting penuh</td>
						<td>Siapa yang berhak ngubah posisi partai</td>
					</tr>
					<tr>
						<td>Keluarkan anggota</td>
						<td>ketua / campuran / voting</td>
						<td>Siapa yang bisa ngeluarin anggota</td>
					</tr>
					<tr>
						<td>Suara resmi di mufakat</td>
						<td>diatur partai</td>
						<td>Siapa yang ngomong atas nama partai</td>
					</tr>
				</tbody>
			</table>
		</div>
		<p class="mt-8 max-w-2xl text-lg leading-relaxed">
			Begitu partai terbit, <strong>konfigurasi terkunci permanen</strong>. Pendiri jadi ketua, dan
			masa honeymoon 3 bulan dimulai. Aturan ditetapkan di depan supaya nggak bisa diubah diam-diam
			pas lagi menguntungkan satu pihak.
		</p>
		<p class="mt-4 max-w-2xl text-sm leading-relaxed opacity-70">
			Ada beberapa preset buat mempercepat (ketua kuat; ketua-usul-anggota-ratifikasi; semua-lewat-suara),
			tapi label preset cuma alat bantu pendiri — yang publik lihat cuma nilai parameternya, bukan labelnya.
		</p>
	</section>

	<!-- 03 — Honeymoon -->
	<section class="border-t-2 px-5 py-16 sm:px-10" style="border-color: var(--lp-ink)">
		<div class="flex flex-wrap items-baseline justify-between gap-3">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">03</span> — Honeymoon: tiga bulan tenang
			</p>
			<span class="lp-stamp lp-stamp-sm" aria-hidden="true">3 BULAN</span>
		</div>
		<p class="mt-8 max-w-2xl text-lg leading-relaxed">
			Partai baru dapat <strong>3 bulan</strong> masa tenang. Selama itu, petisi recall diblokir —
			ketua dan anggota awal bisa fokus membangun dulu sebelum mekanisme pertanggungjawaban aktif.
			Kalau ada yang nyoba mulai petisi selama honeymoon, statusnya keliatan jelas: belum bisa.
		</p>
	</section>

	<!-- 04 — Petisi & recall -->
	<section class="lp-invert border-t-2 px-5 py-16 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-70">
			<span class="lp-amber font-bold">04</span> — Petisi &amp; recall: ketua yang bisa diganti
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Ketua di sini bukan jabatan seumur hidup.</h2>
		<p class="mt-6 max-w-2xl text-lg leading-relaxed opacity-90">
			Kalau anggota merasa ketua nggak lagi mewakili posisi partai, ada jalannya — dan jalannya itu
			angka, bukan drama.
		</p>
		<ol class="mt-10 space-y-6">
			<li class="border-t pt-5" style="border-color: rgba(244,241,234,0.25)">
				<p class="lp-mono text-xs tracking-[0.2em] uppercase" style="color: var(--lp-amber-hi)">01 · Petisi</p>
				<p class="mt-2 max-w-2xl leading-relaxed">
					Anggota mulai petisi recall. Butuh tanda tangan sebanyak ambang yang partai setel
					(10%–50%). Minimal 10 anggota biar valid. Diblokir selama honeymoon.
				</p>
			</li>
			<li class="border-t pt-5" style="border-color: rgba(244,241,234,0.25)">
				<p class="lp-mono text-xs tracking-[0.2em] uppercase" style="color: var(--lp-amber-hi)">02 · Voting</p>
				<p class="mt-2 max-w-2xl leading-relaxed">
					Begitu ambang petisi tercapai, voting recall otomatis jalan. Recall lolos kalau suara
					mencapai ambang yang disetel partai (50%+1 sampai 75%).
				</p>
			</li>
			<li class="border-t pt-5" style="border-color: rgba(244,241,234,0.25)">
				<p class="lp-mono text-xs tracking-[0.2em] uppercase" style="color: var(--lp-amber-hi)">03 · Hasil</p>
				<p class="mt-2 max-w-2xl leading-relaxed">
					Kalau lolos, ketua di-recall. Kalau gagal, petisi diarsipkan, ketua tetap, dan petisi baru
					nggak bisa dimulai selama 30 hari — biar nggak jadi gangguan terus-terusan.
				</p>
			</li>
		</ol>
		<p class="mt-10 max-w-2xl leading-relaxed opacity-90">
			Yang bikin ini beda dari "ganti pengurus" di tempat lain: ambangnya ditetapkan partai sendiri,
			di depan, dan terbuka. Partai yang milih ketua kuat tinggal punya ambang tinggi — dan itu pun
			keliatan publik, jadi orang tahu apa yang mereka masuki.
		</p>
	</section>

	<!-- 05 — Nama & logo -->
	<section class="border-t-2 px-5 py-16 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">05</span> — Setelah honeymoon: nama &amp; logo
		</p>
		<p class="mt-8 max-w-2xl text-lg leading-relaxed">
			Selama honeymoon, ketua bebas ngedit nama dan logo. Setelah honeymoon, ganti nama/logo butuh
			voting anggota (50%+1) — kecuali partai yang konfigurasinya emang ketua-penuh. Identitas partai
			jadi milik bersama begitu masa tenang lewat.
		</p>
	</section>

	<!-- Closing -->
	<section class="border-t-2 px-5 py-24 text-center sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-display-sm mx-auto max-w-2xl">
			Aturan yang kamu lihat sekarang, ya itu <span class="lp-amber-bg">aturannya nanti.</span>
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a href="/buat-partai" class="lp-btn inline-block">Dirikan Partai →</a>
			<a href="/jelajah" class="lp-btn-ghost inline-block">Cari Partai</a>
		</div>
	</section>

	<footer class="border-t-2" style="border-color: var(--lp-ink)">
		<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 px-5 py-8 text-xs tracking-[0.2em] uppercase sm:px-10">
			<span class="font-bold">partai.alternatif.space</span>
			<span><a href="/" class="lp-link">beranda</a> / <a href="/jelajah" class="lp-link">jelajah</a></span>
			<span class="opacity-50">id • 2026</span>
		</div>
	</footer>
</div>
