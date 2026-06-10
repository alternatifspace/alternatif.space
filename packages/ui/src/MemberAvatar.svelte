<script lang="ts">
	// User display component (TRD §3). Phase 0 has no user photos — the avatar
	// is an initial on a deterministic background derived from the name.
	let {
		displayName,
		size = 32
	}: { displayName: string; size?: number } = $props();

	const PALETTE = ['#0e7490', '#7c3aed', '#b45309', '#15803d', '#be123c', '#1d4ed8'];

	const initial = $derived(displayName.trim().charAt(0).toUpperCase() || '?');
	const color = $derived(
		PALETTE[
			[...displayName].reduce((acc, ch) => (acc + ch.codePointAt(0)!) % PALETTE.length, 0)
		]
	);
</script>

<span
	class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none"
	style="width: {size}px; height: {size}px; font-size: {size * 0.45}px; background-color: {color}"
	title={displayName}
	aria-label={displayName}
>
	{initial}
</span>
