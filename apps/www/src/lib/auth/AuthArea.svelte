<!-- W0-01 hero auth area, shared by all three design variants.

     Signed out  → embedded Clerk <SignUp /> (hash routing: this page is fully
                   prerendered, no catch-all route exists for path routing).
                   New users are force-redirected to partai's onboarding —
                   the landing never duplicates it (PRD W0-01).
     Signed in   → "Lanjut ke partai →". No dead-end signup form for existing
                   users. partai's root decides between party page/onboarding;
                   www has no Supabase dependency at launch (PRD §7), so
                   membership lookup cannot happen here.

     Session detection is purely client-side: the app is static (prerender =
     true), so clerk-js reads the shared .alternatif.space cookie after
     hydration. Until it resolves, the signed-out state renders — that is also
     the prerendered HTML, so there is no layout flash for the common case. -->
<script lang="ts">
	import { SignUp, useClerkContext } from 'svelte-clerk/client';
	import { ONBOARDING_URL, PARTAI_URL } from '$lib/urls';

	let {
		ctaClass = '',
		noteClass = '',
		appearance = undefined
	}: {
		/** Variant-styled class for the signed-in "Lanjut ke partai →" link */
		ctaClass?: string;
		/** Variant-styled class for the "Sudah punya akun?" line */
		noteClass?: string;
		/** Optional Clerk appearance object (e.g. dark variables for dark variants) */
		appearance?: Record<string, unknown>;
	} = $props();

	const ctx = useClerkContext();
	const signedIn = $derived(Boolean(ctx.auth.userId));
</script>

{#if signedIn}
	<a href={PARTAI_URL} class={ctaClass} data-testid="lanjut-ke-partai">Lanjut ke partai →</a>
{:else}
	<div>
		<SignUp routing="hash" forceRedirectUrl={ONBOARDING_URL} signInUrl="/masuk" {appearance} />
	</div>
	<p class={noteClass}>
		Sudah punya akun?
		<a href="/masuk" class="underline underline-offset-4">Masuk</a>
	</p>
{/if}
