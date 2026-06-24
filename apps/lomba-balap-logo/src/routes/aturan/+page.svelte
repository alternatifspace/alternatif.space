<script lang="ts">
	let { data } = $props();
	const closeDate = $derived(
		new Date(data.config.close_at).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		})
	);
</script>

<svelte:head>
	<title>Aturan & FAQ · Lomba Balap Logo</title>
	<meta name="description" content="Aturan main Lomba Balap Logo — iseng-iseng, nggak ada hadiah." />
</svelte:head>

<div class="mx-auto max-w-xl">
	<h1 class="text-4xl">Aturan & FAQ</h1>
	<p class="mt-3 text-lg text-ink/60">
		Singkat aja, ini bukan dokumen hukum. Lomba Balap Logo itu iseng-iseng — adu logo, rame-rame,
		udah gitu aja.
	</p>

	<div class="mt-8 space-y-7">
		<section>
			<h2 class="text-2xl">Hadiahnya apa?</h2>
			<p class="mt-2 text-ink/70">
				Nggak ada. Beneran. Nggak ada hadiah, nggak ada uang, nggak ada sertifikat. Yang menang
				cuma dapat hak pamer dan kepuasan batin. Ini murni buat seru-seruan.
			</p>
		</section>

		<section>
			<h2 class="text-2xl">Gimana cara ikutan?</h2>
			<p class="mt-2 text-ink/70">
				Login pakai akun Google, terus kirim satu logo. Nggak perlu daftar panjang, nggak perlu
				gabung partai apa pun — beda sama bagian lain di alternatif.space, di sini bebas.
			</p>
		</section>

		<section>
			<h2 class="text-2xl">Boleh kirim berapa logo?</h2>
			<p class="mt-2 text-ink/70">
				Satu logo aktif per orang. Mau ganti? Tarik dulu yang lama, baru kirim yang baru. Kalau
				logomu ditolak, santai — kamu boleh kirim lagi yang lain.
			</p>
		</section>

		<section>
			<h2 class="text-2xl">Ada moderasi?</h2>
			<p class="mt-2 text-ink/70">
				Ada. Tiap logo dicek dulu sebelum tampil di feed. Yang jelas: nggak boleh konten NSFW atau
				yang bikin nggak nyaman. Kalau ditolak, kamu dikasih tahu alasannya, bukan tiba-tiba
				hilang.
			</p>
		</section>

		<section>
			<h2 class="text-2xl">Menangnya gimana?</h2>
			<p class="mt-2 text-ink/70">
				Logo dengan like terbanyak pas lomba ditutup. Kalau seri, yang lebih dulu disetujui yang
				menang. Satu akun cuma bisa nge-like satu kali per logo, dan nggak bisa nge-like logo
				sendiri.
			</p>
		</section>

		<section>
			<h2 class="text-2xl">Kapan ditutup?</h2>
			<p class="mt-2 text-ink/70">
				{closeDate} (jam 23.59 WIB). Setelah itu papan peringkat dibekukan dan pemenangnya
				ketahuan.
			</p>
		</section>
	</div>

	{#if data.config.is_open && !data.user}
		<a href="/masuk" class="mt-9 inline-block rounded-xl bg-amber px-6 py-3 font-semibold text-ink hover:brightness-95"
			>Oke, ikutan</a
		>
	{/if}
</div>
