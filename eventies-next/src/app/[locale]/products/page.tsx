import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProducts } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { buildMetadata, localeUrl } from '@/server/metadata/builders'
import { itemListJsonLd } from '@/server/metadata/jsonld'
import { SITE_URL } from '@/server/metadata/site'
import { JsonLd } from '@/components/JsonLd'
import { ProductCard } from '@/features/catalog/ProductCard'
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

  const canonical = localeUrl(locale, '/products')

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
        <p className="mt-2 max-w-2xl text-ink-600">{t('intro')}</p>
      </header>

      <nav aria-label={t('filterByCategory')} className="mb-8 flex flex-wrap gap-2">
        <Link
          href="/products"
          aria-current={!activeCategory ? 'true' : undefined}
          className="rounded-full border border-ink-200 px-4 py-1.5 text-sm aria-[current=true]:border-brand-500 aria-[current=true]:bg-brand-50 aria-[current=true]:text-brand-700"
        >
          {t('filterAll')}
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={{ pathname: '/products', query: { category: c.slug } }}
            aria-current={activeCategory?.id === c.id ? 'true' : undefined}
            className="rounded-full border border-ink-200 px-4 py-1.5 text-sm aria-[current=true]:border-brand-500 aria-[current=true]:bg-brand-50 aria-[current=true]:text-brand-700"
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-ink-500">
          {t('empty')}
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <li key={p.slug}>
              <ProductCard product={p} featuredLabel={t('featured')} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
