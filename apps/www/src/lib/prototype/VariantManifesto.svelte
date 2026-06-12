<!-- PROTOTYPE — landing variant "Manifesto / editorial" (www-landing PRD §6).
     Poster typography, single reading column, numbered like a pamphlet. -->
<script lang="ts">
	import { useClerkContext } from 'svelte-clerk/client';
	import AuthArea from '$lib/auth/AuthArea.svelte';
	import { PARTAI_URL } from '$lib/urls';

	const ctx = useClerkContext();
	const signedIn = $derived(Boolean(ctx.auth.userId));
</script>

<div class="min-h-screen bg-[#faf6ef] text-stone-900">
	<!-- W0-01 hero -->
	<header class="mx-auto flex min-h-screen max-w-4xl flex-col justify-between px-6 py-10">
		<div class="flex items-baseline justify-between text-sm tracking-widest uppercase">
			<span class="font-bold">alternatif.space</span>
			{#if signedIn}
				<a href={PARTAI_URL} class="underline underline-offset-4">Lanjut ke partai →</a>
			{:else}
				<a href="/masuk" class="underline underline-offset-4">Masuk</a>
			{/if}
		</div>

		<div>
			<h1 class="font-serif text-[13vw] leading-[0.95] font-black tracking-tight sm:text-8xl">
				Politik soal<br />
				<em class="not-italic underline decoration-4 underline-offset-8">posisi</em>,<br />
				bukan persona.
			</h1>
			<p class="mt-8 max-w-xl text-lg leading-relaxed text-stone-700">
				Dirikan partai, tulis manifesto, dan bawa posisimu ke ruang deliberasi lintas-partai.
			</p>

			<div id="daftar" class="mt-10 max-w-xl">
				<AuthArea
					ctaClass="inline-block bg-stone-900 px-8 py-3 text-lg font-bold text-[#faf6ef]"
					noteClass="mt-3 text-sm text-stone-500"
				/>
			</div>
		</div>

		<p class="text-sm tracking-widest text-stone-400 uppercase">Gulir untuk membaca ↓</p>
	</header>

	<hr class="border-stone-900" />

	<!-- W0-02 cara kerjanya — numbered chapters -->
	<section class="mx-auto max-w-4xl px-6 py-24">
		<p class="text-sm tracking-widest text-stone-500 uppercase">Cara kerjanya</p>
		{#each [['01', 'Dirikan atau gabung partai', 'Setiap orang di sini membawa bendera. Pilih partai yang sesuai posisimu — atau dirikan sendiri, lengkap dengan manifesto dan aturan mainnya.'], ['02', 'Bendera tampil di setiap diskusi', 'Tulisanmu di mufakat selalu membawa bendera partaimu. Perdebatan bergeser dari siapa kamu ke apa posisimu.'], ['03', 'Bawa posisimu ke deliberasi', 'Diskusi tertulis lintas-partai di mufakat. Pertanyaan terbaik naik menjadi deliberasi langsung di simposium.']] as [num, title, body] (num)}
			<div class="mt-14 grid gap-4 sm:grid-cols-[6rem_1fr]">
				<span class="font-serif text-5xl font-black text-stone-300">{num}</span>
				<div>
					<h2 class="font-serif text-3xl font-bold">{title}</h2>
					<p class="mt-3 max-w-xl text-lg leading-relaxed text-stone-700">{body}</p>
				</div>
			</div>
		{/each}
	</section>

	<hr class="border-stone-900" />

	<!-- W0-03 empat ruang — plain editorial list -->
	<section class="mx-auto max-w-4xl px-6 py-24">
		<p class="text-sm tracking-widest text-stone-500 uppercase">Empat ruang</p>
		<dl class="mt-10 divide-y divide-stone-300">
			{#each [['partai', 'Pembentukan dan tata kelola partai.', false], ['mufakat', 'Deliberasi tertulis lintas-partai.', false], ['simposium', 'Deliberasi langsung.', true], ['perpus', 'Dokumentasi.', true]] as [name, desc, soon] (name)}
				<div class="flex flex-wrap items-baseline gap-x-6 gap-y-1 py-6">
					<dt class="font-serif text-3xl font-bold">
						{name}<span class="text-stone-400">.alternatif.space</span>
					</dt>
					<dd class="text-lg text-stone-700">
						{desc}
						{#if soon}<span class="ml-2 text-sm tracking-widest text-stone-400 uppercase">segera</span>{/if}
					</dd>
				</div>
			{/each}
		</dl>
	</section>

	<hr class="border-stone-900" />

	<!-- W0-04 aturan main — bold claims -->
	<section class="mx-auto max-w-4xl px-6 py-24">
		<p class="text-sm tracking-widest text-stone-500 uppercase">Aturan mainnya beda</p>
		<div class="mt-10 space-y-12">
			{#each [['Tidak ada partai tanpa posisi tertulis.', 'Manifesto wajib sejak hari pertama. Bukan slogan — dokumen.'], ['Ketua bisa di-recall.', 'Anggota bisa mengganti ketua lewat petisi dan suara. Ambangnya partai yang tentukan.'], ['Aturan internal terlihat publik.', 'Siapa boleh masuk, siapa suara resmi, bagaimana ketua diganti — semua terbuka.'], ['Partai baru dapat masa tenang.', 'Honeymoon tiga bulan untuk membangun, sebelum mekanisme recall aktif.']] as [claim, body] (claim)}
				<div>
					<h2 class="font-serif text-4xl leading-tight font-black">{claim}</h2>
					<p class="mt-3 max-w-xl text-lg text-stone-700">{body}</p>
				</div>
			{/each}
		</div>
	</section>

	<hr class="border-stone-900" />

	<!-- W0-05 closing -->
	<footer class="mx-auto max-w-4xl px-6 py-24 text-center">
		<h2 class="font-serif text-6xl font-black">Bawa posisimu.</h2>
		<a
			href={signedIn ? PARTAI_URL : '#daftar'}
			class="mt-10 inline-block bg-stone-900 px-12 py-4 text-xl font-bold text-[#faf6ef]"
		>
			{signedIn ? 'Lanjut ke partai →' : 'Daftar'}
		</a>
		<p class="mt-16 text-sm tracking-widest text-stone-400 uppercase">
			alternatif.space — partai · mufakat · simposium · perpus
		</p>
	</footer>
</div>
