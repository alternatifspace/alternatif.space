<script lang="ts">
	import { enhance } from '$app/forms';
	import { ThreadStatusBadge, PartyBadge } from '@alternatif/ui';
	import { PARTAI_URL, partaiGate } from '$lib/links';
	import { formatRelativeDays } from '$lib/format';
	import Composer from '$lib/components/Composer.svelte';
	import CommentNode from '$lib/components/CommentNode.svelte';
	import type { MarkerData } from '$lib/types';

	let { data, form } = $props();

	const thread = $derived(data.thread);
	const threadActive = $derived(thread.status === 'aktif' && !thread.hidden);

	let composing = $state(false);
	let closing = $state(false);
	let closeStatus = $state<'selesai' | 'pertanyaan_terbuka'>('selesai');
	let merging = $state(false);
	let reportingThread = $state(false);

	const markersByAnchor = $derived.by(() => {
		const map = new Map<string | null, MarkerData[]>();
		for (const m of data.markers) {
			const list = map.get(m.after_comment_id) ?? [];
			list.push(m);
			map.set(m.after_comment_id, list);
		}
		return map;
	});
</script>

{#snippet markerBlock(marker: MarkerData)}
	<!-- Spin-off marker (6.6): label + link + LIVE status badge. When the
	     target is selesai, the summary-back block renders inline (M0-15) —
	     read live, never stored in this thread. -->
	<aside class="border-l-4 p-3" style="border-color: var(--lp-amber)">
		<div class="flex flex-wrap items-center gap-2 text-sm">
			<span class="font-medium">
				{marker.kind === 'spinoff' ? 'Dipisah jadi diskusi tersendiri:' : 'Sudah ada diskusinya:'}
			</span>
			{#if marker.target}
				<a href="/diskusi/{marker.target.slug}" class="lp-link lp-amber font-semibold">
					{marker.label ?? marker.target.title}
				</a>
				<ThreadStatusBadge status={marker.target.status} />
			{/if}
		</div>
		{#if marker.target?.closing_summary_html}
			<div class="mt-3 border p-3" style="border-color: var(--lp-ink)">
				<p class="lp-mono text-xs font-bold tracking-[0.15em] uppercase opacity-60">Ringkasan penutup</p>
				<div class="prose prose-sm prose-slate mt-1 max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html marker.target.closing_summary_html}
				</div>
				<a href="/diskusi/{marker.target.slug}" class="lp-link lp-amber mt-2 inline-block text-xs">
					Tidak setuju dengan ringkasan ini? Diskusikan di sana →
				</a>
			</div>
		{/if}
	</aside>
{/snippet}

<svelte:head>
	<title>{thread.hidden ? '[disembunyikan moderator]' : thread.title} — mufakat.alternatif.space</title>
	{#if !thread.hidden}
		<meta name="description" content={thread.title} />
		<link rel="canonical" href="https://mufakat.alternatif.space/diskusi/{thread.slug}" />
		<meta property="og:type" content="article" />
		<meta property="og:url" content="https://mufakat.alternatif.space/diskusi/{thread.slug}" />
		<meta property="og:title" content="{thread.title} — mufakat.alternatif.space" />
		<meta property="og:description" content={thread.title} />
		<meta property="og:locale" content="id_ID" />
		<meta name="twitter:card" content="summary" />
		<meta name="twitter:title" content="{thread.title} — mufakat.alternatif.space" />
		<meta name="twitter:description" content={thread.title} />
	{/if}
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 pb-16">
	{#if form?.reportConfirmation}
		<div class="mb-4 border-2 p-3 text-sm" style="border-color: var(--lp-ink)" role="status" aria-live="polite">
			<p class="lp-mono text-xs font-bold tracking-[0.15em] uppercase"><span class="lp-amber">·</span> Laporan terkirim</p>
			<p class="mt-1">{form.reportConfirmation}</p>
		</div>
	{/if}
	{#if form?.flagged}
		<div class="mb-4 border-2 p-3 text-sm" style="border-color: var(--lp-ink)" role="status" aria-live="polite">
			Ditandai sebagai perdebatan definisi — admin akan meninjau apakah perlu dipisah.
		</div>
	{/if}
	{#if form?.error}
		<div class="mb-4 border-2 p-3 text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">
			{form.explanation ?? form.error}
		</div>
	{/if}

	{#if thread.hidden}
		<h1 class="lp-h2 italic opacity-50">[disembunyikan moderator]</h1>
		<p class="mt-2 text-sm opacity-60">Konten diskusi ini disembunyikan. Strukturnya dipertahankan.</p>
	{:else}
		{#if thread.status === 'dialihkan' && data.redirectTarget}
			<!-- Permanent redirect to the canonical thread (M0-02) -->
			<div class="mb-4 border-2 p-3 text-sm" style="border-color: var(--lp-ink)">
				Diskusi ini ditutup sebagai duplikat. Diskusi kanoniknya:
				<a href="/diskusi/{data.redirectTarget.slug}" class="lp-link lp-amber font-semibold">{data.redirectTarget.title}</a>
			</div>
		{/if}

		{#if data.opPrompt}
			<!-- OP-ship window (M0-09/D2): the split already happened; only the
			     responsibility is being decided. -->
			<div class="mb-4 border-l-4 p-4" style="border-color: var(--lp-amber)">
				<p class="font-semibold">Komentarmu jadi diskusi baru.</p>
				<p class="mt-1 text-sm opacity-80">
					Komunitas menilai pertanyaanmu layak jadi diskusi tersendiri. Mau jadi OP-nya? Tanpa
					respons, OP-ship dikonfirmasi otomatis dalam 24 jam.
				</p>
				<div class="mt-3 flex gap-2">
					<form method="POST" action="?/opship" use:enhance>
						<input type="hidden" name="split_id" value={data.opPrompt.split_id} />
						<button name="decision" value="confirm" class="lp-btn inline-block text-sm">
							Ya, saya jadi OP
						</button>
					</form>
					<form method="POST" action="?/opship" use:enhance>
						<input type="hidden" name="split_id" value={data.opPrompt.split_id} />
						<button name="decision" value="decline" class="lp-btn-ghost inline-block text-sm">
							Tidak — biarkan komunitas
						</button>
					</form>
				</div>
			</div>
		{/if}

		<!-- Thread header (6.8): status prominent, OP flag, timestamp -->
		<header>
			<div class="flex items-start justify-between gap-3">
				<h1 class="lp-display-sm">{thread.title}</h1>
				<ThreadStatusBadge status={thread.status} />
			</div>
			<div class="mt-3 flex flex-wrap items-center gap-2 text-sm opacity-60">
				{#if data.opName}<span class="font-medium opacity-100">{data.opName}</span>{/if}
				<PartyBadge party={data.opParty} partaiBaseUrl={PARTAI_URL} />
				{#if thread.community_raised}
					<span class="lp-mono border px-2 py-0.5 text-xs tracking-[0.12em] uppercase" style="border-color: var(--lp-ink)">
						Diangkat komunitas
					</span>
				{/if}
				<span>{formatRelativeDays(thread.created_at)}</span>
				{#if data.parentThread}
					<a href="/diskusi/{data.parentThread.slug}" class="lp-link text-xs">
						← dari diskusi: {data.parentThread.title}
					</a>
				{/if}
			</div>
		</header>

		{#if thread.status === 'pertanyaan_terbuka'}
			<div class="mt-4 border-l-4 p-3 text-sm" style="border-color: var(--lp-amber)">
				Pertanyaan ini masih terbuka, dan kamu bukan yang pertama menemukannya.
			</div>
		{/if}

		<!-- OP post -->
		<div class="prose prose-slate mt-4 max-w-none">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html thread.body_html ?? ''}
		</div>

		{#if thread.closing_summary_html}
			<section class="mt-6 border-2 p-4" style="border-color: var(--lp-ink)">
				<p class="lp-mono text-xs font-bold tracking-[0.15em] uppercase opacity-60">
					<span class="lp-amber">·</span> Ringkasan penutup
				</p>
				<div class="prose prose-sm prose-slate mt-1 max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html thread.closing_summary_html}
				</div>
			</section>
		{/if}

		<!-- Thread-level Setuju + report -->
		<div class="mt-4 flex flex-wrap items-center gap-2 text-sm">
			<form method="POST" action={data.myThreadSetuju ? '?/unreact' : '?/react'} use:enhance>
				<input type="hidden" name="type" value="setuju" />
				<button
					disabled={!data.canWrite}
					class="min-h-10 rounded-full border px-4 font-medium disabled:opacity-40 {data.myThreadSetuju
						? 'border-[#141210] bg-[#141210] text-[#f4f1ea]'
						: 'border-[#141210] hover:bg-[#141210]/5'}"
				>
					Setuju{data.threadSetuju > 0 ? ` · ${data.threadSetuju}` : ''}
				</button>
			</form>
			{#if data.userId && !data.isOP}
				<button type="button" class="text-xs opacity-50 hover:underline" onclick={() => (reportingThread = !reportingThread)}>
					Laporkan diskusi
				</button>
			{/if}
		</div>

		{#if reportingThread}
			<form method="POST" action="?/report" use:enhance={() => async ({ update }) => {
				reportingThread = false;
				await update();
			}} class="mt-2 flex max-w-md flex-col gap-2 border p-3" style="border-color: var(--lp-ink)">
				<input type="hidden" name="subject_type" value="thread" />
				<input type="hidden" name="subject_id" value={thread.id} />
				<select name="category" required class="min-h-10 border-2 bg-transparent px-2 text-sm" style="border-color: var(--lp-ink)">
					<option value="" disabled selected>— kategori laporan —</option>
					<option value="sara">SARA / ujaran kebencian</option>
					<option value="defamation">Pencemaran nama baik</option>
					<option value="threat">Ancaman</option>
					<option value="spam">Spam</option>
				</select>
				<textarea name="note" maxlength="500" rows="2" placeholder="Catatan (opsional)" class="border-2 bg-transparent px-3 py-2 text-sm" style="border-color: var(--lp-ink)"></textarea>
				<button class="lp-btn inline-block self-start text-sm">Kirim laporan</button>
			</form>
		{/if}

		<!-- OP/admin: close thread (M0-03); admin: merge duplicate (M0-02) -->
		{#if (data.isOP || data.isAdmin) && thread.status === 'aktif'}
			<section class="mt-6 border-2 p-4" style="border-color: var(--lp-ink)">
				{#if !closing && !merging}
					<div class="flex flex-wrap gap-2">
						<button type="button" class="lp-btn-ghost inline-block text-sm" onclick={() => (closing = true)}>
							Tutup diskusi
						</button>
						{#if data.isAdmin}
							<button type="button" class="lp-btn-ghost inline-block text-sm" onclick={() => (merging = true)}>
								Gabungkan sebagai duplikat
							</button>
						{/if}
					</div>
				{/if}

				{#if closing}
					<div class="flex flex-col gap-3">
						<div class="flex gap-4 text-sm">
							<label class="flex items-center gap-2">
								<input type="radio" bind:group={closeStatus} value="selesai" /> Selesai (dengan ringkasan)
							</label>
							<label class="flex items-center gap-2">
								<input type="radio" bind:group={closeStatus} value="pertanyaan_terbuka" /> Pertanyaan Terbuka
							</label>
						</div>
						{#if closeStatus === 'selesai'}
							<Composer
								action="?/close"
								hidden={{ status: 'selesai' }}
								submitLabel="Tutup: Selesai"
								oncancel={() => (closing = false)}
							/>
							<p class="-mt-1 text-xs opacity-50">Editor di atas menjadi ringkasan penutup (closing_summary).</p>
						{:else}
							<form method="POST" action="?/close" use:enhance class="flex gap-2">
								<input type="hidden" name="status" value="pertanyaan_terbuka" />
								<button class="lp-btn inline-block text-sm">
									Tutup: Pertanyaan Terbuka
								</button>
								<button type="button" class="lp-btn-ghost inline-block text-sm" onclick={() => (closing = false)}>
									Batal
								</button>
							</form>
						{/if}
						{#if form?.closeError}<p class="border-2 px-3 py-2 text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">{form.closeError}</p>{/if}
					</div>
				{/if}

				{#if merging}
					<form method="POST" action="?/merge" use:enhance class="flex flex-col gap-2">
						<label class="lp-mono text-xs font-bold tracking-[0.2em] uppercase" for="canonical">ID diskusi kanonik</label>
						<input id="canonical" name="canonical_thread_id" required placeholder="UUID diskusi tujuan" class="min-h-10 border-2 bg-transparent px-3 text-sm" style="border-color: var(--lp-ink)" />
						<label class="flex items-center gap-2 text-sm">
							<input type="checkbox" name="move_comments" /> Pindahkan komentar ke diskusi kanonik
						</label>
						<div class="flex gap-2">
							<button class="lp-btn inline-block text-sm">Gabungkan</button>
							<button type="button" class="lp-btn-ghost inline-block text-sm" onclick={() => (merging = false)}>Batal</button>
						</div>
						{#if form?.mergeError}<p class="border-2 px-3 py-2 text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">{form.mergeError}</p>{/if}
					</form>
				{/if}
			</section>
		{/if}

		<!-- Comments + markers, positionally interleaved (TRD §11) -->
		<section class="mt-8 flex flex-col gap-3">
			<h2 class="lp-mono text-xs font-bold tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber">·</span> Komentar
			</h2>

			{#each markersByAnchor.get(null) ?? [] as marker (marker.id)}
				{@render markerBlock(marker)}
			{/each}

			{#if data.roots.length === 0}
				<p class="text-sm opacity-60">Belum ada komentar — jadilah yang pertama menanggapi.</p>
			{/if}

			{#each data.roots as node (node.id)}
				<CommentNode {node} {threadActive} canWrite={data.canWrite} userId={data.userId} isAdmin={data.isAdmin} />
				{#each markersByAnchor.get(node.id) ?? [] as marker (marker.id)}
					{@render markerBlock(marker)}
				{/each}
			{/each}

			{#if threadActive}
				{#if data.canWrite}
					{#if composing}
						<Composer action="?/comment" submitLabel="Kirim komentar" oncancel={() => (composing = false)} ondone={() => (composing = false)} />
					{:else}
						<button
							type="button"
							class="min-h-11 border-2 px-4 text-left text-sm opacity-60 hover:bg-[#141210]/5 hover:opacity-100"
							style="border-color: var(--lp-ink)"
							onclick={() => (composing = true)}
						>
							Tulis komentar…
						</button>
					{/if}
				{:else if !data.signedIn}
					<p class="text-sm opacity-70">
						<a href={partaiGate()} class="lp-link lp-amber">Bergabunglah dengan partai</a> untuk ikut berdiskusi.
					</p>
				{:else}
					<p class="text-sm opacity-70">
						Kamu butuh keanggotaan partai untuk menulis —
						<a href={partaiGate()} class="lp-link lp-amber">pasang benderamu di partai</a>.
					</p>
				{/if}
			{/if}
		</section>
	{/if}
</main>
