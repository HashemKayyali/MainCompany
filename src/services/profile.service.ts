import { supabase } from '../lib/supabase'
import type { Database } from '../lib/database.types'
import { sanitizeAvatarOptions, type AvatarFields } from '../lib/avatar'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileIdentityCoreRow = Pick<ProfileRow, 'id' | 'name' | 'email' | 'phone' | 'role' | 'created_at'>
type ProfileAvatarRow = Pick<
  ProfileRow,
  'id' | 'avatar_url' | 'avatar_style' | 'avatar_seed' | 'avatar_options'
>
export type ProfileIdentityRow = ProfileIdentityCoreRow & Partial<ProfileAvatarRow>

export const PROFILE_CORE_SELECT = 'id, name, email, phone, role, created_at'
export const PROFILE_GENERATED_AVATAR_SELECT = 'avatar_style, avatar_seed, avatar_options'
export const PROFILE_UPLOADED_AVATAR_SELECT = 'avatar_url'

let generatedAvatarColumnsAvailable: boolean | null = null
let avatarUrlColumnAvailable: boolean | null = null

export function isMissingAvatarColumnError(error: unknown) {
  const candidate = error as { code?: string | null; message?: string | null; details?: string | null }
  const text = `${candidate?.message || ''} ${candidate?.details || ''}`.toLowerCase()
  return (
    candidate?.code === '42703' &&
    (
      text.includes('avatar_url') ||
      text.includes('avatar_style') ||
      text.includes('avatar_seed') ||
      text.includes('avatar_options')
    )
  )
}

export function isMissingGeneratedAvatarColumnError(error: unknown) {
  const candidate = error as { code?: string | null; message?: string | null; details?: string | null }
  const text = `${candidate?.message || ''} ${candidate?.details || ''}`.toLowerCase()
  return (
    candidate?.code === '42703' &&
    (
      text.includes('avatar_style') ||
      text.includes('avatar_seed') ||
      text.includes('avatar_options')
    )
  )
}

export function isMissingAvatarUrlColumnError(error: unknown) {
  const candidate = error as { code?: string | null; message?: string | null; details?: string | null }
  const text = `${candidate?.message || ''} ${candidate?.details || ''}`.toLowerCase()
  return candidate?.code === '42703' && text.includes('avatar_url')
}

function getProfileIdentitySelectClause() {
  const fields = [PROFILE_CORE_SELECT]
  if (generatedAvatarColumnsAvailable !== false) {
    fields.push(PROFILE_GENERATED_AVATAR_SELECT)
  }
  if (avatarUrlColumnAvailable !== false) {
    fields.push(PROFILE_UPLOADED_AVATAR_SELECT)
  }
  return fields.join(', ')
}

function getProfileAvatarSelectClause() {
  const fields = ['id']
  if (generatedAvatarColumnsAvailable !== false) {
    fields.push(PROFILE_GENERATED_AVATAR_SELECT)
  }
  if (avatarUrlColumnAvailable !== false) {
    fields.push(PROFILE_UPLOADED_AVATAR_SELECT)
  }
  return fields.join(', ')
}

export function mapProfileAvatarFields(
  row?: Partial<ProfileAvatarRow> | null
): Required<AvatarFields> {
  return {
    avatarUrl: row?.avatar_url ?? null,
    avatarStyle: row?.avatar_style ?? null,
    avatarSeed: row?.avatar_seed ?? null,
    avatarOptions: sanitizeAvatarOptions(row?.avatar_options),
  }
}

export async function fetchProfileIdentityRow(userId: string): Promise<ProfileIdentityRow | null> {
  let response = await supabase
    .from('profiles')
    .select(getProfileIdentitySelectClause())
    .eq('id', userId)
    .maybeSingle()

  if (response.error && avatarUrlColumnAvailable !== false && isMissingAvatarUrlColumnError(response.error)) {
    avatarUrlColumnAvailable = false
    response = await supabase
      .from('profiles')
      .select(getProfileIdentitySelectClause())
      .eq('id', userId)
      .maybeSingle()
  }

  if (
    response.error &&
    generatedAvatarColumnsAvailable !== false &&
    isMissingGeneratedAvatarColumnError(response.error)
  ) {
    generatedAvatarColumnsAvailable = false
    response = await supabase
      .from('profiles')
      .select(getProfileIdentitySelectClause())
      .eq('id', userId)
      .maybeSingle()
  }

  if (response.error || !response.data) return null
  if (generatedAvatarColumnsAvailable !== false) generatedAvatarColumnsAvailable = true
  if (avatarUrlColumnAvailable !== false) avatarUrlColumnAvailable = true
  return response.data as unknown as ProfileIdentityRow
}

export async function fetchProfileAvatarMap(ids: string[]) {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)))
  if (!uniqueIds.length) return {} as Record<string, Required<AvatarFields>>
  if (generatedAvatarColumnsAvailable === false && avatarUrlColumnAvailable === false) {
    return {} as Record<string, Required<AvatarFields>>
  }

  let response = await supabase
    .from('profiles')
    .select(getProfileAvatarSelectClause())
    .in('id', uniqueIds)

  if (response.error && avatarUrlColumnAvailable !== false && isMissingAvatarUrlColumnError(response.error)) {
    avatarUrlColumnAvailable = false
    response = await supabase
      .from('profiles')
      .select(getProfileAvatarSelectClause())
      .in('id', uniqueIds)
  }

  if (
    response.error &&
    generatedAvatarColumnsAvailable !== false &&
    isMissingGeneratedAvatarColumnError(response.error)
  ) {
    generatedAvatarColumnsAvailable = false
    response = await supabase
      .from('profiles')
      .select(getProfileAvatarSelectClause())
      .in('id', uniqueIds)
  }

  if (response.error || !response.data) return {} as Record<string, Required<AvatarFields>>
  if (generatedAvatarColumnsAvailable !== false) generatedAvatarColumnsAvailable = true
  if (avatarUrlColumnAvailable !== false) avatarUrlColumnAvailable = true

  return ((response.data as unknown as ProfileAvatarRow[]) || []).reduce<Record<string, Required<AvatarFields>>>(
    (acc, row) => {
      acc[row.id] = mapProfileAvatarFields(row)
      return acc
    },
    {}
  )
}
