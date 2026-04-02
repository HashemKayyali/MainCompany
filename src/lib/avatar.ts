import { createAvatar } from '@dicebear/core'
import { avataaarsNeutral, notionistsNeutral, personas } from '@dicebear/collection'

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
}> = [
  { id: 'violet', label: 'Violet', backgroundColor: ['2a1459', '4c1d95'] },
  { id: 'cyan', label: 'Cyan', backgroundColor: ['103255', '0f766e'] },
  { id: 'aurora', label: 'Aurora', backgroundColor: ['1b2453', '7c3aed'] },
  { id: 'midnight', label: 'Midnight', backgroundColor: ['12182f', '24335d'] },
  { id: 'rose', label: 'Rose', backgroundColor: ['35143e', 'be185d'] },
  { id: 'ember', label: 'Ember', backgroundColor: ['311820', 'ea580c'] },
]

export const AVATAR_STYLE_REGISTRY = {
  personas: {
    key: 'personas' as const,
    label: 'Studio',
    description: 'Illustrated portrait cards with premium depth.',
    create: personas,
    defaults: {
      radius: 22,
      scale: 97,
      backgroundType: ['gradientLinear'] as Array<'gradientLinear'>,
      translateY: 1,
    },
  },
  avataaarsNeutral: {
    key: 'avataaarsNeutral' as const,
    label: 'Classic',
    description: 'Refined bust avatars with a crisp SaaS identity.',
    create: avataaarsNeutral,
    defaults: {
      radius: 22,
      scale: 92,
      backgroundType: ['gradientLinear'] as Array<'gradientLinear'>,
    },
  },
  notionistsNeutral: {
    key: 'notionistsNeutral' as const,
    label: 'Editorial',
    description: 'Minimal portrait styling with a softer illustrated feel.',
    create: notionistsNeutral,
    defaults: {
      radius: 22,
      scale: 95,
      backgroundType: ['gradientLinear'] as Array<'gradientLinear'>,
    },
  },
}

export const AVATAR_STYLE_OPTIONS = Object.values(AVATAR_STYLE_REGISTRY)

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}

function normalizeSeed(seed?: string | null) {
  const clean = seed?.trim()
  return clean ? clean.slice(0, 140) : null
}

function normalizeStyle(style?: string | null): AvatarStyleKey | null {
  if (!style) return null
  return style in AVATAR_STYLE_REGISTRY ? (style as AvatarStyleKey) : null
}

export function normalizeAvatarUrl(url?: string | null) {
  const clean = url?.trim()
  return clean ? clean : null
}

export function sanitizeAvatarOptions(value: unknown): AvatarOptionsMap | null {
  if (!isPlainObject(value)) return null

  const sanitized: AvatarOptionsMap = {}
  for (const [key, optionValue] of Object.entries(value)) {
    if (
      optionValue === null ||
      typeof optionValue === 'string' ||
      typeof optionValue === 'number' ||
      typeof optionValue === 'boolean'
    ) {
      sanitized[key] = optionValue
      continue
    }

    if (
      Array.isArray(optionValue) &&
      optionValue.every(
        item =>
          typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean'
      )
    ) {
      sanitized[key] = optionValue as string[] | number[] | boolean[]
    }
  }

  return Object.keys(sanitized).length ? sanitized : null
}

export function normalizeAvatarSelection(
  value?: AvatarFields | null,
  fallbackSeed = 'guest'
): AvatarSelection | null {
  const avatarStyle = normalizeStyle(value?.avatarStyle)
  const avatarSeed = normalizeSeed(value?.avatarSeed)
  const avatarOptions = sanitizeAvatarOptions(value?.avatarOptions)

  if (!avatarStyle || !avatarSeed) return null

  return {
    avatarStyle,
    avatarSeed: avatarSeed || fallbackSeed,
    avatarOptions: avatarOptions || {},
  }
}

export function buildAvatarOptions(style: AvatarStyleKey, options?: AvatarOptionsMap | null) {
  const sanitized = sanitizeAvatarOptions(options) || {}
  const tone = typeof sanitized.tone === 'string' ? sanitized.tone : 'violet'
  const palette =
    AVATAR_TONES.find(entry => entry.id === tone)?.backgroundColor || AVATAR_TONES[0].backgroundColor

  return {
    ...AVATAR_STYLE_REGISTRY[style].defaults,
    ...sanitized,
    backgroundColor: Array.isArray(sanitized.backgroundColor)
      ? (sanitized.backgroundColor as string[])
      : palette,
  }
}

export function buildAvatarDataUri(
  value?: AvatarFields | null,
  options?: {
    size?: number
    fallbackSeed?: string
  }
) {
  const selection = normalizeAvatarSelection(value, options?.fallbackSeed)
  if (!selection) return null

  const styleEntry = AVATAR_STYLE_REGISTRY[selection.avatarStyle]
  const avatar = createAvatar(styleEntry.create as any, {
    seed: selection.avatarSeed,
    size: options?.size ?? 128,
    ...buildAvatarOptions(selection.avatarStyle, selection.avatarOptions),
  })

  return avatar.toDataUri()
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

export function createAvatarVariantSet(baseSeed: string, style: AvatarStyleKey, count = 6) {
  return Array.from({ length: count }, (_, index) => {
    const tone = AVATAR_TONES[index % AVATAR_TONES.length]
    return {
      avatarStyle: style,
      avatarSeed: `${baseSeed}-${style}-${index + 1}`,
      avatarOptions: {
        tone: tone.id,
        backgroundColor: tone.backgroundColor,
      },
    } satisfies AvatarSelection
  })
}

export function buildDefaultAvatarSelection(baseSeed: string, style: AvatarStyleKey = 'personas') {
  return createAvatarVariantSet(baseSeed, style, 1)[0]
}

export function avatarSelectionSignature(value?: AvatarFields | null) {
  const normalized = normalizeAvatarSelection(value)
  if (!normalized) return 'none'

  return [
    normalized.avatarStyle,
    normalized.avatarSeed,
    JSON.stringify(sanitizeAvatarOptions(normalized.avatarOptions) || {}),
  ].join('::')
}

export function isAvatarSelectionEqual(
  left?: AvatarFields | null,
  right?: AvatarFields | null
) {
  return avatarSelectionSignature(left) === avatarSelectionSignature(right)
}

export function avatarSelectionToProfileUpdate(value?: AvatarFields | null) {
  const normalized = normalizeAvatarSelection(value)

  return {
    avatar_style: normalized?.avatarStyle ?? null,
    avatar_seed: normalized?.avatarSeed ?? null,
    avatar_options: normalized?.avatarOptions ?? null,
  }
}
