<script lang="ts">
	import { SignIn, useClerkContext } from 'svelte-clerk';
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';

	// Once Clerk authenticates, the <SignIn> widget unmounts and a redirect
	// follows — a beat that otherwise shows a blank page (SC-A4). Cover the gap
	// with an explicit "mengalihkan" state so the user knows it's working.
	const ctx = useClerkContext();
	const redirecting = $derived(Boolean(ctx.auth.userId));
</script>

<svelte:head>
	<title>Masuk — alternatif.space</title>
</svelte:head>

<div class="lp flex min-h-screen flex-col px-5 pt-6 pb-8 sm:px-10">
	<div class="my-auto flex flex-col items-center py-12">
		<div class="w-full max-w-md text-center">
			<p class="lp-mono text-sm tracking-[0.18em] uppercase opacity-60">
				Bendera kamu masih di <span class="lp-amber font-bold">tangan.</span>
			</p>
			<h1 class="lp-display-sm mt-4">Masuk, lanjut latihan.</h1>
		</div>

		<div class="mt-8 w-full max-w-md">
			{#if redirecting}
				<!-- Auth succeeded; the redirect is in flight (SC-A4). -->
				<div class="flex flex-col items-center gap-4 py-12 text-center" role="status">
					<div class="lp-spinner" aria-hidden="true"></div>
					<p class="lp-mono text-sm tracking-[0.18em] uppercase opacity-70">Mengalihkan…</p>
				</div>
			{:else}
				<!-- Email + password only (P0-01) — social providers disabled in the Clerk
				     dashboard, not here. -->
				<SignIn signUpUrl="/daftar" />
			{/if}
		</div>
	</div>

	<footer class="border-t-2" style="border-color: var(--lp-ink)">
		<div class="lp-mono flex flex-wrap items-baseline justify-between gap-3 py-4 text-xs tracking-[0.2em] uppercase">
			<span class="font-bold">partai.alternatif.space</span>
			<span class="opacity-50">id • 2026</span>
		</div>
	</footer>
</div>

<style>
	.lp-spinner {
		width: 2rem;
		height: 2rem;
		border: 3px solid color-mix(in srgb, var(--lp-ink) 20%, transparent);
		border-top-color: var(--lp-amber);
		border-radius: 50%;
		animation: lp-spin 0.7s linear infinite;
	}
	@keyframes lp-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
