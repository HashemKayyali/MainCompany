import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getCategories, getCategoryBySlug } from '@/server/dal/categories'
import { getProducts } from '@/server/dal/products'
import { buildMetadata, categoryMeta, localeUrl } from '@/server/metadata/builders'
import { categoryJsonLd } from '@/server/metadata/jsonld'
import { normalizePublicHttpsUrl } from '@/server/metadata/site'
import { ArrowLeft, LayoutGrid } from 'lucide-react'
import { JsonLd } from '@/components/JsonLd'
import { ProductCard } from '@/features/catalog/ProductCard'
import { SmartImage } from '@/components/ui/SmartImage'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * CAT-011 — /categories/[slug] detail (RSC, ADR-23 traditional model) +
 * CollectionPage/ItemList JSON-LD. Missing category → notFound() → real 404.
 */
export const dynamicParams = true
export const revalidate = 3600

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
  const tc = await getTranslations('catalog.categories')
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

      <Link
        href="/categories"
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} />
        {tc('allCategories')}
      </Link>

      {/* Category hero band (light — this route sits over the lavender atmosphere). */}
      <header className="relative mb-10 overflow-hidden rounded-[28px] border border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:p-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2.5">
              <span
                className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400"
                aria-hidden="true"
              />
              <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">
                {tc('heading')}
              </span>
            </div>
            <h1 className="font-display text-[clamp(1.9rem,4vw,3rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
              {category.name}
            </h1>
            {category.description ? (
              <p className="mt-4 max-w-xl text-[14.5px] leading-[1.72] text-ink-600">
                {category.description}
              </p>
            ) : null}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-violet-200/70 bg-violet-50/70 px-4 py-2 text-violet-900">
                <LayoutGrid size={14} />
                <span className="text-[12px] font-bold">{products.length}</span>
                <span className="text-[11px] font-semibold opacity-70">
                  {tc('serviceCount', { count: products.length })}
                </span>
              </span>
              <Link
                href="/products"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5"
              >
                {tc('browseAllServices')}
              </Link>
            </div>
          </div>
          {category.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-violet-50 lg:aspect-[16/11]">
              <SmartImage
                media={category.image}
                alt={category.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
                className="object-cover"
              />
            </div>
          ) : null}
        </div>
      </header>

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
  )
}
