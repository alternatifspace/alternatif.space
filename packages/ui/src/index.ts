// @alternatif/ui — shared components across all four subdomains (TRD §3).
// Consumed as raw Svelte source via the workspace; no build step.
export { default as PartyBadge } from './PartyBadge.svelte';
export { default as MemberAvatar } from './MemberAvatar.svelte';
export { default as VoteWidget } from './VoteWidget.svelte';
export { default as NotificationBell } from './NotificationBell.svelte';
export { default as ThreadStatusBadge } from './ThreadStatusBadge.svelte';
export type { ThreadStatus } from './ThreadStatusBadge.svelte';
export { default as SplitPlaceholderCard } from './SplitPlaceholderCard.svelte';

// Landing surfaces: shared scroll-reveal action; styles live in ./landing.css
// (import as a side-effect: `import '@alternatif/ui/landing.css'`).
export { reveal } from './reveal.js';

export { currentUser } from './stores/currentUser.js';
export { currentParty } from './stores/currentParty.js';
