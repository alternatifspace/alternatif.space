<script lang="ts">
	import { enhance } from '$app/forms';
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';

	let { form } = $props();
	let bio = $state('');
</script>

<svelte:head>
	<title>Selamat datang — alternatif.space</title>
</svelte:head>

<div class="lp min-h-screen flex items-center justify-center px-5 py-12 sm:px-10">
	<div class="w-full max-w-xl">
		<header class="text-center">
			<p class="lp-mono text-sm tracking-[0.18em] uppercase opacity-60">
				Langkah pertama dari <span class="lp-amber font-bold">satu perjalanan</span>
			</p>
			<h1 class="lp-display-sm mt-4">
				Bendera di tangan.<br />
				Tinggal <span class="lp-amber-bg">dikibarin.</span>
			</h1>
			<p class="mt-6 leading-relaxed text-lg font-medium">
				Di sini kamu bawa bendera — bukan buat pamer, buat ditimbang. Setiap diskusi
				nggak dinilai siapa yang ngomong, tapi dari posisi mana dia berdiri.
			</p>
			<p class="mt-4 leading-relaxed opacity-80">
				Belum punya partai? Gabung yang cocok — atau dirikan sendiri. Tapi isi dulu
				profilmu. Nama dan bio itu cara orang lain kenal kamu sebelum mereka kenal
				posisimu.
			</p>
		</header>

		<form method="POST" use:enhance class="mt-10 space-y-6">
			<label class="block">
				<span class="lp-mono text-xs tracking-[0.2em] uppercase">Nama tampilan</span>
				<input
					name="display_name"
					required
					maxlength="60"
					class="mt-2 block w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none"
					style="border-color: var(--lp-ink)"
					placeholder="Nama yang tampil di seluruh platform"
				/>
			</label>

			<label class="block">
				<span class="lp-mono text-xs tracking-[0.2em] uppercase">
					Bio <span class="opacity-50">(opsional)</span>
				</span>
				<textarea
					name="bio"
					maxlength="160"
					rows="3"
					bind:value={bio}
					class="mt-2 block w-full border-b-2 bg-transparent px-0 py-3 text-base outline-none resize-y"
					style="border-color: var(--lp-ink)"
					placeholder="Maksimal 160 karakter"
				></textarea>
				<span class="lp-mono mt-1 block text-xs opacity-40">{bio.length}/160</span>
			</label>

			{#if form?.error}
				<p class="lp-mono text-sm" style="color: var(--lp-amber)">{form.error}</p>
			{/if}

			<button type="submit" class="lp-btn inline-block">
				Lanjut →
			</button>
		</form>

		<p class="lp-mono mt-10 text-center text-xs opacity-40">
			Bukan pertama kali? <a href="/masuk" class="lp-link">Masuk</a>
		</p>
	</div>
</div>
