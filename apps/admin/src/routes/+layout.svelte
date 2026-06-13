<script lang="ts">
	import '@fontsource/archivo-black';
	import '@fontsource-variable/space-grotesk';
	import '@alternatif/ui/landing.css';
	import '../app.css';
	let { children } = $props();
</script>

<!-- The whole tool lives inside .lp so the Pamflet design system applies:
     CSS vars (--lp-ink/-bone/-amber), the paper-noise background, and the
     Archivo Black / Space Grotesk fonts all hang off this class. -->
<div class="lp min-h-screen">
	<!-- LIVE-DB warning band. Vermilion is reserved for stamps, so the danger
	     signal is the cap stamp on an ink band, not a coloured bar. -->
	<div
		class="flex items-center justify-center gap-3 px-4 py-2 text-center"
		style="background: var(--lp-ink); color: var(--lp-bone)"
	>
		<span class="lp-stamp lp-stamp-sm lp-stamp-bone">LIVE</span>
		<span class="lp-mono text-xs tracking-[0.12em] uppercase">
			Production database — perubahan langsung tersimpan
		</span>
	</div>

	<header class="border-b-2" style="border-color: var(--lp-ink)">
		<nav class="mx-auto flex max-w-3xl items-center gap-3 px-5 py-3">
			<span class="lp-mono text-base font-bold tracking-[0.15em] uppercase">
				admin<span class="lp-amber">.alternatif.space</span>
			</span>
			<span class="lp-tag lp-tag-muted ml-auto">lokal</span>
		</nav>
	</header>

	<main class="mx-auto max-w-3xl px-5 py-10">
		{@render children()}
	</main>
</div>
