import type { ReactNode } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { NavMenu } from './NavMenu'
import { LanguageSwitcher } from './LanguageSwitcher'

/**
 * CAT-001 header — server component (A11Y-001 landmark). Rendered inside a
 * <Suspense> boundary in the layout so it prerenders on static routes and
 * streams as a dynamic hole on the per-request real-404 routes. Interactive
 * parts (mobile menu, language switch) are small client islands. Includes the
 * skip-link.
 */
export async function SiteHeader({
  locale,
  searchSlot,
}: {
  locale: string
  searchSlot?: ReactNode
}) {
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'nav' })
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
      >
        {t('skipToContent')}
      </a>
      <header className="relative border-b border-ink-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" aria-label={t('home')} className="flex shrink-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, fixed size, no transform */}
            <img
              src="/brand/eventies_logo_horizontal_800.webp"
              alt="Eventies"
              width={148}
              height={32}
              className="h-8 w-auto"
            />
          </Link>
          <div className="flex items-center gap-2">
            <NavMenu />
            {searchSlot}
            <LanguageSwitcher locale={locale} />
          </div>
        </div>
      </header>
    </>
  )
}
