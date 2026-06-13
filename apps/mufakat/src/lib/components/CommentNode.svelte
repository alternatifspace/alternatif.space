<script lang="ts">
	// One comment row, rendered by state (TRD §11):
	// visible → full; deleted → "[dihapus]"; hidden → "[disembunyikan
	// moderator]"; moved → SplitPlaceholderCard (the scar of a split, M0-10).
	import { enhance } from '$app/forms';
	import { MemberAvatar, PartyBadge, SplitPlaceholderCard } from '@alternatif/ui';
	import { PARTAI_URL, partaiProfile } from '$lib/links';
	import { formatRelativeDays } from '$lib/format';
	import type { CommentNodeData } from '$lib/types';
	import Composer from './Composer.svelte';
	import CommentNode from './CommentNode.svelte';

	let {
		node,
		threadActive,
		canWrite,
		userId,
		isAdmin
	}: {
		node: CommentNodeData;
		threadActive: boolean;
		canWrite: boolean;
		userId: string | null;
		isAdmin: boolean;
	} = $props();

	let replying = $state(false);
	let editing = $state(false);
	let reporting = $state(false);
	let confirmDelete = $state(false);

	const EDIT_WINDOW_MS = 15 * 60 * 1000;
	const isMine = $derived(!!userId && node.author_id === userId);
	const canEdit = $derived(
		isMine &&
			node.state === 'visible' &&
			Date.now() - new Date(node.created_at).getTime() < EDIT_WINDOW_MS
	);
	const canReply = $derived(threadActive && canWrite && node.state === 'visible' && node.depth < 3);

	const CATEGORIES = [
		{ value: 'sara', label: 'SARA / ujaran kebencian' },
		{ value: 'defamation', label: 'Pencemaran nama baik' },
		{ value: 'threat', label: 'Ancaman' },
		{ value: 'spam', label: 'Spam' }
	];
</script>

