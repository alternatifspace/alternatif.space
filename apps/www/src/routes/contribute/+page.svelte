<!-- alternatif.space /contribute — roadmap + open-source hub.
      Pamflet visual system × Arena copy register.
      Gantt chart: pure CSS Grid, no JS.
      Motion: reveal fades, gated on scripting/reduced-motion. -->
<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
	import { reveal } from '@alternatif/ui';
	import { SUBDOMAINS } from '$lib/urls';

	const quarters = ['Q2 2026', 'Q3 2026', 'Q4 2026', 'Q1 2027', 'Q2 2027', 'H2 2027'] as const;

	type Workstream = { label: string; items: string[] };
	type Phase = {
		id: string;
		title: string;
		status: string;
		statusClass: string;
		gridCol: string;
		description: string;
		workstreams: Workstream[];
	};

	const phases: Phase[] = [
		{
			id: '0',
			title: 'Fase 0 — Peluncuran',
			status: 'SEKARANG',
			statusClass: 'lp-stamp-amber',
			gridCol: '2 / span 2',
			description:
				'Landasan: partai dibentuk, mufakat dibuka. Untuk pertama kali, ada ruang latihan demokrasi.',
			workstreams: [
				{
					label: 'Partai',
					items: [
						'Wizard 4 langkah — dirikan partai dalam satu alur',
						'Manifesto wajib (TipTap, 50+ kata)',
						'Tiga model keanggotaan: terbuka, lamaran, undangan',
						'Browse & cari partai — filter status, model, nama',
						'Party share cards (OG + Web Share API)',
						'Post-join nudge: "Bendera terpasang. Bawa posisimu ke diskusi."'
					]
				},
				{
					label: 'Mufakat',
					items: [
						'Buat thread — dedup suggestion di judul',
						'Komentar bertingkat (max depth 3), TipTap editor',
						'Reaksi: Setuju + Pertanyaan bagus',
						'Good-question split → spin-off thread otomatis',
						'OP-ship 24h: komentator konfirmasi atau lepas',
						'Moderasi: report, semantic flag, admin spin-off, merge'
					]
				},
				{
					label: 'Infra',
					items: [
						'Landing page (root alternatif.space + subdomain landings)',
						'Clerk auth lintas-subdomain (.alternatif.space cookie)',
						'Supabase PostgreSQL + RLS + Edge Functions',
						'PWA offline, mobile-first, touch targets 44px',
						'Cloudflare Pages deployment (partai, mufakat, www)'
					]
				}
			]
		},
		{
			id: '1',
			title: 'Fase 1 — Kehidupan Internal & Resolusi',
			status: 'SEGERA',
			statusClass: 'lp-stamp-cap',
			gridCol: '4 / span 2',
			description:
				'Partai bernapas dari dalam. Mufakat mulai memetakan hasil diskusi — bukan cuma adu argumen, tapi memahami di mana letak perbedaan.',
			workstreams: [
				{
					label: 'Partai — Komunikasi Internal',
					items: [
						'Dashboard: hub untuk pengumuman, diskusi, tata kelola',
						'Pengumuman (leader broadcast, notifikasi wajib)',
						'Diskusi internal bertingkat — leader/pin/close',
						'Position brief: dokumen sikap terstruktur',
						'Notifikasi berbobot: pengumuman > brief > balasan diskusi'
					]
				},
				{
					label: 'Partai — Tata Kelola',
					items: [
						'Pulse check: polling ringan (2–5 opsi, deadline opsional)',
						'Amandemen manifesto — diff view, vote 50%+1',
						'Recall petition + vote (72h, honeymoon 3 bulan)',
						'Hasil recall: leader diganti atau dipertahankan, log publik',
						'Push notifications (FCM, APNs, Web Push)',
						'Deputy leader — caretaker setelah 7 hari inactivity'
					]
				},
				{
					label: 'Mufakat — Infrastruktur Resolusi',
					items: [
						'Argument lifecycle: Pending / Refuted / Integrated / Axiom Stop',
						'Resolution map — ringkasan terstruktur per thread',
						'Halaman /pertanyaan-terbuka — jejak pertanyaan yang belum terjawab',
						'Sort by most-routed-to — sinyal pertama epistemic engine',
						'Summary dispute — formal challenge ke summary-back'
					]
				}
			]
		},
		{
			id: '2',
			title: 'Fase 2 — Kedalaman & Mesin Epistemik',
			status: 'RENCANA',
			statusClass: 'lp-stamp-outline',
			gridCol: '6 / span 2',
			description:
				'Partai punya struktur delegasi. Mufakat dibantu AI memetakan perbedaan. Simposium hadir sebagai ruang deliberasi langsung.',
			workstreams: [
				{
					label: 'Partai — Depth',
					items: [
						'Council roles — delegasi izin khusus (post, moderate, govern)',
						'Official position stamp — posisi resmi partai di mufakat',
						'Party distancing + response — komunikasi lintas-bendera formal',
						'Graduated conduct: warn → mute → suspend → remove',
						'Dissolution & succession — pembubaran sukarela, suksesi'
					]
				},
				{
					label: 'Mufakat — AI',
					items: [
						'AI semantic-dispute detection (pgvector embeddings)',
						'Global knowledge graph — threads as nodes, splits as edges',
						'Automated open-question routing — tawaran in-thread, user-confirmable',
						'AI-assisted resolution status — confidence-scored, human-confirmed',
						'Parallel convergence detection — debat serupa di parent berbeda'
					]
				},
				{
					label: 'Simposium',
					items: [
						'Deliberasi langsung — thread terpilih naik ke panggung',
						'Speaker designation — siapa wakili partai di sesi langsung',
						'Observer designation — hadir tanpa hak bicara',
						'Post-session ratification — leader sahkan atau tolak posisi speaker'
					]
				}
			]
		}
	] as const;

	const contributeLanes = [
		{
			initial: 'K',
			title: 'Kode',
			body: 'Frontend SvelteKit, backend Supabase Edge Functions, CI/CD GitHub Actions. Cari label <em>good first issue</em> di repo — selalu ada pintu masuk buat kontributor baru.',
			cta: 'Lihat isu',
			href: 'https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug%20label%3Aenhancement%20label%3Adocumentation'
		},
		{
			initial: 'D',
			title: 'Desain',
			body: 'Visual system, UI components, ilustrasi, motion. Bantu bikin ruang ini terasa hidup — tapi tetap jujur. Nggak butuh ornamen; butuh maksud.',
			cta: 'Lihat isu desain',
			href: 'https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Adesign'
		},
		{
			initial: 'T',
			title: 'Tulisan',
			body: 'Copywriting (landing, onboarding, microcopy in-app), dokumentasi teknis, terjemahan. Suara kita santai-serius — bukan korporat, bukan buzzer.',
			cta: 'Lihat isu konten',
			href: 'https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Acopywrite'
		},
		{
			initial: 'U',
			title: 'Uji coba',
			body: 'QA & bug hunting, pengujian fitur baru, laporan UX, riset pengguna. Kamu yang pertama nyoba, kamu yang pertama bantu arahin.',
			cta: 'Lapor bug',
			href: 'https://github.com/alternatifspace/alternatif.space/issues?q=is%3Aissue%20state%3Aopen%20label%3Abug%20label%3Aenhancement%20label%3Adocumentation'
		}
	] as const;

	const stack = [
		'SvelteKit',
		'Svelte 5',
		'TypeScript',
		'Tailwind CSS',
		'Supabase',
		'PostgreSQL',
		'Clerk',
		'Cloudflare Pages',
		'pnpm'
	] as const;
