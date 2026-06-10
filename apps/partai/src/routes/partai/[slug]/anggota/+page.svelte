<script lang="ts">
	import { MemberAvatar } from '@alternatif/ui';

	let { data } = $props();
</script>

<svelte:head>
	<title>Anggota {data.party.name} — partai.alternatif.space</title>
</svelte:head>

<main class="mx-auto max-w-3xl p-4">
	<a href="/partai/{data.party.slug}" class="text-sm text-gray-500 hover:underline">← {data.party.name}</a>
	<h1 class="mt-2 text-2xl font-bold">Anggota</h1>

	{#if data.members.length === 0}
		<p class="mt-6 text-gray-500">Belum ada anggota.</p>
	{:else}
		<ul class="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
			{#each data.members as member (member.user_id)}
				<li class="flex items-center gap-3 p-3">
					<MemberAvatar displayName={member.display_name} />
					<a href="/profil/{member.user_id}" class="font-medium hover:underline">{member.display_name}</a>
					{#if member.is_leader}
						<span class="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-semibold text-white">Ketua</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>
