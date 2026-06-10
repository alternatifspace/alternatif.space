<script lang="ts">
	import { MemberAvatar, PartyBadge } from '@alternatif/ui';
	import { formatDate, formatRelativeDays } from '$lib/format';

	let { data } = $props();

	const LEAVE_LABELS: Record<string, string> = {
		voluntary: 'keluar sendiri',
		removed: 'diberhentikan',
		dissolved: 'partai dibubarkan'
	};
</script>

<svelte:head>
	<title>{data.profile.display_name} — partai.alternatif.space</title>
</svelte:head>

<main class="mx-auto max-w-2xl p-4">
	<header class="flex items-center gap-4">
		<MemberAvatar displayName={data.profile.display_name} size={64} />
		<div class="min-w-0">
			<h1 class="text-2xl font-bold">{data.profile.display_name}</h1>
			<p class="text-xs text-gray-400">terakhir aktif {formatRelativeDays(data.profile.last_active_at)}</p>
			{#if data.currentPartyBadge}
				<div class="mt-2">
					<PartyBadge party={data.currentPartyBadge} partaiBaseUrl="" />
				</div>
			{/if}
		</div>
	</header>

	{#if data.profile.bio}
		<p class="mt-4 text-gray-700">{data.profile.bio}</p>
	{/if}

	<!-- Party history log (5.42): past parties with dates, visible to all -->
	<section class="mt-8">
		<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Riwayat partai</h2>
		{#if data.history.length === 0}
			<p class="mt-2 text-sm text-gray-500">Belum ada riwayat keanggotaan.</p>
		{:else}
			<ul class="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
				{#each data.history as entry (entry.id)}
					<li class="flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
						<a href="/partai/{entry.party?.slug}" class="font-medium hover:underline">
							{entry.party?.name ?? '—'}
						</a>
						<span class="text-gray-500">
							{formatDate(entry.joined_at)}
							{#if entry.left_at}
								— {formatDate(entry.left_at)}
								{#if entry.leave_reason}({LEAVE_LABELS[entry.leave_reason] ?? entry.leave_reason}){/if}
							{:else}
								— sekarang
							{/if}
						</span>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
