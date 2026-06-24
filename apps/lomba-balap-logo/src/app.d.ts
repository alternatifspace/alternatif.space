import type { SupabaseClient, Session, User } from '@supabase/supabase-js';

// Supabase Auth (not Clerk) for this standalone app (TRD §2). The
// request-scoped client and session resolvers are attached in hooks.server.ts.
declare global {
	namespace App {
		interface Locals {
			/** Request-scoped Supabase client carrying the user's session (RLS-bound). */
			supabase: SupabaseClient;
			/** Cheap session getter that validates the JWT against Supabase Auth. */
			safeGetSession: () => Promise<{ session: Session | null; user: User | null }>;
			session: Session | null;
			user: User | null;
			/** True if the signed-in user is in lbl_admins (resolved once per request). */
			isAdmin: boolean;
		}
		interface PageData {
			session: Session | null;
		}
		interface Platform {
			env?: {
				LBL_LOGOS: R2Bucket;
			};
		}
	}
}

// Minimal R2 typing — the full type comes from @cloudflare/workers-types, which
// we don't depend on; this covers the one method we call (TRD §6).
interface R2Bucket {
	put(
		key: string,
		value: ArrayBuffer | ArrayBufferView | Blob | string | ReadableStream,
		options?: { httpMetadata?: { contentType?: string } }
	): Promise<unknown>;
	delete(key: string): Promise<void>;
}

export {};
