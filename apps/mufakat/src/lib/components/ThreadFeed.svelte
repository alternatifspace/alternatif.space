<!-- Chronological thread feed (M0-04). Shared render surface for the public
     /jelajah feed and the signed-in root feed (TRD v1.5 addendum). -->
<script lang="ts">
	import { ThreadStatusBadge, PartyBadge } from '@alternatif/ui';
	import { PARTAI_URL } from '$lib/links';
	import { formatRelativeDays } from '$lib/format';
	import type { ThreadListItem } from '$lib/types';

	let { threads }: { threads: ThreadListItem[] } = $props();
</script>

{#if threads.length === 0}
	<div class="mt-12 text-center opacity-70">
		<p class="text-lg font-medium">Belum ada diskusi.</p>
		<p class="mt-1 text-sm">
			Setiap pertanyaan punya satu rumah — <a href="/buat" class="lp-link lp-amber">buka yang pertama</a>.
		</p>
	</div>
{:else}
	<!-- Thread cards (6.2): title, OP flag, participants, status, timestamp -->
	<ul class="mt-4 flex flex-col gap-3">
		{#each threads as thread (thread.id)}
			<li>
				<a
					href="/diskusi/{thread.slug}"
					class="block border-2 p-4 hover:bg-[#141210]/[0.03]"
					style="border-color: var(--lp-ink)"
				>
					<div class="flex items-start justify-between gap-3">
						<h2 class="font-semibold">{thread.title}</h2>
						<ThreadStatusBadge status={thread.status} />
					</div>
					<div class="mt-2 flex flex-wrap items-center gap-2 text-xs opacity-60">
						{#if thread.op_party}
							<PartyBadge party={thread.op_party} partaiBaseUrl={PARTAI_URL} />
						{:else if thread.community_raised}
							<span class="lp-mono border px-2 py-0.5 tracking-[0.12em] uppercase" style="border-color: var(--lp-ink)">
								Diangkat komunitas
							</span>
						{/if}
						<span>{thread.participant_count} partisipan</span>
						<span>·</span>
						<span>{formatRelativeDays(thread.created_at)}</span>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}
