'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { PRIMARY_NAV } from './nav-links'

/**
 * CAT-001 nav island — the ONLY client part of the header: mobile menu toggle
 * + active-link state (needs usePathname). Desktop links render inline; below
 * `md` they collapse behind a labelled toggle (A11Y-003 keyboard-operable).
 * Navigation uses the locale-aware <Link> wrapper (03 §Locale architecture).
 */
export function NavMenu() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <nav aria-label={t('mainNavigation')} className="flex items-center">
      <ul className="hidden items-center gap-1 md:flex">
        {PRIMARY_NAV.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? 'page' : undefined}
              className="rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-brand-50 hover:text-brand-700 aria-[current=page]:text-brand-700"
            >
              {t(item.key)}
            </Link>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="inline-flex items-center rounded-lg border border-ink-200 px-3 py-2 text-sm md:hidden"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
      >
        {t('menu')}
      </button>

      {open ? (
        <ul
          id="mobile-nav"
          className="absolute inset-x-0 top-full z-40 flex flex-col gap-1 border-t border-ink-100 bg-white p-4 shadow-violet-md md:hidden"
        >
          {PRIMARY_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-brand-50 aria-[current=page]:text-brand-700"
                onClick={() => setOpen(false)}
              >
                {t(item.key)}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  )
}
