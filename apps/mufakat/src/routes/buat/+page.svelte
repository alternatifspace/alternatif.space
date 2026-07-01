<script lang="ts">
	// Create thread (M0-01/M0-02): title + TipTap body, dedup suggestions as
	// invitation (never a block), localStorage draft auto-save. The editor is
	// dynamically imported so TipTap stays out of the read path (6.9).
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { ThreadStatusBadge, type ThreadStatus } from '@alternatif/ui';
	import { supabaseAnon } from '$lib/supabase';
	import type { SupabaseClient } from '@supabase/supabase-js';

	let { form } = $props();

	const DRAFT_KEY = 'mufakat:thread-draft';

	let title = $state('');
	let json = $state<unknown>(null);
	let html = $state('');
	let text = $state('');
	let submitting = $state(false);
	// Editor mounts only after the draft restore so it picks up saved content.
	let restored = $state<unknown>(null);
	let ready = $state(false);

	interface Suggestion {
		id: string;
		slug: string;
		title: string;
		status: ThreadStatus;
	}
	let suggestions = $state<Suggestion[]>([]);

	onMount(() => {
		// Auto-save draft (M0-01): restore on return, cleared on publish.
		try {
			const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
			if (draft) {
				title = draft.title ?? '';
				restored = draft.json ?? null;
				if (title) search(title);
			}
		} catch {
			localStorage.removeItem(DRAFT_KEY);
		}
		ready = true;
	});

	let saveTimer: ReturnType<typeof setTimeout>;
	function saveDraft() {
		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, json }));
			} catch {
				// storage full/unavailable — drafts are best-effort
			}
		}, 500);
	}

	// Dedup (M0-02): debounced anonymous read — threads are public, no auth
	// needed. Threshold math stays in the database function.
	let db: SupabaseClient | undefined;
	let searchTimer: ReturnType<typeof setTimeout>;
	async function search(q: string) {
		q = q.trim();
		if (q.length < 4) {
			suggestions = [];
			return;
		}
		db ??= supabaseAnon();
		const { data } = await db.rpc('search_similar_threads', { q });
		suggestions = (data ?? []) as Suggestion[];
	}

	function onTitleInput() {
		saveDraft();
		clearTimeout(searchTimer);
		searchTimer = setTimeout(() => search(title), 300);
	}
</script>

<svelte:head>
	<title>Buat diskusi — Mufakat</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10">
	<h1 class="lp-display-sm">Buat diskusi</h1>
	<p class="mt-2 text-sm opacity-60">Satu pertanyaan, satu rumah.</p>

	<form
		method="POST"
		class="mt-6 flex flex-col gap-4"
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				submitting = false;
				if (result.type === 'redirect') localStorage.removeItem(DRAFT_KEY);
				await update({ reset: false });
			};
		}}
	>
		<div>
			<label for="title" class="lp-mono text-xs font-bold tracking-[0.2em] uppercase">Judul</label>
			<input
				id="title"
				name="title"
				type="text"
				required
				maxlength={200}
				bind:value={title}
				oninput={onTitleInput}
				placeholder="Pertanyaan atau topik yang mau kamu angkat"
				class="mt-1 min-h-11 w-full border-2 bg-transparent px-3 text-base focus:outline-none"
				style="border-color: var(--lp-ink)"
			/>
			<p class="mt-1 text-right text-xs opacity-50">{title.length}/200</p>
		</div>

		{#if suggestions.length > 0}
			<!-- Dedup as invitation, not block (M0-02): tap opens the thread,
			     the user can always proceed. -->
			<div class="border-2 p-3" style="border-color: var(--lp-ink)">
				<p class="lp-mono text-xs font-bold tracking-[0.15em] uppercase">
					<span class="lp-amber">·</span> Diskusi ini mungkin sudah ada
				</p>
				<ul class="mt-2 flex flex-col gap-1.5">
					{#each suggestions as s (s.id)}
						<li>
							<a
								href="/diskusi/{s.slug}"
								class="flex items-center justify-between gap-2 px-2 py-1.5 text-sm hover:bg-[#141210]/5"
							>
								<span class="lp-link">{s.title}</span>
								<ThreadStatusBadge status={s.status} />
							</a>
						</li>
					{/each}
				</ul>
				<p class="mt-2 text-xs opacity-70">
					Kalau pertanyaanmu memang beda, lanjut aja — kamu tetap bisa bikin diskusi baru.
				</p>
			</div>
		{/if}

		<div>
			<span class="lp-mono text-xs font-bold tracking-[0.2em] uppercase">Isi</span>
			{#if ready}
				{#await import('$lib/components/RichEditor.svelte') then { default: RichEditor }}
					<div class="mt-1">
						<RichEditor
							content={restored}
							onupdate={(payload) => {
								json = payload.json;
								html = payload.html;
								text = payload.text;
								saveDraft();
							}}
						/>
					</div>
				{/await}
			{/if}
		</div>

		{#if form?.error}
			<div class="border-2 p-3 text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">
				{#if form.explanation}
					{form.explanation}
				{:else if form.error === 'party_membership_required'}
					Kamu perlu gabung partai dulu buat buka diskusi.
				{:else}
					Gagal bikin diskusi. Coba lagi.
				{/if}
			</div>
		{/if}

		<input type="hidden" name="content" value={text.trim() ? JSON.stringify(json) : ''} />
		<input type="hidden" name="html" value={text.trim() ? html : ''} />

		<div>
			<button
				type="submit"
				disabled={!title.trim() || submitting}
				class="lp-btn inline-block disabled:opacity-40"
			>
				{submitting ? 'Menerbitkan…' : 'Terbitkan diskusi'}
			</button>
		</div>
	</form>
</main>
