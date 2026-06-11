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
	<aside class="rounded-lg border border-indigo-200 bg-indigo-50 p-3">
		<div class="flex flex-wrap items-center gap-2 text-sm">
			<span class="font-medium text-indigo-900">
				{marker.kind === 'spinoff' ? 'Dipisah jadi diskusi tersendiri:' : 'Sudah ada diskusinya:'}
			</span>
			{#if marker.target}
				<a href="/diskusi/{marker.target.slug}" class="font-semibold text-indigo-800 underline">
					{marker.label ?? marker.target.title}
				</a>
				<ThreadStatusBadge status={marker.target.status} />
			{/if}
		</div>
		{#if marker.target?.closing_summary_html}
			<div class="mt-3 rounded-md border border-indigo-100 bg-white p-3">
				<p class="text-xs font-semibold tracking-wide text-indigo-700 uppercase">Ringkasan penutup</p>
				<div class="prose prose-sm prose-slate mt-1 max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html marker.target.closing_summary_html}
				</div>
				<a href="/diskusi/{marker.target.slug}" class="mt-2 inline-block text-xs text-indigo-700 underline">
					Tidak setuju dengan ringkasan ini? Diskusikan di sana →
				</a>
			</div>
		{/if}
	</aside>
{/snippet}

<svelte:head>
	<title>{thread.hidden ? '[disembunyikan moderator]' : thread.title} — mufakat.alternatif.space</title>
</svelte:head>

<main class="mx-auto max-w-3xl p-4 pb-16">
	{#if form?.reportConfirmation}
		<div class="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-900">
			<p class="font-semibold">Laporan terkirim.</p>
			<p class="mt-1">{form.reportConfirmation}</p>
		</div>
	{/if}
	{#if form?.flagged}
		<div class="mb-4 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
			Ditandai sebagai perdebatan definisi — admin akan meninjau apakah perlu dipisah.
		</div>
	{/if}
	{#if form?.error}
		<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
			{form.explanation ?? form.error}
		</div>
	{/if}

	{#if thread.hidden}
		<h1 class="text-xl font-bold text-gray-400 italic">[disembunyikan moderator]</h1>
		<p class="mt-2 text-sm text-gray-500">Konten diskusi ini disembunyikan. Strukturnya dipertahankan.</p>
	{:else}
		{#if thread.status === 'dialihkan' && data.redirectTarget}
			<!-- Permanent redirect to the canonical thread (M0-02) -->
			<div class="mb-4 rounded-md border border-gray-300 bg-gray-100 p-3 text-sm">
				Diskusi ini ditutup sebagai duplikat. Diskusi kanoniknya:
				<a href="/diskusi/{data.redirectTarget.slug}" class="font-semibold underline">{data.redirectTarget.title}</a>
			</div>
		{/if}

		{#if data.opPrompt}
			<!-- OP-ship window (M0-09/D2): the split already happened; only the
			     responsibility is being decided. -->
			<div class="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4">
				<p class="font-semibold text-amber-900">Komentarmu jadi diskusi baru.</p>
				<p class="mt-1 text-sm text-amber-800">
					Komunitas menilai pertanyaanmu layak jadi diskusi tersendiri. Mau jadi OP-nya? Tanpa
					respons, OP-ship dikonfirmasi otomatis dalam 24 jam.
				</p>
				<div class="mt-3 flex gap-2">
					<form method="POST" action="?/opship" use:enhance>
						<input type="hidden" name="split_id" value={data.opPrompt.split_id} />
						<button name="decision" value="confirm" class="min-h-10 rounded-md bg-slate-800 px-4 text-sm font-semibold text-white">
							Ya, saya jadi OP
						</button>
					</form>
					<form method="POST" action="?/opship" use:enhance>
						<input type="hidden" name="split_id" value={data.opPrompt.split_id} />
						<button name="decision" value="decline" class="min-h-10 rounded-md border border-amber-400 px-4 text-sm font-medium text-amber-900">
							Tidak — biarkan komunitas
						</button>
					</form>
				</div>
			</div>
		{/if}

		<!-- Thread header (6.8): status prominent, OP flag, timestamp -->
		<header>
			<div class="flex items-start justify-between gap-3">
				<h1 class="text-2xl font-bold">{thread.title}</h1>
				<ThreadStatusBadge status={thread.status} />
			</div>
			<div class="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500">
				{#if data.opName}<span class="font-medium text-gray-700">{data.opName}</span>{/if}
				<PartyBadge party={data.opParty} partaiBaseUrl={PARTAI_URL} />
				{#if thread.community_raised}
					<span class="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
						Diangkat komunitas
					</span>
				{/if}
				<span>{formatRelativeDays(thread.created_at)}</span>
				{#if data.parentThread}
					<a href="/diskusi/{data.parentThread.slug}" class="text-xs underline">
						← dari diskusi: {data.parentThread.title}
					</a>
				{/if}
			</div>
		</header>

		{#if thread.status === 'pertanyaan_terbuka'}
			<div class="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
				Pertanyaan ini masih terbuka, dan kamu bukan yang pertama menemukannya.
			</div>
		{/if}

		<!-- OP post -->
		<div class="prose prose-slate mt-4 max-w-none">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html thread.body_html ?? ''}
		</div>

		{#if thread.closing_summary_html}
			<section class="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
				<p class="text-xs font-semibold tracking-wide text-blue-700 uppercase">Ringkasan penutup</p>
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
						? 'border-slate-800 bg-slate-800 text-white'
						: 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
				>
					Setuju{data.threadSetuju > 0 ? ` · ${data.threadSetuju}` : ''}
				</button>
			</form>
			{#if data.userId && !data.isOP}
				<button type="button" class="text-xs text-gray-400 hover:underline" onclick={() => (reportingThread = !reportingThread)}>
					Laporkan diskusi
				</button>
			{/if}
		</div>

		{#if reportingThread}
			<form method="POST" action="?/report" use:enhance={() => async ({ update }) => {
				reportingThread = false;
				await update();
			}} class="mt-2 flex max-w-md flex-col gap-2 rounded-md bg-gray-50 p-3">
				<input type="hidden" name="subject_type" value="thread" />
				<input type="hidden" name="subject_id" value={thread.id} />
				<select name="category" required class="min-h-10 rounded-md border border-gray-300 px-2 text-sm">
					<option value="" disabled selected>— kategori laporan —</option>
					<option value="sara">SARA / ujaran kebencian</option>
					<option value="defamation">Pencemaran nama baik</option>
					<option value="threat">Ancaman</option>
					<option value="spam">Spam</option>
				</select>
				<textarea name="note" maxlength="500" rows="2" placeholder="Catatan (opsional)" class="rounded-md border border-gray-300 px-3 py-2 text-sm"></textarea>
				<button class="min-h-10 self-start rounded-md bg-slate-800 px-4 text-sm font-semibold text-white">Kirim laporan</button>
			</form>
		{/if}

		<!-- OP/admin: close thread (M0-03); admin: merge duplicate (M0-02) -->
		{#if (data.isOP || data.isAdmin) && thread.status === 'aktif'}
			<section class="mt-6 rounded-lg border border-gray-200 p-4">
				{#if !closing && !merging}
					<div class="flex flex-wrap gap-2">
						<button type="button" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm font-medium" onclick={() => (closing = true)}>
							Tutup diskusi
						</button>
						{#if data.isAdmin}
							<button type="button" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm font-medium" onclick={() => (merging = true)}>
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
							<p class="-mt-1 text-xs text-gray-400">Editor di atas menjadi ringkasan penutup (closing_summary).</p>
						{:else}
							<form method="POST" action="?/close" use:enhance class="flex gap-2">
								<input type="hidden" name="status" value="pertanyaan_terbuka" />
								<button class="min-h-10 rounded-md bg-amber-600 px-4 text-sm font-semibold text-white">
									Tutup: Pertanyaan Terbuka
								</button>
								<button type="button" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm" onclick={() => (closing = false)}>
									Batal
								</button>
							</form>
						{/if}
						{#if form?.closeError}<p class="text-sm text-red-600">{form.closeError}</p>{/if}
					</div>
				{/if}

				{#if merging}
					<form method="POST" action="?/merge" use:enhance class="flex flex-col gap-2">
						<label class="text-sm font-medium" for="canonical">ID diskusi kanonik</label>
						<input id="canonical" name="canonical_thread_id" required placeholder="UUID diskusi tujuan" class="min-h-10 rounded-md border border-gray-300 px-3 text-sm" />
						<label class="flex items-center gap-2 text-sm">
							<input type="checkbox" name="move_comments" /> Pindahkan komentar ke diskusi kanonik
						</label>
						<div class="flex gap-2">
							<button class="min-h-10 rounded-md bg-slate-800 px-4 text-sm font-semibold text-white">Gabungkan</button>
							<button type="button" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm" onclick={() => (merging = false)}>Batal</button>
						</div>
						{#if form?.mergeError}<p class="text-sm text-red-600">{form.mergeError}</p>{/if}
					</form>
				{/if}
			</section>
		{/if}

		<!-- Comments + markers, positionally interleaved (TRD §11) -->
		<section class="mt-8 flex flex-col gap-3">
			<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Komentar</h2>

			{#each markersByAnchor.get(null) ?? [] as marker (marker.id)}
				{@render markerBlock(marker)}
			{/each}

			{#if data.roots.length === 0}
				<p class="text-sm text-gray-500">Belum ada komentar — jadilah yang pertama menanggapi.</p>
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
							class="min-h-11 rounded-md border border-gray-300 px-4 text-left text-sm text-gray-500 hover:bg-gray-50"
							onclick={() => (composing = true)}
						>
							Tulis komentar…
						</button>
					{/if}
				{:else if !data.signedIn}
					<p class="text-sm text-gray-500">
						<a href={partaiGate()} class="underline">Bergabunglah dengan partai</a> untuk ikut berdiskusi.
					</p>
				{:else}
					<p class="text-sm text-gray-500">
						Kamu butuh keanggotaan partai untuk menulis —
						<a href={partaiGate()} class="underline">pasang benderamu di partai</a>.
					</p>
				{/if}
			{/if}
		</section>
	{/if}
</main>
