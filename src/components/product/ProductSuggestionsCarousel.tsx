import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
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
  const { dir, translateText } = useI18n()
  const trackRef = useRef<HTMLDivElement>(null)
  const [canScroll, setCanScroll] = useState(false)

  const measureOverflow = useCallback(() => {
    const track = trackRef.current
    if (!track) return
    setCanScroll(track.scrollWidth > track.clientWidth + 4)
  }, [])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return undefined

    measureOverflow()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(measureOverflow)
      : null

    resizeObserver?.observe(track)
    window.addEventListener('resize', measureOverflow, { passive: true })

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', measureOverflow)
    }
  }, [measureOverflow, products.length])

  const scrollByPage = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: direction * Math.max(220, track.clientWidth * 0.82),
      behavior: 'smooth',
    })
  }

  if (products.length === 0) return null

  return (
    <section
      dir={dir}
      className={cn(
        'relative mt-10 min-w-0 max-w-full border-t pt-8 lg:mt-12 lg:pt-9',
        isDark ? 'border-white/[0.07]' : 'border-slate-200/90'
      )}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h2
            className={cn(
              'font-display text-[1.25rem] font-black tracking-[-0.035em] sm:text-[1.55rem]',
              isDark ? 'text-white' : 'text-slate-950'
            )}
          >
            {translateText('Similar services')}
          </h2>
          <p className={cn('mt-1 max-w-xl text-[12.5px] leading-6', isDark ? 'text-slate-400/88' : 'text-slate-500')}>
            {translateText('More options from')}{' '}
            <bdi dir="ltr" lang="en" className="product-data-ltr inline">
              {categoryName || translateText('the same category')}
            </bdi>
            .
          </p>
        </div>

        <div
          className={cn(
            'hidden shrink-0 items-center gap-2 sm:flex',
            !canScroll && 'pointer-events-none invisible'
          )}
          aria-hidden={!canScroll}
        >
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border transition active:translate-y-[1px]',
              isDark
                ? 'border-white/[0.10] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
            )}
            aria-label={translateText('Previous similar services')}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full border transition active:translate-y-[1px]',
              isDark
                ? 'border-white/[0.10] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white'
                : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
            )}
            aria-label={translateText('Next similar services')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        dir="ltr"
        className={cn(
          'flex w-full min-w-0 max-w-full justify-start gap-4 overflow-x-auto overflow-y-hidden pb-4 pt-1',
          'snap-x snap-proximity scroll-smooth overscroll-x-contain overscroll-y-auto',
          '[scrollbar-gutter:stable] [scrollbar-width:thin]',
          isDark
            ? '[scrollbar-color:rgba(167,139,250,0.55)_rgba(255,255,255,0.06)] [&::-webkit-scrollbar-thumb]:bg-violet-300/50 [&::-webkit-scrollbar-track]:bg-white/[0.06]'
            : '[scrollbar-color:rgba(124,58,237,0.50)_rgba(226,232,240,0.95)] [&::-webkit-scrollbar-thumb]:bg-violet-400/60 [&::-webkit-scrollbar-track]:bg-slate-100',
          '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full'
        )}
        data-product-suggestions-track
        aria-label={translateText('Similar services scroll row')}
      >
        {products.map((item, index) => (
          <div
            key={item.slug}
            data-suggestion-card
            className="w-[82vw] max-w-[330px] flex-none snap-start sm:w-[300px] sm:max-w-none lg:w-[318px] xl:w-[330px]"
          >
            <ProductCard
              product={item}
              index={index}
              compact
              revealOnScroll={false}
              imageLoading="lazy"
              imageFetchPriority="auto"
            />
          </div>
        ))}
      </div>

      <div
        className={cn(
          'mt-1 min-h-[1.25rem] text-end text-[11px] font-semibold',
          isDark ? 'text-slate-500' : 'text-slate-400',
          !canScroll && 'invisible'
        )}
        aria-hidden={!canScroll}
      >
        {translateText('Drag or swipe to browse')}
      </div>
    </section>
  )
}
