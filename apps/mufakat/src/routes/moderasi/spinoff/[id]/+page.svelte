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

<main class="mx-auto max-w-3xl p-4 pb-16">
	<a href="/moderasi" class="text-sm text-gray-500 hover:underline">← Moderasi</a>
	<h1 class="mt-2 text-2xl font-bold">Spin-off sub-debat</h1>
	<p class="mt-1 text-sm text-gray-600">
		Dari <a href="/diskusi/{data.thread.slug}" class="underline">{data.thread.title}</a>
	</p>
	<p class="mt-2 text-sm text-gray-500">
		Pilih rantai balasan yang membentuk sub-debat. Komentar pemicu tetap di tempat;
		balasan yang dipilih dipindahkan. Jika sudah ada diskusi kanonik untuk konsep yang
		diperdebatkan, balasan dipindahkan ke sana.
	</p>

	{#if form?.error}
		<div class="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
			{form.error === 'invalid_selection'
				? 'Pilihan tidak valid — semua komentar terpilih harus masih terlihat.'
				: form.error}
		</div>
	{/if}

	{#if data.rows.length === 0}
		<p class="mt-8 text-sm text-gray-500">Diskusi ini belum punya komentar.</p>
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
							class="flex items-start gap-2 rounded-md border p-2.5 {selected.has(row.id)
								? 'border-indigo-400 bg-indigo-50'
								: 'border-gray-200 bg-white'} {row.state !== 'visible' ? 'opacity-50' : ''}"
						>
							<input
								type="checkbox"
								class="mt-1 size-4"
								disabled={row.state !== 'visible'}
								checked={selected.has(row.id)}
								onchange={() => toggle(row.id)}
							/>
							<div class="min-w-0 text-sm">
								<p class="text-xs text-gray-500">
									<span class="font-medium text-gray-700">{row.author_name}</span>
									· {formatRelativeDays(row.created_at)}
									{#if row.id === data.dari}
										<span class="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">pemicu</span>
									{/if}
								</p>
								{#if row.state === 'visible'}
									<div class="prose prose-sm prose-slate mt-1 max-w-none">
										<!-- eslint-disable-next-line svelte/no-at-html-tags -->
										{@html row.html ?? ''}
									</div>
								{:else}
									<p class="mt-1 text-gray-400 italic">
										[{row.state === 'moved' ? 'sudah dipindahkan' : row.state === 'deleted' ? 'dihapus' : 'disembunyikan'}]
									</p>
								{/if}
							</div>
						</label>
					</li>
				{/each}
			</ul>

			<div class="rounded-lg border border-gray-200 bg-white p-4">
				<label for="label" class="text-sm font-medium text-gray-700">
					Label penanda <span class="text-gray-400">(pertanyaan yang diperdebatkan, satu baris)</span>
				</label>
				<input
					id="label"
					name="label"
					type="text"
					required
					maxlength={200}
					bind:value={label}
					placeholder="Apa yang dimaksud dengan …?"
					class="mt-1 min-h-11 w-full rounded-md border border-gray-300 px-3 text-base focus:border-slate-500 focus:outline-none"
				/>

				<label for="title" class="mt-3 block text-sm font-medium text-gray-700">
					Judul diskusi baru <span class="text-gray-400">(opsional — default: label)</span>
				</label>
				<input
					id="title"
					name="title"
					type="text"
					maxlength={200}
					bind:value={title}
					class="mt-1 min-h-11 w-full rounded-md border border-gray-300 px-3 text-base focus:border-slate-500 focus:outline-none"
				/>

				<input type="hidden" name="comment_ids" value={JSON.stringify([...selected])} />

				<button
					type="submit"
					disabled={selected.size === 0 || !label.trim() || submitting}
					class="mt-4 min-h-11 rounded-md bg-indigo-600 px-6 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-40"
				>
					{submitting ? 'Memproses…' : `Pindahkan ${selected.size} komentar`}
				</button>
			</div>
		</form>
	{/if}
</main>
