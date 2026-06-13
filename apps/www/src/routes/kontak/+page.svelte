<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import { SUBDOMAINS } from '$lib/urls';

	let name = '';
	let email = '';
	let message = '';
	let gotcha = '';

	let status = $state('idle');
	let errorMessage = $state('');

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		status = 'loading';
		errorMessage = '';

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, email, message, _gotcha: gotcha })
			});

			const data = await res.json();

			if (data.ok) {
				status = 'success';
			} else {
				status = 'error';
				errorMessage = data.error || 'Gagal mengirim. Coba lagi nanti.';
			}
		} catch {
			status = 'error';
			errorMessage = 'Gagal terhubung. Periksa koneksi kamu.';
		}
	}
</script>

<svelte:head>
	<title>Kontak — alternatif.space</title>
	<meta
		name="description"
		content="Ada yang mau disampaikan? Kirim pesan ke sapa@alternatif.space atau isi formulir di bawah."
	/>
	<link rel="canonical" href="https://alternatif.space/kontak" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://alternatif.space/kontak" />
	<meta property="og:title" content="Kontak — alternatif.space" />
	<meta
		property="og:description"
		content="Ada yang mau disampaikan? Kirim pesan ke sapa@alternatif.space atau isi formulir di bawah."
	/>
	<meta property="og:image" content="https://alternatif.space/og-card.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="Kontak — alternatif.space" />
	<meta
		name="twitter:description"
		content="Ada yang mau disampaikan? Kirim pesan ke sapa@alternatif.space atau isi formulir di bawah."
	/>
	<meta name="twitter:image" content="https://alternatif.space/og-card.png" />
</svelte:head>

