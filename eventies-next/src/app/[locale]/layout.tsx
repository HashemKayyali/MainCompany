import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import '../globals.css'

/**
 * Root layout INSIDE the [locale] segment (03 §Locale architecture):
 * sets <html lang dir> from the server — zero client flash (08 §Direction).
 * setRequestLocale enables static rendering per locale.
 */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// NOTE (D-P1-01): route-segment configs like `dynamicParams` are incompatible
// with cacheComponents, so unknown paths currently serve Next's PPR 404
// fallback — HTTP 200 + <meta name="robots" content="noindex"> + client-rendered
// 404 UI. Real-HTTP-404 strategy is a P2 decision gated by SEO-404 (see
// PHASE_01_REPORT discoveries).

export const metadata: Metadata = {
  title: 'Eventies',
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
