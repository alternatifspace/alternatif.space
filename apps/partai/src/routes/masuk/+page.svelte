<script lang="ts">
	import { SignIn } from 'svelte-clerk';
</script>

<svelte:head>
	<title>Masuk — alternatif.space</title>
</svelte:head>

<!-- Email + password only (P0-01) — social providers disabled in the Clerk
     dashboard, not here. -->
<main class="flex min-h-screen items-center justify-center p-4">
	<SignIn signUpUrl="/daftar" />
</main>
