import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, RefreshCw, Sparkles } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  AVATAR_STYLE_OPTIONS,
  avatarSelectionSignature,
  avatarIdentitySeed,
  buildDefaultAvatarSelection,
  createAvatarVariantSet,
  isAvatarSelectionEqual,
  normalizeAvatarSelection,
  type AvatarSelection,
} from '../../lib/avatar'
import UserAvatar from './UserAvatar'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

type AvatarPickerProps = {
  value?: AvatarSelection | null
  onChange: (value: AvatarSelection) => void
  identitySeed: string
  title?: string
  description?: string
  compact?: boolean
}

export default function AvatarPicker({
  value,
  onChange,
  identitySeed,
  title = 'Choose an avatar',
  description = 'Pick a polished portrait identity that follows you across the full app.',
  compact = false,
}: AvatarPickerProps) {
  const { isDark } = useTheme()
  const valueSignature = useMemo(
    () => avatarSelectionSignature(value),
    [value?.avatarStyle, value?.avatarSeed, JSON.stringify(value?.avatarOptions || {})]
  )
  const normalizedValue = useMemo(
    () => normalizeAvatarSelection(value),
    [valueSignature]
  )
  const [activeStyle, setActiveStyle] = useState(normalizedValue?.avatarStyle || 'personas')
  const [variantSet, setVariantSet] = useState(0)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const normalizedSeed = useMemo(
    () => avatarIdentitySeed([identitySeed, String(variantSet)]),
    [identitySeed, variantSet]
  )

  const variants = useMemo(
    () => createAvatarVariantSet(normalizedSeed, activeStyle, compact ? 4 : 6),
    [activeStyle, compact, normalizedSeed]
  )

  const preferredSelection = useMemo(
    () => variants[0] || buildDefaultAvatarSelection(normalizedSeed, activeStyle),
    [activeStyle, normalizedSeed, variants]
  )
  const preferredSelectionSignature = useMemo(
    () => avatarSelectionSignature(preferredSelection),
    [preferredSelection.avatarStyle, preferredSelection.avatarSeed, JSON.stringify(preferredSelection.avatarOptions || {})]
  )

  useEffect(() => {
    if (normalizedValue?.avatarStyle && normalizedValue.avatarStyle !== activeStyle) {
      setActiveStyle(normalizedValue.avatarStyle)
    }
  }, [activeStyle, normalizedValue?.avatarStyle])

  useEffect(() => {
    const hasMatchingVariant = variants.some(variant => isAvatarSelectionEqual(variant, normalizedValue))
    const shouldAutoSelect =
      !normalizedValue ||
      normalizedValue.avatarStyle !== activeStyle ||
      !hasMatchingVariant

    if (shouldAutoSelect && !isAvatarSelectionEqual(normalizedValue, preferredSelection)) {
      onChangeRef.current(preferredSelection)
    }
  }, [activeStyle, normalizedValue, preferredSelection, preferredSelectionSignature, variants, valueSignature])

  const selected = normalizedValue && normalizedValue.avatarStyle === activeStyle
    ? normalizedValue
    : preferredSelection

  return (
    <div
      className={cn(
        'rounded-[22px] border p-3.5 sm:p-4',
        isDark
          ? 'border-cyan-400/12 bg-[linear-gradient(180deg,rgba(10,14,28,0.92),rgba(8,11,22,0.96))] shadow-[0_28px_70px_-52px_rgba(34,211,238,0.22)]'
          : 'border-violet-200/70 bg-white/90 shadow-[0_20px_42px_-28px_rgba(124,58,237,0.18)]'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.18em]',
              isDark
                ? 'bg-cyan-400/10 text-cyan-100/80 ring-1 ring-inset ring-cyan-300/12'
                : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
            )}
          >
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
            Avatar identity
          </div>
          <h3 className={cn('mt-2.5 font-display text-[0.98rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
            {title}
          </h3>
          <p className={cn('mt-1 max-w-[36rem] text-[11.5px] leading-5', isDark ? 'text-purple-100/64' : 'text-gray-600')}>
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setVariantSet(value => value + 1)}
          className={cn(
            'inline-flex h-9 items-center gap-2 rounded-[13px] px-3 text-[10px] font-semibold transition',
            isDark
              ? 'bg-[#0f1733] text-cyan-100/82 ring-1 ring-inset ring-cyan-400/14 hover:bg-[#111d40] hover:text-white'
              : 'bg-white text-violet-700 ring-1 ring-inset ring-violet-200 hover:bg-violet-50'
          )}
        >
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.9} />
          New set
        </button>
      </div>

      <div className={cn('mt-3.5 grid gap-3.5', compact ? 'lg:grid-cols-[168px_minmax(0,1fr)]' : 'lg:grid-cols-[190px_minmax(0,1fr)]')}>
        <div
          className={cn(
            'rounded-[18px] border p-2.5',
            isDark
              ? 'border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))]'
              : 'border-violet-100 bg-violet-50/50'
          )}
        >
          <div className="relative overflow-hidden rounded-[18px]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_48%)]" />
            <UserAvatar
              name="Avatar"
              avatarStyle={selected.avatarStyle}
              avatarSeed={selected.avatarSeed}
              avatarOptions={selected.avatarOptions}
              className="aspect-square rounded-[18px]"
            />
          </div>

          <div className="mt-2.5 space-y-1">
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-cyan-100/42' : 'text-violet-600/56')}>
              Active style
            </div>
            <div className={cn('font-medium', isDark ? 'text-white' : 'text-gray-900')}>
              {AVATAR_STYLE_OPTIONS.find(style => style.key === selected.avatarStyle)?.label}
            </div>
            <div className={cn('text-[10px]', isDark ? 'text-purple-100/42' : 'text-gray-500')}>
              Seed: {selected.avatarSeed}
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-2">
            {AVATAR_STYLE_OPTIONS.map(style => {
              const active = style.key === activeStyle
              return (
                <button
                  key={style.key}
                  type="button"
                  onClick={() => setActiveStyle(style.key)}
                  className={cn(
                    'inline-flex min-h-[36px] items-center rounded-[13px] px-3 text-[10px] font-semibold transition',
                    active
                      ? isDark
                        ? 'bg-[linear-gradient(135deg,rgba(27,66,92,0.98),rgba(20,44,74,0.96))] text-white ring-1 ring-inset ring-cyan-300/22 shadow-[0_14px_34px_-24px_rgba(34,211,238,0.32)]'
                        : 'bg-violet-100 text-violet-800 ring-1 ring-inset ring-violet-300'
                      : isDark
                        ? 'bg-[#0c132b]/90 text-purple-100/78 ring-1 ring-inset ring-white/8 hover:bg-[#101938] hover:text-white'
                        : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-violet-50 hover:text-gray-900'
                  )}
                >
                  {style.label}
                </button>
              )
            })}
          </div>

          <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-3')}>
            {variants.map(variant => {
              const isSelected =
                selected.avatarStyle === variant.avatarStyle &&
                selected.avatarSeed === variant.avatarSeed

              return (
                <button
                  key={variant.avatarSeed}
                  type="button"
                  onClick={() => onChange(variant)}
                  className={cn(
                    'group relative rounded-[16px] border p-1.5 transition',
                    isSelected
                      ? isDark
                        ? 'border-cyan-300/28 bg-cyan-400/8 shadow-[0_18px_34px_-26px_rgba(34,211,238,0.32)]'
                        : 'border-violet-300 bg-violet-50 shadow-[0_18px_34px_-26px_rgba(124,58,237,0.2)]'
                      : isDark
                        ? 'border-white/8 bg-[#0b1228]/95 hover:border-cyan-400/18 hover:bg-[#101838]'
                        : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/60'
                  )}
                >
                  <UserAvatar
                    name="Avatar option"
                    avatarStyle={variant.avatarStyle}
                    avatarSeed={variant.avatarSeed}
                    avatarOptions={variant.avatarOptions}
                    className="aspect-square rounded-[14px]"
                  />

                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <span className={cn('text-[10px] font-medium', isDark ? 'text-purple-100/62' : 'text-gray-500')}>
                      {String(variant.avatarOptions.tone || '').replace(/^\w/, value =>
                        value.toUpperCase()
                      )}
                    </span>
                    {isSelected ? (
                      <span
                        className={cn(
                          'inline-flex h-5 w-5 items-center justify-center rounded-full',
                          isDark
                            ? 'bg-cyan-400/15 text-cyan-100 ring-1 ring-inset ring-cyan-300/18'
                            : 'bg-violet-100 text-violet-700 ring-1 ring-inset ring-violet-200'
                        )}
                      >
                        <Check className="h-3 w-3" strokeWidth={2.1} />
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
