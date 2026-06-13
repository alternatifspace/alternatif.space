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

<main class="mx-auto max-w-5xl p-4">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">Jelajahi partai</h1>
		<a
			href="/buat-partai"
			class="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
		>
			Dirikan partai
		</a>
	</div>

	<!-- Filters are plain GET params — shareable, SSR-rendered, no JS required -->
	<form method="GET" class="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			Cari nama partai
			<input
				type="search"
				name="q"
				value={data.filters.q}
				placeholder="Nama partai…"
				class="min-h-10 w-48 rounded-md border border-gray-300 bg-white px-3 text-sm"
			/>
		</label>
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			Model keanggotaan
			<select name="model" class="min-h-10 rounded-md border border-gray-300 bg-white px-2 text-sm">
				<option value="" selected={!data.filters.model}>Semua</option>
				<option value="open" selected={data.filters.model === 'open'}>Terbuka</option>
				<option value="application" selected={data.filters.model === 'application'}>Lewat lamaran</option>
				<option value="invite_only" selected={data.filters.model === 'invite_only'}>Hanya undangan</option>
			</select>
		</label>
		<label class="flex flex-col gap-1 text-xs font-medium text-gray-600">
			Status aktivitas
			<select name="status" class="min-h-10 rounded-md border border-gray-300 bg-white px-2 text-sm">
				<option value="" selected={!data.filters.status}>Semua</option>
				<option value="active" selected={data.filters.status === 'active'}>Aktif</option>
				<option value="dormant" selected={data.filters.status === 'dormant'}>Dorman</option>
			</select>
		</label>
		<label class="flex min-h-10 items-center gap-2 text-sm text-gray-600">
			<input type="checkbox" name="dibubarkan" value="1" checked={data.filters.showDissolved} />
			Tampilkan yang dibubarkan
		</label>
		<button
			type="submit"
			class="min-h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium hover:bg-slate-50"
		>
			Terapkan
		</button>
	</form>

	{#if data.parties.length === 0}
		<div class="mt-12 text-center text-gray-500">
			<p class="text-lg font-medium">Belum ada partai yang cocok.</p>
			<p class="mt-1 text-sm">
				Coba ubah filter — atau <a href="/buat-partai" class="text-slate-800 underline">dirikan yang pertama</a>.
			</p>
		</div>
	{:else}
		<!-- Mobile: single column; desktop: responsive grid (TRD §14) -->
		<div class="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.parties as party (party.id)}
				<PartyCard {party} />
			{/each}
		</div>
	{/if}
</main>
