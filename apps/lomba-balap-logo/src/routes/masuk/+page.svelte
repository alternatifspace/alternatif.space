<script lang="ts">
	import { page } from '$app/stores';
	let { data } = $props();

	const redirectTo = $derived($page.url.searchParams.get('redirect') ?? '/');
	const hasError = $derived($page.url.searchParams.get('error') === 'auth');
</script>

<svelte:head><title>Masuk · Lomba Balap Logo</title></svelte:head>

<div class="mx-auto max-w-sm py-10 text-center">
	<h1 class="text-3xl">Masuk dulu, yuk</h1>
	<p class="mt-3 text-ink/60">
		Buat ngirim logo atau nge-like, kamu cuma butuh akun Google. Nggak ada form panjang, nggak
		perlu gabung partai — ini cuma lomba iseng.
	</p>

	{#if hasError}
		<p class="mt-4 rounded-lg bg-[color-mix(in_srgb,var(--color-error)_12%,transparent)] px-3 py-2 text-sm text-error">
			Proses masuk gagal. Coba sekali lagi.
		</p>
	{/if}

	{#if data.user}
		<p class="mt-6 text-ink/70">Kamu sudah masuk sebagai {data.user.name}.</p>
		<a href="/" class="mt-4 inline-block rounded-lg bg-ink px-5 py-3 font-semibold text-paper">Ke beranda</a>
	{:else}
		<a
			href="/auth/login?redirect={encodeURIComponent(redirectTo)}"
			class="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-[var(--color-border-warm)] bg-white px-6 py-3 font-semibold text-ink shadow-sm hover:bg-paper-warm"
		>
			<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
				<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"/>
				<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
				<path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84Z"/>
				<path fill="#EA4335" d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.46 14.97.5 12 .5A11 11 0 0 0 2.18 7.06l3.67 2.84C6.71 7.3 9.14 5.37 12 4.75Z"/>
			</svg>
			Lanjut dengan Google
		</a>
	{/if}
</div>
