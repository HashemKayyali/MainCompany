import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getProducts, getProductBySlug } from '@/server/dal/products'
import { getPartsByProductSlug } from '@/server/dal/catalog-extras'
import { buildMetadata, productMeta, localeUrl } from '@/server/metadata/builders'
import { productJsonLd, breadcrumbJsonLd } from '@/server/metadata/jsonld'
import { normalizePublicHttpsUrl, SITE_URL } from '@/server/metadata/site'
import { JsonLd } from '@/components/JsonLd'
import { SmartImage } from '@/components/ui/SmartImage'
import { Link } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

/**
 * CAT-007/008/009/010 — /products/[slug] (RSC). generateStaticParams warms EN
 * slugs (warm-up only, never correctness — new slugs resolve on demand, 06);
 * an inactive/missing product → notFound() → HTTP 404 (CAT-010/SEO-404).
 * Product + BreadcrumbList JSON-LD (SEO-007/016), OG image via first product
 * image (SEO-003). Detail-main image is the LCP candidate → eager + high.
 */

export async function generateStaticParams() {
  const products = await getProducts()
  // Warm EN only; AR resolves on demand. Cap to avoid a huge build fan-out.
  return products.slice(0, 50).map((p) => ({ locale: routing.defaultLocale, slug: p.slug }))
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
  const parts = await getPartsByProductSlug(slug)
  const canonical = localeUrl(locale, `/products/${encodeURIComponent(slug)}`)
  const ogImage =
    (product.gallery ?? []).map(normalizePublicHttpsUrl).find(Boolean) ??
    normalizePublicHttpsUrl(product.heroImage)
  const gallery = [product.heroImage, ...(product.gallery ?? [])].filter(Boolean) as string[]
  const features = [...(product.features?.left ?? []), ...(product.features?.right ?? [])]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={productJsonLd(product, canonical, ogImage)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Services', url: `${SITE_URL}/products` },
          { name: product.name, url: canonical },
        ])}
      />

      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-ink-500">
        <Link href="/products" className="hover:text-brand-700">
          {t('backToServices')}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink-700">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-ink-50">
            <SmartImage
              media={gallery[0] ?? ''}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              fetchPriority="high"
              className="object-cover"
            />
          </div>
          {gallery.length > 1 ? (
            <ul className="mt-3 grid grid-cols-4 gap-2">
              {gallery.slice(1, 5).map((g, i) => (
                <li key={i} className="relative aspect-square overflow-hidden rounded-lg bg-ink-50">
                  <SmartImage media={g} alt={`${product.name} ${i + 2}`} fill sizes="120px" className="object-cover" />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div>
          <h1 className="text-3xl font-bold text-ink-900">{product.name}</h1>
          {product.shortDescription ? (
            <p className="mt-2 text-lg text-ink-600">{product.shortDescription}</p>
          ) : null}

          {product.description ? (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-ink-900">{t('aboutHeading')}</h2>
              <p className="mt-2 whitespace-pre-line text-ink-700">{product.description}</p>
            </section>
          ) : null}

          {features.length > 0 ? (
            <section className="mt-6">
              <h2 className="text-lg font-semibold text-ink-900">{t('featuresHeading')}</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-ink-700">
                {features.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <p className="mt-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
            {t('requestCta')} — {t('priceOnRequest')}
          </p>
        </div>
      </div>

      {parts.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold text-ink-900">{t('partsHeading')}</h2>
          <ul className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
            {parts.map((part) => (
              <li key={part.id} className="rounded-xl border border-ink-100 p-3">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-ink-50">
                  <SmartImage media={part.image} alt={part.title} fill sizes="180px" className="object-cover" />
                </div>
                <p className="mt-2 line-clamp-1 text-sm font-medium text-ink-900">{part.title}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
