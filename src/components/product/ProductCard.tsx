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

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  )
}

function SimpleBadge({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium tracking-wide backdrop-blur-md',
        active
          ? 'bg-cyan-500/90 text-white shadow-sm'
          : 'bg-black/40 text-white/90 border border-white/10'
      )}
    >
      {children}
    </span>
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

  const categoryLabel = product.categoryTags[0] || 'Marketplace'
  const isFeatured = product.featured

  // We simplify pricing view. Just show the primary price (rental) if it has one.
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
      initial={allowMotion ? { opacity: 0, y: 16 } : false}
      whileInView={allowMotion ? { opacity: 1, y: 0 } : undefined}
      viewport={allowMotion ? { once: true, margin: '-20px' } : undefined}
      transition={
        allowMotion
          ? { duration: 0.5, delay: Math.min(index * 0.05, 0.2), ease: [0.16, 1, 0.3, 1] }
          : undefined
      }
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[20px] transition-all duration-300',
        isDark
          ? 'bg-[#0a0d1a] border border-white/10 hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-900/20'
          : 'bg-white border border-slate-200 hover:border-violet-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200'
      )}
    >
      {/* Subtly animated glow behind content on hover (Desktop only effect) */}
      <div
        className={cn(
          'pointer-events-none absolute -inset-px z-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          isDark
            ? 'bg-gradient-to-b from-white/[0.04] to-transparent'
            : 'bg-gradient-to-b from-violet-50 to-transparent'
        )}
      />

      <Link
        to={`/products/${product.slug}`}
        aria-label={`Open ${product.name}`}
        className="relative block aspect-[1.5/1] w-full shrink-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 z-10"
      >
        <FramedImage
          media={product.heroImage}
          alt={product.name}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-700 ease-out',
            isPlaying ? 'opacity-0 scale-105' : 'opacity-100 group-hover:scale-105'
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
              'absolute inset-0 h-full w-full object-cover transition-opacity duration-300',
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

        {/* Cleaner Gradient Overlay - Only at bottom to ensure tag legibility */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-80" />

        {/* Minimal Tags */}
        <div className="absolute left-3 top-3 z-20 flex gap-2">
          {isFeatured && <SimpleBadge active>Featured</SimpleBadge>}
          {product.badge && <SimpleBadge>{product.badge}</SimpleBadge>}
        </div>

        {hasVideo && !isPlaying && (
          <div className="absolute right-3 top-3 z-20">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white transition-transform group-hover:scale-110">
              <Play size={14} fill="currentColor" className="ml-0.5" />
            </div>
          </div>
        )}
      </Link>

      <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-5">

        {/* Metadata Row */}
        <div className="mb-2 flex items-center justify-between">
          <span className={cn('text-[11px] font-semibold uppercase tracking-wider', isDark ? 'text-cyan-400' : 'text-violet-600')}>
            {categoryLabel}
          </span>
        </div>

        {/* Content Block */}
        <div className="mb-4">
          <Link to={`/products/${product.slug}`} className="outline-none focus-visible:underline">
            <h3 className={cn('font-display text-lg font-bold leading-tight tracking-tight line-clamp-1', isDark ? 'text-white' : 'text-slate-900')}>
              {product.name}
            </h3>
          </Link>
          <p className={cn('mt-2 text-sm leading-relaxed line-clamp-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {product.shortDescription}
          </p>
        </div>

        {/* Pricing Block - Clean alignment */}
        <div className="mb-5 mt-auto flex items-end justify-between border-t border-slate-200/10 pt-4">
          <div>
            <div className={cn('text-xs font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              {priceLabel}
            </div>
            <div className={cn('mt-0.5 font-display text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>
              {priceDisplay}
            </div>
          </div>
        </div>

        {/* commerce actions - cleanly integrated */}
        <ProductCommerceActions product={product} />
      </div>
    </motion.article>
  )
}
