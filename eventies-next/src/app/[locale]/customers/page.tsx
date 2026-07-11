import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCustomers } from '@/server/dal/catalog-extras'
import { buildMetadata } from '@/server/metadata/builders'
import { SmartImage } from '@/components/ui/SmartImage'

/** CAT-013 — /customers wall (RSC; marquee polish deferred to CAT-024 visual pass). */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/customers',
    title: 'Eventies Clients & Event Partners in Jordan',
    description:
      'A curated look at brands, schools, venues, and organizations connected to Eventies activations, custom builds, and event services across Jordan and the region.',
  })
}

export default async function CustomersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.customers')
  const customers = await getCustomers()

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
        <p className="mt-2 text-ink-600">{t('intro')}</p>
      </header>
      {customers.length === 0 ? (
        <p className="text-ink-500">{t('empty')}</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {customers.map((c) => (
            <li
              key={c.id}
              className="flex aspect-video items-center justify-center rounded-xl border border-ink-100 bg-white p-4"
            >
              {c.logo_url ? (
                <div className="relative h-12 w-full">
                  <SmartImage media={c.logo_url} alt={c.name} fill sizes="160px" className="object-contain" />
                </div>
              ) : (
                <span className="text-center text-sm font-medium text-ink-700">{c.name}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
