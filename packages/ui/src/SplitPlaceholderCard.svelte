<script lang="ts">
	// The scar of a good-question split (TRD §3, §11, M0-10/D4): a compact
	// informational card where the moved comment stood. Excerpt + link + LIVE
	// status badge + reaction count at split. The card must never read as
	// deletion or moderation. Replies are disabled — tapping routes to the
	// new canonical thread.
	import ThreadStatusBadge from './ThreadStatusBadge.svelte';
	import type { ThreadStatus } from './ThreadStatusBadge.svelte';

	let {
		excerpt,
		href,
		status,
		reactionCount
	}: {
		excerpt: string; // moved_excerpt from mufakat_comments_public
		href: string; // target thread URL
		status: ThreadStatus; // live from moved_to_thread_id → mufakat_threads.status
		reactionCount: number; // reaction_count_at_split from the split row
	} = $props();
</script>

<a
	{href}
	class="block border border-dashed p-3 hover:bg-[#141210]/[0.03]"
	style="border-color: var(--lp-ink)"
>
	<p class="line-clamp-2 text-sm italic opacity-70">{excerpt}</p>
	<div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
		<span class="lp-amber font-medium">→ kini diskusi tersendiri</span>
		<ThreadStatusBadge {status} />
		<span class="ml-auto text-xs opacity-60">
			{reactionCount} × pertanyaan bagus
		</span>
	</div>
</a>
