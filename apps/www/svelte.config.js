import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		// Cloudflare Pages, output .svelte-kit/cloudflare (TRD §4)
		adapter: adapter()
	}
};

export default config;
