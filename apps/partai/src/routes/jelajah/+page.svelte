<script lang="ts">
	import PartyCard from '$lib/components/PartyCard.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Jelajahi partai — alternatif.space</title>
	<meta
		name="description"
		content="Telusuri partai di alternatif.space — pilih posisi yang kamu yakini, atau dirikan partaimu sendiri."
	/>
</svelte:head>

<main class="mx-auto max-w-5xl px-5 py-10 sm:px-10">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">Jelajah · Cari barisan</p>
			<h1 class="lp-display-sm mt-3">Cari partai yang searah.</h1>
		</div>
		<a href="/buat-partai" class="lp-btn-nav inline-block">Dirikan partai →</a>
	</div>

	<!-- Filters are plain GET params — shareable, SSR-rendered, no JS required -->
	<form method="GET" class="mt-8 flex flex-wrap items-end gap-3 border-2 p-4" style="border-color: var(--lp-ink)">
		<label class="flex flex-col gap-1.5">
			<span class="lp-mono text-xs tracking-[0.15em] uppercase opacity-60">Cari nama partai</span>
			<input
				type="search"
				name="q"
				value={data.filters.q}
				placeholder="Nama partai…"
				class="lp-field min-h-10 w-48 px-3 text-sm"
			/>
		</label>
		<label class="flex flex-col gap-1.5">
			<span class="lp-mono text-xs tracking-[0.15em] uppercase opacity-60">Model keanggotaan</span>
			<select name="model" class="lp-field min-h-10 px-2 text-sm">
				<option value="" selected={!data.filters.model}>Semua</option>
				<option value="open" selected={data.filters.model === 'open'}>Terbuka</option>
				<option value="application" selected={data.filters.model === 'application'}>Lewat lamaran</option>
				<option value="invite_only" selected={data.filters.model === 'invite_only'}>Hanya undangan</option>
			</select>
		</label>
		<label class="flex flex-col gap-1.5">
			<span class="lp-mono text-xs tracking-[0.15em] uppercase opacity-60">Status aktivitas</span>
			<select name="status" class="lp-field min-h-10 px-2 text-sm">
				<option value="" selected={!data.filters.status}>Semua</option>
				<option value="active" selected={data.filters.status === 'active'}>Aktif</option>
				<option value="dormant" selected={data.filters.status === 'dormant'}>Dorman</option>
			</select>
		</label>
		<label class="flex min-h-10 items-center gap-2 text-sm">
			<input type="checkbox" name="dibubarkan" value="1" checked={data.filters.showDissolved} />
			Tampilkan yang dibubarkan
		</label>
		<button type="submit" class="lp-btn-nav inline-block min-h-10">Terapkan</button>
	</form>

	{#if data.parties.length === 0}
		<div class="mt-12 border-2 border-dashed p-10 text-center" style="border-color: var(--lp-ink)">
			<p class="lp-h2">Belum ada partai yang cocok.</p>
			<p class="mt-2 text-sm opacity-70">
				Coba ubah filter — atau <a href="/buat-partai" class="lp-link">dirikan yang pertama</a>.
			</p>
		</div>
	{:else}
		<!-- Mobile: single column; desktop: responsive grid (TRD §14) -->
		<div class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.parties as party (party.id)}
				<PartyCard {party} />
			{/each}
		</div>
	{/if}
</main>
