<script lang="ts">
	// Voting UI scaffold (TRD §3) — Phase 1 wires this to proposals and the
	// cast-vote Edge Function. Phase 0 ships the shell only (checklist 2.3).
	interface VoteOption {
		id: string;
		label: string;
	}

	let {
		question,
		options = [],
		disabled = true,
		onvote
	}: {
		question: string;
		options?: VoteOption[];
		disabled?: boolean;
		onvote?: (optionId: string) => void;
	} = $props();
</script>

<div class="rounded-lg border border-gray-200 p-4">
	<p class="font-medium text-gray-900">{question}</p>
	<div class="mt-3 flex flex-col gap-2">
		{#each options as option (option.id)}
			<button
				type="button"
				class="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-left text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				{disabled}
				onclick={() => onvote?.(option.id)}
			>
				{option.label}
			</button>
		{/each}
	</div>
	{#if disabled}
		<p class="mt-2 text-xs text-gray-500">Pemungutan suara hadir di Fase 1.</p>
	{/if}
</div>
