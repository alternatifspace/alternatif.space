<script lang="ts">
	// Party flag: logo + name, linking to the party profile on partai
	// (TRD §3, M0-06). Flag reflects membership at time of posting — callers
	// pass the denormalised *_party_id join result, never a live membership.
	// party = null is the flagless state (muted member): renders nothing.
	interface Party {
		slug: string;
		name: string;
		logo_url: string | null;
	}

	let {
		party,
		partaiBaseUrl = 'https://partai.alternatif.space'
	}: { party: Party | null; partaiBaseUrl?: string } = $props();
</script>

{#if party}
	<a
		href="{partaiBaseUrl}/partai/{party.slug}"
		class="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-sm font-medium text-gray-800 hover:bg-gray-200"
	>
		{#if party.logo_url}
			<img src={party.logo_url} alt="" class="h-4 w-4 rounded-sm object-cover" />
		{/if}
		<span>{party.name}</span>
	</a>
{/if}
