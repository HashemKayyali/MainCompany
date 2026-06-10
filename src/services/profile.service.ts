import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileIdentityCoreRow = Pick<
  ProfileRow,
  'id' | 'name' | 'email' | 'phone' | 'role' | 'created_at'
>
export type ProfileIdentityRow = ProfileIdentityCoreRow

export const PROFILE_CORE_SELECT = 'id, name, email, phone, role, created_at'

export async function fetchProfileIdentityRow(
  userId: string
): Promise<ProfileIdentityRow | null> {
  const response = await supabase
    .from('profiles')
    .select(PROFILE_CORE_SELECT)
    .eq('id', userId)
    .maybeSingle()

  if (response.error || !response.data) return null
  return response.data as unknown as ProfileIdentityRow
}
