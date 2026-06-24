<script lang="ts">
	import { goto } from '$app/navigation';
	import { imageUrl } from '$lib/images';
	import type { FeedItem } from '$lib/types';

	let { data } = $props();

	// Optimistic overlay on top of server data, so a like reflects instantly
	// without a full reload. Cleared whenever the feed reloads (sort/navigation).
	let overrides = $state<Record<string, { liked: boolean; delta: number }>>({});
	$effect(() => {
		data.items;
		overrides = {};
	});

	const items = $derived(
		data.items.map((it): FeedItem => {
			const o = overrides[it.id];
			return o ? { ...it, liked_by_me: o.liked, like_count: it.like_count + o.delta } : it;
		})
	);

	let busy = $state<string | null>(null);

	async function toggleLike(item: FeedItem) {
		if (!data.signedIn) {
			goto('/masuk?redirect=/');
			return;
		}
		if (busy) return;
		busy = item.id;

		const wasLiked = item.liked_by_me;
		overrides[item.id] = { liked: !wasLiked, delta: wasLiked ? -1 : 1 };

		try {
			const res = await fetch('/api/like', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ submission_id: item.id, liked: wasLiked })
			});
			if (!res.ok) throw new Error(await res.text());
		} catch {
			// Roll back on failure.
			delete overrides[item.id];
			overrides = { ...overrides };
		} finally {
			busy = null;
		}
	}

	function setSort(sort: 'populer' | 'terbaru') {
		goto(`/?sort=${sort}`, { keepFocus: true, noScroll: true });
	}
</script>

<svelte:head><title>Lomba Balap Logo · alternatif.space</title></svelte:head>

<section class="text-center">
	<h1 class="text-4xl sm:text-5xl">Lomba Balap Logo</h1>
	<p class="mx-auto mt-3 max-w-md text-ink/60">
		Adu logo, iseng-iseng aja. Nggak ada hadiah, yang penting rame. Login Google, kirim satu logo,
		dan biarkan like yang menentukan.
	</p>
	{#if !data.signedIn}
		<a href="/masuk" class="mt-5 inline-block rounded-xl bg-amber px-6 py-3 font-semibold text-ink hover:brightness-95"
			>Ikutan sekarang</a
		>
	{/if}
</section>

<div class="mt-8 flex items-center justify-between">
	<h2 class="text-2xl">Papan peringkat</h2>
	<div class="inline-flex rounded-lg border border-[var(--color-border-warm)] bg-paper-warm p-0.5 text-sm">
		<button
			onclick={() => setSort('populer')}
			class="rounded-md px-3 py-1.5 font-medium"
			class:bg-ink={data.sort === 'populer'}
			class:text-paper={data.sort === 'populer'}
			class:text-ink={data.sort !== 'populer'}>Terpopuler</button
		>
		<button
			onclick={() => setSort('terbaru')}
			class="rounded-md px-3 py-1.5 font-medium"
			class:bg-ink={data.sort === 'terbaru'}
			class:text-paper={data.sort === 'terbaru'}
			class:text-ink={data.sort !== 'terbaru'}>Terbaru</button
		>
	</div>
</div>

{#if items.length === 0}
	<div class="mt-10 rounded-2xl border border-dashed border-[var(--color-border-warm)] p-10 text-center">
		<p class="text-lg text-ink/70">Belum ada logo yang masuk.</p>
		<p class="mt-1 text-sm text-ink/50">Jadi yang pertama — kirim logomu dan mulai balapannya.</p>
		<a href="/kirim" class="mt-4 inline-block rounded-lg bg-amber px-5 py-2.5 font-semibold text-ink"
			>Kirim logo</a
		>
	</div>
{:else}
	<ul class="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
		{#each items as item, i (item.id)}
			<li class="overflow-hidden rounded-2xl border border-[var(--color-border-warm)] bg-white">
				<div class="relative aspect-square bg-paper-warm">
					<img
						src={imageUrl(item.image_key)}
						alt={item.title}
						loading="lazy"
						class="h-full w-full object-contain"
					/>
					{#if data.sort === 'populer' && i < 3}
						<span
							class="absolute left-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-ink text-sm font-bold text-amber"
							>{i + 1}</span
						>
					{/if}
				</div>
				<div class="flex items-start justify-between gap-3 p-4">
					<div class="min-w-0">
						<h3 class="truncate font-sans text-base font-semibold">{item.title}</h3>
						{#if item.caption}
							<p class="mt-0.5 line-clamp-2 text-sm text-ink/60">{item.caption}</p>
						{/if}
						<p class="mt-1 text-xs text-ink/40">oleh {item.author_name ?? 'Anonim'}</p>
					</div>
					<button
						onclick={() => toggleLike(item)}
						disabled={busy === item.id}
						class="flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50"
						class:border-amber={item.liked_by_me}
						class:bg-amber={item.liked_by_me}
						class:text-ink={item.liked_by_me}
						class:border-border-warm={!item.liked_by_me}
						aria-pressed={item.liked_by_me}
						aria-label={item.liked_by_me ? 'Batal suka' : 'Suka'}
					>
						<svg width="16" height="16" viewBox="0 0 24 24" fill={item.liked_by_me ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
							<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8Z"/>
						</svg>
						{item.like_count}
					</button>
				</div>
			</li>
		{/each}
	</ul>
{/if}
