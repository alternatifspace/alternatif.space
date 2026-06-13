<script lang="ts">
	// Public moderation log (6.39): transparency in aggregate — what was done
	// and when, never to whom or by whom.
	let { data } = $props();

	const ACTION_LABELS: Record<string, string> = {
		hide_comment: 'Komentar disembunyikan',
		hide_thread: 'Diskusi disembunyikan',
		dismiss_report: 'Laporan diabaikan',
		escalate_report: 'Laporan dieskalasi',
		spinoff_executed: 'Spin-off sub-debat dijalankan',
		merge_threads: 'Diskusi duplikat dialihkan'
	};

	const dateFormat = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' });
</script>

<svelte:head>
	<title>Log moderasi — Mufakat</title>
	<meta name="description" content="Log publik tindakan moderasi mufakat.alternatif.space — jenis tindakan dan tanggal." />
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 pb-16">
	<h1 class="lp-display-sm">Log moderasi</h1>
	<p class="mt-2 text-sm opacity-60">
		Setiap tindakan moderasi tercatat di sini: jenis tindakan dan tanggal. Identitas pelapor
		dan moderator tidak pernah ditampilkan.
	</p>

	{#if data.entries.length === 0}
		<p class="mt-8 text-sm opacity-60">Belum ada tindakan moderasi.</p>
	{:else}
		<ul class="mt-6 flex flex-col divide-y divide-[#141210]/15 border-y-2" style="border-color: var(--lp-ink)">
			{#each data.entries as entry (entry.id)}
				<li class="flex items-baseline justify-between gap-4 py-2.5 text-sm">
					<span>{ACTION_LABELS[entry.action] ?? entry.action}</span>
					<time class="shrink-0 text-xs opacity-50" datetime={entry.created_at}>
						{dateFormat.format(new Date(entry.created_at))}
					</time>
				</li>
			{/each}
		</ul>
	{/if}
</main>
