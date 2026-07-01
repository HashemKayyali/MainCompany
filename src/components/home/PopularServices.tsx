import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useCategoriesData, useProductsData } from '../../contexts/DataContext'
import type { Product } from '../../data/products/types'
import { preloadRoute } from '../../utils/route-preload'
import FramedImage from '../ui/FramedImage'
import Reveal from './Reveal'
import SectionHeading, { ViewAllButton } from './SectionHeading'

function ServiceCard({
  product,
  categoryLabel,
  imageLoading = 'lazy',
}: {
  product: Product
  categoryLabel: string
  imageLoading?: 'eager' | 'lazy'
}) {
  const href = `/products/${product.slug}`
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceValue = showRentalPrice ? `${product.rentalPricePerDay} ${product.currency}` : 'Request'
  const priceNote = showRentalPrice ? '/ day' : 'on request'

  return (
    <Link
      to={href}
      onMouseEnter={() => preloadRoute(href)}
      onFocus={() => preloadRoute(href)}
      aria-label={product.name}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-violet-200/70 bg-white outline-none transition-all duration-400 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-26px_rgba(89,23,196,0.5)] focus-visible:ring-2 focus-visible:ring-violet-400"
      style={{ boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 12px 30px -22px rgba(89,23,196,0.22)' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-violet-50">
        <FramedImage
          media={product.heroImage}
          alt={product.name}
          width={800}
          height={600}
          loading={imageLoading}
          fetchPriority="auto"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
          fallbackTransform={{ fit: 'cover' }}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/20 to-transparent" />
        {product.featured && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_4px_12px_-4px_rgba(192,38,211,0.6)]">
            Popular
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        <span className="mb-1 truncate text-[9px] font-bold uppercase tracking-[0.14em] text-violet-500">{categoryLabel}</span>
        <h3 className="line-clamp-1 font-sans text-[13.5px] font-bold tracking-[-0.01em] text-ink-900 transition-colors group-hover:text-violet-900">
          {product.name}
        </h3>
        <div className="mt-2.5 flex items-end justify-between gap-2 border-t border-violet-100 pt-2.5">
          <span className="min-w-0">
            <span className="block truncate font-sans text-[13px] font-black tracking-[-0.03em] text-ink-900">{priceValue}</span>
            <span className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-ink-400">{priceNote}</span>
          </span>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-500 group-hover:text-white">
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function PopularServices() {
  const { featuredProducts } = useProductsData()
  const { categories } = useCategoriesData()

  const items = useMemo(() => (featuredProducts ?? []).slice(0, 12), [featuredProducts])
  const categoryName = useMemo(() => {
    const map = new Map(categories.map(category => [category.id, category.name]))
    return (id: string) => map.get(id) || 'Marketplace'
  }, [categories])

  if (items.length === 0) return null

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <SectionHeading
          eyebrow="Popular services"
          title="Loved by organizers"
          description="A selection of in-demand services from across the marketplace — ready to add to your next event request."
          className="mb-12"
        />

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {items.map((product, index) => (
            <Reveal key={product.slug} delay={Math.min(index * 0.04, 0.32)} y={22} className="h-full">
              <ServiceCard
                product={product}
                categoryLabel={categoryName(product.categoryId)}
                imageLoading="lazy"
              />
            </Reveal>
          ))}
        </div>

        <ViewAllButton to="/products" onMouseEnter={() => preloadRoute('/products')}>
          View all services
        </ViewAllButton>
      </div>
    </section>
  )
}
