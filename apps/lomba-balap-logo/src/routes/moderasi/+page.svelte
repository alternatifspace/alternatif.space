<script lang="ts">
	import { enhance } from '$app/forms';
	import { imageUrl } from '$lib/images';

	let { data } = $props();

	// Track which card's reject form is expanded.
	let rejecting = $state<string | null>(null);

	function fmt(ts: string) {
		return new Date(ts).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
	}
</script>

<svelte:head><title>Moderasi · Lomba Balap Logo</title></svelte:head>

<div class="flex items-center justify-between">
	<h1 class="text-3xl">Moderasi</h1>
	<span class="rounded-full bg-ink px-3 py-1 text-sm font-semibold text-amber">{data.pending.length} antre</span>
</div>

{#if data.pending.length === 0}
	<p class="mt-6 rounded-xl border border-dashed border-[var(--color-border-warm)] p-8 text-center text-ink/50">
		Antrean kosong. Mantap.
	</p>
{:else}
	<ul class="mt-5 space-y-4">
		{#each data.pending as s (s.id)}
			<li class="rounded-2xl border border-[var(--color-border-warm)] bg-white p-4">
				<div class="flex gap-4">
					<img src={imageUrl(s.image_key)} alt={s.title} class="h-28 w-28 shrink-0 rounded-xl object-contain ring-1 ring-[var(--color-border-warm)]" />
					<div class="min-w-0 flex-1">
						<h2 class="font-semibold">{s.title}</h2>
						{#if s.caption}<p class="mt-1 text-sm text-ink/60">{s.caption}</p>{/if}
						<p class="mt-1 text-xs text-ink/40">Dikirim {fmt(s.created_at)}</p>

						<div class="mt-3 flex flex-wrap gap-2">
							<form method="POST" action="?/approve" use:enhance class="contents">
								<input type="hidden" name="id" value={s.id} />
								<button type="submit" class="min-h-10 rounded-lg bg-success px-4 py-2 text-sm font-semibold text-white hover:brightness-95">Setujui</button>
							</form>
							<button
								type="button"
								onclick={() => (rejecting = rejecting === s.id ? null : s.id)}
								class="min-h-10 rounded-lg border border-error/40 px-4 py-2 text-sm font-semibold text-error hover:bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)]"
								>Tolak</button
							>
						</div>

						{#if rejecting === s.id}
							<form method="POST" action="?/reject" use:enhance={() => async ({ update }) => { await update(); rejecting = null; }} class="mt-3">
								<input type="hidden" name="id" value={s.id} />
								<textarea
									name="reason"
									required
									rows="2"
									placeholder="Alasan penolakan (ditampilkan ke pengirim)"
									class="w-full rounded-lg border border-[var(--color-border-warm)] px-3 py-2 text-sm outline-none focus:border-amber"
								></textarea>
								<button type="submit" class="mt-2 min-h-10 rounded-lg bg-error px-4 py-2 text-sm font-semibold text-white">Konfirmasi tolak</button>
							</form>
						{/if}
					</div>
				</div>
			</li>
		{/each}
	</ul>
{/if}

{#if data.decided.length}
	<h2 class="mt-10 text-xl">Terakhir diputuskan</h2>
	<ul class="mt-3 space-y-2">
		{#each data.decided as s (s.id)}
			<li class="flex items-center gap-3 rounded-lg border border-[var(--color-border-warm)] bg-paper-warm/50 px-3 py-2 text-sm">
				<img src={imageUrl(s.image_key)} alt={s.title} class="h-10 w-10 rounded object-contain" />
				<span class="flex-1 truncate">{s.title}</span>
				<span
					class="rounded-full px-2 py-0.5 text-xs font-semibold"
					class:bg-success={s.status === 'approved'}
					class:text-white={s.status === 'approved'}
					class:bg-error={s.status === 'rejected'}
				>{s.status === 'approved' ? 'Disetujui' : 'Ditolak'}</span>
			</li>
		{/each}
	</ul>
{/if}
