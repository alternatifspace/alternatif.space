<script lang="ts">
	// Reply-chain selection (M0-13): checkboxes over the thread's comments in
	// nesting order. The triggering comment stays; selected replies move.
	import { enhance } from '$app/forms';
	import { formatRelativeDays } from '$lib/format';

	let { data, form } = $props();

	// Deliberate initial-value capture: ?dari= descendants seed the selection
	// once; after that the admin's checkbox choices own the state.
	// svelte-ignore state_referenced_locally
	let selected = $state(new Set(data.rows.filter((r) => r.inChain).map((r) => r.id)));
	let label = $state('');
	let title = $state('');
	let submitting = $state(false);

	function toggle(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selected = next;
	}
</script>

<svelte:head>
	<title>Spin-off — Moderasi</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10 pb-16">
	<a href="/moderasi" class="lp-link lp-amber text-sm">← Moderasi</a>
	<h1 class="lp-display-sm mt-3">Spin-off sub-debat</h1>
	<p class="mt-2 text-sm opacity-70">
		Dari <a href="/diskusi/{data.thread.slug}" class="lp-link">{data.thread.title}</a>
	</p>
	<p class="mt-2 text-sm opacity-60">
		Pilih rantai balasan yang membentuk sub-debat. Komentar pemicu tetap di tempat;
		balasan yang dipilih dipindahkan. Jika sudah ada diskusi kanonik untuk konsep yang
		diperdebatkan, balasan dipindahkan ke sana.
	</p>

	{#if form?.error}
		<div class="mt-4 border-2 p-3 text-sm" style="border-color: var(--lp-ink)" role="alert" aria-live="polite">
			{form.error === 'invalid_selection'
				? 'Pilihan tidak valid — semua komentar terpilih harus masih terlihat.'
				: form.error}
		</div>
	{/if}

	{#if data.rows.length === 0}
		<p class="mt-8 text-sm opacity-60">Diskusi ini belum punya komentar.</p>
	{:else}
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update({ reset: false });
				};
			}}
			class="mt-6 flex flex-col gap-4"
		>
			<ul class="flex flex-col gap-1.5">
				{#each data.rows as row (row.id)}
					<li style="margin-left: {row.depth * 1.25}rem">
						<label
							class="flex items-start gap-2 border-2 p-2.5 {selected.has(row.id)
								? 'bg-[#c17d0f]/[0.08]'
								: ''} {row.state !== 'visible' ? 'opacity-50' : ''}"
							style="border-color: var(--lp-ink)"
						>
							<input
								type="checkbox"
								class="mt-1 size-4"
								disabled={row.state !== 'visible'}
								checked={selected.has(row.id)}
								onchange={() => toggle(row.id)}
							/>
							<div class="min-w-0 text-sm">
								<p class="text-xs opacity-60">
									<span class="font-medium opacity-100">{row.author_name}</span>
									· {formatRelativeDays(row.created_at)}
									{#if row.id === data.dari}
										<span class="lp-mono lp-amber ml-1 border px-2 py-0.5 tracking-[0.12em] uppercase" style="border-color: var(--lp-amber)">pemicu</span>
									{/if}
								</p>
								{#if row.state === 'visible'}
									<div class="prose prose-sm prose-slate mt-1 max-w-none">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html row.html ?? ''}
									</div>
								{:else}
									<p class="mt-1 italic opacity-50">
										[{row.state === 'moved' ? 'sudah dipindahkan' : row.state === 'deleted' ? 'dihapus' : 'disembunyikan'}]
									</p>
								{/if}
							</div>
						</label>
					</li>
				{/each}
			</ul>

			<div class="border-2 p-4" style="border-color: var(--lp-ink)">
				<label for="label" class="lp-mono block text-xs font-bold tracking-[0.15em] uppercase">
					Label penanda <span class="opacity-50">(pertanyaan yang diperdebatkan, satu baris)</span>
				</label>
				<input
					id="label"
					name="label"
					type="text"
					required
					maxlength={200}
					bind:value={label}
					placeholder="Apa yang dimaksud dengan …?"
					class="mt-1 min-h-11 w-full border-2 bg-transparent px-3 text-base focus:outline-none"
					style="border-color: var(--lp-ink)"
				/>

				<label for="title" class="lp-mono mt-3 block text-xs font-bold tracking-[0.15em] uppercase">
					Judul diskusi baru <span class="opacity-50">(opsional — default: label)</span>
				</label>
				<input
					id="title"
					name="title"
					type="text"
					maxlength={200}
					bind:value={title}
					class="mt-1 min-h-11 w-full border-2 bg-transparent px-3 text-base focus:outline-none"
					style="border-color: var(--lp-ink)"
				/>

				<input type="hidden" name="comment_ids" value={JSON.stringify([...selected])} />

				<button
					type="submit"
					disabled={selected.size === 0 || !label.trim() || submitting}
					class="lp-btn mt-4 inline-block disabled:opacity-40"
				>
					{submitting ? 'Memproses…' : `Pindahkan ${selected.size} komentar`}
				</button>
			</div>
		</form>
	{/if}
</main>
