<script lang="ts">
	// Client-side image pipeline (TRD §8, L0-08): accept JPG/PNG/WebP, reject
	// >2MB originals, centered-square crop, scale to a fixed max dimension,
	// re-encode to WebP ~0.85. Output lands in the tens of KB. Mirrors partai's
	// LogoUpload.svelte (copy-pasted per TRD §8, not yet shared).
	let {
		preview = null,
		onselect
	}: {
		preview?: string | null;
		onselect: (payload: { blob: Blob; previewUrl: string }) => void;
	} = $props();

	let error = $state('');

	const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
	const MAX_BYTES = 2 * 1024 * 1024;
	const OUTPUT_SIZE = 768;

	async function handleFile(event: Event) {
		error = '';
		const file = (event.target as HTMLInputElement).files?.[0];
		if (!file) return;
		if (!ACCEPTED.includes(file.type)) {
			error = 'Format harus JPG, PNG, atau WebP.';
			return;
		}
		if (file.size > MAX_BYTES) {
			error = 'Ukuran maksimal 2MB.';
			return;
		}

		const url = URL.createObjectURL(file);
		const img = new Image();
		let loadFailed = false;
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('load failed'));
			img.src = url;
		}).catch(() => {
			loadFailed = true;
		});
		if (loadFailed) {
			URL.revokeObjectURL(url);
			error = 'Gambar tidak bisa dibaca.';
			return;
		}

		const side = Math.min(img.naturalWidth, img.naturalHeight);
		const sx = (img.naturalWidth - side) / 2;
		const sy = (img.naturalHeight - side) / 2;
		const canvas = document.createElement('canvas');
		canvas.width = OUTPUT_SIZE;
		canvas.height = OUTPUT_SIZE;
		canvas.getContext('2d')!.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
		URL.revokeObjectURL(url);

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/webp', 0.85)
		);
		if (!blob) {
			error = 'Gagal memproses gambar.';
			return;
		}
		onselect({ blob, previewUrl: canvas.toDataURL('image/webp', 0.85) });
	}
</script>

<div class="flex items-center gap-4">
	{#if preview}
		<img src={preview} alt="Pratinjau logo" class="h-24 w-24 rounded-xl object-cover ring-1 ring-[var(--color-border-warm)]" />
	{:else}
		<div class="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border-warm)] text-xs text-ink/40">
			Logo
		</div>
	{/if}
	<div class="flex flex-col gap-1">
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFile}
			class="text-sm file:mr-3 file:min-h-11 file:rounded-lg file:border-0 file:bg-paper-warm file:px-4 file:font-medium file:text-ink hover:file:bg-[var(--color-border-warm)]"
		/>
		<span class="text-xs text-ink/40">JPG/PNG/WebP, maks. 2MB — dipotong persegi otomatis</span>
		{#if error}<span class="text-xs text-error">{error}</span>{/if}
	</div>
</div>
