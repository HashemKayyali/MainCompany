import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import { cn } from '../../utils/cn'
import ProductCard from './ProductCard'

type ProductSuggestionsCarouselProps = {
  products: Product[]
  categoryName: string
}

export default function ProductSuggestionsCarousel({
  products,
  categoryName,
}: ProductSuggestionsCarouselProps) {
  const { isDark } = useTheme()
  const motionEnabled = useMotionEnabled()
  const trackRef = useRef<HTMLDivElement>(null)
  const resumeTimerRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const hasMultiple = products.length > 1

  const clearResumeTimer = () => {
    if (resumeTimerRef.current === null) return
    window.clearTimeout(resumeTimerRef.current)
    resumeTimerRef.current = null
  }

  const pause = () => {
    clearResumeTimer()
    setPaused(true)
  }

  const resumeSoon = () => {
    clearResumeTimer()
    resumeTimerRef.current = window.setTimeout(() => setPaused(false), 1800)
  }

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current
      if (!track || products.length === 0) return

      const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-suggestion-card]'))
      const boundedIndex = ((index % products.length) + products.length) % products.length
      const target = cards[boundedIndex]
      if (!target) return

      track.scrollTo({
        left: target.offsetLeft - track.offsetLeft,
        behavior: motionEnabled ? 'smooth' : 'auto',
      })
      setActiveIndex(boundedIndex)
    },
    [motionEnabled, products.length]
  )

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const updateActiveIndex = () => {
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-suggestion-card]'))
        if (cards.length === 0) return

        const nextIndex = cards.reduce(
          (closest, card, index) => {
            const distance = Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft)
            return distance < closest.distance ? { distance, index } : closest
          },
          { distance: Number.POSITIVE_INFINITY, index: 0 }
        ).index

        setActiveIndex(nextIndex)
      })
    }

    track.addEventListener('scroll', updateActiveIndex, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      track.removeEventListener('scroll', updateActiveIndex)
    }
  }, [products.length])

  useEffect(() => {
    if (!hasMultiple || paused) return

    const interval = window.setInterval(() => {
      scrollToIndex(activeIndex + 1)
    }, 4200)

    return () => window.clearInterval(interval)
  }, [activeIndex, hasMultiple, paused, scrollToIndex])

  useEffect(() => () => clearResumeTimer(), [])

  if (products.length === 0) return null

  return (
    <section
      className={cn(
        'relative mt-12 overflow-hidden rounded-[28px] border px-4 py-6 sm:mt-14 sm:px-6 sm:py-7 lg:mt-16 lg:px-8 lg:py-8',
        isDark
          ? 'border-white/[0.07] bg-white/[0.025] shadow-[0_22px_64px_rgba(2,4,16,0.28),inset_0_1px_0_rgba(255,255,255,0.035)]'
          : 'border-violet-100/80 bg-white/88 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 h-px',
          isDark
            ? 'bg-gradient-to-r from-transparent via-violet-400/30 to-transparent'
            : 'bg-gradient-to-r from-transparent via-violet-300/55 to-transparent'
        )}
        aria-hidden="true"
      />

      <div className="relative mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2.5 flex items-center gap-2.5">
            <span className="section-label">// Suggestions</span>
            <div className={`h-px w-8 ${isDark ? 'bg-violet-500/30' : 'bg-violet-300/50'}`} />
          </div>
          <h2 className={cn('font-display text-[1.55rem] font-black leading-tight tracking-[-0.045em] sm:text-[2rem]', isDark ? 'text-white' : 'text-slate-900')}>
            Similar products
          </h2>
          <p className={cn('mt-2 max-w-xl text-[13px] leading-[1.7]', isDark ? 'text-slate-400/88' : 'text-slate-500')}>
            More options from {categoryName || 'the same category'}.
          </p>
        </div>

        {hasMultiple && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                pause()
                scrollToIndex(activeIndex - 1)
                resumeSoon()
              }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition active:translate-y-[1px]',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
              )}
              aria-label="Previous similar product"
            >
              <ChevronLeft size={17} />
            </button>
            <button
              type="button"
              onClick={() => {
                pause()
                scrollToIndex(activeIndex + 1)
                resumeSoon()
              }}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border transition active:translate-y-[1px]',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
              )}
              aria-label="Next similar product"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        )}
      </div>

      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8">
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-10 w-7 bg-gradient-to-r to-transparent sm:w-10',
            isDark ? 'from-[#0b0a1d]' : 'from-white'
          )}
          aria-hidden="true"
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 z-10 w-7 bg-gradient-to-l to-transparent sm:w-10',
            isDark ? 'from-[#0b0a1d]' : 'from-white'
          )}
          aria-hidden="true"
        />

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] sm:gap-5 sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
          onMouseEnter={pause}
          onMouseLeave={resumeSoon}
          onFocusCapture={pause}
          onBlurCapture={resumeSoon}
          onPointerDown={pause}
          onPointerUp={resumeSoon}
          onPointerCancel={resumeSoon}
          style={{ touchAction: 'pan-x pan-y' }}
          aria-label="Similar products carousel"
        >
          {products.map((item, index) => (
            <div
              key={item.slug}
              data-suggestion-card
              className="w-[78vw] max-w-[310px] flex-none snap-start sm:w-[285px] lg:w-[360px] lg:max-w-none xl:w-[380px]"
            >
              <ProductCard
                product={item}
                index={index}
                revealOnScroll={false}
                imageLoading={index < 2 ? 'eager' : 'lazy'}
                imageFetchPriority={index === 0 ? 'high' : 'auto'}
              />
            </div>
          ))}
        </div>
      </div>

      {hasMultiple && (
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className={cn('inline-flex items-center gap-1.5 text-[11px] font-semibold', isDark ? 'text-slate-500' : 'text-slate-400')}>
            <Sparkles size={12} />
            Auto sliding
          </div>
          <div className="flex items-center gap-1.5" aria-label="Similar products position">
            {products.map(item => (
              <button
                key={item.slug}
                type="button"
                onClick={() => {
                  pause()
                  scrollToIndex(products.findIndex(product => product.slug === item.slug))
                  resumeSoon()
                }}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  products[activeIndex]?.slug === item.slug
                    ? isDark
                      ? 'w-5 bg-violet-300'
                      : 'w-5 bg-violet-600'
                    : isDark
                      ? 'w-1.5 bg-white/20 hover:bg-white/35'
                      : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                )}
                aria-label={`Go to ${item.name}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
