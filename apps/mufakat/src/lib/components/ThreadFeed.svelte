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
	<div class="mt-12 text-center text-gray-500">
		<p class="text-lg font-medium">Belum ada diskusi.</p>
		<p class="mt-1 text-sm">
			Setiap pertanyaan punya satu rumah — <a href="/buat" class="text-slate-800 underline">buka yang pertama</a>.
		</p>
	</div>
{:else}
	<!-- Thread cards (6.2): title, OP flag, participants, status, timestamp -->
	<ul class="mt-4 flex flex-col gap-3">
		{#each threads as thread (thread.id)}
			<li>
				<a
					href="/diskusi/{thread.slug}"
					class="block rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300 hover:shadow-sm"
				>
					<div class="flex items-start justify-between gap-3">
						<h2 class="font-semibold text-gray-900">{thread.title}</h2>
						<ThreadStatusBadge status={thread.status} />
					</div>
					<div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
						{#if thread.op_party}
							<PartyBadge party={thread.op_party} partaiBaseUrl={PARTAI_URL} />
						{:else if thread.community_raised}
							<span class="rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-800">
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
