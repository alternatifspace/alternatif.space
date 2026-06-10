<script lang="ts">
	import { enhance } from '$app/forms';
	import { PARAM_LABELS, MEMBERSHIP_MODEL_LABELS, formatParam } from '$lib/governance';
	import { formatRelativeDays } from '$lib/format';
	import type { GovernanceConfig } from '$lib/types';

	let { data, form } = $props();

	const party = $derived(data.party);
	const isMemberHere = $derived(data.membership?.party_id === party.id);
	const inOtherParty = $derived(!!data.membership && data.membership.party_id !== party.id);
	const model = $derived(party.governance_config.membership_model);

	let confirmLeave = $state(false);

	const GOVERNANCE_KEYS: Array<keyof GovernanceConfig> = [
		'recall_petition_threshold',
		'recall_vote_threshold',
		'manifesto_approval',
		'membership_model',
		'member_removal_authority',
		'mufakat_voice'
	];
</script>

<svelte:head>
	<!-- OG meta per party (P0-13, 5.19); og:image is the pre-composed share card -->
	<title>{party.name} — partai.alternatif.space</title>
	<meta property="og:title" content={party.name} />
	<meta property="og:description" content={party.tagline ?? 'Partai di alternatif.space'} />
	{#if party.share_card_url}
		<meta property="og:image" content={party.share_card_url} />
	{/if}
	<meta property="og:type" content="website" />
</svelte:head>

<main class="mx-auto max-w-3xl p-4">
	{#if party.status === 'pending_review'}
		<div class="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-800">
			Partai ini sedang ditinjau moderator (target 24 jam). Hanya kamu yang bisa melihat halaman ini.
		</div>
	{/if}

	<!-- Hero (5.12): logo, name, tagline, status pills — no archetype label, ever -->
	<header class="flex items-start gap-4">
		{#if party.logo_url}
			<img src={party.logo_url} alt="" class="h-20 w-20 rounded-lg object-cover" />
		{:else}
			<div class="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-200 text-3xl font-bold text-slate-500">
				{party.name.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div class="min-w-0">
			<h1 class="text-2xl font-bold">{party.name}</h1>
			{#if party.tagline}<p class="mt-1 text-gray-600">{party.tagline}</p>{/if}
			<div class="mt-2 flex flex-wrap gap-2 text-xs font-medium">
				{#if party.status === 'dormant'}
					<span class="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800">Dorman</span>
				{:else if party.status === 'dissolved'}
					<span class="rounded-full bg-gray-200 px-2 py-0.5 text-gray-600">Dibubarkan</span>
				{:else if party.status === 'active'}
					<span class="rounded-full bg-green-100 px-2 py-0.5 text-green-800">Aktif</span>
				{/if}
				<span class="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">{MEMBERSHIP_MODEL_LABELS[model]}</span>
			</div>
		</div>
	</header>

	<!-- Member count + leader + last-active indicator (5.16) -->
	<p class="mt-4 text-sm text-gray-600">
		{data.memberCount} anggota · Ketua: <strong>{data.leader?.display_name ?? '—'}</strong>
		<span class="text-gray-400">· terakhir aktif {formatRelativeDays(party.leader_last_active_at)}</span>
		· <a href="/partai/{party.slug}/anggota" class="underline">lihat anggota</a>
	</p>

	<!-- Already-in-party gate (5.31) -->
	{#if form?.gate === 'already_member' || (inOtherParty && !isMemberHere)}
		{#if form?.gate === 'already_member' || inOtherParty}
			<div class="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
				Kamu sudah tergabung di
				<a href="/partai/{data.membership?.party.slug}" class="font-semibold underline">{data.membership?.party.name}</a>.
				Untuk pindah, tinggalkan partaimu dulu — perpindahan ini <strong>tercatat permanen di riwayat profilmu</strong>.
			</div>
		{/if}
	{/if}

	<!-- Join CTA per membership model (5.17) -->
	{#if party.status !== 'dissolved' && party.status !== 'pending_review' && !isMemberHere && !inOtherParty}
		<section class="mt-6 rounded-lg border border-gray-200 p-4">
			{#if !data.user}
				<a href="/masuk" class="font-semibold text-slate-800 underline">Masuk untuk bergabung</a>
			{:else if data.inviteToken}
				<!-- Invite redemption: CTA pre-activated (P0-10) -->
				<form method="POST" action="?/redeem" use:enhance>
					<input type="hidden" name="token" value={data.inviteToken} />
					<p class="text-sm text-gray-700">Kamu diundang bergabung dengan {party.name}.</p>
					{#if form?.inviteError}
						<p class="mt-1 text-sm text-red-600">
							{form.inviteError === 'token_expired'
								? 'Undangan sudah kedaluwarsa.'
								: form.inviteError === 'token_already_used'
									? 'Undangan sudah dipakai.'
									: 'Undangan tidak valid.'}
						</p>
					{/if}
					<button class="mt-2 min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white hover:bg-slate-700">
						Terima undangan
					</button>
				</form>
			{:else if model === 'open'}
				<form method="POST" action="?/join" use:enhance>
					<button class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white hover:bg-slate-700">
						Bergabung
					</button>
				</form>
			{:else if model === 'application'}
				{#if form?.applied || data.hasPendingApplication}
					<p class="text-sm text-gray-700">
						Lamaranmu sudah terkirim dan menunggu tinjauan ketua. Kamu akan diberi tahu saat ada keputusan.
					</p>
				{:else}
					<form method="POST" action="?/apply" use:enhance class="flex flex-col gap-2">
						<label class="text-sm font-medium" for="message">Lamaran bergabung</label>
						<textarea
							id="message"
							name="message"
							maxlength="500"
							rows="4"
							class="rounded-md border border-gray-300 px-3 py-2"
							placeholder="Ceritakan kenapa kamu ingin bergabung (maks. 500 karakter)"
						></textarea>
						<button class="min-h-11 self-start rounded-md bg-slate-800 px-6 font-semibold text-white hover:bg-slate-700">
							Kirim lamaran
						</button>
					</form>
				{/if}
			{:else}
				<p class="text-sm text-gray-700">
					Partai ini <strong>hanya menerima anggota lewat undangan</strong>. Minta tautan undangan dari
					anggota yang kamu kenal.
				</p>
			{/if}
			{#if form?.error}<p class="mt-2 text-sm text-red-600">{form.error}</p>{/if}
		</section>
	{/if}

	<!-- Member panel: invite generation (5.33) + leave (5.35) -->
	{#if isMemberHere}
		<section class="mt-6 flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
			<p class="text-sm text-gray-700">Kamu anggota partai ini{data.isLeader ? ' — dan ketuanya' : ''}.</p>

			{#if model === 'invite_only'}
				<form method="POST" action="?/invite" use:enhance>
					<button class="min-h-11 rounded-md border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50">
						Buat tautan undangan
					</button>
					<span class="ml-2 text-xs text-gray-500">sekali pakai, berlaku 7 hari</span>
				</form>
				{#if form?.inviteUrl}
					<div class="rounded-md bg-gray-50 p-2 text-sm break-all">
						{form.inviteUrl}
						<button
							type="button"
							class="ml-2 text-xs font-semibold text-slate-700 underline"
							onclick={() => navigator.clipboard.writeText(form?.inviteUrl ?? '')}
						>
							Salin
						</button>
					</div>
				{/if}
			{/if}

			{#if !data.isLeader}
				{#if confirmLeave}
					<div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm">
						<p class="text-red-900">
							Keluar bersifat permanen sampai kamu mengajukan bergabung lagi.
							<strong>Ini akan tercatat di riwayat profilmu.</strong>
						</p>
						<div class="mt-2 flex gap-2">
							<form method="POST" action="?/leave" use:enhance>
								<button class="min-h-10 rounded-md bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-500">
									Ya, keluar dari partai
								</button>
							</form>
							<button
								type="button"
								class="min-h-10 rounded-md border border-gray-300 px-4 text-sm"
								onclick={() => (confirmLeave = false)}
							>
								Batal
							</button>
						</div>
					</div>
				{:else}
					<button
						type="button"
						class="self-start text-sm text-red-700 underline"
						onclick={() => (confirmLeave = true)}
					>
						Keluar dari partai
					</button>
				{/if}
			{/if}
		</section>
	{/if}

	<!-- Leader review panel (P0-09) -->
	{#if data.isLeader && data.pendingApplications.length > 0}
		<section class="mt-6 rounded-lg border border-gray-200 p-4">
			<h2 class="font-semibold">Lamaran menunggu ({data.pendingApplications.length})</h2>
			<ul class="mt-3 flex flex-col gap-3">
				{#each data.pendingApplications as app (app.id)}
					<li class="rounded-md bg-gray-50 p-3">
						<p class="text-sm font-medium">{app.applicant?.display_name ?? '—'}</p>
						{#if app.message}<p class="mt-1 text-sm text-gray-600">{app.message}</p>{/if}
						<div class="mt-2 flex gap-2">
							<form method="POST" action="?/review" use:enhance>
								<input type="hidden" name="application_id" value={app.id} />
								<button name="decision" value="approve" class="min-h-10 rounded-md bg-green-700 px-4 text-sm font-semibold text-white hover:bg-green-600">
									Terima
								</button>
							</form>
							<form method="POST" action="?/review" use:enhance>
								<input type="hidden" name="application_id" value={app.id} />
								<button name="decision" value="reject" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm hover:bg-gray-100">
									Tolak
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Current stance (5.14) -->
	{#if party.current_stance}
		<section class="mt-8">
			<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Sikap saat ini</h2>
			<p class="mt-2 rounded-md border-l-4 border-slate-800 bg-gray-50 p-3 text-gray-800">
				{party.current_stance}
			</p>
		</section>
	{/if}

	<!-- Full manifesto (5.13): rendered TipTap HTML, read-only -->
	{#if party.manifesto_html}
		<section class="mt-8">
			<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Manifesto</h2>
			<div class="prose prose-slate mt-2 max-w-none">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html party.manifesto_html}
			</div>
		</section>
	{/if}

	<!-- Governance config (5.15): raw parameter values, no archetype label (Q7) -->
	<section class="mt-8">
		<h2 class="text-sm font-semibold tracking-wide text-gray-500 uppercase">Tata kelola</h2>
		<dl class="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-200">
			{#each GOVERNANCE_KEYS as key (key)}
				<div class="flex items-center justify-between gap-4 p-3 text-sm">
					<dt class="text-gray-600">{PARAM_LABELS[key]}</dt>
					<dd class="font-medium text-gray-900">{formatParam(key, party.governance_config[key])}</dd>
				</div>
			{/each}
		</dl>
	</section>
</main>
