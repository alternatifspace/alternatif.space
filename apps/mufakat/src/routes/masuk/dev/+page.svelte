<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<meta http-equiv="refresh" content="0;url={data.tokenUrl}" />
</svelte:head>

<p>Redirecting to Clerk sign-in...</p>
<p>After sign-in, navigate back to <a href="/">mufakat</a>.</p>
