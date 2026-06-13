<script lang="ts">
	// In-app notification bell with unread count (TRD §3, §12). Required at
	// Phase 0 because the OP-ship window depends on it; push delivery is a
	// Phase 1 fast follow. Touch target ≥ 44px (TRD §14).
	let {
		count = 0,
		onclick
	}: { count?: number; onclick?: () => void } = $props();
</script>

<button
	type="button"
	class="relative inline-flex h-11 w-11 items-center justify-center rounded-full hover:bg-[#141210]/5"
	aria-label={count > 0 ? `Notifikasi, ${count} belum dibaca` : 'Notifikasi'}
	{onclick}
>
	<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-6 w-6">
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9"
		/>
	</svg>
	{#if count > 0}
		<span
			class="absolute top-1 right-1 inline-flex min-w-4.5 items-center justify-center rounded-full bg-[#c17d0f] px-1 text-[11px] font-bold text-white"
		>
			{count > 99 ? '99+' : count}
		</span>
	{/if}
</button>
