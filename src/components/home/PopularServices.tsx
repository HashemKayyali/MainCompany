import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useCategoriesData, useProductsData } from '../../contexts/DataContext'
import type { Product } from '../../data/products/types'
import { preloadRoute } from '../../utils/route-preload'
import { rowPeekStyles, useRowPeek } from '../../hooks/useRowPeek'
import { PRODUCT_DETAIL_IMAGE_SIZES, preloadImage } from '../../lib/image-delivery'
import FramedImage from '../ui/FramedImage'
import Reveal from './Reveal'
import SectionHeading, { ViewAllButton } from './SectionHeading'

function ServiceCard({
  product,
  categoryLabel,
  imageLoading = 'lazy',
  imageActive = true,
  onImageSettled,
}: {
  product: Product
  categoryLabel: string
  imageLoading?: 'eager' | 'lazy'
  imageActive?: boolean
  onImageSettled?: () => void
}) {
  const href = `/products/${product.slug}`
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceValue = showRentalPrice ? `${product.rentalPricePerDay} ${product.currency}` : 'Request'
  const priceNote = showRentalPrice ? '/ day' : 'on request'

  useEffect(() => {
    if (imageActive && !product.heroImage) onImageSettled?.()
  }, [imageActive, onImageSettled, product.heroImage])

  return (
    <Link
      to={href}
      onMouseEnter={() => { preloadRoute(href); void preloadImage(product.heroImage, 'detail', 'products', PRODUCT_DETAIL_IMAGE_SIZES) }}
      onFocus={() => { preloadRoute(href); void preloadImage(product.heroImage, 'detail', 'products', PRODUCT_DETAIL_IMAGE_SIZES) }}
      onTouchStart={() => { preloadRoute(href); void preloadImage(product.heroImage, 'detail', 'products', PRODUCT_DETAIL_IMAGE_SIZES) }}
      aria-label={product.name}
      className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-violet-200/70 bg-white outline-none transition-all duration-400 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-26px_rgba(89,23,196,0.5)] focus-visible:ring-2 focus-visible:ring-violet-400"
      style={{ boxShadow: '0 1px 2px rgba(20,8,50,0.04), 0 12px 30px -22px rgba(89,23,196,0.22)' }}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-violet-50">
        {imageActive ? (
          <FramedImage
            media={product.heroImage}
            preset="card"
            alt={product.name}
            width={800}
            height={600}
            loading={imageLoading}
            data-image-group="products"
            fetchPriority="auto"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
            fallbackTransform={{ fit: 'cover' }}
            onLoad={onImageSettled}
            onError={onImageSettled}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]"
          />
        ) : (
          <div className="absolute inset-0 animate-pulse bg-violet-100/70" aria-hidden="true" />
        )}
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
        <h3 className="line-clamp-2 min-h-[2.5em] font-sans text-[0.9rem] font-bold leading-tight tracking-[-0.028em] text-ink-900 transition-colors group-hover:text-violet-900 sm:text-[1.16rem]">
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

export default function PopularServices({
  enabled = true,
  onUsefulBatchReady,
  onBatchComplete,
}: {
  enabled?: boolean
  onUsefulBatchReady?: () => void
  onBatchComplete?: () => void
}) {
  const { featuredProducts } = useProductsData()
  const { categories } = useCategoriesData()

  const items = useMemo(() => (featuredProducts ?? []).slice(0, 12), [featuredProducts])
  const [activeImageCount, setActiveImageCount] = useState(0)
  const [expanded, setExpanded] = useState(false)
  // Collapsed: never more than 3 rows at any width — 2 full rows plus a half-row peek.
  const { ref: gridRef, peek } = useRowPeek()
  const visibleItems = useMemo(
    () => (expanded ? items : items.slice(0, peek.cols * 3)),
    [items, expanded, peek.cols]
  )
  const clipped = !expanded && peek.clipHeight !== null
  const peekStyles = rowPeekStyles(peek)
  const renderedCount = visibleItems.length
  const settledImagesRef = useRef(new Set<string>())
  const usefulReportedRef = useRef(false)
  const completeReportedRef = useRef(false)
  const batchKey = items.map(item => item.slug).join('|')
  const categoryName = useMemo(() => {
    const map = new Map(categories.map(category => [category.id, category.name]))
    return (id: string) => map.get(id) || 'Marketplace'
  }, [categories])

  const reportUseful = useCallback(() => {
    if (usefulReportedRef.current) return
    usefulReportedRef.current = true
    onUsefulBatchReady?.()
  }, [onUsefulBatchReady])

  const reportComplete = useCallback(() => {
    if (completeReportedRef.current) return
    completeReportedRef.current = true
    onBatchComplete?.()
  }, [onBatchComplete])

  const reportImageSettled = useCallback((key: string) => {
    if (settledImagesRef.current.has(key)) return
    settledImagesRef.current.add(key)
    setActiveImageCount(current => Math.min(items.length, current + 1))

    // Thresholds track what is actually rendered — the collapsed grid stops at 3 rows.
    const settledCount = settledImagesRef.current.size
    if (settledCount >= Math.max(1, Math.ceil(renderedCount * 0.66))) reportUseful()
    if (settledCount >= renderedCount) reportComplete()
  }, [items.length, renderedCount, reportComplete, reportUseful])

  useEffect(() => {
    settledImagesRef.current.clear()
    usefulReportedRef.current = false
    completeReportedRef.current = false
    setActiveImageCount(enabled ? Math.min(4, items.length) : 0)
    if (enabled && items.length === 0) {
      reportUseful()
      reportComplete()
    }
  }, [batchKey, enabled, items.length, reportComplete, reportUseful])

  useEffect(() => {
    if (!enabled || items.length === 0 || usefulReportedRef.current) return undefined
    const timer = window.setTimeout(reportUseful, 3000)
    return () => window.clearTimeout(timer)
  }, [batchKey, enabled, items.length, reportUseful])

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

        <div className="relative overflow-hidden" style={clipped ? { height: peek.clipHeight ?? undefined } : undefined}>
          {/* Collapsed: cards fade out into a blur ramp instead of ending on a hard clip edge. */}
          <div
            ref={gridRef}
            className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
            style={clipped ? peekStyles.grid : undefined}
          >
            {visibleItems.map((product, index) => (
              <Reveal key={product.slug} delay={Math.min(index * 0.04, 0.32)} y={22} className="h-full">
                <ServiceCard
                  product={product}
                  categoryLabel={categoryName(product.categoryId)}
                  imageActive={enabled && (expanded || index < activeImageCount)}
                  imageLoading="eager"
                  onImageSettled={() => reportImageSettled(product.slug)}
                />
              </Reveal>
            ))}
          </div>
          {clipped && (
            <div
              className="pointer-events-none absolute inset-x-0 backdrop-blur-[5px]"
              style={peekStyles.overlay}
              aria-hidden="true"
            />
          )}
        </div>

        {peek.clipHeight !== null ? (
          <ViewAllButton onClick={() => setExpanded(value => !value)}>
            {expanded ? 'Show less' : 'View all services'}
          </ViewAllButton>
        ) : (
          <ViewAllButton to="/products" onMouseEnter={() => preloadRoute('/products')}>
            View all services
          </ViewAllButton>
        )}
      </div>
    </section>
  )
}
