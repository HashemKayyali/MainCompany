import type { Metadata } from 'next'
import type { CSSProperties } from 'react'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { SiteNav, type NavSearchItem, type NavCategory } from '@/components/layout/SiteNav'
import { SiteBackground } from '@/components/layout/SiteBackground'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { JsonLd } from '@/components/JsonLd'
import { GLOBAL_JSON_LD } from '@/server/metadata/jsonld'
import { getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { AuthSessionLifecycle } from '@/features/auth/AuthSessionLifecycle'
import { RealtimeShell } from '@/features/realtime/RealtimeShell'
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

  const [products, categories] = await Promise.all([getProducts(), getCategories()])
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))
  const countByCategory = new Map<string, number>()
  for (const p of products)
    countByCategory.set(p.categoryId, (countByCategory.get(p.categoryId) ?? 0) + 1)

  // Nav categories (dropdown), sorted by service count.
  const navCategories: NavCategory[] = categories
    .filter((c) => c.slug.trim().length > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.icon ?? '',
      count: countByCategory.get(c.id) ?? 0,
    }))
    .sort((a, b) => b.count - a.count)

  // Nav search index (categories + products), meta localized server-side.
  const navSearch: NavSearchItem[] = [
    ...navCategories.map((c) => ({
      type: 'category' as const,
      name: c.name,
      href: `/categories/${c.slug}`,
      meta: tn('servicesCount', { count: c.count }),
    })),
    ...products.map((p) => ({
      type: 'product' as const,
      name: p.name,
      href: `/products/${p.slug}`,
      image: p.heroImage || p.gallery?.[0] || undefined,
      meta: categoryNameById.get(p.categoryId) ?? tn('services'),
    })),
  ]

  const shellStyle = {
    '--app-navbar-height': '74px',
    '--app-header-offset': '74px',
  } as CSSProperties

  return (
    <html lang={locale} dir={dir} className="light">
      <head>
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
              <SiteNav locale={locale} search={navSearch} categories={navCategories} />
              <main id="main-content" className="min-w-0 flex-1 pt-[var(--app-header-offset)]">
                {children}
              </main>
              <SiteFooter
                locale={locale}
                categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon }))}
              />
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
