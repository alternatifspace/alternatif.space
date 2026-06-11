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

<main class="mx-auto max-w-3xl p-4">
	<h1 class="text-2xl font-bold">Buat diskusi</h1>
	<p class="mt-1 text-sm text-gray-500">Satu pertanyaan, satu rumah.</p>

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
			<label for="title" class="text-sm font-medium text-gray-700">Judul</label>
			<input
				id="title"
				name="title"
				type="text"
				required
				maxlength={200}
				bind:value={title}
				oninput={onTitleInput}
				placeholder="Pertanyaan atau topik yang ingin kamu angkat"
				class="mt-1 min-h-11 w-full rounded-md border border-gray-300 px-3 text-base focus:border-slate-500 focus:outline-none"
			/>
			<p class="mt-1 text-right text-xs text-gray-400">{title.length}/200</p>
		</div>

		{#if suggestions.length > 0}
			<!-- Dedup as invitation, not block (M0-02): tap opens the thread,
			     the user can always proceed. -->
			<div class="rounded-md border border-amber-200 bg-amber-50 p-3">
				<p class="text-sm font-medium text-amber-900">Diskusi ini mungkin sudah ada:</p>
				<ul class="mt-2 flex flex-col gap-1.5">
					{#each suggestions as s (s.id)}
						<li>
							<a
								href="/diskusi/{s.slug}"
								class="flex items-center justify-between gap-2 rounded px-2 py-1.5 text-sm text-slate-800 hover:bg-amber-100"
							>
								<span class="underline">{s.title}</span>
								<ThreadStatusBadge status={s.status} />
							</a>
						</li>
					{/each}
				</ul>
				<p class="mt-2 text-xs text-amber-800">
					Kalau pertanyaanmu memang berbeda, lanjutkan saja — kamu tetap bisa membuat diskusi baru.
				</p>
			</div>
		{/if}

		<div>
			<span class="text-sm font-medium text-gray-700">Isi</span>
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
			<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
				{#if form.explanation}
					{form.explanation}
				{:else if form.error === 'party_membership_required'}
					Kamu perlu bergabung dengan partai untuk membuka diskusi.
				{:else}
					Gagal membuat diskusi. Coba lagi.
				{/if}
			</div>
		{/if}

		<input type="hidden" name="content" value={text.trim() ? JSON.stringify(json) : ''} />
		<input type="hidden" name="html" value={text.trim() ? html : ''} />

		<div>
			<button
				type="submit"
				disabled={!title.trim() || submitting}
				class="min-h-11 rounded-md bg-slate-800 px-6 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
			>
				{submitting ? 'Menerbitkan…' : 'Terbitkan diskusi'}
			</button>
		</div>
	</form>
</main>
