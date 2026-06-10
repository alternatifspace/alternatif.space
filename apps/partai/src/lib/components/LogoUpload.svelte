<script lang="ts">
	// Party logo (P0-07, TRD §13): JPG/PNG/WebP, max 2MB, client-side canvas
	// crop to centered square before upload.
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
	const OUTPUT_SIZE = 512;

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
		await new Promise<void>((resolve, reject) => {
			img.onload = () => resolve();
			img.onerror = () => reject(new Error('load failed'));
			img.src = url;
		}).catch(() => {
			error = 'Gambar tidak bisa dibaca.';
		});
		if (error) return;

		// Centered square crop, scaled to OUTPUT_SIZE.
		const side = Math.min(img.naturalWidth, img.naturalHeight);
		const sx = (img.naturalWidth - side) / 2;
		const sy = (img.naturalHeight - side) / 2;
		const canvas = document.createElement('canvas');
		canvas.width = OUTPUT_SIZE;
		canvas.height = OUTPUT_SIZE;
		canvas.getContext('2d')!.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
		URL.revokeObjectURL(url);

		const blob = await new Promise<Blob | null>((resolve) =>
			canvas.toBlob(resolve, 'image/webp', 0.9)
		);
		if (!blob) {
			error = 'Gagal memproses gambar.';
			return;
		}
		onselect({ blob, previewUrl: canvas.toDataURL('image/webp', 0.9) });
	}
</script>

<div class="flex items-center gap-4">
	{#if preview}
		<img src={preview} alt="Pratinjau logo" class="h-20 w-20 rounded-lg object-cover" />
	{:else}
		<div class="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-xs text-gray-400">
			Logo
		</div>
	{/if}
	<div class="flex flex-col gap-1">
		<input
			type="file"
			accept="image/jpeg,image/png,image/webp"
			onchange={handleFile}
			class="text-sm file:mr-3 file:min-h-10 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:font-medium hover:file:bg-slate-200"
		/>
		<span class="text-xs text-gray-400">JPG/PNG/WebP, maks. 2MB — dipotong persegi otomatis</span>
		{#if error}<span class="text-xs text-red-600">{error}</span>{/if}
	</div>
</div>
