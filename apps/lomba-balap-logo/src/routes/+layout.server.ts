import type { LayoutServerLoad } from './$types';
import type { ContestConfig } from '$lib/types';

// Session, admin flag, and contest window resolved once for the whole app.
export const load: LayoutServerLoad = async ({ locals }) => {
	let config: ContestConfig = {
		close_at: '2026-08-15T23:59:00+07:00',
		is_open: true,
		submissions_open: true
	};

	const { data } = await locals.supabase
		.from('lbl_config')
		.select('key, value')
		.in('key', ['contest', 'submissions_open']);

	if (data) {
		const contest = data.find((r) => r.key === 'contest')?.value as { close_at?: string } | undefined;
		const subsOpen = data.find((r) => r.key === 'submissions_open')?.value;
		const closeAt = contest?.close_at ?? config.close_at;
		config = {
			close_at: closeAt,
			is_open: Date.now() < new Date(closeAt).getTime(),
			submissions_open: subsOpen === false ? false : subsOpen === true ? true : true
		};
	}

	return {
		session: locals.session,
		user: locals.user
			? {
					id: locals.user.id,
					name:
						(locals.user.user_metadata?.full_name as string | undefined) ??
						(locals.user.user_metadata?.name as string | undefined) ??
						locals.user.email ??
						null,
					avatar: (locals.user.user_metadata?.avatar_url as string | undefined) ?? null
				}
			: null,
		isAdmin: locals.isAdmin,
		config
	};
};
