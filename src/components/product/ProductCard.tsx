import { memo, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
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

const CARD_IMAGE_SIZES = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'

const ProductCard = memo(function ProductCard({
  product,
  index = 0,
  revealOnScroll = true,
  imageLoading = 'lazy',
  imageFetchPriority = 'auto',
}: {
  product: Product
  index?: number
  revealOnScroll?: boolean
  imageLoading?: 'eager' | 'lazy'
  imageFetchPriority?: 'high' | 'auto'
}) {
  const { isDark } = useTheme()
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

  const categoryLabel = product.categoryTags[0] || 'Marketplace'
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceDisplay = showRentalPrice
    ? `${product.rentalPricePerDay} ${product.currency}`
    : 'Quote Based'
  const priceLabel = showRentalPrice ? 'Per Day' : 'Custom Pricing'

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

  return (
    <motion.article
      {...revealProps}
      ref={cardRef}
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      {...spotlight.handlers}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[22px]',
        'transition-[border-color,box-shadow] duration-350',
        isDark
          ? reducedCardEffects
            ? 'border border-white/[0.08] bg-[linear-gradient(168deg,rgba(16,13,34,0.97),rgba(9,9,26,0.98))]'
            : 'border border-white/[0.08] bg-[linear-gradient(168deg,rgba(16,13,34,0.97),rgba(9,9,26,0.98))] hover:border-violet-400/[0.26] hover:shadow-[0_28px_64px_-18px_rgba(124,58,237,0.3),0_0_0_1px_rgba(124,58,237,0.10)]'
          : reducedCardEffects
            ? 'border border-slate-200/80 bg-white'
            : 'border border-slate-200/80 bg-white hover:border-violet-300/65 hover:shadow-[0_24px_52px_-16px_rgba(139,92,246,0.22)]'
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
        to={`/products/${product.slug}`}
        aria-label={`Open ${product.name}`}
        className="relative z-10 block aspect-[4/3] w-full shrink-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
      >
        <FramedImage
          media={product.heroImage}
          alt={product.name}
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

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black/75 via-black/22 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/28 to-transparent" />

        <div className="absolute left-2 top-2 z-20 flex flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
          {product.featured && (
            <span className={cn(
              'inline-flex items-center rounded-[8px] border border-cyan-400/40 bg-cyan-500/90 px-2.5 py-1 text-[9.5px] font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(34,211,238,0.3)]',
              reducedCardEffects ? '' : 'backdrop-blur-sm'
            )}>
              Featured
            </span>
          )}
          {product.badge && (
            <span className={cn(
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

      <div className="relative z-10 flex flex-1 flex-col px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3.5 lg:px-5 lg:pb-5 lg:pt-4">
        <div className="mb-1.5 sm:mb-2.5">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-[3px] text-[8.5px] font-bold uppercase tracking-[0.14em] sm:px-2.5 sm:text-[9px] sm:tracking-[0.16em]',
              isDark
                ? 'bg-violet-500/[0.13] text-violet-300/95 ring-1 ring-violet-400/[0.17]'
                : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80'
            )}
          >
            {categoryLabel}
          </span>
        </div>

        <div className="mb-2.5 flex-1 sm:mb-4">
          <Link to={`/products/${product.slug}`} className="outline-none focus-visible:underline">
            <h3
              className={cn(
                'font-display text-[0.875rem] font-bold leading-tight tracking-[-0.028em] line-clamp-1 transition-colors duration-300 sm:text-[1.06rem]',
                isDark ? 'text-white group-hover:text-violet-100' : 'text-slate-900 group-hover:text-violet-900'
              )}
            >
              {product.name}
            </h3>
          </Link>
          <p
            className={cn(
              'mt-1 text-[11px] leading-[1.55] line-clamp-2 sm:mt-1.5 sm:text-[12.5px] sm:leading-[1.6]',
              isDark ? 'text-slate-400/88' : 'text-slate-500'
            )}
          >
            {product.shortDescription}
          </p>
        </div>

        <div
          className={cn(
            'mb-2 flex items-end justify-between border-t pt-2.5 sm:mb-3.5 sm:pt-3',
            isDark ? 'border-white/[0.07]' : 'border-slate-100'
          )}
        >
          <div>
            <div
              className={cn(
                'text-[10px] font-semibold uppercase tracking-[0.12em]',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              {priceLabel}
            </div>
            <div
              className={cn(
                'mt-0.5 font-display text-[0.95rem] font-black tracking-[-0.04em] sm:text-[1.18rem]',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {priceDisplay}
            </div>
          </div>
        </div>

        <ProductCommerceActions product={product} />
      </div>
    </motion.article>
  )
})

export default ProductCard
