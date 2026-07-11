import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { PRIMARY_NAV } from './nav-links'

/**
 * CAT-001 footer — server component, landmark <footer> (A11Y-001). Legal links
 * point at the canonical primaries (not the 301 aliases). Contact email is the
 * public support address.
 */
const LEGAL = [
  { href: '/privacy-policy', key: 'privacy' },
  { href: '/terms', key: 'terms' },
  { href: '/vendor-terms', key: 'vendorTerms' },
  { href: '/refund-policy', key: 'refund' },
  { href: '/cookie-policy', key: 'cookies' },
] as const

export async function SiteFooter() {
  const t = await getTranslations('footer')
  const tn = await getTranslations('nav')
  // Static: reading the clock in a prerendered server component is disallowed
  // under cacheComponents. The copyright year updates on deploy.
  const year = 2026

  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-50/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold text-ink-900">Eventies</p>
          <p className="mt-2 text-sm text-ink-600">{t('tagline')}</p>
          <a href="mailto:support@eventiesjo.com" className="mt-3 inline-block text-sm text-brand-700">
            support@eventiesjo.com
          </a>
        </div>
        <nav aria-label={t('exploreHeading')}>
          <p className="text-sm font-semibold text-ink-900">{t('exploreHeading')}</p>
          <ul className="mt-3 space-y-2">
            {PRIMARY_NAV.filter((i) => i.href !== '/').map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-sm text-ink-600 hover:text-brand-700">
                  {tn(i.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t('legalHeading')}>
          <p className="text-sm font-semibold text-ink-900">{t('legalHeading')}</p>
          <ul className="mt-3 space-y-2">
            {LEGAL.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="text-sm text-ink-600 hover:text-brand-700">
                  {t(i.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="text-sm font-semibold text-ink-900">{t('contactHeading')}</p>
          <p className="mt-3 text-sm text-ink-600">{t('contactBody')}</p>
        </div>
      </div>
      <div className="border-t border-ink-100 py-4 text-center text-xs text-ink-500">
        © {year} Eventies. {t('rights')}
      </div>
    </footer>
  )
}
