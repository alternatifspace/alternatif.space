// Shared scroll-reveal action for prototype variants. Adds .in when the node
// enters the viewport; instant under prefers-reduced-motion. The matching
// hidden-before-reveal CSS must gate on @media (scripting: enabled) so
// prerendered HTML stays readable without JS.
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
