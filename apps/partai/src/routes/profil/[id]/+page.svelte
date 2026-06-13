<script lang="ts">
	import { MemberAvatar, PartyBadge } from '@alternatif/ui';
	import { formatDate, formatRelativeDays } from '$lib/format';
	import '@alternatif/ui/landing.css';

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

<div class="lp min-h-screen px-5 py-10 sm:px-10">
	<main class="mx-auto max-w-2xl">
		<header class="flex items-center gap-4">
			<MemberAvatar displayName={data.profile.display_name} size={64} />
			<div class="min-w-0">
				<h1 class="lp-h2">{data.profile.display_name}</h1>
				<p class="lp-mono mt-1 text-xs uppercase opacity-40">terakhir aktif {formatRelativeDays(data.profile.last_active_at)}</p>
				{#if data.currentPartyBadge}
					<div class="mt-2">
						<PartyBadge party={data.currentPartyBadge} partaiBaseUrl="" />
					</div>
				{/if}
			</div>
		</header>

		{#if data.profile.bio}
			<p class="mt-6 leading-relaxed opacity-70">{data.profile.bio}</p>
		{/if}

		<section class="mt-10 border-t-2 pt-8" style="border-color: var(--lp-ink)">
			<h2 class="lp-mono text-xs tracking-[0.2em] uppercase opacity-40">Riwayat partai</h2>
			{#if data.history.length === 0}
				<p class="lp-mono mt-3 text-xs opacity-40">Belum ada riwayat keanggotaan.</p>
			{:else}
				<div class="mt-4 border-2" style="border-color: var(--lp-ink)">
					{#each data.history as entry, i (entry.id)}
						<div
							class="flex flex-wrap items-center justify-between gap-2 p-4 text-sm {i > 0 ? 'border-t-2' : ''}"
							style="border-color: var(--lp-ink)"
						>
							<a href="/partai/{entry.party?.slug}" class="font-bold lp-link">
								{entry.party?.name ?? '—'}
							</a>
							<span class="lp-mono text-xs opacity-50">
								{formatDate(entry.joined_at)}
								{#if entry.left_at}
									— {formatDate(entry.left_at)}
									{#if entry.leave_reason}({LEAVE_LABELS[entry.leave_reason] ?? entry.leave_reason}){/if}
								{:else}
									— sekarang
								{/if}
							</span>
						</div>
					{/each}
				</div>
			{/if}
		</section>
	</main>
</div>
