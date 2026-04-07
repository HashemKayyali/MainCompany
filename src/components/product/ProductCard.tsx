import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import FramedImage from '../ui/FramedImage'
import FramedVideo from '../ui/FramedVideo'
import ProductCommerceActions from './ProductCommerceActions'
import { cn } from '../../utils/cn'

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  )
}

export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product
  index?: number
}) {
  const { isDark } = useTheme()
  const motionEnabled = useMotionEnabled()
  const cardRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [isHovering, setIsHovering] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const allowMotion = motionEnabled && !prefersReducedMotion()
  const hasVideo = Boolean(product.videoUrl)
  const isFeatured = product.featured

  const categoryLabel = product.categoryTags[0] || 'Marketplace'
  const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
  const priceDisplay = showRentalPrice ? `${product.rentalPricePerDay} ${product.currency}` : 'Quote Based'
  const priceLabel = showRentalPrice ? 'Per Day' : 'Custom Pricing'

  useEffect(() => {
    if (!hasVideo || !cardRef.current || prefersReducedMotion()) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          videoRef.current?.pause()
          if (videoRef.current) videoRef.current.currentTime = 0
          setIsPlaying(false)
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(cardRef.current)
    return () => observer.disconnect()
  }, [hasVideo])

  const startPreview = () => {
    setIsHovering(true)
    if (!hasVideo || prefersReducedMotion()) return
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    void video.play().catch(() => undefined)
  }

  const stopPreview = () => {
    setIsHovering(false)
    const video = videoRef.current
    if (!video) return
    video.pause()
    video.currentTime = 0
    setIsPlaying(false)
  }

  return (
    <motion.article
      ref={cardRef}
      initial={allowMotion ? { opacity: 0, y: 18 } : false}
      whileInView={allowMotion ? { opacity: 1, y: 0 } : undefined}
      viewport={allowMotion ? { once: true, margin: '-20px' } : undefined}
      transition={
        allowMotion
          ? { duration: 0.52, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }
          : undefined
      }
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[22px] transition-all duration-350',
        isDark
          ? 'border border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,13,32,0.96),rgba(9,9,24,0.98))] hover:border-violet-400/[0.22] hover:-translate-y-1 hover:shadow-[0_28px_60px_-20px_rgba(124,58,237,0.28),0_0_0_1px_rgba(124,58,237,0.10)]'
          : 'border border-slate-200/80 bg-white hover:border-violet-300/60 hover:-translate-y-1 hover:shadow-[0_24px_48px_-18px_rgba(139,92,246,0.22)]'
      )}
      // Fix flickering: use willChange instead of backdropFilter on a transforming element
      style={{ willChange: 'transform' }}
    >
      {/* Hover glow layer - static position, no transform, so no GPU invalidation */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-[22px]',
          isDark
            ? 'bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.14)_0%,transparent_55%)]'
            : 'bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,0.05)_0%,transparent_55%)]'
        )}
      />

      {/* ── Image / Video ── */}
      <Link
        to={`/products/${product.slug}`}
        aria-label={`Open ${product.name}`}
        className="relative z-10 block aspect-[4/3] w-full shrink-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
      >
        <FramedImage
          media={product.heroImage}
          alt={product.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-700 ease-out',
            isPlaying ? 'opacity-0 scale-[1.06]' : 'opacity-100 group-hover:scale-[1.05]'
          )}
          fallbackTransform={{ fit: 'cover' }}
          draggable={false}
        />

        {hasVideo && (
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

        {/* Image bottom gradient - stronger */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

        {/* Top-left badges */}
        <div className="absolute left-3 top-3 z-20 flex flex-wrap gap-1.5">
          {isFeatured && (
            <span className="inline-flex items-center rounded-[8px] border border-cyan-400/40 bg-cyan-500/90 px-2.5 py-1 text-[9.5px] font-bold tracking-wide text-white backdrop-blur-sm shadow-[0_4px_12px_rgba(34,211,238,0.3)]">
              Featured
            </span>
          )}
          {product.badge && (
            <span className="inline-flex items-center rounded-[8px] border border-white/20 bg-black/50 px-2.5 py-1 text-[9.5px] font-medium text-white/90 backdrop-blur-sm">
              {product.badge}
            </span>
          )}
        </div>

        {/* Play icon */}
        {hasVideo && !isPlaying && (
          <div className="absolute right-3 top-3 z-20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
              <Play size={13} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      {/* ── Card content ── */}
      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">

        {/* Category tag */}
        <div className="mb-2.5">
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.14em]',
            isDark
              ? 'bg-violet-500/[0.14] text-violet-300/90 ring-1 ring-violet-400/[0.18]'
              : 'bg-violet-50 text-violet-700 ring-1 ring-violet-200/80'
          )}>
            {categoryLabel}
          </span>
        </div>

        {/* Title + description */}
        <div className="mb-4 flex-1">
          <Link to={`/products/${product.slug}`} className="outline-none focus-visible:underline">
            <h3 className={cn(
              'font-display text-[1.05rem] font-bold leading-tight tracking-[-0.025em] line-clamp-1 transition-colors duration-300',
              isDark ? 'text-white group-hover:text-violet-100' : 'text-slate-900 group-hover:text-violet-900'
            )}>
              {product.name}
            </h3>
          </Link>
          <p className={cn(
            'mt-2 text-[12.5px] leading-[1.6] line-clamp-2',
            isDark ? 'text-slate-400/90' : 'text-slate-500'
          )}>
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing */}
        <div className={cn(
          'mb-4 flex items-end justify-between border-t pt-3.5',
          isDark ? 'border-white/[0.07]' : 'border-slate-100'
        )}>
          <div>
            <div className={cn('text-[10.5px] font-medium', isDark ? 'text-slate-500' : 'text-slate-400')}>
              {priceLabel}
            </div>
            <div className={cn('mt-0.5 font-display text-[1.18rem] font-black tracking-[-0.04em]', isDark ? 'text-white' : 'text-slate-900')}>
              {priceDisplay}
            </div>
          </div>
        </div>

        <ProductCommerceActions product={product} />
      </div>
    </motion.article>
  )
}
