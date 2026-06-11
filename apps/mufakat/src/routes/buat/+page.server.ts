import { fail, redirect } from '@sveltejs/kit';
import { invokeEdge } from '$lib/server/edge';
import { partaiGate } from '$lib/links';
import type { Actions, PageServerLoad } from './$types';

// /buat (M0-01, 6.10): member-only write surface. Non-members — including
// suspended/removed members — are sent to the partai onboarding gate.
export const load: PageServerLoad = async (event) => {
	const { membership } = await event.parent();
	if (!membership || !['active', 'muted'].includes(membership.status)) {
		redirect(303, partaiGate());
	}
	return {};
};

export const actions: Actions = {
	// Submit via mufakat-create-thread (M0-17): rate limits, membership and
	// slug generation all live in the Edge Function, never here.
	default: async (event) => {
		const form = await event.request.formData();
		const title = ((form.get('title') as string) ?? '').trim();
		if (!title || title.length > 200) {
			return fail(400, { error: 'title_invalid' });
		}

		let content: unknown = null;
		const raw = form.get('content') as string | null;
		if (raw) {
			try {
				content = JSON.parse(raw);
			} catch {
				return fail(400, { error: 'invalid_content' });
			}
		}

		const res = await invokeEdge<{ slug: string; explanation?: string }>(
			event,
			'mufakat-create-thread',
			{
				title,
				body_content: content,
				body_html: (form.get('html') as string) || null
			}
		);
		if (!res.ok) {
			return fail(res.status, { error: res.data.error, explanation: res.data.explanation });
		}
		redirect(303, `/diskusi/${res.data.slug}`);
	}
};
