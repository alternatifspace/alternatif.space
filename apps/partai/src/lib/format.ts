const DAY_MS = 24 * 60 * 60 * 1000;

/** "hari ini" / "kemarin" / "X hari lalu" — leader activity indicator (P0-04). */
export function formatRelativeDays(dateStr: string | null): string {
	if (!dateStr) return 'tidak diketahui';
	const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / DAY_MS);
	if (days <= 0) return 'hari ini';
	if (days === 1) return 'kemarin';
	return `${days} hari lalu`;
}

export function formatDate(dateStr: string): string {
	return new Date(dateStr).toLocaleDateString('id-ID', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
}
