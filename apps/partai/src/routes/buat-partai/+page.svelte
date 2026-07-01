<script lang="ts">
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { useClerkContext } from 'svelte-clerk';
	import { CreatePartyDraft, type SerializedDraft } from '$lib/stores/createPartyDraft.svelte';
	import {
		ARCHETYPE_COPY,
		OPTION_LABELS,
		PARAM_LABELS,
		RECALL_PETITION_RANGE,
		RECALL_VOTE_RANGE,
		formatParam,
		formatPercent,
		type Archetype
	} from '$lib/governance';
	import type { GovernanceConfig } from '$lib/types';
	import ManifestoEditor from '$lib/components/ManifestoEditor.svelte';
	import LogoUpload from '$lib/components/LogoUpload.svelte';
	import { supabaseBrowser } from '$lib/supabase';

	let { form } = $props();

	const DRAFT_KEY = 'buat-partai-draft';
	const MANIFESTO_MIN_WORDS = 50;
	const draft = new CreatePartyDraft();
	const ctx = useClerkContext();

	let restored = $state(false);
	let publishing = $state(false);

	const ARCHETYPES: Archetype[] = ['vanguard', 'republic', 'commune', 'custom'];
	const GOVERNANCE_KEYS: Array<keyof GovernanceConfig> = [
		'recall_petition_threshold',
		'recall_vote_threshold',
		'manifesto_approval',
		'membership_model',
		'member_removal_authority',
		'mufakat_voice'
	];

	const manifestoWordCount = $derived(
		draft.manifestoText.trim().split(/\s+/).filter(Boolean).length
	);
	const identityComplete = $derived(
		draft.name.trim().length > 0 && manifestoWordCount >= MANIFESTO_MIN_WORDS
	);

	// Auto-save draft (P0-06): everything except the logo blob.
	onMount(() => {
		const saved = localStorage.getItem(DRAFT_KEY);
		if (saved) {
			try {
				draft.restore(JSON.parse(saved) as SerializedDraft);
			} catch {
				localStorage.removeItem(DRAFT_KEY);
			}
		}
		restored = true;
	});
	$effect(() => {
		const snapshot = JSON.stringify(draft.serialize());
		if (restored) localStorage.setItem(DRAFT_KEY, snapshot);
	});

	// The vote slider runs 50%–75%; its bottom stop means the TRD's "50% + 1"
	// (stored as 0.501). Rounding strips range-input float noise.
	const VOTE_SLIDER_MIN = 0.5;
	function setPetition(raw: string) {
		draft.config.recall_petition_threshold = Math.round(parseFloat(raw) * 1000) / 1000;
	}
	function setVote(raw: string) {
		const v = Math.round(parseFloat(raw) * 1000) / 1000;
		draft.config.recall_vote_threshold = v === VOTE_SLIDER_MIN ? 0.501 : v;
	}
	const voteSliderValue = $derived(
		draft.config.recall_vote_threshold === 0.501
			? VOTE_SLIDER_MIN
			: (draft.config.recall_vote_threshold ?? 0.6)
	);

	async function uploadLogoAndFinish(partyId: string, slug: string) {
		if (draft.logoBlob) {
			const sb = supabaseBrowser(
				() => ctx.session?.getToken({ template: 'supabase' }) ?? Promise.resolve(null)
			);
			const path = `${partyId}/logo.webp`;
			const { error: uploadErr } = await sb.storage
				.from('party-logos')
				.upload(path, draft.logoBlob, { contentType: 'image/webp', upsert: true });
			if (!uploadErr) {
				const { data: pub } = sb.storage.from('party-logos').getPublicUrl(path);
				await sb.from('parties').update({ logo_url: pub.publicUrl }).eq('id', partyId);
			}
		}
		localStorage.removeItem(DRAFT_KEY);
		await goto(`/partai/${slug}`);
	}
</script>

<svelte:head>
	<title>Dirikan partai — partai.alternatif.space</title>
</svelte:head>

