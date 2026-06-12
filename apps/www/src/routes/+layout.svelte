<script lang="ts">
	import { ClerkProvider } from 'svelte-clerk';
	import '../app.css';

	let { children } = $props();
</script>

<!-- Client-only Clerk: no server hook exists (the app is fully prerendered,
     PRD §7). clerk-js reads the shared .alternatif.space session cookie after
     hydration — same Clerk instance and env var set as the other apps (TRD §5).
     The apex sits inside the cookie scope, so no satellite-domain config. -->
<ClerkProvider>
	{@render children()}
</ClerkProvider>
