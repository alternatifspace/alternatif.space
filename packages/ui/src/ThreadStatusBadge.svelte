<script module lang="ts">
	export type ThreadStatus = 'aktif' | 'selesai' | 'pertanyaan_terbuka' | 'dialihkan';
</script>

<script lang="ts">
	// mufakat status pill (TRD §3, §11, M0-03) — also used by spin-off markers
	// and placeholder cards, where the status is read LIVE from the target
	// thread at render time (§9.4): callers pass the joined status, this
	// component never fetches.
	let { status }: { status: ThreadStatus } = $props();

	// Pamflet × Arena: statuses folded into the ink+amber system. aktif = amber
	// (the live state); selesai = solid ink stamp (concluded); pertanyaan_terbuka
	// = ink outline; dialihkan = muted ink outline. Palette literals match
	// landing.css (--lp-ink #141210, --lp-amber #c17d0f).
	const STYLES: Record<ThreadStatus, { label: string; classes: string }> = {
		aktif: { label: 'Aktif', classes: 'border border-[#c17d0f] text-[#c17d0f]' },
		selesai: { label: 'Selesai', classes: 'bg-[#141210] text-[#f4f1ea]' },
		pertanyaan_terbuka: { label: 'Pertanyaan Terbuka', classes: 'border border-[#141210] text-[#141210]' },
		dialihkan: { label: 'Dialihkan', classes: 'border border-[#141210] text-[#141210] opacity-50' }
	};
</script>

<span
	class="lp-mono inline-flex items-center px-2 py-0.5 text-xs tracking-[0.12em] whitespace-nowrap uppercase {STYLES[
		status
	].classes}"
>
	{STYLES[status].label}
</span>
