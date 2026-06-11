<script lang="ts">
	// Admin dashboard (6.34): three queues — reports, semantic flags, pending
	// dedup-reference confirmations. All mutations round-trip form actions.
	import { enhance } from '$app/forms';
	import { formatRelativeDays } from '$lib/format';

	let { data, form } = $props();

	const CATEGORY_LABELS: Record<string, string> = {
		sara: 'SARA / ujaran kebencian',
		defamation: 'Pencemaran nama baik',
		threat: 'Ancaman',
		spam: 'Spam'
	};

	const commentHref = (slug: string, commentId: string | null) =>
		commentId ? `/diskusi/${slug}#komentar-${commentId}` : `/diskusi/${slug}`;
</script>

<svelte:head>
	<title>Moderasi — Mufakat</title>
</svelte:head>

<main class="mx-auto max-w-3xl p-4 pb-16">
	<h1 class="text-2xl font-bold">Moderasi</h1>
	<p class="mt-1 text-sm text-gray-500">
		Semua tindakan tercatat di <a href="/moderasi/log" class="underline">log publik</a> (jenis tindakan + tanggal).
	</p>

	{#if form?.error}
		<div class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
			{form.error}
		</div>
	{/if}

	<!-- Report queue (6.35): dismiss / hide / escalate -->
	<section class="mt-8">
		<h2 class="text-lg font-semibold">Laporan masuk <span class="text-sm font-normal text-gray-400">({data.reports.length})</span></h2>
		{#if data.reports.length === 0}
			<p class="mt-2 text-sm text-gray-500">Tidak ada laporan yang menunggu.</p>
		{:else}
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.reports as report (report.id)}
					<li class="rounded-lg border border-gray-200 bg-white p-4">
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="rounded-full bg-red-100 px-2 py-0.5 font-medium text-red-800">
								{CATEGORY_LABELS[report.category] ?? report.category}
							</span>
							<span class="text-gray-400">
								{report.subject_type === 'thread' ? 'Diskusi' : 'Komentar'} · {formatRelativeDays(report.created_at)}
							</span>
						</div>
						{#if report.subject}
							<a
								href={commentHref(report.subject.thread_slug, report.subject.comment_id)}
								class="mt-2 block text-sm font-medium text-slate-800 hover:underline"
							>
								{report.subject.thread_title}
							</a>
							{#if report.subject.excerpt}
								<p class="mt-1 text-sm text-gray-600">“{report.subject.excerpt}”</p>
							{/if}
						{:else}
							<p class="mt-2 text-sm text-gray-400 italic">Konten tidak ditemukan.</p>
						{/if}
						{#if report.note}
							<p class="mt-1 text-xs text-gray-500">Catatan pelapor: {report.note}</p>
						{/if}
						<form method="POST" action="?/review" use:enhance class="mt-3 flex flex-wrap gap-2">
							<input type="hidden" name="report_id" value={report.id} />
							<button name="action" value="dismiss" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm hover:bg-gray-50">
								Abaikan
							</button>
							<button name="action" value="hide" class="min-h-10 rounded-md bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700">
								Sembunyikan
							</button>
							<button name="action" value="escalate" class="min-h-10 rounded-md border border-amber-400 px-4 text-sm text-amber-800 hover:bg-amber-50">
								Eskalasi
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- Semantic flag queue (6.36): resolve via spin-off, or dismiss -->
	<section class="mt-10">
		<h2 class="text-lg font-semibold">Perdebatan definisi <span class="text-sm font-normal text-gray-400">({data.flagQueue.length})</span></h2>
		{#if data.flagQueue.length === 0}
			<p class="mt-2 text-sm text-gray-500">Tidak ada penanda yang menunggu.</p>
		{:else}
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.flagQueue as flag (flag.comment_id)}
					<li class="rounded-lg border p-4 {flag.count >= 3 ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 bg-white'}">
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="rounded-full border border-dashed border-indigo-300 px-2 py-0.5 text-indigo-700">
								{flag.count} penanda
							</span>
							{#if flag.count >= 3}
								<span class="rounded-full bg-indigo-600 px-2 py-0.5 font-medium text-white">Prioritas</span>
							{/if}
							<span class="text-gray-400">{formatRelativeDays(flag.oldest)}</span>
						</div>
						{#if flag.thread_slug}
							<a
								href={commentHref(flag.thread_slug, flag.comment_id)}
								class="mt-2 block text-sm font-medium text-slate-800 hover:underline"
							>
								{flag.thread_title}
							</a>
						{/if}
						{#if flag.excerpt}
							<p class="mt-1 text-sm text-gray-600">“{flag.excerpt}”</p>
						{/if}
						<div class="mt-3 flex flex-wrap items-center gap-2">
							{#if flag.thread_id}
								<a
									href="/moderasi/spinoff/{flag.thread_id}?dari={flag.comment_id}"
									class="min-h-10 rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
								>
									Pisahkan (spin-off)
								</a>
							{/if}
							<form method="POST" action="?/dismissFlags" use:enhance>
								<input type="hidden" name="comment_id" value={flag.comment_id} />
								<button class="min-h-10 rounded-md border border-gray-300 px-4 text-sm hover:bg-gray-50">
									Abaikan
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<!-- Pending dedup-reference confirmations (6.37) -->
	<section class="mt-10">
		<h2 class="text-lg font-semibold">Konfirmasi rujukan duplikat <span class="text-sm font-normal text-gray-400">({data.dedupQueue.length})</span></h2>
		{#if data.dedupQueue.length === 0}
			<p class="mt-2 text-sm text-gray-500">Tidak ada rujukan yang menunggu konfirmasi.</p>
		{:else}
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.dedupQueue as item (item.id)}
					<li class="rounded-lg border border-gray-200 bg-white p-4">
						<p class="text-xs text-gray-400">
							{item.reaction_count} reaksi “Pertanyaan bagus” · {formatRelativeDays(item.created_at)}
						</p>
						{#if item.excerpt}
							<p class="mt-2 text-sm text-gray-600">“{item.excerpt}”</p>
						{/if}
						<dl class="mt-2 text-sm">
							{#if item.source}
								<div class="flex gap-2">
									<dt class="text-gray-400">Dari:</dt>
									<dd><a href="/diskusi/{item.source.slug}" class="text-slate-800 hover:underline">{item.source.title}</a></dd>
								</div>
							{/if}
							{#if item.target}
								<div class="flex gap-2">
									<dt class="text-gray-400">Kandidat rumah:</dt>
									<dd><a href="/diskusi/{item.target.slug}" class="text-slate-800 hover:underline">{item.target.title}</a></dd>
								</div>
							{/if}
						</dl>
						<form method="POST" action="?/dedup" use:enhance class="mt-3 flex flex-wrap gap-2">
							<input type="hidden" name="split_id" value={item.id} />
							<button name="action" value="confirm" class="min-h-10 rounded-md bg-slate-800 px-4 text-sm font-semibold text-white hover:bg-slate-700">
								Pertanyaan sama — rujuk ke sana
							</button>
							<button name="action" value="reject" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm hover:bg-gray-50">
								Berbeda — buat diskusi baru
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
