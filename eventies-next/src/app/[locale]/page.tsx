import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing, type AppLocale } from '@/i18n/routing'

/**
 * P1 plumbing-proof page ONLY (phase prompt: "a page exists only as needed
 * to prove plumbing"). Proves: [locale] SSR, lang/dir, per-locale messages,
 * hreflang pairs + x-default (08 §Metadata). Replaced by the real home in P2.
 */

const SITE_URL = 'https://www.eventiesjo.com'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'Eventies — foundation',
    alternates: {
      canonical: locale === 'ar' ? `${SITE_URL}/ar` : `${SITE_URL}/`,
      languages: {
        en: `${SITE_URL}/`,
        ar: `${SITE_URL}/ar`,
        'x-default': `${SITE_URL}/`,
      },
    },
  }
}

export default async function FoundationPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale as AppLocale)
  const t = await getTranslations('common')

  return (
    <main>
      <h1>{t('appName')}</h1>
      <p>{t('hello')}</p>
      <p data-testid="locale-proof">{t('localeProof')}</p>
      <p data-testid="locale-value">{locale}</p>
      <p data-testid="available-locales">{routing.locales.join(',')}</p>
    </main>
  )
}
