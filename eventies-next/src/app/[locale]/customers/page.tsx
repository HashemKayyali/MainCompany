import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCustomers } from '@/server/dal/catalog-extras'
import { buildMetadata } from '@/server/metadata/builders'
import { EventiesHero } from '@/features/catalog/EventiesHero'
import { LogoCloud } from '@/features/catalog/home/LogoCloud'
import { SmartImage } from '@/components/ui/SmartImage'

/** CAT-013 — /customers wall (RSC). EventiesHero + logo marquee (item 9). */
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
  const logoItems = customers.map((c) => ({
    name: c.name,
    slug: c.slug || c.id,
    logo: c.logo_url ?? undefined,
  }))

  return (
    <div>
      <EventiesHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        description={t('heroDescription')}
        primaryAction={{ label: t('browseServicesCta'), href: '/products' }}
      />

      <div className="bg-[#f8f3ff]">
        {customers.length === 0 ? (
          <section className="site-section">
            <div className="site-container-wide">
              <p className="text-center text-ink-500">{t('empty')}</p>
            </div>
          </section>
        ) : (
          <>
            {/* Infinite marquee rows (item 9). */}
            <LogoCloud locale={locale} customers={logoItems} showHeading={false} />

            {/* Static grid — a11y/complete list of every client logo. */}
            <section className="site-section pt-0">
              <div className="site-container-wide">
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {customers.map((c) => (
                    <li
                      key={c.id}
                      className="flex aspect-video items-center justify-center rounded-2xl border border-violet-100 bg-white/80 p-4 shadow-[0_14px_40px_-32px_rgba(89,23,196,0.35)]"
                    >
                      {c.logo_url ? (
                        <div className="relative h-12 w-full">
                          <SmartImage
                            media={c.logo_url}
                            alt={c.name}
                            fill
                            sizes="160px"
                            className="object-contain"
                          />
                        </div>
                      ) : (
                        <span className="text-center text-sm font-medium text-ink-700">
                          {c.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
