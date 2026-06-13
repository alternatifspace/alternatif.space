<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	function confirmApprove(name: string) {
		return confirm(`Setujui "${name}"?\n\nStatus → 'active'. Partai akan tampil publik (jelajah, sitemap, halaman bagikan).`);
	}
	function confirmReject(name: string) {
		return confirm(`Tolak "${name}"?\n\nStatus → 'dissolved'. Partai tidak akan tampil publik.`);
	}

	function fmtDate(iso: string) {
		return new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	}
</script>

<header class="mb-8 flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="lp-display-sm">Persetujuan Partai</h1>
		<p class="lp-mono mt-2 text-sm opacity-70">
			Antrean moderasi — status <code class="font-semibold">pending_review</code>
		</p>
	</div>
	<div class="text-right leading-none">
		<div class="lp-num">{data.parties.length}</div>
		<div class="lp-mono mt-1 text-xs tracking-[0.15em] uppercase opacity-60">menunggu</div>
	</div>
</header>

{#if data.loadError}
	<div class="mb-6 flex items-center gap-3 border-2 p-3" style="border-color: var(--lp-ink)">
		<span class="lp-stamp lp-stamp-sm">GAGAL</span>
		<span class="text-sm">Tidak bisa memuat antrean: {data.loadError}</span>
	</div>
{/if}

{#if form?.error}
	<div class="mb-6 flex items-center gap-3 border-2 p-3" style="border-color: var(--lp-ink)">
		<span class="lp-stamp lp-stamp-sm">GAGAL</span>
		<span class="text-sm">{form.error}</span>
	</div>
{/if}
{#if form?.approved}
	<div class="mb-6 flex items-center gap-3 border-2 p-3" style="border-color: var(--lp-amber)">
		<span class="lp-tag lp-tag-amber">disetujui</span>
		<span class="text-sm">Partai sekarang aktif dan tampil publik.</span>
	</div>
{/if}
{#if form?.rejected}
	<div class="mb-6 flex items-center gap-3 border-2 p-3" style="border-color: rgba(20, 18, 16, 0.35)">
		<span class="lp-tag lp-tag-muted">ditolak</span>
		<span class="text-sm">Partai di-set <code>dissolved</code>.</span>
	</div>
{/if}

{#if data.parties.length === 0}
	<div class="lp-card flex flex-col items-center gap-3 p-12 text-center">
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-10 w-10 opacity-40">
			<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
		</svg>
		<p class="lp-h2">Antrean kosong</p>
		<p class="lp-mono text-sm opacity-60">Tidak ada partai yang menunggu peninjauan.</p>
	</div>
{:else}
	<ul class="space-y-6">
		{#each data.parties as party (party.id)}
			<li class="lp-card p-6">
				<div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
					<h2 class="lp-h2">{party.name}</h2>
					<span class="lp-mono text-xs opacity-55">/{party.slug}</span>
				</div>

				{#if party.tagline}
					<p class="mt-2 text-[0.95rem] italic opacity-80">&ldquo;{party.tagline}&rdquo;</p>
				{/if}

				<div class="mt-4 flex flex-wrap gap-2">
					<span class="lp-tag">Pendiri · {party.leader_name}</span>
					<span class="lp-tag lp-tag-muted">{fmtDate(party.created_at)}</span>
					<span class="lp-tag {party.council_enabled ? 'lp-tag-amber' : 'lp-tag-muted'}">
						Dewan {party.council_enabled ? 'aktif' : 'nonaktif'}
					</span>
				</div>

				{#if party.manifesto_html}
					<details class="mt-5 border-t pt-4" style="border-color: rgba(20, 18, 16, 0.15)">
						<summary class="lp-mono cursor-pointer text-sm font-semibold tracking-[0.06em] uppercase select-none">
							Manifesto
						</summary>
						<!-- Founder-authored HTML. Fine for a localhost single-operator
						     tool reviewing its own DB; this never ships to the public. -->
						<div class="prose prose-sm prose-stone mt-4 max-w-none">
							{@html party.manifesto_html}
						</div>
					</details>
				{/if}

				<div class="mt-6 flex flex-wrap gap-3 border-t pt-5" style="border-color: rgba(20, 18, 16, 0.15)">
					<form
						method="POST"
						action="?/approve"
						use:enhance={({ cancel }) => {
							if (!confirmApprove(party.name)) cancel();
						}}
					>
						<input type="hidden" name="party_id" value={party.id} />
						<button type="submit" class="lp-btn">Setujui</button>
					</form>

					<form
						method="POST"
						action="?/reject"
						use:enhance={({ cancel }) => {
							if (!confirmReject(party.name)) cancel();
						}}
					>
						<input type="hidden" name="party_id" value={party.id} />
						<button type="submit" class="lp-btn-ghost">Tolak</button>
					</form>
				</div>
			</li>
		{/each}
	</ul>
{/if}
