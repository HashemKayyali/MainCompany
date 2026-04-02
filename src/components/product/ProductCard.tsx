import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Play, Sparkles } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import FramedImage from '../ui/FramedImage'
import FramedVideo from '../ui/FramedVideo'
import ProductCommerceActions from './ProductCommerceActions'

const titleClampStyle: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

const descriptionClampStyle: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}

const ease = [0.16, 1, 0.3, 1] as const

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  )
}

function ProductPill({
  children,
  tone = 'neutral',
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'accent' | 'success'
}) {
  const classes =
    tone === 'accent'
      ? 'border-cyan-300/18 bg-[linear-gradient(180deg,rgba(34,211,238,0.14),rgba(124,58,237,0.08))] text-cyan-50'
      : tone === 'success'
        ? 'border-emerald-300/18 bg-[linear-gradient(180deg,rgba(16,185,129,0.16),rgba(6,182,212,0.08))] text-emerald-50'
        : 'border-white/[0.08] bg-white/[0.05] text-white/78'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-[0.34rem] text-[7.5px] font-semibold uppercase tracking-[0.12em] backdrop-blur-md',
        classes
      )}
    >
      {children}
    </span>
  )
}

function PriceTile({
  label,
  value,
  meta,
  accent = 'violet',
}: {
  label: string
  value: string
  meta: string
  accent?: 'violet' | 'cyan'
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[14px] border px-2.5 py-2',
        accent === 'cyan'
          ? 'border-cyan-300/14 bg-[linear-gradient(180deg,rgba(10,25,41,0.92),rgba(8,15,29,0.94))]'
          : 'border-white/[0.08] bg-[linear-gradient(180deg,rgba(14,17,37,0.94),rgba(9,13,28,0.96))]'
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          accent === 'cyan'
            ? 'bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent'
            : 'bg-gradient-to-r from-transparent via-fuchsia-300/22 to-transparent'
        )}
      />
      <div className="text-[8px] font-mono uppercase tracking-[0.16em] text-white/42">{label}</div>
      <div className="mt-1 text-[0.84rem] font-display font-black leading-none tracking-[-0.04em] text-white">
        {value}
      </div>
      <div className="mt-0.75 text-[9px] leading-4 text-white/58">{meta}</div>
    </div>
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
  const rentalEnabled = product.rentalEnabled !== false
  const saleEnabled = product.saleEnabled !== false
  const showRentalPrice = rentalEnabled && product.showPrice !== false
  const categoryLabel = product.categoryTags[0] || 'Marketplace'
  const heroThumb = product.heroImage
  const heroPoster = product.heroImage

  const chips = useMemo(
    () =>
      Array.from(new Set(product.categoryTags.filter(Boolean))).slice(0, 2),
    [product.categoryTags]
  )

  const pricingTiles = useMemo(() => {
    const tiles: Array<{ label: string; value: string; meta: string; accent?: 'violet' | 'cyan' }> =
      []

    if (rentalEnabled) {
      tiles.push({
        label: showRentalPrice ? 'Rental Rate' : 'Rental Pricing',
        value: showRentalPrice
          ? `${product.rentalPricePerDay} ${product.currency}`
          : 'Tailored Pricing',
        meta: showRentalPrice ? 'Per day rental pricing' : 'Quote-based rental setup',
        accent: 'cyan',
      })
    }

    if (saleEnabled) {
      tiles.push({
        label: 'Purchase Quote',
        value: 'Custom Quote',
        meta: 'Built around your brief and scope',
        accent: 'violet',
      })
    }

    return tiles
  }, [product.currency, product.rentalPricePerDay, rentalEnabled, saleEnabled, showRentalPrice])

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
      className="group relative self-start"
      initial={allowMotion ? { opacity: 0, y: 24 } : false}
      whileInView={allowMotion ? { opacity: 1, y: 0 } : undefined}
      viewport={allowMotion ? { once: true, margin: '-32px' } : undefined}
      transition={
        allowMotion
          ? { duration: 0.58, delay: Math.min(index * 0.04, 0.18), ease }
          : undefined
      }
      onMouseEnter={startPreview}
      onMouseLeave={stopPreview}
    >
      <div
        className={cn(
          'absolute inset-[6px] -z-10 rounded-[20px] border blur-lg transition-opacity duration-300',
          isHovering ? 'opacity-100' : 'opacity-70',
          isDark
            ? 'border-cyan-400/10 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_58%)]'
            : 'border-violet-300/12 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_58%)]'
        )}
      />

      <div
        className={cn(
          'relative flex flex-col overflow-hidden rounded-[19px] border p-2',
          isDark
            ? 'border-white/[0.08] bg-[linear-gradient(145deg,rgba(10,14,30,0.96),rgba(6,10,20,0.98))] shadow-[0_30px_90px_-62px_rgba(8,16,38,0.96)]'
            : 'border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,245,255,0.94))] shadow-[0_26px_58px_-40px_rgba(15,23,42,0.18)]'
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.1]"
          style={{
            backgroundImage: isDark
              ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
              : 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.04) 1px, transparent 1px)',
            backgroundSize: '78px 78px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.54), transparent 55%)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.54), transparent 55%)',
          }}
        />

        <Link
          to={`/products/${product.slug}`}
          aria-label={`Open ${product.name}`}
          className={cn(
            'relative block aspect-[1.82/1] overflow-hidden rounded-[16px] border outline-none focus-visible:ring-2 focus-visible:ring-offset-2 sm:aspect-[16/9]',
            isDark
              ? 'border-white/[0.10] bg-black/20 focus-visible:ring-cyan-300/55 focus-visible:ring-offset-[#07101c]'
              : 'border-white/85 bg-white/75 focus-visible:ring-violet-500/45 focus-visible:ring-offset-white'
          )}
        >
          <FramedImage
            media={heroThumb}
            alt={product.name}
            loading="lazy"
            className={cn(
              'h-full w-full transition-all duration-700',
              isPlaying ? 'opacity-0 scale-[1.04]' : 'opacity-100 scale-100'
            )}
            fallbackTransform={{ fit: 'cover' }}
            draggable={false}
          />

          {hasVideo ? (
            <FramedVideo
              ref={videoRef}
              media={product.videoUrl}
              posterMedia={heroPoster}
              className={cn(
                'absolute inset-0 h-full w-full transition-opacity duration-300',
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
          ) : null}

          <div
            className={cn(
              'pointer-events-none absolute inset-0',
              isDark
                ? 'bg-[linear-gradient(180deg,rgba(2,6,18,0.08),transparent_34%,rgba(2,6,18,0.82))]'
                : 'bg-[linear-gradient(180deg,rgba(255,255,255,0.10),transparent_36%,rgba(255,255,255,0.92))]'
            )}
          />

          <div className="pointer-events-none absolute left-2 top-2 z-10 flex flex-wrap gap-1.25">
            <ProductPill tone="accent">{categoryLabel}</ProductPill>
            {product.badge?.trim() ? <ProductPill>{product.badge}</ProductPill> : null}
          </div>

          <div className="pointer-events-none absolute right-2 top-2 z-10 flex flex-wrap justify-end gap-1.25">
            {product.featured ? <ProductPill tone="success">Featured</ProductPill> : null}
            {saleEnabled && !rentalEnabled ? <ProductPill>Quote Based</ProductPill> : null}
          </div>

          {hasVideo ? (
            <>
              <div className="pointer-events-none absolute bottom-2 left-2 z-10">
                <ProductPill>{isPlaying ? 'Preview Playing' : 'Video Preview'}</ProductPill>
              </div>
              {!isPlaying ? (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-md',
                      isDark
                        ? 'border-white/14 bg-black/36 text-white'
                        : 'border-white/90 bg-white/70 text-violet-700'
                    )}
                  >
                    <Play size={11} fill="currentColor" strokeWidth={0} className="ml-0.5" />
                  </div>
                </div>
              ) : null}
            </>
          ) : null}
        </Link>

        <div className="relative flex flex-1 flex-col gap-2 px-0 pb-0 pt-2.5">
          <div className="space-y-1.75">
            <div className={cn('text-[8px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-cyan-100/40' : 'text-violet-700/70')}>
              Premium product listing
            </div>

            <div className="space-y-1.25">
              <h3
                className={cn(
                  'font-display text-[0.98rem] font-black leading-[0.98] tracking-[-0.05em] sm:text-[1.04rem]',
                  isDark ? 'text-white' : 'text-gray-900'
                )}
                style={titleClampStyle}
              >
                {product.name}
              </h3>

              <p
                className={cn('text-[0.76rem] leading-[1.45]', isDark ? 'text-purple-100/68' : 'text-gray-500')}
                style={descriptionClampStyle}
              >
                {product.shortDescription}
              </p>
            </div>

            {chips.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {chips.map((chip, chipIndex) => (
                  <span
                    key={`${product.slug}-${chip}`}
                    className={cn(
                      'inline-flex items-center rounded-full border px-2 py-[0.34rem] text-[8.5px] font-medium',
                      chipIndex === 0
                        ? isDark
                          ? 'border-cyan-400/16 bg-cyan-400/10 text-cyan-100'
                          : 'border-violet-200 bg-violet-50 text-violet-700'
                        : isDark
                          ? 'border-white/[0.08] bg-white/[0.04] text-white/72'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                    )}
                  >
                    {chip}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {pricingTiles.length > 0 ? (
            <div className={cn('grid gap-1.25', pricingTiles.length > 1 ? 'sm:grid-cols-2' : 'grid-cols-1')}>
              {pricingTiles.map(tile => (
                <PriceTile
                  key={`${product.slug}-${tile.label}`}
                  label={tile.label}
                  value={tile.value}
                  meta={tile.meta}
                  accent={tile.accent}
                />
              ))}
            </div>
          ) : null}

          <div className="mt-auto space-y-1.5 pt-0.25">
            <Link
              to={`/products/${product.slug}`}
              className={cn(
                'inline-flex min-h-[35px] w-full items-center justify-center gap-1.25 rounded-[12px] border px-3 py-1.75 text-[9.75px] font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-slate-100/88 hover:border-cyan-300/22 hover:bg-white/[0.08] focus-visible:ring-cyan-300/55 focus-visible:ring-offset-[#07101c]'
                  : 'border-white/90 bg-white/72 text-slate-700 hover:border-violet-300 hover:bg-white focus-visible:ring-violet-500/45 focus-visible:ring-offset-white'
              )}
            >
              <Sparkles size={13} />
              View Details
              <ArrowUpRight size={12} />
            </Link>

            <ProductCommerceActions product={product} />
          </div>
        </div>
      </div>
    </motion.article>
  )
}
