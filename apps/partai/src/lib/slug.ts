/** Same shape as the mufakat Edge Function slugify (TRD: slugs are unique). */
export function slugify(name: string): string {
	const base = name
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.trim()
		.replace(/\s+/g, '-')
		.slice(0, 60);
	return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}
