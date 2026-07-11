import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { NavMenu } from './NavMenu'
import { LanguageSwitcher } from './LanguageSwitcher'

/**
 * CAT-001 header — server component (A11Y-001 landmark <header>/<nav>). The
 * interactive parts (mobile menu, language switch) are small client islands;
 * the shell itself is server-rendered.
 */
export async function SiteHeader({ locale }: { locale: string }) {
  const t = await getTranslations('nav')
  return (
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
          <LanguageSwitcher locale={locale} />
        </div>
      </div>
    </header>
  )
}
