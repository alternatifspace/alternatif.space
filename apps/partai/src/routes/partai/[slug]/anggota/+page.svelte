<script lang="ts">
	import { MemberAvatar } from '@alternatif/ui';

	let { data } = $props();
</script>

<svelte:head>
	<title>Anggota {data.party.name} — partai.alternatif.space</title>
</svelte:head>

<main class="mx-auto max-w-3xl px-5 py-10">
	<a href="/partai/{data.party.slug}" class="lp-link lp-amber text-sm">← {data.party.name}</a>
	<h1 class="lp-display-sm mt-3">Anggota</h1>

	{#if data.members.length === 0}
		<p class="mt-6 opacity-60">Belum ada anggota.</p>
	{:else}
		<ul class="mt-5 border-2" style="border-color: var(--lp-ink)">
			{#each data.members as member (member.user_id)}
				<li class="flex items-center gap-3 border-t px-3 py-3 first:border-t-0" style="border-color: rgba(20, 18, 16, 0.15)">
					<MemberAvatar displayName={member.display_name} />
					<a href="/profil/{member.user_id}" class="lp-link font-medium">{member.display_name}</a>
					{#if member.is_leader}
						<span class="lp-mono lp-amber border px-2 py-0.5 text-xs tracking-[0.2em] uppercase" style="border-color: var(--lp-amber)">Ketua</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
</main>
