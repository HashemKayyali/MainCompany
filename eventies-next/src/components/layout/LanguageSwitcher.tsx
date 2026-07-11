'use client'

import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * I18N-003 — language switcher: navigates to the alternate-locale URL of the
 * SAME deep path (preserves the route) and sets the NEXT_LOCALE cookie (the
 * router wrapper does both). No full reload; no path loss.
 */
export function LanguageSwitcher({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()
  const target = locale === 'ar' ? 'en' : 'ar'

  return (
    <button
      type="button"
      onClick={() => router.replace(pathname, { locale: target })}
      className="rounded-lg border border-ink-200 px-3 py-2 text-sm font-medium"
      aria-label={target === 'ar' ? t('switchToArabic') : t('switchToEnglish')}
    >
      {target === 'ar' ? 'ع' : 'EN'}
    </button>
  )
}

export const LOCALES = routing.locales
