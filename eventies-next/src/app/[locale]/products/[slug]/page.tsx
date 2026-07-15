import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import {
  Check,
  ChevronDown,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
} from 'lucide-react'
import { getProducts, getProductBySlug } from '@/server/dal/products'
import { getCategories } from '@/server/dal/categories'
import { getPartsByProductSlug } from '@/server/dal/catalog-extras'
import { buildMetadata, productMeta, localeUrl } from '@/server/metadata/builders'
import { productJsonLd, breadcrumbJsonLd } from '@/server/metadata/jsonld'
import { normalizePublicHttpsUrl, SITE_URL } from '@/server/metadata/site'
import { JsonLd } from '@/components/JsonLd'
import { SmartImage } from '@/components/ui/SmartImage'
import { AddToDraftActions } from '@/features/commerce/AddToDraftActions'
import { ProductGallery } from '@/features/catalog/ProductGallery'
import { ProductCard } from '@/features/catalog/ProductCard'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * Product detail route. Data remains server-rendered and cached by the DAL;
 * gallery and draft mutations are the only client islands. The composition
 * mirrors the production service-detail journey without weakening the real
 * rental and purchase-request behavior completed in Phase 6.
 */
export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  const products = await getProducts()
  return products.slice(0, 50).map((product) => ({
    locale: routing.defaultLocale,
    slug: product.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return buildMetadata(productMeta(locale, product))
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const t = await getTranslations('catalog.detail')
  const [parts, products, categories] = await Promise.all([
    getPartsByProductSlug(slug),
    getProducts(),
    getCategories(),
  ])
  const canonical = localeUrl(locale, `/products/${encodeURIComponent(slug)}`)
  const ogImage =
    (product.gallery ?? []).map(normalizePublicHttpsUrl).find(Boolean) ??
    normalizePublicHttpsUrl(product.heroImage)
  const gallery = [product.heroImage, ...(product.gallery ?? [])].filter(Boolean) as string[]
  const features = [...(product.features?.left ?? []), ...(product.features?.right ?? [])]
  const category = categories.find((item) => item.id === product.categoryId)
  const similarProducts = products
    .filter((item) => item.categoryId === product.categoryId && item.slug !== product.slug)
    .slice(0, 4)
  const includedItems = t.raw('includedItems') as string[]
  const whatsappText = encodeURIComponent(t('whatsappMessage', { product: product.name }))
  const trustBadges = [
    { icon: ShieldCheck, label: t('trust.insured') },
    { icon: Truck, label: t('trust.delivery') },
    { icon: Wrench, label: t('trust.support') },
  ]

  return (
    <div className="site-container py-8 sm:py-12">
      <JsonLd data={productJsonLd(product, canonical, ogImage)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Services', url: `${SITE_URL}/products` },
          { name: product.name, url: canonical },
        ])}
      />

      <nav
        aria-label="Breadcrumb"
        className="mb-6 flex min-w-0 flex-wrap items-center gap-2 text-sm text-ink-500"
      >
        <Link
          href="/products"
          className="rounded-full border border-violet-100 bg-white/80 px-3 py-1.5 font-semibold transition hover:border-violet-300 hover:text-violet-800"
        >
          {t('backToServices')}
        </Link>
        <span aria-hidden="true">/</span>
        {category ? (
          <>
            <Link href={`/categories/${category.slug}`} className="truncate hover:text-violet-800">
              {category.name}
            </Link>
            <span aria-hidden="true">/</span>
          </>
        ) : null}
        <span className="truncate font-semibold text-ink-700" aria-current="page">
          {product.name}
        </span>
      </nav>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-12">
        <div className="min-w-0">
          <ProductGallery images={gallery} alt={product.name} />
        </div>

        <div className="min-w-0 lg:sticky lg:top-24">
          <div className="flex flex-wrap gap-2">
            {product.badge ? (
              <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-bold text-fuchsia-800">
                {product.badge}
              </span>
            ) : null}
            {category ? (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                {category.name}
              </span>
            ) : null}
          </div>
          <h1 className="mt-4 text-balance font-display text-4xl font-black leading-tight text-ink-950 sm:text-5xl">
            {product.name}
          </h1>
          {product.shortDescription ? (
            <p className="mt-4 text-lg leading-8 text-ink-600">{product.shortDescription}</p>
          ) : null}

          <aside className="mt-7 rounded-[28px] border border-violet-100 bg-white/90 p-5 shadow-[0_24px_70px_-42px_rgba(89,23,196,0.5)] sm:p-6">
            <div className="flex items-center gap-2 text-sm font-bold text-violet-800">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {t('reviewedPricing')}
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-600">{t('tailoredQuote')}</p>
            <AddToDraftActions
              product={product}
              labels={{ rental: t('addRental'), quote: t('addQuote'), added: t('added') }}
            />
            <a
              href={`https://wa.me/962788611234?text=${whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              {t('askWhatsapp')}
            </a>
            <p className="mt-4 text-xs leading-5 text-ink-500">{t('reviewNotice')}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-violet-100 pt-4">
              {trustBadges.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="text-center text-[11px] font-semibold leading-4 text-ink-600"
                >
                  <Icon className="mx-auto mb-1.5 h-4 w-4 text-violet-600" aria-hidden="true" />
                  {label}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>

      <div className="mt-12 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          {product.description ? (
            <section className="section-shell p-6 sm:p-8" aria-labelledby="product-about">
              <h2 id="product-about" className="font-display text-2xl font-black text-ink-950">
                {t('aboutHeading')}
              </h2>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-ink-700">
                {product.description}
              </p>
            </section>
          ) : null}

          {product.quickOptions.length > 0 ? (
            <section className="section-shell p-6 sm:p-8" aria-labelledby="product-options">
              <h2 id="product-options" className="font-display text-2xl font-black text-ink-950">
                {t('optionsHeading')}
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {product.quickOptions.map((option) => (
                  <div
                    key={option.label}
                    className="rounded-2xl border border-violet-100 bg-violet-50/55 p-4"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-violet-700">
                      {option.label}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {option.values.map((value) => (
                        <span
                          key={value}
                          className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-ink-700 shadow-sm"
                        >
                          {value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {features.length > 0 ? (
            <section className="section-shell p-6 sm:p-8" aria-labelledby="product-features">
              <h2 id="product-features" className="font-display text-2xl font-black text-ink-950">
                {t('featuresHeading')}
              </h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <li
                    key={`${feature}-${index}`}
                    className="flex items-start gap-3 rounded-2xl bg-white/80 p-3 text-sm leading-6 text-ink-700"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {product.notes.length > 0 ? (
            <section className="section-shell p-6 sm:p-8" aria-labelledby="product-notes">
              <h2 id="product-notes" className="font-display text-2xl font-black text-ink-950">
                {t('beforeHeading')}
              </h2>
              <ol className="mt-5 space-y-3">
                {product.notes.map((note, index) => (
                  <li
                    key={`${note}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-ink-700"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fuchsia-100 text-xs font-black text-fuchsia-800">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{note}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>

        <details className="group section-shell overflow-hidden p-5 lg:sticky lg:top-24">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-display text-lg font-black text-ink-900">
            {t('includedHeading')}
            <ChevronDown
              className="h-5 w-5 text-violet-600 transition group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ul className="mt-4 space-y-3 border-t border-violet-100 pt-4">
            {includedItems.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm leading-6 text-ink-600">
                <Check className="mt-1 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </details>
      </div>

      {parts.length > 0 ? (
        <section className="mt-12" aria-labelledby="product-parts">
          <h2 id="product-parts" className="font-display text-2xl font-black text-ink-950">
            {t('partsHeading')}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {parts.map((part) => (
              <li key={part.id} className="rounded-2xl border border-violet-100 bg-white/85 p-3">
                <div className="relative aspect-square overflow-hidden rounded-xl bg-ink-50">
                  <SmartImage
                    media={part.image}
                    alt={part.title}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-semibold text-ink-900">{part.title}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {similarProducts.length > 0 ? (
        <section className="mt-16" aria-labelledby="similar-services">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="similar-services" className="font-display text-3xl font-black text-ink-950">
                {t('similarHeading')}
              </h2>
              {category ? (
                <p className="mt-2 text-ink-600">
                  {t('similarDescription', { category: category.name })}
                </p>
              ) : null}
            </div>
            <Link
              href="/products"
              className="text-sm font-bold text-violet-700 hover:text-violet-900"
            >
              {t('backToServices')}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similarProducts.map((item) => (
              <ProductCard key={item.slug} product={item} featuredLabel={t('featured')} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