</script>

<svelte:head>
	<title>Kontribusi — alternatif.space</title>
	<meta
		name="description"
		content="Proyek terbuka — dari kode sampai arah. Lihat roadmap, ikut bangun, bantu bentuk ruang latihan demokrasi Indonesia."
	/>
	<link rel="canonical" href="https://alternatif.space/contribute" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alternatif.space/contribute" />
	<meta property="og:title" content="Kontribusi — alternatif.space" />
	<meta
		property="og:description"
		content="Proyek terbuka — dari kode sampai arah. Lihat roadmap, ikut bangun, bantu bentuk ruang latihan demokrasi."
	/>
	<meta property="og:image" content="https://alternatif.space/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Kontribusi — alternatif.space" />
	<meta
		name="twitter:description"
		content="Proyek terbuka — dari kode sampai arah. Lihat roadmap, ikut bangun, bantu bentuk ruang latihan demokrasi."
	/>
	<meta name="twitter:image" content="https://alternatif.space/og-card.png" />
</svelte:head>

<div class="lp min-h-screen">
	<!-- 01 — Hero: belonging-first, open-source thesis -->
	<header class="lp-hero relative flex min-h-[70vh] flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10">
		<div class="lp-halftone" aria-hidden="true"></div>

		<div
			class="lp-mono relative flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
			style="border-color: var(--lp-ink)"
		>
			<a href="/" class="font-bold">alternatif.space</a>
			<a href={SUBDOMAINS.partai} class="lp-btn-nav">
				Lanjut ke partai <span class="lp-amber" aria-hidden="true">→</span>
			</a>
		</div>

		<div class="relative my-auto py-8">
			<p class="lp-mono text-sm tracking-[0.18em] uppercase">
				Bukan cuma kode — arahnya juga <span class="lp-amber-bg">ditentukan bersama.</span>
			</p>
			<h1 class="lp-display mt-4">
				Proyek ini<br />
				<span class="lp-underline">terbuka.</span>
			</h1>
			<p class="mt-5 max-w-lg text-lg leading-snug font-medium">
				Dari kode sampai arah — kamu bisa masuk dan tentuin. Nggak perlu nunggu diangkat. Lihat
				roadmap, timpuk isu, atau bikin sendiri.
			</p>
			<span class="lp-stamp mt-8 inline-block" aria-hidden="true">KONTRIBUSI</span>
		</div>

		<div class="lp-mono relative flex items-baseline justify-between text-xs tracking-[0.2em] uppercase opacity-60">
			<span>(Gulir buat lihat peta jalannya)</span>
			<span>id · 2026</span>
		</div>
	</header>

	<!-- tally divider -->
	<div class="lp-tally" aria-hidden="true">
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
		<span class="lp-mono lp-tally-label">tiap fase satu langkah</span>
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
	</div>

	<!-- 02 — Roadmap: Gantt chart + phase detail cards -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">01</span> — Peta jalan
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Satu langkah, satu fase.</h2>
		<p class="mt-3 max-w-xl leading-relaxed opacity-80">
			Tiga fase dari peluncuran sampai ruang ini bisa memetakan perbedaan secara mandiri. Tiap fase
			terbangun di atas fase sebelumnya — nggak lompat.
		</p>

		<!-- Gantt chart — pure CSS Grid, scrollable on narrow screens -->
		<div class="lp-gantt-wrap mt-12">
			<div class="lp-gantt-grid">
				<!-- time header row -->
				<div class="lp-gantt-label"></div>
				{#each quarters as q}
					<div class="lp-gantt-time lp-mono">{q}</div>
				{/each}

				<!-- phase bars + sub-labels -->
				{#each phases as phase}
					<!-- phase bar row -->
					<div class="lp-gantt-label">
						<span class="lp-gantt-phase-name">{phase.title}</span>
					</div>
					<div class="lp-gantt-bar {phase.statusClass}" style="grid-column: {phase.gridCol}">
						<span class="lp-gantt-bar-label lp-mono">{phase.status}</span>
					</div>

					<!-- phase sub-labels row -->
					<div class="lp-gantt-label"></div>
					<div class="lp-gantt-subs" style="grid-column: {phase.gridCol}">
						{#each phase.workstreams as ws, j (ws.label)}
							<span class="lp-mono">{ws.label}</span>
							{#if j < phase.workstreams.length - 1}<span class="lp-gantt-sep">·</span>{/if}
						{/each}
					</div>
				{/each}
			</div>
		</div>

		<!-- Phase detail cards -->
		<div class="mt-20 grid gap-16">
			{#each phases as phase, pi (phase.id)}
				<article
					class="lp-reveal"
					style="--d: {pi * 90}ms"
					use:reveal
				>
					<div class="flex flex-wrap items-center justify-between gap-4">
						<div class="flex items-center gap-4">
							<span class="lp-num" aria-hidden="true">{String(pi + 1).padStart(2, '0')}</span>
							<h3 class="lp-h2">{phase.title}</h3>
						</div>
						<span class="lp-stamp lp-stamp-sm {phase.statusClass}" aria-hidden="true">{phase.status}</span>
					</div>
					<p class="mt-4 max-w-2xl leading-relaxed opacity-80">{phase.description}</p>

					<div class="mt-8 grid gap-6 md:grid-cols-{phase.workstreams.length > 2 ? '3' : '2'}">
						{#each phase.workstreams as ws}
							<div
								class="border-l-2 py-1 pl-5"
								style="border-color: var(--lp-amber)"
							>
								<p class="lp-mono text-xs font-bold tracking-[0.15em] uppercase">{ws.label}</p>
								<ul class="mt-2 space-y-1.5">
									{#each ws.items as item}
										<li class="text-sm leading-relaxed">{item}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</article>
			{/each}
		</div>
	</section>

	<!-- 03 — GitHub & kode terbuka, inverted band -->
	<section class="lp-invert border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-70">
			<span class="lp-amber font-bold">02</span> — Kode terbuka
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">
			Jujur sampai <span class="lp-amber-bg">tulang.</span>
		</h2>
		<div class="mt-8 grid gap-10 lg:grid-cols-[1fr_auto]">
			<div>
				<p class="max-w-xl leading-relaxed text-lg font-medium">
					Kode kami terbuka — dan <em>"unresolved is a valid state"</em> itu bukan disclaimer. Itu
					komitmen. Semua diskusi teknis, keputusan arsitektur, dan backlog terbuka untuk dilihat
					dan dikomentari. Kamu nggak perlu izin buat mulai baca — atau mulai bantu.
				</p>
				<div class="mt-8 flex flex-wrap gap-3">
					<a href="https://github.com/alternatifspace/alternatif.space" target="_blank" rel="noopener" class="lp-btn">Lihat di GitHub →</a>
					<a href="https://github.com/alternatifspace/alternatif.space/issues" target="_blank" rel="noopener" class="lp-btn-outline">Jelajahi isu</a>
				</div>
			</div>
			<div class="lp-mono text-xs tracking-[0.15em] uppercase opacity-50">
				<p class="mb-2 font-bold">Tech stack</p>
				<div class="flex flex-wrap gap-1.5 max-w-[16rem]">
					{#each stack as tech}
						<span class="lp-stack-chip">{tech}</span>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- 04 — Cara berkontribusi: 2×2 grid -->
	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">03</span> — Cara berkontribusi
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">
			Pilih <span class="lp-amber-bg">jalurmu.</span>
		</h2>
		<p class="mt-3 max-w-xl leading-relaxed opacity-80">
			Semua masuk. Kamu nggak harus bisa kode buat ikut ngebangun.
		</p>

		<div class="mt-10 grid gap-0 border-2 sm:grid-cols-2" style="border-color: var(--lp-ink)">
			{#each contributeLanes as lane, i (lane.title)}
				<a
					href={lane.href}
					target="_blank"
					rel="noopener"
					class="lp-cell lp-cell-live relative block"
				>
					<span class="lp-cell-ghost" aria-hidden="true">{lane.initial}</span>
					<div class="relative">
						<p class="lp-mono text-xs tracking-[0.2em] uppercase opacity-50">
							{String(i + 1).padStart(2, '0')} · jalur
						</p>
						<h3 class="lp-h2 mt-3">{lane.title}</h3>
						<p class="mt-2 max-w-[18rem] text-sm leading-relaxed opacity-80">
							{@html lane.body}
						</p>
						<p class="lp-cell-cta lp-mono mt-5 text-xs font-bold tracking-[0.2em] uppercase">
							{lane.cta} <span aria-hidden="true">→</span>
						</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<!-- 05 — Penutup CTA -->
	<section class="lp-closing border-t-2 px-5 py-24 text-center sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">04</span> — Mulai
		</p>
		<p class="lp-display mt-6">
			Hasilnya ditentukan<br />oleh yang <span class="lp-underline">ikut latihan.</span>
		</p>
		<div class="mt-10 flex flex-wrap items-center justify-center gap-4">
			<a href="https://github.com/alternatifspace/alternatif.space" target="_blank" rel="noopener" class="lp-btn">Lihat di GitHub →</a>
			<a href="/daftar" class="lp-btn-outline">Mulai Latihan</a>
		</div>
	</section>

	<!-- footer -->
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
			<span>github · <a href="/contribute" class="lp-link">/contribute</a> · <a href="/kontak" class="lp-link">/kontak</a></span>
		</div>
	</footer>
</div>

<style>
	/* ============ GANTT CHART ============ */

	.lp-gantt-wrap {
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
		padding-bottom: 0.5rem;
	}
	.lp-gantt-grid {
		display: grid;
		grid-template-columns: minmax(11rem, 13rem) repeat(6, minmax(5.5rem, 1fr));
		min-width: 48rem;
		align-items: center;
		row-gap: 0;
	}

	.lp-gantt-time {
		font-size: 0.6rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		text-align: center;
		padding: 0.4rem 0.3rem;
		border-bottom: 1.5px solid var(--lp-ink);
		opacity: 0.55;
	}

	.lp-gantt-label {
		display: flex;
		align-items: center;
		padding: 0.35rem 0.6rem 0.35rem 0;
	}
	.lp-gantt-phase-name {
		font-family: 'Archivo Black', sans-serif;
		font-size: 0.75rem;
		line-height: 1.2;
		letter-spacing: -0.01em;
	}

	.lp-gantt-bar {
		position: relative;
		height: 1.6rem;
		border-radius: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0.1rem 1px;
	}
	.lp-gantt-bar-label {
		font-size: 0.55rem;
		letter-spacing: 0.16em;
		font-weight: 700;
		text-transform: uppercase;
	}

	.lp-stamp-amber.lp-gantt-bar {
		background: var(--lp-amber);
	}
	.lp-stamp-amber .lp-gantt-bar-label {
		color: var(--lp-bone);
	}

	.lp-stamp-cap.lp-gantt-bar {
		background: repeating-linear-gradient(
			-40deg,
			var(--lp-amber),
			var(--lp-amber) 4px,
			var(--lp-amber-hi) 4px,
			var(--lp-amber-hi) 8px
		);
	}
	.lp-stamp-cap .lp-gantt-bar-label {
		color: var(--lp-ink);
	}

	.lp-stamp-outline.lp-gantt-bar {
		background: transparent;
		border: 2px solid var(--lp-ink);
	}
	.lp-stamp-outline .lp-gantt-bar-label {
		color: var(--lp-ink);
	}

	.lp-gantt-subs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.25rem 0.5rem;
		padding: 0.25rem 0.5rem 0.6rem;
		font-size: 0.58rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		opacity: 0.55;
	}
	.lp-gantt-sep {
		color: var(--lp-amber);
		font-weight: 700;
	}
</style>
