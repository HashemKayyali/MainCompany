import { getTranslations } from 'next-intl/server'
import { ArrowUpRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/ui/Reveal'
import { SmartImage } from '@/components/ui/SmartImage'
import type { Product } from '@/shared/types/catalog'
import { SectionHeading, ViewAllButton } from './SectionHeading'

/**
 * CAT-025 — Popular services (RSC). VERBATIM port of the Vite PopularServices /
 * ServiceCard: 4/3 image, category eyebrow, price/day or on-request, arrow chip.
 */
function ServiceCard({
  product,
  categoryLabel,
  labels,
}: {
  product: Product
  categoryLabel: string
  labels: { popular: string; perDay: string; onRequest: string; request: string }
}) {
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceValue = showRentalPrice
    ? `${product.rentalPricePerDay} ${product.currency}`
    : labels.request
  const priceNote = showRentalPrice ? labels.perDay : labels.onRequest
  const media = product.heroImage || product.gallery?.[0] || ''

  return (
    <Link
      href={`/products/${product.slug}`}
      aria-label={product.name}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-violet-200/70 bg-white shadow-[0_1px_2px_rgba(20,8,50,0.04),0_12px_30px_-22px_rgba(89,23,196,0.22)] outline-none transition-all duration-[400ms] hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-26px_rgba(89,23,196,0.5)] focus-visible:ring-2 focus-visible:ring-violet-400"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-violet-50">
        <SmartImage
          media={media}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/20 to-transparent" />
        {product.featured && (
          <span className="absolute start-2.5 top-2.5 inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_4px_12px_-4px_rgba(192,38,211,0.6)]">
            {labels.popular}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <span className="mb-1 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-violet-500">
          {categoryLabel}
        </span>
        <h3 className="line-clamp-2 min-h-[2.5em] font-sans text-[0.9rem] font-bold leading-tight tracking-[-0.028em] text-ink-900 transition-colors group-hover:text-violet-900 sm:text-[1.16rem]">
          {product.name}
        </h3>
        <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-violet-100 pt-2.5">
          <span className="min-w-0">
            <span className="block truncate font-sans text-[13px] font-black tracking-[-0.03em] text-ink-900">
              {priceValue}
            </span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-400">
              {priceNote}
            </span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-500 group-hover:text-white">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export async function PopularServices({
  locale,
  products,
  categoryNameById,
}: {
  locale: string
  products: Product[]
  categoryNameById: Record<string, string>
}) {
  if (products.length === 0) return null
  const t = await getTranslations({ locale: locale as 'en' | 'ar', namespace: 'catalog.home' })
  const items = products.slice(0, 12)
  const labels = {
    popular: t('popularServices.popular'),
    perDay: t('popularServices.perDay'),
    onRequest: t('popularServices.onRequest'),
    request: t('popularServices.request'),
  }

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow={t('popularServices.eyebrow')}
          title={t('popularServices.title')}
          description={t('popularServices.description')}
          className="mb-12"
        />

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((product, index) => (
            <Reveal
              key={product.slug}
              delay={Math.min(index * 0.04, 0.32)}
              y={22}
              className="h-full"
            >
              <ServiceCard
                product={product}
                categoryLabel={
                  categoryNameById[product.categoryId] || t('popularServices.marketplace')
                }
                labels={labels}
              />
            </Reveal>
          ))}
        </div>

        <ViewAllButton href="/products">{t('popularServices.viewAll')}</ViewAllButton>
      </div>
    </section>
  )
}