<div class="lp min-h-screen">
	<header class="lp-hero relative flex min-h-[60vh] flex-col overflow-hidden px-5 pt-6 pb-8 sm:px-10">
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
				Ngobrol langsung? <span class="lp-amber-bg">Buka aja.</span>
			</p>
			<h1 class="lp-display mt-4">
				Ada yang mau<br />
				<span class="lp-underline">disampaikan?</span>
			</h1>
			<p class="mt-5 max-w-lg text-lg leading-snug font-medium">
				Tulis langsung ke <a href="mailto:sapa@alternatif.space" class="lp-link">sapa@alternatif.space</a>, atau
				isi formulir di bawah. Kami nggak janji cepat — tapi kami janji baca.
			</p>
			<span class="lp-stamp mt-8 inline-block" aria-hidden="true">KONTAK</span>
		</div>

		<div class="lp-mono relative flex items-baseline justify-between text-xs tracking-[0.2em] uppercase opacity-60">
			<span>(Gulir buat isi formulir)</span>
			<span>id · 2026</span>
		</div>
	</header>

	<div class="lp-tally" aria-hidden="true">
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
		<span class="lp-mono lp-tally-label">tiap pesan kami baca</span>
		{#each Array(5) as _, i (i)}
			<span class="lp-tally-group">||||<span class="lp-tally-strike">/</span></span>
		{/each}
	</div>

	<section class="border-t-2 px-5 py-20 sm:px-10" style="border-color: var(--lp-ink)">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">01</span> — Kirim pesan
		</p>
		<h2 class="lp-display-sm mt-4 max-w-2xl">Tulis di sini — atau <span class="lp-amber-bg">email langsung.</span></h2>

		<div class="mt-10 max-w-xl">
			<a
				href="mailto:sapa@alternatif.space"
				class="lp-mono inline-block border-2 px-5 py-3 text-sm font-bold tracking-[0.15em] uppercase"
				style="border-color: var(--lp-ink)"
			>
				sapa@alternatif.space <span aria-hidden="true">→</span>
			</a>
		</div>

		{#if status === 'success'}
			<div class="mt-12 border-2 p-8" style="border-color: var(--lp-amber)">
				<p class="lp-h2">Pesan terkirim.</p>
				<p class="mt-3 leading-relaxed opacity-80">Kami akan baca dan balas segera. Nggak janji cepat — tapi kami janji baca.</p>
			</div>
		{:else}
			<form onsubmit={submit} class="mt-12 max-w-xl space-y-6">
				<div>
					<label for="name" class="lp-mono block text-xs tracking-[0.2em] uppercase">Nama</label>
					<input
						id="name"
						type="text"
						bind:value={name}
						required
						maxlength={100}
						disabled={status === 'loading'}
						class="mt-2 block w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none"
						style="border-color: var(--lp-ink)"
						placeholder="Namamu"
					/>
				</div>

				<div>
					<label for="email" class="lp-mono block text-xs tracking-[0.2em] uppercase">Email</label>
					<input
						id="email"
						type="email"
						bind:value={email}
						required
						maxlength={254}
						disabled={status === 'loading'}
						class="mt-2 block w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none"
						style="border-color: var(--lp-ink)"
						placeholder="kamu@email.com"
					/>
				</div>

				<div>
					<label for="message" class="lp-mono block text-xs tracking-[0.2em] uppercase">Pesan</label>
					<textarea
						id="message"
						bind:value={message}
						required
						maxlength={2000}
						rows={5}
						disabled={status === 'loading'}
						class="mt-2 block w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none resize-y"
						style="border-color: var(--lp-ink)"
						placeholder="Tulis pesanmu di sini..."
					></textarea>
				</div>

				<label class="lp-honeypot" aria-hidden="true">
					<input type="text" bind:value={gotcha} tabindex="-1" autocomplete="off" />
				</label>

				{#if status === 'error' && errorMessage}
					<p class="lp-mono text-sm" style="color: var(--lp-cap)">{errorMessage}</p>
				{/if}

				<button
					type="submit"
					disabled={status === 'loading'}
					class="lp-btn inline-block"
					class:opacity-50={status === 'loading'}
				>
					{status === 'loading' ? 'Mengirim...' : 'Kirim pesan →'}
				</button>
			</form>
		{/if}
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
			<a href="/contribute" class="lp-link">kontribusi</a>
		</div>
	</footer>
</div>

<style>
	.lp {
		--lp-bone: #f4f1ea;
		--lp-ink: #141210;
		--lp-cap: #d4380d;
		--lp-cap-bone: #ff7a50;
		--lp-amber: #c17d0f;
		--lp-amber-hi: #f5a623;
		background: var(--lp-bone);
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.08 0 0 0 0 0.07 0 0 0 0 0.06 0 0 0 0.025 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23g)'/%3E%3C/svg%3E");
		color: var(--lp-ink);
		font-family: 'Space Grotesk Variable', sans-serif;
	}
	.lp-mono {
		font-family: 'Space Grotesk Variable', sans-serif;
	}
	.lp-amber {
		color: var(--lp-amber);
	}
	.lp-amber-bg {
		box-shadow: inset 0 -0.45em 0 0 rgba(245, 166, 35, 0.45);
	}
	.lp-display {
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(2.6rem, 11vw, 7rem);
		line-height: 0.98;
		letter-spacing: -0.01em;
	}
	.lp-display-sm {
		font-family: 'Archivo Black', sans-serif;
		font-size: clamp(1.8rem, 6vw, 3.2rem);
		line-height: 1.05;
	}
	.lp-h2 {
		font-family: 'Archivo Black', sans-serif;
		font-size: 1.5rem;
		line-height: 1.15;
	}
	.lp-underline {
		box-shadow:
			inset 0 -0.18em 0 0 var(--lp-bone),
			inset 0 -0.34em 0 0 var(--lp-amber-hi);
	}
	.lp-link {
		text-decoration: underline;
		text-underline-offset: 4px;
	}
	.lp-btn {
		font-family: 'Archivo Black', sans-serif;
		background: var(--lp-ink);
		color: var(--lp-bone);
		padding: 0.9rem 2.4rem;
		font-size: 1.05rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		border: none;
		cursor: pointer;
	}
	.lp-btn:hover {
		background: var(--lp-amber);
		color: var(--lp-ink);
	}
	.lp-btn:disabled {
		cursor: not-allowed;
	}
	.lp-btn-nav {
		font-family: 'Archivo Black', sans-serif;
		background: var(--lp-ink);
		color: var(--lp-bone);
		padding: 0.5rem 1.1rem;
		font-size: 0.7rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.lp-btn-nav:hover {
		background: var(--lp-amber);
		color: var(--lp-ink);
	}
	.lp-btn-nav:hover .lp-amber {
		color: var(--lp-ink);
	}

	.lp-hero {
		position: relative;
	}
	.lp-halftone {
		position: absolute;
		top: -4rem;
		right: -6rem;
		width: 34rem;
		height: 34rem;
		pointer-events: none;
		background-image: radial-gradient(rgba(193, 125, 15, 0.5) 1.5px, transparent 1.5px);
		background-size: 14px 14px;
		mask-image: radial-gradient(closest-side, rgba(0, 0, 0, 0.5), transparent 70%);
		-webkit-mask-image: radial-gradient(closest-side, rgba(0, 0, 0, 0.5), transparent 70%);
	}

	.lp-tally {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 1.4rem;
		border-top: 2px solid var(--lp-ink);
		padding: 0.8rem 1rem;
		font-family: 'Archivo Black', sans-serif;
		font-size: 1.3rem;
		letter-spacing: 0.25em;
		color: var(--lp-amber);
		overflow: hidden;
		white-space: nowrap;
	}
	.lp-tally-group {
		position: relative;
	}
	.lp-tally-strike {
		position: absolute;
		left: 0;
		right: 0;
		text-align: center;
		transform: rotate(8deg) scaleX(1.6);
		color: var(--lp-ink);
	}
	.lp-tally-label {
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--lp-ink);
		opacity: 0.6;
	}

	.lp-stamp {
		font-family: 'Archivo Black', sans-serif;
		font-size: 0.85rem;
		letter-spacing: 0.12em;
		color: var(--lp-cap);
		border: 3px double var(--lp-cap);
		border-radius: 4px;
		padding: 0.35rem 0.8rem;
		transform: rotate(-6deg);
		opacity: 0.85;
		mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='40'%3E%3Cfilter id='r'%3E%3CfeTurbulence baseFrequency='0.6' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0.1'/%3E%3CfeComposite operator='in' in2='SourceGraphic'/%3E%3C/filter%3E%3Crect width='120' height='40' fill='black' filter='url(%23r)'/%3E%3C/svg%3E");
		mask-size: cover;
	}

	.lp-honeypot {
		position: absolute;
		left: -9999px;
		opacity: 0;
	}
</style>
