import { SupabaseClient } from 'npm:@supabase/supabase-js@2';

export interface Membership {
  party_id: string;
  status: 'active' | 'muted' | 'suspended' | 'removed';
}

export async function currentMembership(
  db: SupabaseClient,
  userId: string,
): Promise<Membership | null> {
  const { data } = await db
    .from('party_members')
    .select('party_id, status')
    .eq('user_id', userId)
    .maybeSingle();
  return data as Membership | null;
}

/**
 * Members allowed to write on mufakat: active posts flagged, muted posts
 * flagless (author_party_id = NULL — M0-06). Suspended/removed cannot write.
 */
export function mufakatPartyFlag(m: Membership | null): { ok: boolean; partyId: string | null } {
  if (!m || m.status === 'suspended' || m.status === 'removed') {
    return { ok: false, partyId: null };
  }
  return { ok: true, partyId: m.status === 'muted' ? null : m.party_id };
}

export async function getConfig<T>(db: SupabaseClient, key: string): Promise<T> {
  const { data, error } = await db
    .from('platform_config')
    .select('value')
    .eq('key', key)
    .single();
  if (error) throw new Error(`missing platform_config: ${key}`);
  return data.value as T;
}

export async function isAdmin(db: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await db
    .from('platform_admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return !!data;
}

export async function notify(
  db: SupabaseClient,
  userId: string,
  type: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await db.from('notifications').insert({ user_id: userId, type, payload });
}
