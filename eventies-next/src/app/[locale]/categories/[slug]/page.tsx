import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCategories, getCategoryBySlug } from '@/server/dal/categories'
import { getProducts } from '@/server/dal/products'
import { buildMetadata, categoryMeta, localeUrl } from '@/server/metadata/builders'
import { categoryJsonLd } from '@/server/metadata/jsonld'
import { normalizePublicHttpsUrl } from '@/server/metadata/site'
import { JsonLd } from '@/components/JsonLd'
import { ProductCard } from '@/features/catalog/ProductCard'
import { routing } from '@/i18n/routing'

/** CAT-011 — /categories/[slug] detail (RSC) + CollectionPage/ItemList JSON-LD. */
export async function generateStaticParams() {
  const categories = await getCategories()
  return categories.map((c) => ({ locale: routing.defaultLocale, slug: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const category = await getCategoryBySlug(slug)
  if (!category) return {}
  return buildMetadata(categoryMeta(locale, category))
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const category = await getCategoryBySlug(slug)
  if (!category) notFound()

  const t = await getTranslations('catalog.products')
  const allProducts = await getProducts()
  const products = allProducts.filter((p) => p.categoryId === category.id)
  const canonical = localeUrl(locale, `/categories/${encodeURIComponent(slug)}`)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      {categoryJsonLd(
        category,
        canonical,
        products.map((p) => ({ name: p.name, slug: p.slug })),
        normalizePublicHttpsUrl(category.image)
      ).map((node, i) => (
        <JsonLd key={i} data={node} />
      ))}

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-ink-900">{category.name}</h1>
        {category.description ? <p className="mt-2 max-w-2xl text-ink-600">{category.description}</p> : null}
      </header>

      {products.length === 0 ? (
        <p className="text-ink-500">{t('empty')}</p>
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
