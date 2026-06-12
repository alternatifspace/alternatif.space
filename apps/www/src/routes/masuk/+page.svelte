<!-- Masuk on the apex (W0-01 secondary CTA target). Existing users go
     straight to partai after sign-in — partai's root routes them onward.
     Email + password only (P0-01) — social providers are disabled in the
     Clerk dashboard, not here. -->
<script lang="ts">
	import { SignIn } from 'svelte-clerk/client';
	import { PARTAI_URL } from '$lib/urls';
</script>

<svelte:head>
	<title>Masuk — alternatif.space</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center bg-white p-4">
	<div>
		<a href="/" class="mb-6 block text-center text-sm font-bold tracking-widest uppercase">
			alternatif.space
		</a>
		<SignIn routing="hash" forceRedirectUrl={PARTAI_URL} signUpUrl="/" />
	</div>
</main>
