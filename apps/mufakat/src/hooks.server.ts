import { withClerkHandler } from 'svelte-clerk/server';

// Clerk session resolution on every request (TRD §5). The session cookie is
// scoped to .alternatif.space (Clerk dashboard: production instance on the
// root domain) so one login covers every subdomain. Route-level auth gates
// for member-only routes are layered on per route group (checklist 5.3).
export const handle = withClerkHandler();
