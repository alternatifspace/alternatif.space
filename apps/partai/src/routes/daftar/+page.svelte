<script lang="ts">
	import { SignUp } from 'svelte-clerk';
</script>

<svelte:head>
	<title>Daftar — alternatif.space</title>
</svelte:head>

<main class="flex min-h-screen items-center justify-center p-4">
	<SignUp signInUrl="/masuk" forceRedirectUrl="/onboarding" />
</main>
