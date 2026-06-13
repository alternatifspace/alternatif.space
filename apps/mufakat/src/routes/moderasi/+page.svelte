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

<main class="mx-auto max-w-3xl px-5 py-10 pb-16">
	<h1 class="lp-display-sm">Moderasi</h1>
	<p class="mt-2 text-sm opacity-60">
		Semua tindakan tercatat di <a href="/moderasi/log" class="lp-link lp-amber">log publik</a> (jenis tindakan + tanggal).
	</p>

	{#if form?.error}
		<div class="mt-4 border-2 p-3 text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">
			{form.error}
		</div>
	{/if}

	<!-- Report queue (6.35): dismiss / hide / escalate -->
	<section class="mt-8">
		<h2 class="lp-h2">Laporan masuk <span class="text-sm font-normal opacity-50">({data.reports.length})</span></h2>
		{#if data.reports.length === 0}
			<p class="mt-2 text-sm opacity-60">Tidak ada laporan yang menunggu.</p>
		{:else}
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.reports as report (report.id)}
					<li class="border-2 p-4" style="border-color: var(--lp-ink)">
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="lp-mono border px-2 py-0.5 tracking-[0.12em] uppercase" style="border-color: var(--lp-ink)">
								{CATEGORY_LABELS[report.category] ?? report.category}
							</span>
							<span class="opacity-50">
								{report.subject_type === 'thread' ? 'Diskusi' : 'Komentar'} · {formatRelativeDays(report.created_at)}
							</span>
						</div>
						{#if report.subject}
							<a
								href={commentHref(report.subject.thread_slug, report.subject.comment_id)}
								class="lp-link mt-2 block text-sm font-medium"
							>
								{report.subject.thread_title}
							</a>
							{#if report.subject.excerpt}
								<p class="mt-1 text-sm opacity-70">“{report.subject.excerpt}”</p>
							{/if}
						{:else}
							<p class="mt-2 text-sm italic opacity-50">Konten tidak ditemukan.</p>
						{/if}
						{#if report.note}
							<p class="mt-1 text-xs opacity-60">Catatan pelapor: {report.note}</p>
						{/if}
						<form method="POST" action="?/review" use:enhance class="mt-3 flex flex-wrap gap-2">
							<input type="hidden" name="report_id" value={report.id} />
							<button name="action" value="dismiss" class="lp-btn-ghost inline-block text-sm">
								Abaikan
							</button>
							<button name="action" value="hide" class="lp-btn inline-block text-sm">
								Sembunyikan
							</button>
							<button name="action" value="escalate" class="lp-btn-ghost inline-block text-sm">
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
		<h2 class="lp-h2">Perdebatan definisi <span class="text-sm font-normal opacity-50">({data.flagQueue.length})</span></h2>
		{#if data.flagQueue.length === 0}
			<p class="mt-2 text-sm opacity-60">Tidak ada penanda yang menunggu.</p>
		{:else}
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.flagQueue as flag (flag.comment_id)}
					<li class="border-2 p-4 {flag.count >= 3 ? 'bg-[#c17d0f]/[0.07]' : ''}" style="border-color: var(--lp-ink)">
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="lp-mono border border-dashed px-2 py-0.5 tracking-[0.12em] uppercase" style="border-color: var(--lp-ink)">
								{flag.count} penanda
							</span>
							{#if flag.count >= 3}
								<span class="lp-mono lp-amber border px-2 py-0.5 tracking-[0.12em] uppercase" style="border-color: var(--lp-amber)">Prioritas</span>
							{/if}
							<span class="opacity-50">{formatRelativeDays(flag.oldest)}</span>
						</div>
						{#if flag.thread_slug}
							<a
								href={commentHref(flag.thread_slug, flag.comment_id)}
								class="lp-link mt-2 block text-sm font-medium"
							>
								{flag.thread_title}
							</a>
						{/if}
						{#if flag.excerpt}
							<p class="mt-1 text-sm opacity-70">“{flag.excerpt}”</p>
						{/if}
						<div class="mt-3 flex flex-wrap items-center gap-2">
							{#if flag.thread_id}
								<a
									href="/moderasi/spinoff/{flag.thread_id}?dari={flag.comment_id}"
									class="lp-btn inline-block text-sm"
								>
									Pisahkan (spin-off)
								</a>
							{/if}
							<form method="POST" action="?/dismissFlags" use:enhance>
								<input type="hidden" name="comment_id" value={flag.comment_id} />
								<button class="lp-btn-ghost inline-block text-sm">
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
		<h2 class="lp-h2">Konfirmasi rujukan duplikat <span class="text-sm font-normal opacity-50">({data.dedupQueue.length})</span></h2>
		{#if data.dedupQueue.length === 0}
			<p class="mt-2 text-sm opacity-60">Tidak ada rujukan yang menunggu konfirmasi.</p>
		{:else}
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.dedupQueue as item (item.id)}
					<li class="border-2 p-4" style="border-color: var(--lp-ink)">
						<p class="text-xs opacity-50">
							{item.reaction_count} reaksi “Pertanyaan bagus” · {formatRelativeDays(item.created_at)}
						</p>
						{#if item.excerpt}
							<p class="mt-2 text-sm opacity-70">“{item.excerpt}”</p>
						{/if}
						<dl class="mt-2 text-sm">
							{#if item.source}
								<div class="flex gap-2">
									<dt class="opacity-50">Dari:</dt>
									<dd><a href="/diskusi/{item.source.slug}" class="lp-link">{item.source.title}</a></dd>
								</div>
							{/if}
							{#if item.target}
								<div class="flex gap-2">
									<dt class="opacity-50">Kandidat rumah:</dt>
									<dd><a href="/diskusi/{item.target.slug}" class="lp-link">{item.target.title}</a></dd>
								</div>
							{/if}
						</dl>
						<form method="POST" action="?/dedup" use:enhance class="mt-3 flex flex-wrap gap-2">
							<input type="hidden" name="split_id" value={item.id} />
							<button name="action" value="confirm" class="lp-btn inline-block text-sm">
								Pertanyaan sama — rujuk ke sana
							</button>
							<button name="action" value="reject" class="lp-btn-ghost inline-block text-sm">
								Berbeda — buat diskusi baru
							</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>
</main>
