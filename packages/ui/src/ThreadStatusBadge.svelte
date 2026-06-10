<script module lang="ts">
	export type ThreadStatus = 'aktif' | 'selesai' | 'pertanyaan_terbuka' | 'dialihkan';
</script>

<script lang="ts">
	// mufakat status pill (TRD §3, §11, M0-03) — also used by spin-off markers
	// and placeholder cards, where the status is read LIVE from the target
	// thread at render time (§9.4): callers pass the joined status, this
	// component never fetches.
	let { status }: { status: ThreadStatus } = $props();

	const STYLES: Record<ThreadStatus, { label: string; classes: string }> = {
		aktif: { label: 'Aktif', classes: 'bg-green-100 text-green-800' },
		selesai: { label: 'Selesai', classes: 'bg-blue-100 text-blue-800' },
		pertanyaan_terbuka: { label: 'Pertanyaan Terbuka', classes: 'bg-amber-100 text-amber-800' },
		dialihkan: { label: 'Dialihkan', classes: 'bg-gray-200 text-gray-700' }
	};
</script>

<span
	class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap {STYLES[
		status
	].classes}"
>
	{STYLES[status].label}
</span>
