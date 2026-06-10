<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let bio = $state('');
</script>

<svelte:head>
	<title>Selamat datang — alternatif.space</title>
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-8 p-6">
	<header>
		<h1 class="text-3xl font-bold">Selamat datang di alternatif.space</h1>
		<p class="mt-4 text-gray-700">
			Ini ruang deliberasi politik lintas posisi. Setiap orang di sini membawa bendera: partai yang
			kamu dirikan atau kamu ikuti. Bendera itu tampil di setiap diskusi — perdebatan bergeser dari
			soal pribadi ke soal posisi.
		</p>
		<p class="mt-2 text-gray-700">
			Untuk ikut serta, kamu harus <strong>bergabung dengan partai atau mendirikan partai</strong>
			terlebih dahulu. Langkah pertama: lengkapi profilmu.
		</p>
	</header>

	<form method="POST" use:enhance class="flex flex-col gap-4">
		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Nama tampilan</span>
			<input
				name="display_name"
				required
				maxlength="60"
				class="min-h-11 rounded-md border border-gray-300 px-3"
				placeholder="Nama yang tampil di seluruh platform"
			/>
		</label>

		<label class="flex flex-col gap-1">
			<span class="text-sm font-medium">Bio <span class="text-gray-400">(opsional)</span></span>
			<textarea
				name="bio"
				maxlength="160"
				rows="3"
				bind:value={bio}
				class="rounded-md border border-gray-300 px-3 py-2"
				placeholder="Maksimal 160 karakter"
			></textarea>
			<span class="text-xs text-gray-400">{bio.length}/160</span>
		</label>

		{#if form?.error}
			<p class="text-sm text-red-600">{form.error}</p>
		{/if}

		<button
			type="submit"
			class="min-h-11 rounded-md bg-slate-800 px-6 font-semibold text-white hover:bg-slate-700"
		>
			Lanjut
		</button>
	</form>
</main>
