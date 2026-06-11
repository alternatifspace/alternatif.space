<script lang="ts">
	// Rich text editor (M0-01/M0-05): same formats as the partai manifesto
	// editor — H2/H3, bold, italic, bullet, numbered, blockquote. No images.
	// Lazy-loaded by callers (6.9): never bundled into the thread-read path.
	import { onMount } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';

	let {
		content = null,
		onupdate
	}: {
		content?: unknown;
		onupdate: (payload: { json: unknown; html: string; text: string }) => void;
	} = $props();

	let element: HTMLDivElement | undefined = $state();
	let editor: Editor | undefined = $state();
	// Bumped on every transaction so toolbar active-states stay reactive.
	let tick = $state(0);

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({
					heading: { levels: [2, 3] },
					code: false,
					codeBlock: false,
					strike: false,
					horizontalRule: false
				})
			],
			content: (content as object | null) ?? '',
			editorProps: {
				attributes: { class: 'prose prose-slate max-w-none min-h-48 p-3 focus:outline-none' }
			},
			onTransaction: () => {
				tick += 1;
			},
			onUpdate: ({ editor }) => {
				onupdate({ json: editor.getJSON(), html: editor.getHTML(), text: editor.getText() });
			}
		});
		return () => editor?.destroy();
	});

	const buttons = $derived.by(() => {
		void tick;
		if (!editor) return [];
		const e = editor;
		return [
			{ label: 'H2', active: e.isActive('heading', { level: 2 }), run: () => e.chain().focus().toggleHeading({ level: 2 }).run() },
			{ label: 'H3', active: e.isActive('heading', { level: 3 }), run: () => e.chain().focus().toggleHeading({ level: 3 }).run() },
			{ label: 'B', active: e.isActive('bold'), run: () => e.chain().focus().toggleBold().run() },
			{ label: 'I', active: e.isActive('italic'), run: () => e.chain().focus().toggleItalic().run() },
			{ label: '• Daftar', active: e.isActive('bulletList'), run: () => e.chain().focus().toggleBulletList().run() },
			{ label: '1. Daftar', active: e.isActive('orderedList'), run: () => e.chain().focus().toggleOrderedList().run() },
			{ label: '❝ Kutip', active: e.isActive('blockquote'), run: () => e.chain().focus().toggleBlockquote().run() }
		];
	});
</script>

<div class="rounded-md border border-gray-300">
	<div class="flex flex-wrap gap-1 border-b border-gray-200 bg-gray-50 p-1.5">
		{#each buttons as button (button.label)}
			<button
				type="button"
				class="min-h-9 rounded px-2.5 text-sm font-medium {button.active
					? 'bg-slate-800 text-white'
					: 'text-gray-700 hover:bg-gray-200'}"
				onclick={button.run}
			>
				{button.label}
			</button>
		{/each}
	</div>
	<div bind:this={element}></div>
</div>