{#snippet governanceParams()}
	<div class="flex flex-col gap-4">
		<label class="flex flex-col gap-1">
			<span class="flex justify-between text-sm">
				<span class="font-medium">{PARAM_LABELS.recall_petition_threshold}</span>
				<span class="text-gray-600">
					{draft.config.recall_petition_threshold === null
						? '—'
						: `${formatPercent(draft.config.recall_petition_threshold)} anggota`}
				</span>
			</span>
			<input
				type="range"
				min={RECALL_PETITION_RANGE.min}
				max={RECALL_PETITION_RANGE.max}
				step={RECALL_PETITION_RANGE.step}
				value={draft.config.recall_petition_threshold ?? 0.3}
				oninput={(e) => setPetition(e.currentTarget.value)}
				class="min-h-11 accent-slate-800"
			/>
			<span class="flex justify-between text-xs text-gray-400">
				<span>{formatPercent(RECALL_PETITION_RANGE.min)}</span>
				<span>{formatPercent(RECALL_PETITION_RANGE.max)}</span>
			</span>
		</label>

		<label class="flex flex-col gap-1">
			<span class="flex justify-between text-sm">
				<span class="font-medium">{PARAM_LABELS.recall_vote_threshold}</span>
				<span class="text-gray-600">
					{draft.config.recall_vote_threshold === null
						? '—'
						: draft.config.recall_vote_threshold === 0.501
							? '50% + 1'
							: formatPercent(draft.config.recall_vote_threshold)}
				</span>
			</span>
			<input
				type="range"
				min={VOTE_SLIDER_MIN}
				max={RECALL_VOTE_RANGE.max}
				step={RECALL_VOTE_RANGE.step}
				value={voteSliderValue}
				oninput={(e) => setVote(e.currentTarget.value)}
				class="min-h-11 accent-slate-800"
			/>
			<span class="flex justify-between text-xs text-gray-400">
				<span>50% + 1</span>
				<span>{formatPercent(RECALL_VOTE_RANGE.max)}</span>
			</span>
		</label>

		{#each ['manifesto_approval', 'membership_model', 'member_removal_authority', 'mufakat_voice'] as const as key (key)}
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">{PARAM_LABELS[key]}</span>
				<select
					class="min-h-11 rounded-md border border-gray-300 px-2"
					value={draft.config[key] ?? ''}
					onchange={(e) => {
						// @ts-expect-error narrow per-key union assignment
						draft.config[key] = e.currentTarget.value === '' ? null : e.currentTarget.value;
					}}
				>
					<option value="" disabled>— pilih —</option>
					{#each Object.entries(OPTION_LABELS[key]) as [value, label] (value)}
						<option {value}>{label}</option>
					{/each}
				</select>
			</label>
		{/each}

		{#if draft.unsetCount > 0}
			<!-- Custom-path completion counter (5.23) -->
			<p class="text-sm text-amber-700">
				{draft.unsetCount} dari {draft.totalParams} parameter belum diatur
			</p>
		{/if}
	</div>
{/snippet}

<main class="mx-auto max-w-2xl p-4 pb-16">
	<h1 class="text-2xl font-bold">Dirikan partai</h1>
	<ol class="mt-3 flex gap-1 text-xs text-gray-400">
		{#each ['Titik awal', 'Identitas', 'Dewan', 'Tinjau'] as label, i (label)}
			<li class="flex-1 border-t-4 pt-1 {draft.step > i ? 'border-slate-800 text-slate-800 font-medium' : 'border-gray-200'}">
				{i + 1}. {label}
			</li>
		{/each}
	</ol>

	<!-- Step 1 — starting point + governance parameters (5.21–5.23).
	     Archetype = UI-only pre-fill, never stored (Q7). The parameter form
	     lives under the cards: always open for Custom, collapsible for presets. -->
	{#if draft.step === 1}
		<div class="mt-6 flex flex-col gap-4">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
				{#each ARCHETYPES as archetype (archetype)}
					<button
						type="button"
						class="rounded-lg border-2 p-4 text-left hover:border-slate-400 {draft.archetype === archetype
							? 'border-slate-800'
							: 'border-gray-200'}"
						onclick={() => draft.selectArchetype(archetype)}
					>
						<span class="block font-bold">{ARCHETYPE_COPY[archetype].name}</span>
						<span class="mt-1 block text-sm text-gray-600">"{ARCHETYPE_COPY[archetype].tagline}"</span>
					</button>
				{/each}
			</div>

			{#if draft.archetype === 'custom'}
				<section class="rounded-lg border border-gray-200 p-4">
					<h2 class="mb-4 font-semibold">Setel aturan mainnya</h2>
					{@render governanceParams()}
				</section>
			{:else if draft.archetype}
				<details class="rounded-lg border border-gray-200 p-4">
					<summary class="cursor-pointer font-semibold">Lihat & sesuaikan aturan mainnya</summary>
					<div class="mt-4">
						{@render governanceParams()}
					</div>
				</details>
			{/if}

			{#if draft.archetype}
				<p class="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
					Aturan main ini <strong>terkunci permanen</strong> begitu partai terbit — pilih dengan
					sadar. Masa honeymoon 3 bulan jalan setelah terbit; selama itu recall ketua belum
					bisa dimulai.
				</p>
			{/if}

			<div>
				<button
					type="button"
					class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white disabled:opacity-40"
					disabled={!draft.archetype || draft.unsetCount > 0}
					onclick={() => (draft.step = 2)}
				>
					Lanjut
				</button>
			</div>
		</div>

	<!-- Step 2 — identity (5.24): name, logo, tagline, manifesto -->
	{:else if draft.step === 2}
		<div class="mt-6 flex flex-col gap-4">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Nama partai</span>
				<input bind:value={draft.name} maxlength="80" class="min-h-11 rounded-md border border-gray-300 px-3" />
			</label>

			<div class="flex flex-col gap-1">
				<span class="text-sm font-medium">Logo</span>
				<LogoUpload
					preview={draft.logoPreview}
					onselect={({ blob, previewUrl }) => {
						draft.logoBlob = blob;
						draft.logoPreview = previewUrl;
					}}
				/>
			</div>

			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">Tagline</span>
				<input bind:value={draft.tagline} maxlength="120" class="min-h-11 rounded-md border border-gray-300 px-3" />
			</label>

			<div class="flex flex-col gap-1">
				<span class="text-sm font-medium">Manifesto</span>
				{#if restored}
					<ManifestoEditor
						content={draft.manifesto}
						onupdate={({ json, html, text }) => {
							draft.manifesto = json;
							draft.manifestoHtml = html;
							draft.manifestoText = text;
						}}
					/>
				{/if}
				<span class="text-xs {manifestoWordCount >= MANIFESTO_MIN_WORDS ? 'text-gray-400' : 'text-amber-700'}">
					{manifestoWordCount}/{MANIFESTO_MIN_WORDS} kata minimum — draf tersimpan otomatis
				</span>
			</div>

			<div class="flex gap-2">
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 1)}>
					Kembali
				</button>
				<button
					type="button"
					class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white disabled:opacity-40"
					disabled={!identityComplete}
					onclick={() => (draft.step = 3)}
				>
					Lanjut
				</button>
			</div>
		</div>

	<!-- Step 3 — council toggle (5.25) -->
	{:else if draft.step === 3}
		<div class="mt-6 flex flex-col gap-4">
			<label class="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
				<input type="checkbox" bind:checked={draft.councilEnabled} class="mt-1 h-5 w-5" />
				<span>
					<span class="font-medium">Aktifkan dewan</span>
					<span class="mt-1 block text-sm text-gray-600">
						Opsional. Kalau aktif, pengaturan peran dewan menyusul setelah partai terbit.
					</span>
				</span>
			</label>
			<div class="flex gap-2">
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 2)}>
					Kembali
				</button>
				<button type="button" class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white" onclick={() => (draft.step = 4)}>
					Lanjut
				</button>
			</div>
		</div>

	<!-- Step 4 — review & publish (5.26): config locks permanently on publish -->
	{:else if draft.step === 4}
		<div class="mt-6 flex flex-col gap-4">
			<section class="rounded-lg border border-gray-200 p-4">
				<div class="flex items-center gap-3">
					{#if draft.logoPreview}<img src={draft.logoPreview} alt="" class="h-14 w-14 rounded-lg object-cover" />{/if}
					<div>
						<p class="font-bold">{draft.name}</p>
						{#if draft.tagline}<p class="text-sm text-gray-600">{draft.tagline}</p>{/if}
					</div>
				</div>
				<dl class="mt-4 divide-y divide-gray-100 text-sm">
					{#each GOVERNANCE_KEYS as key (key)}
						<div class="flex justify-between gap-4 py-2">
							<dt class="text-gray-600">{PARAM_LABELS[key]}</dt>
							<dd class="font-medium">
								{draft.config[key] === null ? '—' : formatParam(key, draft.config[key]!)}
							</dd>
						</div>
					{/each}
					<div class="flex justify-between gap-4 py-2">
						<dt class="text-gray-600">Dewan</dt>
						<dd class="font-medium">{draft.councilEnabled ? 'Aktif' : 'Tidak aktif'}</dd>
					</div>
				</dl>
			</section>

			<div class="rounded-md bg-amber-50 p-3 text-sm text-amber-900">
				Setelah terbit, <strong>aturan main terkunci permanen</strong> dan masa honeymoon
				3 bulan dimulai. Sebelum tampil publik, partai kamu ditinjau moderator dulu (target 24 jam).
			</div>

			{#if form?.error}<p class="text-sm text-red-600">{form.error}</p>{/if}

			<form
				method="POST"
				action="?/publish"
				use:enhance={() => {
					publishing = true;
					return async ({ result, update }) => {
						if (result.type === 'success' && result.data?.published) {
							await uploadLogoAndFinish(result.data.partyId as string, result.data.slug as string);
						} else {
							publishing = false;
							await update();
						}
					};
				}}
				class="flex gap-2"
			>
				<!-- Raw values only — the archetype is never sent anywhere (Q7) -->
				<input type="hidden" name="name" value={draft.name} />
				<input type="hidden" name="tagline" value={draft.tagline} />
				<input type="hidden" name="config" value={JSON.stringify(draft.config)} />
				<input type="hidden" name="manifesto" value={JSON.stringify(draft.manifesto)} />
				<input type="hidden" name="manifesto_html" value={draft.manifestoHtml} />
				<input type="hidden" name="manifesto_text" value={draft.manifestoText} />
				<input type="hidden" name="council_enabled" value={draft.councilEnabled.toString()} />
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 3)}>
					Kembali
				</button>
				<button
					type="submit"
					disabled={publishing}
					class="min-h-11 rounded-md bg-slate-800 px-8 font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
				>
					{publishing ? 'Menerbitkan…' : 'Terbitkan partai'}
				</button>
			</form>
		</div>
	{/if}
</main>
