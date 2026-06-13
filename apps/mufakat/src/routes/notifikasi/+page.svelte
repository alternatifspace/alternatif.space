<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatRelativeDays } from '$lib/format';

	let { data } = $props();

	interface NotificationPayload {
		thread_id?: string;
		thread_slug?: string;
		split_id?: string;
		message?: string;
		[key: string]: unknown;
	}

	const COPY: Record<string, (p: NotificationPayload) => string> = {
		mufakat_split_op_window: () => 'Komentarmu jadi diskusi baru — kamu punya 24 jam untuk menerima atau menolak jadi OP.',
		mufakat_split_op_reminder: () => 'Sisa kurang dari 4 jam untuk merespons — tanpa respons, kamu otomatis jadi OP diskusi baru.',
		application_approved: () => 'Lamaran partaimu diterima.',
		application_rejected: () => 'Lamaran partaimu ditolak.'
	};

	function describe(n: { type: string; payload: NotificationPayload }): string {
		return COPY[n.type]?.(n.payload) ?? n.payload.message ?? n.type;
	}
</script>

<svelte:head>
	<title>Notifikasi — mufakat.alternatif.space</title>
</svelte:head>

<main class="mx-auto max-w-2xl px-5 py-10">
	<div class="flex items-center justify-between gap-3">
		<h1 class="lp-display-sm">Notifikasi</h1>
		<form method="POST" action="?/markAllRead" use:enhance>
			<button class="lp-link text-sm opacity-70">Tandai semua dibaca</button>
		</form>
	</div>

	{#if data.notifications.length === 0}
		<p class="mt-8 text-center opacity-60">Belum ada notifikasi.</p>
	{:else}
		<ul class="mt-5 border-2" style="border-color: var(--lp-ink)">
			{#each data.notifications as n (n.id)}
				<li class="flex items-start gap-3 border-t border-[#141210]/15 p-3 first:border-t-0 {n.read_at ? 'opacity-60' : ''}">
					{#if !n.read_at}<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#c17d0f]"></span>{/if}
					<div class="min-w-0">
						<p class="text-sm">{describe(n)}</p>
						{#if n.payload?.thread_slug}
							<a href="/diskusi/{n.payload.thread_slug}" class="lp-link lp-amber text-sm font-medium">
								Buka diskusi
							</a>
						{/if}
						<p class="mt-0.5 text-xs opacity-50">{formatRelativeDays(n.created_at)}</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>
