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
	class="block rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 hover:border-gray-400 hover:bg-gray-100"
>
	<p class="line-clamp-2 text-sm text-gray-600 italic">{excerpt}</p>
	<div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
		<span class="font-medium text-blue-700">→ kini diskusi tersendiri</span>
		<ThreadStatusBadge {status} />
		<span class="ml-auto text-xs text-gray-500">
			{reactionCount} × pertanyaan bagus
		</span>
	</div>
</a>
