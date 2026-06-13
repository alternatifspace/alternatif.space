// Safe TipTap-JSON → HTML serializer (TRD §6, security).
//
// We render display HTML ONLY from the trusted TipTap/ProseMirror JSON document,
// never from a client-supplied HTML string. `generateHTML` from @tiptap/html is
// NOT a safe sanitizer here: StarterKit v3 enables the Link mark and emits the
// `href` attribute verbatim, so crafted JSON could produce `javascript:` URLs.
// This serializer emits a fixed allowlist of tags and validates link protocols,
// escaping every piece of text. Unknown node/mark types degrade to their text
// content — they can never emit raw markup.
//
// Mirror of supabase/functions/_shared/tiptap-html.ts. Keep the two in sync.

type Json = Record<string, unknown>;

export function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

// Allow relative paths, in-page anchors, and absolute http(s)/mailto links.
// Reject everything else (javascript:, data:, vbscript:, protocol-relative //).
function safeHref(href: unknown): string | null {
	if (typeof href !== 'string') return null;
	const v = href.trim();
	if (!v) return null;
	if (v.startsWith('//')) return null;
	if (v.startsWith('/') || v.startsWith('#')) return v;
	if (/^(https?:|mailto:)/i.test(v)) return v;
	return null;
}

function renderMarks(text: string, marks: unknown): string {
	let out = escapeHtml(text);
	if (!Array.isArray(marks)) return out;
	for (const m of marks) {
		const mark = (m ?? {}) as Json;
		switch (mark.type) {
			case 'bold':
				out = `<strong>${out}</strong>`;
				break;
			case 'italic':
				out = `<em>${out}</em>`;
				break;
			case 'underline':
				out = `<u>${out}</u>`;
				break;
			case 'strike':
				out = `<s>${out}</s>`;
				break;
			case 'link': {
				const href = safeHref((mark.attrs as Json | undefined)?.href);
				if (href) {
					out = `<a href="${escapeHtml(href)}" rel="nofollow noopener noreferrer" target="_blank">${out}</a>`;
				}
				break;
			}
			// unknown marks: text is already escaped — drop the formatting only.
		}
	}
	return out;
}

function renderNode(node: unknown): string {
	if (!node || typeof node !== 'object') return '';
	const n = node as Json;
	if (n.type === 'text') {
		return renderMarks(typeof n.text === 'string' ? n.text : '', n.marks);
	}
	if (n.type === 'hardBreak') return '<br>';
	const inner = Array.isArray(n.content) ? n.content.map(renderNode).join('') : '';
	switch (n.type) {
		case 'doc':
			return inner;
		case 'paragraph':
			return `<p>${inner}</p>`;
		case 'heading': {
			const level = (n.attrs as Json | undefined)?.level;
			const h = typeof level === 'number' && level >= 1 && level <= 6 ? level : 2;
			return `<h${h}>${inner}</h${h}>`;
		}
		case 'bulletList':
			return `<ul>${inner}</ul>`;
		case 'orderedList':
			return `<ol>${inner}</ol>`;
		case 'listItem':
			return `<li>${inner}</li>`;
		case 'blockquote':
			return `<blockquote>${inner}</blockquote>`;
		default:
			// Unknown / disabled node type: keep the text, drop the wrapper.
			return inner;
	}
}

/** Render trusted TipTap JSON to a safe HTML string. Null for empty input. */
export function tiptapToHtml(doc: unknown): string | null {
	if (!doc) return null;
	const html = renderNode(doc);
	return html || null;
}
