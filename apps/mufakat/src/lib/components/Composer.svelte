<script lang="ts">
	// Generic rich-text form: TipTap is dynamically imported on mount, so the
	// editor never enters the thread-read bundle (6.9, TRD §14).
	import { enhance } from '$app/forms';

	let {
		action,
		hidden = {},
		initial = null,
		submitLabel = 'Kirim',
		oncancel,
		ondone
	}: {
		action: string;
		hidden?: Record<string, string>;
		initial?: unknown;
		submitLabel?: string;
		oncancel?: () => void;
		ondone?: () => void;
	} = $props();

	let json = $state<unknown>(initial);
	let html = $state('');
	let text = $state('');
	let submitting = $state(false);

	const empty = $derived(text.trim().length === 0);
</script>

{#await import('./RichEditor.svelte') then { default: RichEditor }}
	<form
		method="POST"
		{action}
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				submitting = false;
				await update();
				if (result.type === 'success') ondone?.();
			};
		}}
		class="flex flex-col gap-2"
	>
		<RichEditor
			content={initial}
			onupdate={(payload) => {
				json = payload.json;
				html = payload.html;
				text = payload.text;
			}}
		/>
		{#each Object.entries(hidden) as [name, value] (name)}
			<input type="hidden" {name} {value} />
		{/each}
		<input type="hidden" name="content" value={JSON.stringify(json)} />
		<input type="hidden" name="html" value={html} />
		<input type="hidden" name="text" value={text} />
		<div class="flex gap-2">
			<button
				type="submit"
				disabled={empty || submitting}
				class="min-h-10 rounded-md bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40"
			>
				{submitting ? 'Mengirim…' : submitLabel}
			</button>
			{#if oncancel}
				<button type="button" class="min-h-10 rounded-md border border-gray-300 px-4 text-sm" onclick={oncancel}>
					Batal
				</button>
			{/if}
		</div>
	</form>
{/await}
