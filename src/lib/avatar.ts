/**
 * Avatar feature fully removed (no uploads, no generated avatars, no
 * avatar columns in the database). This module is now a dependency-free
 * shim: it keeps every exported name so the rest of the codebase keeps
 * compiling, but all behaviour is neutralised and the heavy @dicebear
 * dependency is gone.
 */

export type AvatarStyleKey = 'personas' | 'avataaarsNeutral' | 'notionistsNeutral'

export type AvatarOptionValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[]

export type AvatarOptionsMap = Record<string, AvatarOptionValue | undefined>

export type AvatarSelection = {
  avatarStyle: AvatarStyleKey
  avatarSeed: string
  avatarOptions: AvatarOptionsMap
}

export type AvatarFields = {
  avatarUrl?: string | null
  avatarStyle?: string | null
  avatarSeed?: string | null
  avatarOptions?: AvatarOptionsMap | null
}

export type AvatarToneKey = 'violet' | 'cyan' | 'aurora' | 'midnight' | 'rose' | 'ember'

export const AVATAR_TONES: Array<{
  id: AvatarToneKey
  label: string
  backgroundColor: string[]
}> = []

export const AVATAR_STYLE_REGISTRY = {} as Record<
  AvatarStyleKey,
  { key: AvatarStyleKey; label: string; description: string }
>

export const AVATAR_STYLE_OPTIONS: Array<{
  key: AvatarStyleKey
  label: string
  description: string
}> = []

const DEFAULT_SELECTION: AvatarSelection = {
  avatarStyle: 'personas',
  avatarSeed: 'guest',
  avatarOptions: {},
}

export function normalizeAvatarUrl(_url?: string | null): string | null {
  return null
}

export function sanitizeAvatarOptions(_value: unknown): AvatarOptionsMap | null {
  return null
}

export function normalizeAvatarSelection(
  _value?: AvatarFields | null,
  _fallbackSeed = 'guest'
): AvatarSelection | null {
  return null
}

export function buildAvatarOptions(
  _style: AvatarStyleKey,
  _options?: AvatarOptionsMap | null
): AvatarOptionsMap {
  return {}
}

export function buildAvatarDataUri(
  _value?: AvatarFields | null,
  _options?: { size?: number; fallbackSeed?: string }
): string | null {
  return null
}

export function avatarInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || 'User'
  const parts = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
  return parts.join('') || 'U'
}

export function avatarIdentitySeed(parts: Array<string | null | undefined>) {
  const clean = parts
    .map(value => value?.trim())
    .filter(Boolean)
    .join('-')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return clean || 'guest'
}

export function createAvatarVariantSet(
  _baseSeed: string,
  _style: AvatarStyleKey,
  _count = 6
): AvatarSelection[] {
  return []
}

export function buildDefaultAvatarSelection(
  _baseSeed: string,
  _style: AvatarStyleKey = 'personas'
): AvatarSelection {
  return { ...DEFAULT_SELECTION }
}

export function avatarSelectionSignature(_value?: AvatarFields | null) {
  return 'none'
}

export function isAvatarSelectionEqual(
  _left?: AvatarFields | null,
  _right?: AvatarFields | null
) {
  // Avatars no longer vary — always considered equal so nothing ever
  // reports an "unsaved avatar change".
  return true
}

export function avatarSelectionToProfileUpdate(
  _value?: AvatarFields | null
): Record<string, never> {
  // No avatar columns are written anymore.
  return {}
}
