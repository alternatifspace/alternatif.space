<!-- PROTOTYPE — landing variant "Clean civic-tech" (www-landing PRD §6).
     Trust-first SaaS structure: sticky nav, split hero with form card,
     grids with badges. -->
<script lang="ts">
	import { useClerkContext } from 'svelte-clerk/client';
	import AuthArea from '$lib/auth/AuthArea.svelte';
	import { PARTAI_URL } from '$lib/urls';

	const ctx = useClerkContext();
	const signedIn = $derived(Boolean(ctx.auth.userId));
</script>

<div class="min-h-screen bg-white text-slate-900">
	<!-- nav -->
	<nav class="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
		<div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
			<span class="font-bold">alternatif<span class="text-slate-400">.space</span></span>
			<div class="flex items-center gap-3">
				{#if signedIn}
					<a
						href={PARTAI_URL}
						class="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white"
					>
						Lanjut ke partai →
					</a>
				{:else}
					<a href="/masuk" class="px-3 py-2 text-sm font-medium text-slate-600">Masuk</a>
					<a href="#daftar" class="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white">
						Daftar
					</a>
				{/if}
			</div>
		</div>
	</nav>

	<!-- W0-01 split hero -->
	<header class="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 lg:grid-cols-2">
		<div>
			<p class="text-sm font-semibold tracking-wide text-slate-500 uppercase">
				Platform deliberasi sipil
			</p>
			<h1 class="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
				Politik soal posisi, bukan persona.
			</h1>
			<p class="mt-5 text-lg leading-relaxed text-slate-600">
				Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai.
			</p>
			<ul class="mt-8 space-y-3 text-slate-700">
				{#each ['Setiap akun membawa bendera partai', 'Manifesto wajib — posisi selalu tertulis', 'Tata kelola internal terlihat publik'] as item (item)}
					<li class="flex items-start gap-3">
						<span class="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-xs text-white">✓</span>
						{item}
					</li>
				{/each}
			</ul>
		</div>

		<div id="daftar">
			<AuthArea
				ctaClass="inline-block rounded-md bg-slate-800 px-6 py-3 font-semibold text-white"
				noteClass="mt-4 text-sm text-slate-500"
			/>
		</div>
	</header>

	<!-- W0-02 three steps -->
	<section class="border-y border-slate-200 bg-slate-50">
		<div class="mx-auto max-w-6xl px-4 py-20">
			<h2 class="text-center text-3xl font-bold">Cara kerjanya</h2>
			<div class="mt-12 grid gap-8 sm:grid-cols-3">
				{#each [['1', 'Dirikan atau gabung partai', 'Pilih partai yang sesuai posisimu — atau dirikan sendiri.'], ['2', 'Bendera tampil di setiap diskusi', 'Tulisanmu di mufakat selalu membawa bendera partaimu.'], ['3', 'Bawa posisimu ke deliberasi', 'Pertanyaan terbaik naik menjadi deliberasi langsung di simposium.']] as [num, title, body] (num)}
					<div class="rounded-xl bg-white p-6 shadow-sm">
						<span class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-white">{num}</span>
						<h3 class="mt-4 text-lg font-semibold">{title}</h3>
						<p class="mt-2 text-slate-600">{body}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- W0-03 four spaces -->
	<section class="mx-auto max-w-6xl px-4 py-20">
		<h2 class="text-center text-3xl font-bold">Empat ruang</h2>
		<div class="mt-12 grid gap-6 sm:grid-cols-2">
			{#each [['partai', 'Pembentukan dan tata kelola partai', false], ['mufakat', 'Deliberasi tertulis lintas-partai', false], ['simposium', 'Deliberasi langsung', true], ['perpus', 'Dokumentasi', true]] as [name, desc, soon] (name)}
				<div class="rounded-xl border border-slate-200 p-6 {soon ? 'opacity-60' : ''}">
					<div class="flex items-center justify-between">
						<h3 class="text-xl font-bold">{name}<span class="font-normal text-slate-400">.alternatif.space</span></h3>
						{#if soon}<span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">Segera</span>{/if}
					</div>
					<p class="mt-2 text-slate-600">{desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- W0-04 governance features 2x2 -->
	<section class="border-y border-slate-200 bg-slate-50">
		<div class="mx-auto max-w-6xl px-4 py-20">
			<h2 class="text-center text-3xl font-bold">Aturan mainnya beda</h2>
			<div class="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
				{#each [['Manifesto wajib', 'Tidak ada partai tanpa posisi tertulis.'], ['Ketua bisa di-recall', 'Anggota bisa mengganti ketua lewat petisi dan suara. Ambangnya partai yang tentukan.'], ['Konfigurasi terbuka', 'Aturan internal setiap partai terlihat publik: siapa boleh masuk, siapa suara resmi, bagaimana ketua diganti.'], ['Honeymoon 3 bulan', 'Partai baru dapat masa tenang untuk membangun sebelum mekanisme recall aktif.']] as [title, body] (title)}
					<div class="flex gap-4">
						<div class="h-10 w-1 shrink-0 rounded bg-slate-800"></div>
						<div>
							<h3 class="text-lg font-semibold">{title}</h3>
							<p class="mt-1 text-slate-600">{body}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- W0-05 closing -->
	<section class="bg-slate-900 text-white">
		<div class="mx-auto max-w-6xl px-4 py-20 text-center">
			<h2 class="text-3xl font-bold sm:text-4xl">Bawa posisimu.</h2>
			<a
				href={signedIn ? PARTAI_URL : '#daftar'}
				class="mt-8 inline-block rounded-md bg-white px-8 py-3 font-semibold text-slate-900"
			>
				{signedIn ? 'Lanjut ke partai →' : 'Daftar sekarang'}
			</a>
		</div>
	</section>

	<footer class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-slate-500">
		<span class="font-semibold text-slate-700">alternatif.space</span>
		<div class="flex gap-6">
			<span>partai</span><span>mufakat</span><span>simposium</span><span>perpus</span>
		</div>
	</footer>
</div>
