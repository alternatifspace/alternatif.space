<!-- Daftar on the apex (W-Q1 resolved: BOTH — this dedicated route is the
     canonical signup URL for share cards/press and the mobile hero CTA
     target; the inline hero embed remains for desktop). Mirrors /masuk.
     New users are force-redirected to partai's onboarding — the landing
     never duplicates it (PRD W0-01). -->
<script lang="ts">
	import { SignUp } from 'svelte-clerk/client';
	import { ONBOARDING_URL } from '$lib/urls';
</script>

<svelte:head>
	<title>Daftar — alternatif.space</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="flex min-h-screen items-center justify-center p-4" style="background:#f4f1ea;color:#141210">
	<div>
		<a href="/" class="mb-6 block text-center text-sm font-bold tracking-widest uppercase">
			alternatif.space
		</a>
		<SignUp routing="hash" forceRedirectUrl={ONBOARDING_URL} signInUrl="/masuk" />
		<p class="mt-4 text-center text-sm opacity-70">
			Sudah punya akun?
			<a href="/masuk" class="underline underline-offset-4">Masuk</a>
		</p>
	</div>
</main>
