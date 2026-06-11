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

<main class="mx-auto max-w-2xl p-4">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Notifikasi</h1>
		<form method="POST" action="?/markAllRead" use:enhance>
			<button class="text-sm text-gray-500 hover:underline">Tandai semua dibaca</button>
		</form>
	</div>

	{#if data.notifications.length === 0}
		<p class="mt-8 text-center text-gray-500">Belum ada notifikasi.</p>
	{:else}
		<ul class="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200">
			{#each data.notifications as n (n.id)}
				<li class="flex items-start gap-3 p-3 {n.read_at ? 'opacity-60' : ''}">
					{#if !n.read_at}<span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500"></span>{/if}
					<div class="min-w-0">
						<p class="text-sm text-gray-800">{describe(n)}</p>
						{#if n.payload?.thread_slug}
							<a href="/diskusi/{n.payload.thread_slug}" class="text-sm font-medium text-slate-700 underline">
								Buka diskusi
							</a>
						{/if}
						<p class="mt-0.5 text-xs text-gray-400">{formatRelativeDays(n.created_at)}</p>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</main>
