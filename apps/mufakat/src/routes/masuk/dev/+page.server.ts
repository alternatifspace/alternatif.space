import { CLERK_SECRET_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';

const TEST_USER_ID = 'user_3F4QrtPgsrNt3FgUy2AgzpGdXyz';

export const load: PageServerLoad = async () => {
	const res = await fetch('https://api.clerk.com/v1/sign_in_tokens', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${CLERK_SECRET_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ user_id: TEST_USER_ID })
	});

	if (!res.ok) {
		return { tokenUrl: '/masuk', error: 'Failed to create sign-in token' };
	}

	const { url } = await res.json();
	return { tokenUrl: url };
};
