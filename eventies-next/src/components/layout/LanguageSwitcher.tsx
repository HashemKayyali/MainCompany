'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * I18N-003 — language switcher: navigates to the alternate-locale URL of the
 * SAME deep path (preserves the route) and sets the NEXT_LOCALE cookie (the
 * router wrapper does both). No full reload; no path loss.
 */
export function LanguageSwitcher({
  locale,
  className,
  compact = false,
}: {
  locale: string
  className?: string
  compact?: boolean
}) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()
  const target = locale === 'ar' ? 'en' : 'ar'
  const base = compact
    ? 'inline-flex h-9 items-center justify-center rounded-full border px-3 font-display text-[13px] font-bold transition-all'
    : 'inline-flex h-11 items-center justify-center rounded-full border px-3.5 font-display text-[13px] font-bold transition-all'

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: target })}
      className={`${base} ${className ?? 'border-ink-200 bg-white text-ink-800 hover:bg-violet-50'}`}
      aria-label={target === 'ar' ? t('switchToArabic') : t('switchToEnglish')}
    >
      {target === 'ar' ? 'ع' : 'EN'}
    </button>
  )
}

export const LOCALES = routing.locales
