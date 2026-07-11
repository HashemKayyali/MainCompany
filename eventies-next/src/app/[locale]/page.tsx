import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeaturedProducts, getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { buildMetadata } from '@/server/metadata/builders'
import { ProductCard } from '@/features/catalog/ProductCard'
import { SmartImage } from '@/components/ui/SmartImage'
import { Link } from '@/i18n/navigation'

/**
 * CAT-003 — home (RSC). Sections resolve from the DAL (categories + featured/
 * popular products). The WebGL hero (CAT-002, ssr:false island) and the full
 * marketing section stack (CAT-004/025/026, FAQ, how-it-works) are a follow-up
 * within P2; this ships a static server hero + the core catalog sections so
 * the home route is real, indexable, and cutover-shaped.
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

  return (
    <div>
      <section className="bg-gradient-brand text-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">{PAGE_TITLE.split(' | ')[0]}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">{PAGE_DESC}</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/products" className="rounded-lg bg-white px-6 py-3 font-medium text-brand-700">
              {t('products.heading')}
            </Link>
            <Link
              href="/custom-builds"
              className="rounded-lg border border-white/40 px-6 py-3 font-medium text-white"
            >
              {t('customBuilds.heading')}
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="text-2xl font-bold text-ink-900">{t('categories.heading')}</h2>
          <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.slug}`}
                  className="group block overflow-hidden rounded-xl border border-ink-100 bg-white"
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
                    <SmartImage media={c.image} alt={c.name} fill sizes="160px" className="object-cover" />
                  </div>
                  <p className="p-2 text-center text-xs font-medium text-ink-800">{c.name}</p>
                </Link>
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
            {popular.map((p) => (
              <li key={p.slug}>
                <ProductCard product={p} featuredLabel={t('products.featured')} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
