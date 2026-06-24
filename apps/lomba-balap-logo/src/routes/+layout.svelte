<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	let { data, children } = $props();

	const closeDate = $derived(new Date(data.config.close_at));
	const closed = $derived(!data.config.is_open);

	function fmtDate(d: Date) {
		return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
	}
</script>

<div class="flex min-h-dvh flex-col">
	<header class="sticky top-0 z-20 border-b border-[var(--color-border-warm)] bg-paper/90 backdrop-blur">
		<nav class="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
			<a href="/" class="flex items-center gap-2 font-display text-xl text-ink">
				<span class="grid h-8 w-8 place-items-center rounded-lg bg-ink font-display text-amber">L</span>
				<span class="hidden sm:inline">Lomba Balap Logo</span>
			</a>
			<div class="ml-auto flex items-center gap-1.5">
				<a
					href="/aturan"
					class="rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-paper-warm hover:text-ink"
					class:font-semibold={$page.url.pathname === '/aturan'}>Aturan</a
				>
				{#if data.user}
					{#if !closed}
						<a
							href="/kirim"
							class="rounded-lg bg-amber px-3 py-2 text-sm font-semibold text-ink hover:brightness-95"
							>Kirim logo</a
						>
					{/if}
					{#if data.isAdmin}
						<a href="/moderasi" class="rounded-lg px-3 py-2 text-sm text-ink/70 hover:bg-paper-warm"
							>Moderasi</a
						>
					{/if}
					<form method="POST" action="/auth/signout" class="contents">
						<button
							type="submit"
							class="rounded-lg px-3 py-2 text-sm text-ink/60 hover:bg-paper-warm hover:text-ink"
							title={data.user.name ?? 'Keluar'}>Keluar</button
						>
					</form>
				{:else}
					<a
						href="/masuk"
						class="rounded-lg bg-ink px-3 py-2 text-sm font-semibold text-paper hover:brightness-110"
						>Masuk</a
					>
				{/if}
			</div>
		</nav>
	</header>

	<main class="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
		{@render children()}
	</main>

	<footer class="border-t border-[var(--color-border-warm)] px-4 py-6 text-center text-xs text-ink/40">
		<p>
			{#if closed}
				Lomba sudah ditutup ({fmtDate(closeDate)}). Papan peringkat dibekukan.
			{:else}
				Iseng-iseng aja, nggak ada hadiah. Ditutup {fmtDate(closeDate)}.
			{/if}
		</p>
		<p class="mt-1">
			<a href="/aturan" class="underline hover:text-ink/70">Aturan & FAQ</a>
		</p>
	</footer>
</div>
