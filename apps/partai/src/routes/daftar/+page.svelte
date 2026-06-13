<script lang="ts">
	import { SignUp } from 'svelte-clerk';
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
</script>

<svelte:head>
	<title>Daftar — alternatif.space</title>
</svelte:head>

<div class="lp min-h-screen flex flex-col px-5 pt-6 pb-8 sm:px-10">
	<div
		class="lp-mono flex items-center justify-between border-b-2 pb-3 text-xs tracking-[0.2em] uppercase"
		style="border-color: var(--lp-ink)"
	>
		<a href="/" class="font-bold">partai.alternatif.space</a>
		<a href="/masuk" class="lp-link">Masuk</a>
	</div>

	<div class="my-auto flex flex-col items-center py-12">
		<div class="w-full max-w-md text-center">
			<p class="lp-mono text-sm tracking-[0.18em] uppercase opacity-60">
				Nggak perlu <span class="lp-amber font-bold">diangkat.</span>
			</p>
			<h1 class="lp-display-sm mt-4">Satu akun, satu bendera.</h1>
			<p class="mt-4 leading-relaxed opacity-80">
				Daftar sekarang. Nanti kamu bikin partai atau gabung yang udah ada — semua dari satu akun yang sama.
			</p>
		</div>

		<div class="w-full max-w-md mt-8">
			<SignUp signInUrl="/masuk" forceRedirectUrl="/onboarding" />
		</div>
	</div>

	<footer class="border-t-2" style="border-color: var(--lp-ink)">
		<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 py-4 text-xs tracking-[0.2em] uppercase">
			<span class="font-bold">partai.alternatif.space</span>
			<span class="opacity-50">id • 2026</span>
		</div>
	</footer>
</div>
