<script lang="ts">
	import { onMount } from 'svelte';
	import { invalidateAll, goto } from '$app/navigation';
	import { env } from '$env/dynamic/public';
	import LogoUpload from '$lib/components/LogoUpload.svelte';
	import { imageUrl } from '$lib/images';

	let { data } = $props();

	let title = $state('');
	let caption = $state('');
	let blob = $state<Blob | null>(null);
	let previewUrl = $state<string | null>(null);
	let turnstileToken = $state('');
	let submitting = $state(false);
	let errorMsg = $state('');
	let done = $state(false);

	const siteKey = env.PUBLIC_TURNSTILE_SITE_KEY;

	// Render Turnstile once the script loads. Token is written to state via callback.
	onMount(() => {
		(window as any).__lblTurnstileCb = (token: string) => (turnstileToken = token);
		const s = document.createElement('script');
		s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
		s.async = true;
		s.defer = true;
		document.head.appendChild(s);
	});

	function onselect(payload: { blob: Blob; previewUrl: string }) {
		blob = payload.blob;
		previewUrl = payload.previewUrl;
	}

	async function submit(e: SubmitEvent) {
		e.preventDefault();
		errorMsg = '';
		if (!blob) {
			errorMsg = 'Pilih gambar logo dulu.';
			return;
		}
		if (!title.trim()) {
			errorMsg = 'Judul wajib diisi.';
			return;
		}
		if (!turnstileToken) {
			errorMsg = 'Tunggu verifikasi anti-bot selesai sebentar.';
			return;
		}

		submitting = true;
		const fd = new FormData();
		fd.append('image', blob, 'logo.webp');
		fd.append('title', title.trim());
		fd.append('caption', caption.trim());
		fd.append('cf-turnstile-response', turnstileToken);

		try {
			const res = await fetch('/api/kirim', { method: 'POST', body: fd });
			if (!res.ok) {
				const body = await res.json().catch(() => ({ message: '' }));
				throw new Error(body.message || 'Gagal mengirim. Coba lagi.');
			}
			done = true;
			await invalidateAll();
		} catch (err) {
			errorMsg = err instanceof Error ? err.message : 'Gagal mengirim.';
			// Reset the one-time Turnstile token so the user can retry.
			turnstileToken = '';
			(window as any).turnstile?.reset?.();
		} finally {
			submitting = false;
		}
	}

	const statusLabel: Record<string, string> = {
		pending: 'Menunggu moderasi',
		approved: 'Sudah tampil di feed',
		rejected: 'Ditolak'
	};
</script>

<svelte:head><title>Kirim logo · Lomba Balap Logo</title></svelte:head>

<h1 class="text-3xl">Kirim logo</h1>

{#if done}
	<div class="mt-6 rounded-2xl border border-success/40 bg-[color-mix(in_srgb,var(--color-success)_8%,transparent)] p-6">
		<h2 class="text-xl text-success">Logo terkirim!</h2>
		<p class="mt-2 text-ink/70">
			Logomu masuk antrean moderasi. Begitu disetujui, dia langsung muncul di papan peringkat.
		</p>
		<a href="/" class="mt-4 inline-block rounded-lg bg-ink px-5 py-2.5 font-semibold text-paper">Lihat feed</a>
	</div>
{:else if data.hasLive && data.latest}
	<!-- One live submission at a time (L0-05). Show it + a withdraw path. -->
	<div class="mt-6 rounded-2xl border border-[var(--color-border-warm)] bg-white p-6">
		<p class="text-sm font-semibold text-ink/50">{statusLabel[data.latest.status]}</p>
		<div class="mt-3 flex items-start gap-4">
			<img src={imageUrl(data.latest.image_key)} alt={data.latest.title} class="h-24 w-24 rounded-xl object-contain ring-1 ring-[var(--color-border-warm)]" />
			<div>
				<h2 class="text-lg font-semibold">{data.latest.title}</h2>
				{#if data.latest.caption}<p class="mt-1 text-sm text-ink/60">{data.latest.caption}</p>{/if}
				<p class="mt-1 text-sm text-ink/50">{data.latest.like_count} suka</p>
			</div>
		</div>
		<p class="mt-4 text-sm text-ink/60">
			Kamu cuma bisa punya satu logo aktif. Mau ganti? Tarik dulu yang ini, lalu kirim yang baru.
		</p>
		<form method="POST" action="?/withdraw" class="mt-3">
			<input type="hidden" name="id" value={data.latest.id} />
			<button type="submit" class="rounded-lg border border-error/40 px-4 py-2 text-sm font-semibold text-error hover:bg-[color-mix(in_srgb,var(--color-error)_8%,transparent)]"
				>Tarik logo ini</button
			>
		</form>
	</div>
{:else if !data.canSubmit}
	<div class="mt-6 rounded-2xl border border-[var(--color-border-warm)] bg-paper-warm p-6">
		<p class="text-ink/70">Pengiriman logo sedang ditutup untuk saat ini.</p>
		<a href="/" class="mt-3 inline-block text-sm underline">Kembali ke feed</a>
	</div>
{:else}
	{#if data.latest?.status === 'rejected'}
		<div class="mt-6 rounded-xl border border-error/30 bg-[color-mix(in_srgb,var(--color-error)_6%,transparent)] p-4">
			<p class="text-sm font-semibold text-error">Logo sebelumnya ditolak</p>
			{#if data.latest.rejection_reason}
				<p class="mt-1 text-sm text-ink/70">Alasan: {data.latest.rejection_reason}</p>
			{/if}
			<p class="mt-1 text-sm text-ink/60">Nggak apa-apa — kirim lagi yang baru di bawah.</p>
		</div>
	{/if}

	<form onsubmit={submit} class="mt-6 space-y-5">
		<div>
			<label for="logo" class="block text-sm font-semibold">Gambar logo</label>
			<div class="mt-2"><LogoUpload preview={previewUrl} {onselect} /></div>
		</div>

		<div>
			<label for="title" class="block text-sm font-semibold">Judul</label>
			<input
				id="title"
				bind:value={title}
				maxlength="80"
				placeholder="Kasih nama logomu"
				class="mt-1.5 min-h-11 w-full rounded-lg border border-[var(--color-border-warm)] bg-white px-3 py-2 outline-none focus:border-amber"
			/>
		</div>

		<div>
			<label for="caption" class="block text-sm font-semibold">Caption <span class="font-normal text-ink/40">(opsional)</span></label>
			<textarea
				id="caption"
				bind:value={caption}
				maxlength="280"
				rows="2"
				placeholder="Cerita singkat di balik logo ini"
				class="mt-1.5 w-full rounded-lg border border-[var(--color-border-warm)] bg-white px-3 py-2 outline-none focus:border-amber"
			></textarea>
		</div>

		<!-- Cloudflare Turnstile (TRD §6/§9) -->
		<div class="cf-turnstile" data-sitekey={siteKey} data-callback="__lblTurnstileCb"></div>

		{#if errorMsg}<p class="text-sm text-error">{errorMsg}</p>{/if}

		<button
			type="submit"
			disabled={submitting}
			class="min-h-12 w-full rounded-xl bg-amber px-6 py-3 font-semibold text-ink hover:brightness-95 disabled:opacity-50"
			>{submitting ? 'Mengirim…' : 'Kirim logo'}</button
		>
		<p class="text-center text-xs text-ink/40">
			Dengan mengirim, kamu setuju dengan <a href="/aturan" class="underline">aturan lomba</a>.
		</p>
	</form>
{/if}
