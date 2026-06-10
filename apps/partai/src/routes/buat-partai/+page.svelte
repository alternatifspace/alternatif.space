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
	const draft = new CreatePartyDraft();
	const ctx = useClerkContext();

	let restored = $state(false);
	let publishing = $state(false);

	const ARCHETYPES: Archetype[] = ['vanguard', 'republic', 'commune', 'custom'];
	const PETITION_OPTIONS = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
	const VOTE_OPTIONS = [0.501, 0.55, 0.6, 0.65, 0.7, 0.75];
	const GOVERNANCE_KEYS: Array<keyof GovernanceConfig> = [
		'recall_petition_threshold',
		'recall_vote_threshold',
		'manifesto_approval',
		'membership_model',
		'member_removal_authority',
		'mufakat_voice'
	];

	const step3Complete = $derived(
		draft.name.trim().length > 0 && draft.manifestoText.trim().length >= 200
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

	function setThreshold(key: 'recall_petition_threshold' | 'recall_vote_threshold', raw: string) {
		draft.config[key] = raw === '' ? null : parseFloat(raw);
	}

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

<main class="mx-auto max-w-2xl p-4 pb-16">
	<h1 class="text-2xl font-bold">Dirikan partai</h1>
	<ol class="mt-3 flex gap-1 text-xs text-gray-400">
		{#each ['Titik awal', 'Tata kelola', 'Identitas', 'Dewan', 'Tinjau'] as label, i (label)}
			<li class="flex-1 border-t-4 pt-1 {draft.step > i ? 'border-slate-800 text-slate-800 font-medium' : 'border-gray-200'}">
				{i + 1}. {label}
			</li>
		{/each}
	</ol>

	<!-- Step 1 — starting point (5.21). Archetype = UI-only pre-fill, never stored (Q7). -->
	{#if draft.step === 1}
		<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
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

	<!-- Step 2 — governance parameters (5.22, 5.23) -->
	{:else if draft.step === 2}
		<div class="mt-6 flex flex-col gap-4">
			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">{PARAM_LABELS.recall_petition_threshold}</span>
				<select
					class="min-h-11 rounded-md border border-gray-300 px-2"
					value={draft.config.recall_petition_threshold?.toString() ?? ''}
					onchange={(e) => setThreshold('recall_petition_threshold', e.currentTarget.value)}
				>
					<option value="" disabled>— pilih —</option>
					{#each PETITION_OPTIONS as v (v)}
						<option value={v.toString()}>{formatPercent(v)} anggota</option>
					{/each}
				</select>
			</label>

			<label class="flex flex-col gap-1">
				<span class="text-sm font-medium">{PARAM_LABELS.recall_vote_threshold}</span>
				<select
					class="min-h-11 rounded-md border border-gray-300 px-2"
					value={draft.config.recall_vote_threshold?.toString() ?? ''}
					onchange={(e) => setThreshold('recall_vote_threshold', e.currentTarget.value)}
				>
					<option value="" disabled>— pilih —</option>
					{#each VOTE_OPTIONS as v (v)}
						<option value={v.toString()}>{v === 0.501 ? '50% + 1' : formatPercent(v)}</option>
					{/each}
				</select>
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

			<div class="flex gap-2">
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 1)}>
					Kembali
				</button>
				<button
					type="button"
					class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white disabled:opacity-40"
					disabled={draft.unsetCount > 0}
					onclick={() => (draft.step = 3)}
				>
					Lanjut
				</button>
			</div>
		</div>

	<!-- Step 3 — identity (5.24): name, logo, tagline, manifesto -->
	{:else if draft.step === 3}
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
				<span class="text-xs {draft.manifestoText.trim().length >= 200 ? 'text-gray-400' : 'text-amber-700'}">
					{draft.manifestoText.trim().length}/200 karakter minimum — draf tersimpan otomatis
				</span>
			</div>

			<div class="flex gap-2">
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 2)}>
					Kembali
				</button>
				<button
					type="button"
					class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white disabled:opacity-40"
					disabled={!step3Complete}
					onclick={() => (draft.step = 4)}
				>
					Lanjut
				</button>
			</div>
		</div>

	<!-- Step 4 — council toggle (5.25) -->
	{:else if draft.step === 4}
		<div class="mt-6 flex flex-col gap-4">
			<label class="flex items-start gap-3 rounded-lg border border-gray-200 p-4">
				<input type="checkbox" bind:checked={draft.councilEnabled} class="mt-1 h-5 w-5" />
				<span>
					<span class="font-medium">Aktifkan dewan</span>
					<span class="mt-1 block text-sm text-gray-600">
						Opsional. Jika aktif, pembuatan peran dewan tersedia setelah terbit (dieksekusi di Fase 2).
					</span>
				</span>
			</label>
			<div class="flex gap-2">
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 3)}>
					Kembali
				</button>
				<button type="button" class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white" onclick={() => (draft.step = 5)}>
					Lanjut
				</button>
			</div>
		</div>

	<!-- Step 5 — review & publish (5.26): config locks permanently on publish -->
	{:else if draft.step === 5}
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
				Setelah terbit, <strong>konfigurasi tata kelola terkunci permanen</strong> dan masa honeymoon
				3 bulan dimulai. Partai akan ditinjau moderator sebelum tampil publik (target 24 jam).
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
				<button type="button" class="min-h-11 rounded-md border border-gray-300 px-5" onclick={() => (draft.step = 4)}>
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
