import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

// adapter-node is a deliberate signal: this app is a LOCAL server, never a
// Cloudflare Pages deploy. There is intentionally no `build` script in
// package.json, so `pnpm -r build` skips this app entirely. The adapter is
// here only so `svelte-kit sync`/`check` has a valid config.
/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
