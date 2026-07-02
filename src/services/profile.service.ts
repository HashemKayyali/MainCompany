import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileIdentityCoreRow = Pick<
  ProfileRow,
  'id' | 'name' | 'email' | 'phone' | 'role' | 'created_at'
>
export type ProfileIdentityRow = ProfileIdentityCoreRow

export const PROFILE_CORE_SELECT = 'id, name, email, phone, role, created_at'

// The identity row is fetched independently by UserContext and AuthContext at
// session start (and each is double-invoked under React 18 StrictMode in dev),
// producing 2-4 identical `profiles?id=eq.<uid>` requests for the same user.
// Dedupe *concurrent* calls by sharing the in-flight promise keyed by userId.
// The entry is cleared as soon as the request settles, so a later call always
// re-fetches fresh data (role/name can change) — this is not a result cache.
const inFlightIdentityRequests = new Map<string, Promise<ProfileIdentityRow | null>>()

export async function fetchProfileIdentityRow(
  userId: string
): Promise<ProfileIdentityRow | null> {
  const existing = inFlightIdentityRequests.get(userId)
  if (existing) return existing

  const request = (async () => {
    const response = await supabase
      .from('profiles')
      .select(PROFILE_CORE_SELECT)
      .eq('id', userId)
      .maybeSingle()

    if (response.error || !response.data) return null
    return response.data as unknown as ProfileIdentityRow
  })().finally(() => {
    inFlightIdentityRequests.delete(userId)
  })

  inFlightIdentityRequests.set(userId, request)
  return request
}