<article class="flex flex-col gap-2" id="komentar-{node.id}">
	{#if node.state === 'moved' && node.movedTo}
		<!-- The scar (M0-10/D4): excerpt + link + LIVE status + reaction count -->
		<SplitPlaceholderCard
			excerpt={node.moved_excerpt ?? ''}
			href="/diskusi/{node.movedTo.slug}"
			status={node.movedTo.status}
			reactionCount={node.movedTo.reaction_count}
		/>
	{:else if node.state === 'deleted'}
		<p class="border p-3 text-sm italic opacity-50" style="border-color: var(--lp-ink)">[dihapus]</p>
	{:else if node.state === 'hidden'}
		<p class="border p-3 text-sm italic opacity-50" style="border-color: var(--lp-ink)">[disembunyikan moderator]</p>
	{:else}
		<div class="border p-3" style="border-color: var(--lp-ink)">
			<header class="flex flex-wrap items-center gap-2 text-sm">
				<MemberAvatar displayName={node.author_name} size={24} />
				<a href={partaiProfile(node.author_id)} class="lp-link font-medium">{node.author_name}</a>
				<!-- Flag at time of posting; muted members render flagless (M0-06) -->
				<PartyBadge party={node.author_party} partaiBaseUrl={PARTAI_URL} />
				<span class="text-xs opacity-50">{formatRelativeDays(node.created_at)}</span>
				{#if node.edited_at}<span class="text-xs italic opacity-50">(diedit)</span>{/if}
			</header>

			{#if editing}
				<div class="mt-2">
					<Composer
						action="?/edit"
						hidden={{ comment_id: node.id }}
						initial={node.content}
						submitLabel="Simpan"
						oncancel={() => (editing = false)}
						ondone={() => (editing = false)}
					/>
				</div>
			{:else}
				<div class="prose prose-sm prose-slate mt-2 max-w-none">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html node.html ?? ''}
				</div>
			{/if}

			<footer class="mt-2 flex flex-wrap items-center gap-2 text-xs">
				<!-- Setuju + Pertanyaan bagus; counts public, threshold math never
				     shipped (M0-07/M0-08). No downvote exists, by design. -->
				{#each ['setuju', 'pertanyaan_bagus'] as const as type (type)}
					{@const active = node.myReactions[type]}
					<form method="POST" action={active ? '?/unreact' : '?/react'} use:enhance>
						<input type="hidden" name="comment_id" value={node.id} />
						<input type="hidden" name="type" value={type} />
						<button
							disabled={!canWrite}
							class="min-h-9 rounded-full border px-3 font-medium disabled:opacity-40 {active
								? 'border-[#141210] bg-[#141210] text-[#f4f1ea]'
								: 'border-[#141210] hover:bg-[#141210]/5'}"
						>
							{type === 'setuju' ? 'Setuju' : 'Pertanyaan bagus'}
							{node.reactions[type] > 0 ? ` · ${node.reactions[type]}` : ''}
						</button>
					</form>
				{/each}

				{#if canReply}
					<button type="button" class="opacity-60 hover:underline" onclick={() => (replying = !replying)}>
						Balas
					</button>
				{/if}
				{#if canEdit}
					<button type="button" class="opacity-60 hover:underline" onclick={() => (editing = !editing)}>
						Edit
					</button>
				{/if}
				{#if isMine && node.state === 'visible'}
					{#if confirmDelete}
						<!-- Destructive: red is intentionally retained for delete -->
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="comment_id" value={node.id} />
							<button class="font-semibold text-red-600 hover:underline">Yakin hapus?</button>
						</form>
						<button type="button" class="opacity-50" onclick={() => (confirmDelete = false)}>batal</button>
					{:else}
						<button type="button" class="text-red-700 hover:underline" onclick={() => (confirmDelete = true)}>
							Hapus
						</button>
					{/if}
				{/if}
				{#if userId && !isMine}
					<button type="button" class="opacity-60 hover:underline" onclick={() => (reporting = !reporting)}>
						Laporkan
					</button>
					<!-- Semantic flag (M0-14): clarification, not reporting — distinct
					     framing and styling from the report flow (dashed = "definition"). -->
					<form method="POST" action="?/flag" use:enhance>
						<input type="hidden" name="comment_id" value={node.id} />
						<button class="rounded-full border border-dashed px-2 py-0.5 hover:bg-[#141210]/5" style="border-color: var(--lp-ink)">
							Tandai: perdebatan definisi
						</button>
					</form>
				{/if}
				{#if isAdmin}
					<a href="/moderasi/spinoff/{node.thread_id}?dari={node.id}" class="lp-amber hover:underline">
						Spin-off
					</a>
				{/if}
			</footer>

			{#if reporting}
				<form method="POST" action="?/report" use:enhance={() => async ({ update }) => {
					reporting = false;
					await update();
				}} class="mt-2 flex flex-col gap-2 border p-3" style="border-color: var(--lp-ink)">
					<input type="hidden" name="subject_type" value="comment" />
					<input type="hidden" name="subject_id" value={node.id} />
					<select name="category" required class="min-h-10 border-2 bg-transparent px-2 text-sm" style="border-color: var(--lp-ink)">
						<option value="" disabled selected>— kategori laporan —</option>
						{#each CATEGORIES as cat (cat.value)}
							<option value={cat.value}>{cat.label}</option>
						{/each}
					</select>
					<textarea
						name="note"
						maxlength="500"
						rows="2"
						placeholder="Catatan (opsional)"
						class="border-2 bg-transparent px-3 py-2 text-sm"
						style="border-color: var(--lp-ink)"
					></textarea>
					<button class="lp-btn inline-block self-start text-sm">
						Kirim laporan
					</button>
				</form>
			{/if}

			{#if replying}
				<div class="mt-3 border-l-2 pl-3" style="border-color: var(--lp-ink)">
					<Composer
						action="?/comment"
						hidden={{ parent_id: node.id }}
						submitLabel="Balas"
						oncancel={() => (replying = false)}
						ondone={() => (replying = false)}
					/>
				</div>
			{/if}
		</div>
	{/if}

	{#if node.replies.length > 0}
		<div class="flex flex-col gap-2 border-l-2 border-[#141210]/15 pl-3 sm:pl-4">
			{#each node.replies as reply (reply.id)}
				<CommentNode node={reply} {threadActive} {canWrite} {userId} {isAdmin} />
			{/each}
		</div>
	{/if}
</article>
