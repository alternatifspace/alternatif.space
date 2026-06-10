import { writable } from 'svelte/store';

/**
 * The user's current party membership, resolved with the single query in
 * TRD §5 after the Clerk session resolves. null = no party (TRD §11).
 *
 * @type {import('svelte/store').Writable<{
 *   id: string,
 *   slug: string,
 *   name: string,
 *   logo_url: string | null,
 *   status: string,
 *   role: 'leader' | 'member'
 * } | null>}
 */
export const currentParty = writable(null);
