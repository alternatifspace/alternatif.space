<!-- PROTOTYPE — landing variant "Bold activist" (www-landing PRD §6).
     Strong color, movement energy: near-black ground, red accent, heavy
     uppercase sans, CSS-only marquee strips. -->
<script lang="ts">
	import { useClerkContext } from 'svelte-clerk/client';
	import AuthArea from '$lib/auth/AuthArea.svelte';
	import { PARTAI_URL } from '$lib/urls';

	const ctx = useClerkContext();
	const signedIn = $derived(Boolean(ctx.auth.userId));
</script>

<div class="min-h-screen bg-neutral-950 text-white">
	<!-- nav -->
	<nav class="flex items-center justify-between px-6 py-5">
		<span class="text-sm font-black tracking-widest uppercase">alternatif.space</span>
		{#if signedIn}
			<a
				href={PARTAI_URL}
				class="text-sm font-bold tracking-widest text-red-500 uppercase underline underline-offset-4"
			>
				Lanjut ke partai →
			</a>
		{:else}
			<a
				href="/masuk"
				class="text-sm font-bold tracking-widest text-red-500 uppercase underline underline-offset-4"
			>
				Masuk
			</a>
		{/if}
	</nav>

	<!-- W0-01 hero -->
	<header class="px-6 pt-16 pb-20 sm:pt-24">
		<div class="mx-auto max-w-5xl">
			<h1 class="text-[15vw] leading-[0.9] font-black tracking-tighter uppercase sm:text-8xl lg:text-9xl">
				Politik soal<br />
				<span class="text-red-500">posisi</span>,<br />
				bukan persona.
			</h1>
			<p class="mt-8 max-w-xl text-xl leading-relaxed text-neutral-300">
				Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai.
			</p>

			<div id="daftar" class="mt-10 max-w-xl">
				<AuthArea
					ctaClass="inline-block bg-red-600 px-10 py-4 text-lg font-black tracking-wide uppercase"
					noteClass="mt-3 text-sm text-neutral-400"
				/>
			</div>
		</div>
	</header>

	<!-- marquee divider — CSS-only motion -->
	<div class="marquee overflow-hidden border-y-4 border-red-600 bg-red-600 py-3" aria-hidden="true">
		<div class="marquee-track flex w-max gap-8 text-2xl font-black tracking-tight whitespace-nowrap uppercase">
			{#each Array(8) as _, i (i)}
				<span>Bawa posisimu</span><span>✊</span>
			{/each}
		</div>
	</div>

	<!-- W0-02 cara kerjanya -->
	<section class="mx-auto max-w-5xl px-6 py-24">
		<h2 class="text-sm font-black tracking-[0.3em] text-red-500 uppercase">Cara kerjanya</h2>
		<div class="mt-12 space-y-12">
			{#each [['01', 'Dirikan atau gabung partai', 'Setiap orang di sini membawa bendera. Pilih partai yang sesuai posisimu — atau dirikan sendiri.'], ['02', 'Bendera tampil di setiap diskusi', 'Tulisanmu di mufakat selalu membawa bendera partaimu. Perdebatan bergeser dari siapa kamu ke apa posisimu.'], ['03', 'Bawa posisimu ke deliberasi', 'Diskusi tertulis lintas-partai di mufakat. Pertanyaan terbaik naik menjadi deliberasi langsung di simposium.']] as [num, title, body] (num)}
				<div class="grid gap-4 border-l-8 border-red-600 pl-6 sm:grid-cols-[5rem_1fr]">
					<span class="text-4xl font-black text-neutral-700">{num}</span>
					<div>
						<h3 class="text-3xl font-black uppercase">{title}</h3>
						<p class="mt-3 max-w-xl text-lg leading-relaxed text-neutral-300">{body}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- W0-03 empat ruang -->
	<section class="border-y-4 border-white">
		<div class="mx-auto max-w-5xl px-6 py-24">
			<h2 class="text-sm font-black tracking-[0.3em] text-red-500 uppercase">Empat ruang</h2>
			<div class="mt-12 grid gap-px bg-neutral-800 sm:grid-cols-2">
				{#each [['partai', 'Pembentukan dan tata kelola partai', false], ['mufakat', 'Deliberasi tertulis lintas-partai', false], ['simposium', 'Deliberasi langsung', true], ['perpus', 'Dokumentasi', true]] as [name, desc, soon] (name)}
					<div class="bg-neutral-950 p-8 {soon ? 'opacity-50' : ''}">
						<div class="flex items-start justify-between gap-4">
							<h3 class="text-2xl font-black lowercase">
								{name}<span class="font-normal text-neutral-500">.alternatif.space</span>
							</h3>
							{#if soon}
								<span class="shrink-0 bg-white px-2 py-1 text-xs font-black tracking-widest text-neutral-950 uppercase">
									Segera
								</span>
							{/if}
						</div>
						<p class="mt-2 text-neutral-300">{desc}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- W0-04 aturan main -->
	<section class="mx-auto max-w-5xl px-6 py-24">
		<h2 class="text-sm font-black tracking-[0.3em] text-red-500 uppercase">Aturan mainnya beda</h2>
		<div class="mt-12 space-y-10">
			{#each [['Manifesto wajib', 'Tidak ada partai tanpa posisi tertulis.'], ['Ketua bisa di-recall', 'Anggota bisa mengganti ketua lewat petisi dan suara. Ambangnya partai yang tentukan.'], ['Konfigurasi terbuka', 'Aturan internal setiap partai terlihat publik: siapa boleh masuk, siapa suara resmi, bagaimana ketua diganti.'], ['Honeymoon 3 bulan', 'Partai baru dapat masa tenang untuk membangun sebelum mekanisme recall aktif.']] as [title, body] (title)}
				<div>
					<h3 class="text-4xl leading-tight font-black tracking-tight uppercase">
						<span class="bg-red-600 box-decoration-clone px-2">{title}</span>
					</h3>
					<p class="mt-4 max-w-xl text-lg text-neutral-300">{body}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- marquee divider (reversed) -->
	<div class="marquee overflow-hidden border-y-4 border-white py-3" aria-hidden="true">
		<div class="marquee-track marquee-reverse flex w-max gap-8 text-2xl font-black tracking-tight whitespace-nowrap text-white uppercase">
			{#each Array(8) as _, i (i)}
				<span>Politik soal posisi</span><span>·</span>
			{/each}
		</div>
	</div>

	<!-- W0-05 closing -->
	<footer class="px-6 py-24 text-center">
		<h2 class="text-6xl font-black tracking-tighter uppercase sm:text-7xl">
			Bawa <span class="text-red-500">posisimu</span>.
		</h2>
		<a
			href={signedIn ? PARTAI_URL : '#daftar'}
			class="mt-10 inline-block bg-red-600 px-14 py-5 text-xl font-black tracking-wide uppercase"
		>
			{signedIn ? 'Lanjut ke partai →' : 'Daftar'}
		</a>
		<div class="mt-20 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-bold tracking-widest text-neutral-500 uppercase">
			<span class="text-white">alternatif.space</span>
			<span>partai</span><span>mufakat</span><span>simposium</span><span>perpus</span>
		</div>
	</footer>
</div>

<style>
	.marquee-track {
		animation: marquee 20s linear infinite;
	}
	.marquee-reverse {
		animation-direction: reverse;
	}
	@keyframes marquee {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.marquee-track {
			animation: none;
		}
	}
</style>
