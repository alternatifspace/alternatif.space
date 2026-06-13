// Scroll-reveal action shared by the landing surfaces (mirrors apps/www).
// Adds .in when the node enters the viewport; instant under reduced-motion.
// The hidden-before-reveal CSS gates on @media (scripting: enabled) so the
// SSR/prerendered HTML stays readable without JS.
export function reveal(node: HTMLElement) {
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		node.classList.add('in');
		return;
	}
	const io = new IntersectionObserver(
		(entries) => {
			for (const e of entries) {
				if (e.isIntersecting) {
					node.classList.add('in');
					io.unobserve(node);
				}
			}
		},
		{ threshold: 0.15 }
	);
	io.observe(node);
	return { destroy: () => io.disconnect() };
}
