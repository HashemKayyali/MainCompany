import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { JsonLd } from '@/components/JsonLd'
import { GLOBAL_JSON_LD } from '@/server/metadata/jsonld'
import { SearchDialog, type SearchItem } from '@/features/catalog/SearchDialog'
import { getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
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
  setRequestLocale(locale as 'en' | 'ar')

  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  // CAT-019 search index — built server-side from the cached DAL and handed to
  // the header as a slot (keeps components/ free of server/feature imports).
  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const searchItems: SearchItem[] = [
    ...products.map((p) => ({
      type: 'product' as const,
      name: p.name,
      href: `/products/${p.slug}`,
    })),
    ...categories.map((c) => ({
      type: 'category' as const,
      name: c.name,
      href: `/categories/${c.slug}`,
    })),
  ]

  return (
    <html lang={locale} dir={dir} className="light">
      <head>
        {/* Font + data preconnects matching the audited index.html. Fonts load
            by literal family name (globals.css @import) so the ported Vite CSS
            resolves 'Alexandria'/'Sora'/'Zodiak'/'IBM Plex Sans Arabic'. */}
        <link rel="preconnect" href="https://dqizzlcsioqykfeldtsj.supabase.co" crossOrigin="" />
        <link rel="dns-prefetch" href="https://dqizzlcsioqykfeldtsj.supabase.co" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
      </head>
      <body>
        {GLOBAL_JSON_LD.map((node, i) => (
          <JsonLd key={i} data={node} />
        ))}
        <NextIntlClientProvider>
          <SiteHeader locale={locale} searchSlot={<SearchDialog items={searchItems} />} />
          <main id="main-content">{children}</main>
          <SiteFooter
            locale={locale}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
