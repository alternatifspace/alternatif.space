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

	// Upcoming capabilities — presentation-only teaser, not yet built (checklist phase-1 §4, phase-2 §3)
	const UPCOMING_GROUPS: Array<{ phase: string; features: string[] }> = [
		{
			phase: 'Kehidupan internal partai',
			features: [
				'Dashboard partai (pengumuman, diskusi, tata kelola)',
				'Pengumuman & diskusi internal anggota',
				'Pulse check & musyawarah internal',
				'Voting amandemen manifesto',
				'Petisi & voting recall ketua'
			]
		},
		{
			phase: 'Tata kelola lanjutan',
			features: [
				'Peran dewan & delegasi wewenang',
				'Tata tertib anggota (peringatan, mute, suspensi)',
				'Posisi resmi partai di mufakat',
				'Wakil ketua & suksesi kepemimpinan'
			]
		}
	];
</script>

<svelte:head>
	<!-- OG meta per party (P0-13, 5.19); og:image is the pre-composed share card -->
	<title>{party.name} — partai.alternatif.space</title>
	<meta name="description" content={party.tagline ?? 'Partai di alternatif.space'} />
	<link rel="canonical" href="https://partai.alternatif.space/partai/{party.slug}" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://partai.alternatif.space/partai/{party.slug}" />
	<meta property="og:title" content={party.name} />
	<meta property="og:description" content={party.tagline ?? 'Partai di alternatif.space'} />
	{#if party.share_card_url}
		<meta property="og:image" content={party.share_card_url} />
	{/if}
	<meta property="og:locale" content="id_ID" />
	<meta name="twitter:card" content={party.share_card_url ? 'summary_large_image' : 'summary'} />
	<meta name="twitter:title" content={party.name} />
	<meta name="twitter:description" content={party.tagline ?? 'Partai di alternatif.space'} />
	{#if party.share_card_url}
		<meta name="twitter:image" content={party.share_card_url} />
	{/if}
</svelte:head>

<div class="mx-auto max-w-5xl px-5 py-10">
<div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
<main class="min-w-0">
	{#if party.status === 'pending_review'}
		<div class="mb-6 border-2 p-3 text-sm" style="border-color: var(--lp-ink)">
			<span class="lp-mono lp-amber text-xs font-bold tracking-[0.2em] uppercase">Sedang ditinjau</span>
			<p class="mt-1">
				Partai ini sedang ditinjau moderator (target 24 jam). Hanya kamu yang bisa melihat halaman ini.
			</p>
		</div>
	{/if}

	<!-- Hero (5.12): logo, name, tagline, status pills — no archetype label, ever -->
	<header class="flex items-start gap-4">
		{#if party.logo_url}
			<img src={party.logo_url} alt="" class="h-20 w-20 object-cover" style="border: 2px solid var(--lp-ink)" />
		{:else}
			<div
				class="flex h-20 w-20 items-center justify-center text-3xl"
				style="border: 2px solid var(--lp-ink); font-family: 'Archivo Black', sans-serif"
			>
				{party.name.charAt(0).toUpperCase()}
			</div>
		{/if}
		<div class="min-w-0">
			<h1 class="lp-display-sm">{party.name}</h1>
			{#if party.tagline}<p class="mt-2 text-lg leading-snug">{party.tagline}</p>{/if}
			<div class="mt-3 flex flex-wrap gap-2">
				{#if party.status === 'dormant'}
					<span class="lp-mono border px-2 py-0.5 text-xs tracking-[0.2em] uppercase" style="border-color: var(--lp-ink)">Dorman</span>
				{:else if party.status === 'dissolved'}
					<span class="lp-mono border px-2 py-0.5 text-xs tracking-[0.2em] uppercase opacity-50" style="border-color: var(--lp-ink)">Dibubarkan</span>
				{:else if party.status === 'active'}
					<span class="lp-mono lp-amber border px-2 py-0.5 text-xs tracking-[0.2em] uppercase" style="border-color: var(--lp-amber)">Aktif</span>
				{/if}
				<span class="lp-mono border px-2 py-0.5 text-xs tracking-[0.2em] uppercase" style="border-color: var(--lp-ink)">{MEMBERSHIP_MODEL_LABELS[model]}</span>
			</div>
		</div>
	</header>

	<!-- Member count + leader + last-active indicator (5.16) -->
	<p class="mt-5 text-sm">
		{data.memberCount} anggota · Ketua: <strong>{data.leader?.display_name ?? '—'}</strong>
		<span class="opacity-50">· terakhir aktif {formatRelativeDays(party.leader_last_active_at)}</span>
		· <a href="/partai/{party.slug}/anggota" class="lp-link lp-amber">lihat anggota</a>
	</p>

	<!-- Already-in-party gate (5.31) -->
	{#if form?.gate === 'already_member' || (inOtherParty && !isMemberHere)}
		{#if form?.gate === 'already_member' || inOtherParty}
			<div class="mt-5 border-2 p-3 text-sm" style="border-color: var(--lp-ink)">
				Kamu sudah tergabung di
				<a href="/partai/{data.membership?.party.slug}" class="lp-link lp-amber-bg font-semibold">{data.membership?.party.name}</a>.
				Untuk pindah, tinggalkan partaimu dulu — perpindahan ini <strong>tercatat permanen di riwayat profilmu</strong>.
			</div>
		{/if}
	{/if}

	<!-- Join CTA per membership model (5.17) -->
	{#if party.status !== 'dissolved' && party.status !== 'pending_review' && !isMemberHere && !inOtherParty}
		<section class="mt-6 border-2 p-5" style="border-color: var(--lp-ink)">
			{#if !data.user}
				<a href="/masuk" class="lp-link lp-amber font-semibold">Masuk untuk bergabung</a>
			{:else if data.inviteToken}
				<!-- Invite redemption: CTA pre-activated (P0-10) -->
				<form method="POST" action="?/redeem" use:enhance>
					<input type="hidden" name="token" value={data.inviteToken} />
					<p class="text-sm">Kamu diundang bergabung dengan {party.name}.</p>
					{#if form?.inviteError}
						<p class="mt-2 border-2 px-3 py-2 lp-mono text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">
							{form.inviteError === 'token_expired'
								? 'Undangan sudah kedaluwarsa.'
								: form.inviteError === 'token_already_used'
									? 'Undangan sudah dipakai.'
									: 'Undangan tidak valid.'}
						</p>
					{/if}
					<button class="lp-btn mt-3 inline-block">Terima undangan</button>
				</form>
			{:else if model === 'open'}
				<form method="POST" action="?/join" use:enhance>
					<button class="lp-btn inline-block">Bergabung</button>
				</form>
			{:else if model === 'application'}
				{#if form?.applied || data.hasPendingApplication}
					<p class="text-sm">
						Lamaranmu sudah terkirim dan menunggu tinjauan ketua. Kamu akan diberi tahu saat ada keputusan.
					</p>
				{:else}
					<form method="POST" action="?/apply" use:enhance class="flex flex-col gap-2">
						<label class="lp-mono text-xs font-bold tracking-[0.2em] uppercase" for="message">Lamaran bergabung</label>
						<textarea
							id="message"
							name="message"
							maxlength="500"
							rows="4"
							class="border-2 bg-transparent px-3 py-2 text-sm"
							style="border-color: var(--lp-ink)"
							placeholder="Ceritakan kenapa kamu ingin bergabung (maks. 500 karakter)"
						></textarea>
						<button class="lp-btn mt-1 inline-block self-start">Kirim lamaran</button>
					</form>
				{/if}
			{:else}
				<p class="text-sm">
					Partai ini <strong>hanya menerima anggota lewat undangan</strong>. Minta tautan undangan dari
					anggota yang kamu kenal.
				</p>
			{/if}
			{#if form?.error}
				<p class="mt-3 border-2 px-3 py-2 lp-mono text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">{form.error}</p>
			{/if}
		</section>
	{/if}

	<!-- Member panel: invite generation (5.33) + leave (5.35) -->
	{#if isMemberHere}
		<section class="mt-6 flex flex-col gap-3 border-2 p-5" style="border-color: var(--lp-ink)">
			<p class="text-sm">Kamu anggota partai ini{data.isLeader ? ' — dan ketuanya' : ''}.</p>

			{#if model === 'invite_only'}
				<form method="POST" action="?/invite" use:enhance>
					<button class="lp-btn-ghost inline-block text-sm">Buat tautan undangan</button>
					<span class="ml-2 text-xs opacity-60">sekali pakai, berlaku 7 hari</span>
				</form>
				{#if form?.inviteUrl}
					<div class="border-2 p-2 lp-mono text-sm break-all" style="border-color: var(--lp-ink)">
						{form.inviteUrl}
						<button
							type="button"
							class="lp-link lp-amber ml-2 text-xs font-semibold"
							onclick={() => navigator.clipboard.writeText(form?.inviteUrl ?? '')}
						>
							Salin
						</button>
					</div>
				{/if}
			{/if}

			{#if !data.isLeader}
				{#if confirmLeave}
					<!-- Destructive: red is intentionally retained here (leave is the one danger action) -->
					<div class="rounded-md border border-red-300 bg-red-50 p-3 text-sm">
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
								class="min-h-10 border-2 px-4 text-sm"
								style="border-color: var(--lp-ink)"
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
		<section class="mt-6 border-2 p-5" style="border-color: var(--lp-ink)">
			<h2 class="lp-h2">Lamaran menunggu ({data.pendingApplications.length})</h2>
			<ul class="mt-4 flex flex-col gap-3">
				{#each data.pendingApplications as app (app.id)}
					<li class="border p-3" style="border-color: var(--lp-ink)">
						<p class="text-sm font-medium">{app.applicant?.display_name ?? '—'}</p>
						{#if app.message}<p class="mt-1 text-sm opacity-80">{app.message}</p>{/if}
						<div class="mt-3 flex gap-2">
							<form method="POST" action="?/review" use:enhance>
								<input type="hidden" name="application_id" value={app.id} />
								<button name="decision" value="approve" class="lp-btn inline-block text-sm">Terima</button>
							</form>
							<form method="POST" action="?/review" use:enhance>
								<input type="hidden" name="application_id" value={app.id} />
								<button name="decision" value="reject" class="lp-btn-ghost inline-block text-sm">Tolak</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<!-- Current stance (5.14) -->
	{#if party.current_stance}
		<section class="mt-10">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">·</span> Sikap saat ini
			</p>
			<p class="mt-3 border-l-4 p-3" style="border-color: var(--lp-amber)">
				{party.current_stance}
			</p>
		</section>
	{/if}

	<!-- Full manifesto (5.13): rendered TipTap HTML, read-only -->
	{#if party.manifesto_html}
		<section class="mt-10">
			<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
				<span class="lp-amber font-bold">·</span> Manifesto
			</p>
			<div class="prose prose-slate mt-3 max-w-none">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html party.manifesto_html}
			</div>
		</section>
	{/if}

	<!-- Governance config (5.15): raw parameter values, no archetype label (Q7) -->
	<section class="mt-10">
		<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
			<span class="lp-amber font-bold">·</span> Tata kelola
		</p>
		<table class="lp-table mt-3">
			<tbody>
				{#each GOVERNANCE_KEYS as key (key)}
					<tr>
						<td>{PARAM_LABELS[key]}</td>
						<td>{formatParam(key, party.governance_config[key])}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>
</main>

<!-- Coming soon: preview of Phase 1/2 internal party life — presentation-only, nothing clickable -->
<aside class="lg:sticky lg:top-6 lg:self-start">
	<p class="lp-mono text-xs tracking-[0.25em] uppercase opacity-60">
		<span class="lp-amber font-bold">·</span> Segera hadir
	</p>
	<p class="mt-3 text-sm opacity-80">
		Saat partai mulai hidup secara internal, kemampuan-kemampuan ini akan terbuka di sini.
	</p>
	<div class="mt-4 border-2" style="border-color: var(--lp-ink)">
		{#each UPCOMING_GROUPS as group (group.phase)}
			<div class="border-b-2 last:border-b-0" style="border-color: var(--lp-ink)">
				<div class="flex items-center justify-between gap-2 px-3 py-2" style="background: rgba(20, 18, 16, 0.04)">
					<p class="lp-mono text-xs font-bold tracking-[0.15em] uppercase">{group.phase}</p>
					<span class="lp-mono shrink-0 border px-2 py-0.5 text-xs tracking-[0.2em] uppercase opacity-60" style="border-color: rgba(20, 18, 16, 0.4)">
						Segera
					</span>
				</div>
				<ul>
					{#each group.features as feature (feature)}
						<li class="border-t px-3 py-2.5 text-sm opacity-80 first:border-t-0" style="border-color: rgba(20, 18, 16, 0.15)">
							{feature}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</aside>
</div>
</div>
