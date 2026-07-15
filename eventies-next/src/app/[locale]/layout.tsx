import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SiteNav } from '@/components/layout/SiteNav'
import { SiteBackground } from '@/components/layout/SiteBackground'
import { CatalogSiteFooter, CatalogSiteNav } from './SiteCatalogChrome'
import { JsonLd } from '@/components/JsonLd'
import { GLOBAL_JSON_LD } from '@/server/metadata/jsonld'
import { AuthSessionLifecycle } from '@/features/auth/AuthSessionLifecycle'
import { RealtimeShell } from '@/features/realtime/RealtimeShell'
import { alexandria, ibmPlexSansArabic, sora } from '@/lib/fonts'
import '../globals.css'

/**
 * Root layout INSIDE the [locale] segment (03 §Locale architecture):
 * sets <html lang dir> from the server — zero client flash (08 §Direction).
 * The fixed animated backdrop + transparent-over-hero navbar mirror the Vite
 * PageContainer; content sits above the backdrop and clears the fixed navbar
 * via `--app-header-offset` (hero islands pull back up under it).
 */

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Eventies',
}

function supabaseOrigin(): string | null {
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!configuredUrl) return null

  try {
    const url = new URL(configuredUrl)
    return url.protocol === 'https:' ? url.origin : null
  } catch {
    return null
  }
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
  setRequestLocale(locale as 'en' | 'ar')

  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const tn = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'nav' })

  const shellStyle = {
    '--app-navbar-height': '74px',
    '--app-header-offset': '74px',
  } as CSSProperties
  const configuredSupabaseOrigin = supabaseOrigin()

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${alexandria.variable} ${ibmPlexSansArabic.variable} ${sora.variable} light`}
    >
      <head>
        {configuredSupabaseOrigin ? (
          <>
            <link rel="preconnect" href={configuredSupabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={configuredSupabaseOrigin} />
          </>
        ) : null}
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
      </head>
      <body>
        {GLOBAL_JSON_LD.map((node, i) => (
          <JsonLd key={i} data={node} />
        ))}
        <NextIntlClientProvider>
          <AuthSessionLifecycle />
          <RealtimeShell />
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[100] focus:rounded-xl focus:bg-violet-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
          >
            {tn('skipToContent')}
          </a>
          <div className="relative flex min-h-screen min-w-0 flex-col overflow-x-clip">
            <SiteBackground />
            <div className="relative z-10 flex min-h-screen min-w-0 flex-col" style={shellStyle}>
              <Suspense fallback={<SiteNav locale={locale} search={[]} categories={[]} />}>
                <CatalogSiteNav locale={locale} />
              </Suspense>
              <main id="main-content" className="min-w-0 flex-1 pt-[var(--app-header-offset)]">
                {children}
              </main>
              <Suspense fallback={null}>
                <CatalogSiteFooter locale={locale} />
              </Suspense>
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
