import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { alexandria, sora, ibmPlexSansArabic } from '@/lib/fonts'
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
    <html
      lang={locale}
      dir={dir}
      className={`${alexandria.variable} ${sora.variable} ${ibmPlexSansArabic.variable}`}
    >
      <head>
        {/* FOUND-032 — preconnect parity with the audited index.html:
            Supabase (data) + Cloudinary (images) + Fontshare (Zodiak, until
            self-hosted in P2). Google Fonts preconnects are obsolete here:
            next/font self-hosts those files. */}
        <link rel="preconnect" href="https://dqizzlcsioqykfeldtsj.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://dqizzlcsioqykfeldtsj.supabase.co" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
      </head>
      <body className="font-sans">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
