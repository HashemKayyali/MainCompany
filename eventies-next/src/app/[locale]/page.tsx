import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeaturedProducts, getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { buildMetadata } from '@/server/metadata/builders'
import { ProductCard } from '@/features/catalog/ProductCard'
import { HeroClient, type HeroChip } from '@/features/catalog/hero/HeroClient'
import { HowItWorks, EventTypes, HomeCTA } from '@/features/catalog/home/HomeSections'
import { Reveal } from '@/components/ui/Reveal'
import { SmartImage } from '@/components/ui/SmartImage'
import { Link } from '@/i18n/navigation'

/**
 * CAT-002/003/004/025/026 — home (RSC). Server sections resolve from the DAL;
 * the WebGL hero is a client island (its shader chunk is ssr:false, never in
 * the shared bundle). Marketing sections and reveal animations follow.
 */
const PAGE_TITLE = 'Eventies | Event Services Marketplace in Jordan'
const PAGE_DESC =
  'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan, then send one clear request for review.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({ locale, path: '/', title: PAGE_TITLE, description: PAGE_DESC })
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog')
  const [categories, featured, allProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getProducts(),
  ])
  const popular = (featured.length > 0 ? featured : allProducts).slice(0, 8)
  const chips: HeroChip[] = categories
    .filter((c) => c.slug.trim().length > 0)
    .slice(0, 5)
    .map((c) => ({ id: c.id, slug: c.slug, name: c.name }))

  return (
    <div>
      <HeroClient chips={chips} />

      {categories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <Reveal>
            <h2 className="text-2xl font-bold text-ink-900">{t('categories.heading')}</h2>
          </Reveal>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((c, i) => (
              <li key={c.id}>
                <Reveal delay={Math.min(i, 6) * 0.04}>
                  <Link
                    href={`/categories/${c.slug}`}
                    className="group block overflow-hidden rounded-xl border border-ink-100 bg-white"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
                      <SmartImage
                        media={c.image}
                        alt={c.name}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                    </div>
                    <p className="p-2 text-center text-xs font-medium text-ink-800">{c.name}</p>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {popular.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink-900">{t('products.heading')}</h2>
            <Link href="/products" className="text-sm font-medium text-brand-700">
              {t('detail.backToServices')}
            </Link>
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {popular.map((p, i) => (
              <li key={p.slug}>
                <Reveal delay={Math.min(i, 4) * 0.05}>
                  <ProductCard product={p} featuredLabel={t('products.featured')} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <HowItWorks locale={locale} />
      <EventTypes locale={locale} />
      <HomeCTA locale={locale} />
    </div>
  )
}
