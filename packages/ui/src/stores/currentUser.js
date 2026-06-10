import { writable } from 'svelte/store';

/**
 * Populated on app initialisation after the Clerk session resolves (TRD §11).
 * Components read from this store — they do not fetch independently.
 *
 * @type {import('svelte/store').Writable<{
 *   id: string,
 *   display_name: string,
 *   bio: string | null,
 *   last_active_at: string | null
 * } | null>}
 */
export const currentUser = writable(null);
