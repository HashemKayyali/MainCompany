import { memo, useEffect, useRef, useState, type MouseEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useCategoriesData } from '../../contexts/DataContext'
import { useI18n } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import { usePerfMode } from '../../hooks/usePerfMode'
import { useRevealWithMotion } from '../../hooks/useReveal'
import FramedImage from '../ui/FramedImage'
import FramedVideo from '../ui/FramedVideo'
import ProductCommerceActions from './ProductCommerceActions'
import { cn } from '../../utils/cn'
import { useSpotlight, SpotlightOverlay } from '../ui/spotlight-card'
import { PRODUCT_DETAIL_IMAGE_SIZES, preloadImage } from '../../lib/image-delivery'
import { preloadRoute } from '../../utils/route-preload'

const CARD_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

function isCardActionTarget(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest('a, button, input, textarea, select, [role="button"]'))
    : false
}

const ProductCard = memo(function ProductCard({
  product,
  index = 0,
  revealOnScroll = true,
  imageLoading = 'lazy',
  imageFetchPriority = 'auto',
  compact = false,
}: {
  product: Product
  index?: number
  revealOnScroll?: boolean
  imageLoading?: 'eager' | 'lazy'
  imageFetchPriority?: 'high' | 'auto'
  compact?: boolean
}) {
  const { isDark } = useTheme()
  const { dir, translateText } = useI18n()
  const navigate = useNavigate()
  const { categories = [] } = useCategoriesData()
  const { perfLow } = usePerfMode()
  const motionEnabled = useMotionEnabled()
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const compactViewport = useMediaQuery('(max-width: 1023px)')
  const reveal = useRevealWithMotion(motionEnabled, {
    distance: 14,
    duration: 0.34,
    delay: Math.min(index * 0.03, 0.12),
    margin: '0px 0px 14% 0px',
  })
  const revealProps = revealOnScroll ? reveal : { initial: false as const }

  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reducedCardEffects = perfLow || coarsePointer || compactViewport || !motionEnabled

  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [videoRequested, setVideoRequested] = useState(false)

  const hasVideo = Boolean(product.videoUrl)
  const spotlight = useSpotlight(!reducedCardEffects)
  const interactivePreviewEnabled = hasVideo && !reducedCardEffects
  const productHref = `/products/${product.slug}`

  const prepareProduct = () => {
    preloadRoute(productHref)
    void preloadImage(product.heroImage, 'detail', 'products', PRODUCT_DETAIL_IMAGE_SIZES)
  }

  const categoryLabel =
    categories.find(category => category.id === product.categoryId)?.name || 'Marketplace'
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceDisplay = showRentalPrice
    ? `${product.rentalPricePerDay} ${product.currency}`
    : translateText('Reviewed pricing')
  // Only render the tiny eyebrow label when we actually have a numeric price
  // to describe. Without a price the value ("Reviewed pricing") is
  // self-explanatory, so avoid the duplicate "REVIEWED PRICING / Reviewed
  // pricing" stack the card used to render.
  const priceLabel = showRentalPrice ? translateText('Per Day') : null

  // Pause and reset the video when the card scrolls out of the viewport.
  // Never autoplay — on desktop, hover events handle playback; on mobile, no autoplay at all.
  useEffect(() => {
    if (!interactivePreviewEnabled || !videoRequested || !cardRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          videoRef.current?.pause()
          if (videoRef.current) videoRef.current.currentTime = 0
          setIsPlaying(false)
        }
      },
      { threshold: 0.3 }
    )

    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [interactivePreviewEnabled, videoRequested])

  useEffect(() => {
    if (!interactivePreviewEnabled || !videoRequested || !isHovered) return

    const video = videoRef.current
    if (!video) return

    video.currentTime = 0
    void video.play().catch(() => undefined)
  }, [interactivePreviewEnabled, isHovered, videoRequested])

  const startPreview = () => {
    if (!interactivePreviewEnabled) return
    setIsHovered(true)
    setVideoRequested(true)
  }

  const stopPreview = () => {
    if (!interactivePreviewEnabled) return

    setIsHovered(false)
    const video = videoRef.current
    if (!video) return

    video.pause()
    video.currentTime = 0
    setIsPlaying(false)
  }

  const openProductFromCard = (event: MouseEvent<HTMLElement>) => {
    if (isCardActionTarget(event.target)) return
    navigate(productHref)
  }

  return (
    <motion.article
      {...revealProps}
      ref={cardRef}
      onClick={openProductFromCard}
      onDragStart={event => event.preventDefault()}
      onMouseEnter={() => {
        prepareProduct()
        startPreview()
      }}
      onFocusCapture={prepareProduct}
      onTouchStart={prepareProduct}
      onMouseLeave={stopPreview}
      {...spotlight.handlers}
      className={cn(
        'group relative flex h-full cursor-pointer flex-col overflow-hidden',
        compact ? 'rounded-[18px]' : 'rounded-[22px]',
        'transition-[border-color,box-shadow] duration-350',
        isDark
          ? reducedCardEffects
            ? 'border border-white/[0.14] bg-[linear-gradient(168deg,rgba(16,13,34,0.97),rgba(9,9,26,0.98))] shadow-[0_26px_62px_-30px_rgba(0,0,0,0.78),0_12px_28px_-18px_rgba(0,0,0,0.56),0_0_0_1px_rgba(255,255,255,0.045)]'
            : 'border border-white/[0.14] bg-[linear-gradient(168deg,rgba(16,13,34,0.97),rgba(9,9,26,0.98))] shadow-[0_26px_62px_-30px_rgba(0,0,0,0.78),0_12px_28px_-18px_rgba(0,0,0,0.56),0_0_0_1px_rgba(255,255,255,0.045)] hover:border-white/[0.22] hover:shadow-[0_34px_72px_-26px_rgba(0,0,0,0.62),0_16px_34px_-18px_rgba(0,0,0,0.60),0_0_0_1px_rgba(255,255,255,0.08)]'
          : reducedCardEffects
            ? 'border border-black/[0.16] bg-white shadow-[0_26px_62px_-36px_rgba(15,23,42,0.50),0_11px_26px_-18px_rgba(15,23,42,0.24),0_0_0_1px_rgba(255,255,255,0.88)]'
            : 'border border-black/[0.16] bg-white shadow-[0_26px_62px_-36px_rgba(15,23,42,0.50),0_11px_26px_-18px_rgba(15,23,42,0.24),0_0_0_1px_rgba(255,255,255,0.88)] hover:border-black/[0.26] hover:shadow-[0_32px_70px_-32px_rgba(15,23,42,0.50),0_14px_32px_-18px_rgba(15,23,42,0.28),0_0_0_1px_rgba(255,255,255,0.92)]'
      )}
    >
      {!reducedCardEffects && <SpotlightOverlay ref={spotlight.overlayRef} className="z-[11]" />}

      {!reducedCardEffects && (
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
            isDark
              ? 'bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(124,58,237,0.14)_0%,transparent_65%)]'
              : 'bg-[radial-gradient(ellipse_80%_55%_at_50%_0%,rgba(124,58,237,0.05)_0%,transparent_65%)]'
          )}
          aria-hidden="true"
        />
      )}

      <Link
        to={productHref}
        aria-label={`${translateText('Open')} ${product.name}`}
        draggable={false}
        className="relative z-10 block aspect-[4/3] w-full shrink-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
      >
        <FramedImage
          media={product.heroImage}
          preset="card"
          alt={product.name}
          width={800}
          height={600}
          loading={imageLoading}
          fetchPriority={imageFetchPriority}
          sizes={CARD_IMAGE_SIZES}
          revealMode="crisp"
          className={cn(
            'h-full w-full object-cover',
            !reducedCardEffects && 'transition-transform duration-700 ease-out',
            interactivePreviewEnabled
              ? isPlaying ? 'opacity-0 scale-[1.06]' : 'opacity-100 group-hover:scale-[1.05]'
              : 'opacity-100'
          )}
          fallbackTransform={{ fit: 'cover' }}
          draggable={false}
        />

        {interactivePreviewEnabled && videoRequested && (
          <FramedVideo
            ref={videoRef}
            media={product.videoUrl}
            posterMedia={product.heroImage}
            className={cn(
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-400',
              isPlaying ? 'opacity-100' : 'opacity-0'
            )}
            muted
            loop
            playsInline
            preload="metadata"
            fallbackTransform={{ fit: 'cover' }}
            onPlaying={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/28 to-transparent" />

        <div className="absolute start-2 top-2 z-20 flex flex-wrap gap-1 sm:start-3 sm:top-3 sm:gap-1.5">
          {product.featured && (
            <span className={cn(
              'inline-flex items-center rounded-[8px] border border-cyan-400/40 bg-cyan-500/90 px-2.5 py-1 text-[9.5px] font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(34,211,238,0.3)]',
              reducedCardEffects ? '' : 'backdrop-blur-sm'
            )}>
              {translateText('Featured')}
            </span>
          )}
          {product.badge && (
            <span dir="ltr" lang="en" data-i18n-skip className={cn(
              'inline-flex items-center rounded-[8px] border border-white/20 bg-black/50 px-2.5 py-1 text-[9.5px] font-medium text-white/90',
              reducedCardEffects ? '' : 'backdrop-blur-sm'
            )}>
              {product.badge}
            </span>
          )}
        </div>

        {interactivePreviewEnabled && !isPlaying && (
          <div className="absolute right-3 top-3 z-20">
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white',
              !reducedCardEffects && 'transition-transform duration-300 group-hover:scale-110',
              reducedCardEffects ? '' : 'backdrop-blur-md'
            )}>
              <Play size={12} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      <div
        className={cn(
          'relative z-10 h-px w-full overflow-visible after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-2 after:bg-gradient-to-b after:to-transparent',
          isDark
            ? 'bg-white/[0.09] shadow-[0_5px_10px_-6px_rgba(0,0,0,0.62)] after:from-black/[0.18]'
            : 'bg-black/[0.10] shadow-[0_6px_12px_-5px_rgba(15,23,42,0.34)] after:from-black/[0.07]'
        )}
        aria-hidden="true"
      />

      <div
        className={cn(
          'relative z-10 flex flex-1 flex-col',
          compact
            ? 'px-2.5 pb-2.5 pt-2'
            : 'px-2.5 pb-2.5 pt-2 sm:px-4 sm:pb-4 sm:pt-3.5 lg:px-5 lg:pb-5 lg:pt-4'
        )}
      >
        <div className={compact ? 'mb-1' : 'mb-1 sm:mb-2.5'}>
          <span
            data-i18n-skip
            className={cn(
              'inline-flex items-center rounded-full font-bold uppercase',
              compact
                ? 'px-1.5 py-[2px] text-[7.5px] tracking-[0.12em]'
                : 'px-1.5 py-[2px] text-[7.5px] tracking-[0.12em] sm:px-2.5 sm:py-[3px] sm:text-[9px] sm:tracking-[0.16em]',
              isDark
                ? 'bg-violet-500/[0.13] text-violet-300/95 ring-1 ring-violet-400/[0.17]'
                : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80'
            )}
          >
            <bdi dir="ltr" lang="en">{categoryLabel}</bdi>
          </span>
        </div>

        <div className={compact ? 'mb-1.5 flex-1' : 'mb-1.5 flex-1 sm:mb-4'}>
          <Link
            to={productHref}
            draggable={false}
            className="outline-none focus-visible:underline"
          >
            <h3
              dir="ltr"
              lang="en"
              data-i18n-skip
              className={cn(
                // Reserve exactly two lines: long names wrap to 2 lines (then
                // clamp) instead of truncating on 1, and short names still
                // occupy 2 lines so card heights stay identical. leading-tight
                // is 1.25, so 2 lines = 2.5em regardless of the responsive size.
                'product-data-ltr font-sans font-bold leading-tight tracking-[-0.028em] line-clamp-2 min-h-[2.5em] transition-colors duration-300',
                compact ? 'text-[0.9rem]' : 'text-[0.9rem] sm:text-[1.16rem]',
                isDark ? 'text-white group-hover:text-violet-100' : 'text-slate-900 group-hover:text-violet-900'
              )}
            >
              {product.name}
            </h3>
          </Link>
          <p
            dir="ltr"
            lang="en"
            data-i18n-skip
            className={cn(
              compact
                ? 'product-data-ltr mt-1 text-[10px] leading-[1.4] line-clamp-1'
                : 'product-data-ltr mt-1 text-[10px] leading-[1.4] line-clamp-2 sm:mt-1.5 sm:text-[12.5px] sm:leading-[1.6]',
              isDark ? 'text-slate-400/88' : 'text-slate-500'
            )}
          >
            {product.shortDescription}
          </p>
        </div>

        <div
          className={cn(
            'flex items-end justify-between border-t',
            compact ? 'mb-1.5 pt-1.5' : 'mb-1.5 pt-1.5 sm:mb-3.5 sm:pt-3',
            isDark ? 'border-white/[0.07]' : 'border-slate-100'
          )}
        >
          <div>
            {priceLabel && (
              <div
                dir={dir}
                className={cn(
                  'font-semibold uppercase tracking-[0.12em]',
                  compact ? 'text-[8px]' : 'text-[8.5px] sm:text-[10px]',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}
              >
                {priceLabel}
              </div>
            )}
            <div
              dir={showRentalPrice ? 'ltr' : dir}
              className={cn(
                'font-sans font-black tracking-[-0.04em]',
                priceLabel ? 'mt-0.5' : '',
                compact ? 'text-[0.85rem]' : 'text-[0.85rem] sm:text-[1.18rem]',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {priceDisplay}
            </div>
          </div>
        </div>

        <ProductCommerceActions product={product} compact={compact} />
      </div>
    </motion.article>
  )
})

export default ProductCard
