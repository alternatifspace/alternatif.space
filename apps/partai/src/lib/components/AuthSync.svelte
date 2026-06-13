<!-- Reconciles the client Clerk session with the server-rendered auth state.

     The session cookie is scoped to .alternatif.space and clerk-js resolves it
     only *after* hydration (TRD §5). So a sign-in or sign-out — including one
     that happened on another subdomain or tab — isn't reflected in the chrome
     the server rendered. When the live client session disagrees with what was
     rendered, re-run the load functions so the navbar (and everything else)
     matches reality without a manual refresh. Render inside <ClerkProvider>. -->
<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { useClerkContext } from 'svelte-clerk/client';

	let { signedIn }: { signedIn: boolean } = $props();

	const ctx = useClerkContext();

	$effect(() => {
		if (!ctx.isLoaded) return;
		const clientSignedIn = Boolean(ctx.auth.userId);
		if (clientSignedIn !== signedIn) {
			invalidateAll();
		}
	});
</script>
