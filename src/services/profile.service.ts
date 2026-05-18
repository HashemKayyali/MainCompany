import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import type { AvatarFields } from '../lib/avatar'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileIdentityCoreRow = Pick<
  ProfileRow,
  'id' | 'name' | 'email' | 'phone' | 'role' | 'created_at'
>
export type ProfileIdentityRow = ProfileIdentityCoreRow

export const PROFILE_CORE_SELECT = 'id, name, email, phone, role, created_at'

// Avatar feature removed — these column-presence predicates are kept as
// harmless stubs so existing importers keep compiling.
export function isMissingAvatarColumnError(_error: unknown) {
  return false
}
export function isMissingGeneratedAvatarColumnError(_error: unknown) {
  return false
}
export function isMissingAvatarUrlColumnError(_error: unknown) {
  return false
}

// Always returns empty avatar fields. The app no longer reads or writes
// any avatar columns; identity chips render initials only.
export function mapProfileAvatarFields(
  _row?: unknown
): Required<AvatarFields> {
  return {
    avatarUrl: null,
    avatarStyle: null,
    avatarSeed: null,
    avatarOptions: null,
  }
}

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

export async function fetchProfileAvatarMap(
  _ids: string[]
): Promise<Record<string, Required<AvatarFields>>> {
  // No avatar columns exist anymore.
  return {}
}
