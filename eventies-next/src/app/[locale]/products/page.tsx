import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { buildMetadata, localeUrl } from '@/server/metadata/builders'
import { itemListJsonLd } from '@/server/metadata/jsonld'
import { SITE_URL } from '@/server/metadata/site'
import { LayoutGrid, SlidersHorizontal } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { ProductCard } from '@/features/catalog/ProductCard'
import { EventiesHero } from '@/features/catalog/EventiesHero'
import { ProductsHeroShowcase } from '@/features/catalog/ProductsHeroShowcase'
import { Link } from '@/i18n/navigation'

/**
 * CAT-005 — /products listing (RSC). Filter state lives in the URL
 * (?category=slug) so results are shareable (CAT-005 acceptance). ItemList
 * JSON-LD (SEO-006). Metadata parity with the prerender STATIC_PAGES copy.
 */

const PAGE_TITLE = 'Event Services & Rentals in Jordan | Eventies'
const PAGE_DESC =
  'Browse interactive games, screens, booths, production support, and event rentals from trusted providers across Jordan. Compare options and submit one clear request for review.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({ locale, path: '/products', title: PAGE_TITLE, description: PAGE_DESC })
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const { locale } = await params
  const { category } = await searchParams
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.products')

  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()])
  const activeCategory = category ? categories.find((c) => c.slug === category) : undefined
  const products = activeCategory
    ? allProducts.filter((p) => p.categoryId === activeCategory.id)
    : allProducts
  const categoryNameById = new Map(categories.map((c) => [c.id, c.name]))

  const canonical = localeUrl(locale, '/products')
  const chips = categories
    .filter((c) => c.slug.trim().length > 0)
    .slice(0, 5)
    .map((c) => ({ label: c.name, href: `/categories/${c.slug}` }))
  const showcase = allProducts.slice(0, 12).map((p) => ({
    name: p.name,
    slug: p.slug,
    image: p.heroImage || p.gallery?.[0] || undefined,
    category: categoryNameById.get(p.categoryId) ?? '',
  }))

  return (
    <div>
      <JsonLd
        data={itemListJsonLd(
          canonical,
          PAGE_TITLE,
          products.map((p) => ({
            name: p.name,
            url: `${SITE_URL}/products/${encodeURIComponent(p.slug)}`,
          }))
        )}
      />

      <EventiesHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        description={t('heroDescription')}
        primaryAction={{ label: t('browseServices'), href: '/products#products-catalog' }}
        secondaryAction={{ label: t('exploreCategories'), href: '/categories' }}
        chipsLabel={t('browseLabel')}
        chips={chips}
        rightSlot={<ProductsHeroShowcase products={showcase} />}
      />

      <div className="bg-[#f8f3ff]">
        <section id="products-catalog" className="site-section scroll-mt-[96px]">
          <div className="site-container">
            <div className="relative overflow-hidden rounded-[28px] border border-violet-100/80 bg-white/93 px-5 py-9 shadow-[0_24px_64px_rgba(15,23,42,0.07)] sm:px-7 sm:py-11 lg:px-10 lg:py-12">
              <div className="mb-9">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <div className="mb-3.5 flex items-center gap-2">
                      <SlidersHorizontal size={12} className="text-slate-400" />
                      <span className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {t('serviceCategory')}
                      </span>
                    </div>
                    <h2 className="font-display text-[1.45rem] font-black tracking-[-0.04em] text-slate-900 sm:text-[1.8rem]">
                      {t('serviceCatalog')}
                    </h2>
                  </div>
                  <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/70 px-4 py-2.5 text-violet-900">
                    <LayoutGrid size={14} />
                    <span className="text-[12px] font-bold">{products.length}</span>
                    <span className="text-[11px] font-semibold opacity-70">
                      {activeCategory ? t('inThisCategory') : t('totalServices')}
                    </span>
                  </div>
                </div>

                <nav aria-label={t('filterByCategory')} className="flex flex-wrap gap-2">
                  <Link
                    href="/products"
                    aria-current={!activeCategory ? 'true' : undefined}
                    className="rounded-full border border-violet-200 px-4 py-1.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-violet-50 aria-[current=true]:border-violet-500 aria-[current=true]:bg-violet-600 aria-[current=true]:text-white"
                  >
                    {t('filterAll')}
                  </Link>
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={{ pathname: '/products', query: { category: c.slug } }}
                      aria-current={activeCategory?.id === c.id ? 'true' : undefined}
                      className="rounded-full border border-violet-200 px-4 py-1.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-violet-50 aria-[current=true]:border-violet-500 aria-[current=true]:bg-violet-600 aria-[current=true]:text-white"
                    >
                      {c.name}
                    </Link>
                  ))}
                </nav>
              </div>

              {products.length === 0 ? (
                <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-ink-500">
                  {t('empty')}
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {products.map((p) => (
                    <li key={p.slug}>
                      <ProductCard product={p} featuredLabel={t('featured')} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
