import { useCallback, useEffect, useRef, useState, type DragEvent, type MouseEvent, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import type { Product } from '../../data/products/types'
import { cn } from '../../utils/cn'
import ProductCard from './ProductCard'

type ProductSuggestionsCarouselProps = {
  products: Product[]
  categoryName: string
}

type DragState = {
  pointerId: number
  startX: number
  lastX: number
  scrollLeft: number
  moved: boolean
  captured: boolean
  frame: number
}

function shouldSkipDragTarget(target: EventTarget | null) {
  return target instanceof Element
    ? Boolean(target.closest('button, input, textarea, select, [role="button"]'))
    : false
}

export default function ProductSuggestionsCarousel({
  products,
  categoryName,
}: ProductSuggestionsCarouselProps) {
  const { isDark } = useTheme()
  const trackRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragState | null>(null)
  const suppressClickRef = useRef(false)
  const suppressTimerRef = useRef<number | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [canScroll, setCanScroll] = useState(false)

  const clearClickSuppression = useCallback(() => {
    if (suppressTimerRef.current !== null) {
      window.clearTimeout(suppressTimerRef.current)
      suppressTimerRef.current = null
    }
    suppressClickRef.current = false
  }, [])

  const updateTrackState = useCallback(() => {
    const track = trackRef.current
    if (!track) return

    setCanScroll(track.scrollWidth > track.clientWidth + 4)

    const cards = Array.from(track.querySelectorAll<HTMLElement>('[data-suggestion-card]'))
    if (cards.length === 0) return

    const nextIndex = cards.reduce(
      (closest, card, index) => {
        const distance = Math.abs(card.offsetLeft - track.scrollLeft)
        return distance < closest.distance ? { distance, index } : closest
      },
      { distance: Number.POSITIVE_INFINITY, index: 0 }
    ).index

    setActiveIndex(nextIndex)
  }, [])

  useEffect(() => {
    updateTrackState()
    window.addEventListener('resize', updateTrackState)
    return () => {
      window.removeEventListener('resize', updateTrackState)
      clearClickSuppression()
    }
  }, [clearClickSuppression, products.length, updateTrackState])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0
    const handleScroll = () => {
      if (dragRef.current?.moved) return
      window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(updateTrackState)
    }

    track.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      track.removeEventListener('scroll', handleScroll)
    }
  }, [updateTrackState])

  const scrollByPage = (direction: -1 | 1) => {
    const track = trackRef.current
    if (!track) return

    track.scrollBy({
      left: direction * Math.max(220, track.clientWidth * 0.82),
      behavior: 'smooth',
    })
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!canScroll || shouldSkipDragTarget(event.target)) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const track = trackRef.current
    if (!track) return

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      scrollLeft: track.scrollLeft,
      moved: false,
      captured: false,
      frame: 0,
    }
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!canScroll) return
    const drag = dragRef.current
    const track = trackRef.current
    if (!drag || !track || drag.pointerId !== event.pointerId) return

    const delta = event.clientX - drag.startX
    drag.lastX = event.clientX
    if (!drag.moved && Math.abs(delta) <= 6) return

    if (!drag.moved) {
      drag.moved = true
      setIsDragging(true)
      clearClickSuppression()
      suppressClickRef.current = true
      try {
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.captured = true
      } catch {
        // Some browsers may reject capture if the pointer is already released.
      }
    }

    if (!drag.frame) {
      drag.frame = window.requestAnimationFrame(() => {
        drag.frame = 0
        track.scrollLeft = drag.scrollLeft - (drag.lastX - drag.startX)
      })
    }

    event.preventDefault()
  }

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!canScroll) return
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    if (drag.captured) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // Pointer capture may already be released by the browser.
      }
    }

    if (drag.frame) window.cancelAnimationFrame(drag.frame)

    if (drag.moved) {
      const track = trackRef.current
      if (track) track.scrollLeft = drag.scrollLeft - (drag.lastX - drag.startX)
      suppressTimerRef.current = window.setTimeout(() => {
        suppressClickRef.current = false
        suppressTimerRef.current = null
      }, 180)
    } else {
      suppressClickRef.current = false
    }

    dragRef.current = null
    setIsDragging(false)
    window.requestAnimationFrame(updateTrackState)
  }

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }

  const handleNativeDragStart = (event: DragEvent<HTMLDivElement>) => {
    if (!canScroll) return
    event.preventDefault()
  }

  if (products.length === 0) return null

  return (
    <section
      className={cn(
        'relative mt-10 border-t pt-8 lg:mt-12 lg:pt-9',
        isDark ? 'border-white/[0.07]' : 'border-slate-200/90'
      )}
    >
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className={cn('font-display text-[1.25rem] font-black tracking-[-0.035em] sm:text-[1.55rem]', isDark ? 'text-white' : 'text-slate-950')}>
            Similar services
          </h2>
          <p className={cn('mt-1 max-w-xl text-[12.5px] leading-6', isDark ? 'text-slate-400/88' : 'text-slate-500')}>
            More options from {categoryName || 'the same category'}.
          </p>
        </div>

        {canScroll && (
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border transition active:translate-y-[1px]',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.04] text-white/72 hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
              )}
              aria-label="Previous similar services"
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
              aria-label="Next similar services"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={trackRef}
        className={cn(
          'flex gap-4 pt-1',
          canScroll
            ? cn(
                'justify-start overflow-x-auto overscroll-x-contain pb-4 [scrollbar-gutter:stable] [scrollbar-width:thin]',
                isDragging ? 'snap-none' : 'snap-x snap-mandatory',
                isDragging ? 'cursor-grabbing select-none' : 'cursor-grab',
                isDark
                  ? '[scrollbar-color:rgba(167,139,250,0.55)_rgba(255,255,255,0.06)] [&::-webkit-scrollbar-thumb]:bg-violet-300/50 [&::-webkit-scrollbar-track]:bg-white/[0.06]'
                  : '[scrollbar-color:rgba(124,58,237,0.50)_rgba(226,232,240,0.95)] [&::-webkit-scrollbar-thumb]:bg-violet-400/60 [&::-webkit-scrollbar-track]:bg-slate-100',
                '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:rounded-full'
              )
            : 'justify-center overflow-visible pb-1'
        )}
        data-native-scroll
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onClickCapture={handleClickCapture}
        onDragStart={handleNativeDragStart}
        style={{ touchAction: canScroll ? 'pan-x pan-y' : undefined }}
        aria-label="Similar services scroll row"
      >
        {products.map((item, index) => (
          <div
            key={item.slug}
            data-suggestion-card
            className="w-[64vw] max-w-[220px] flex-none snap-start sm:w-[225px] sm:max-w-none lg:w-[232px]"
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

      {canScroll && (
        <div className={cn('mt-1 text-right text-[11px] font-semibold', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Drag or swipe to browse
          <span className="sr-only">. Current position: {activeIndex + 1} of {products.length}</span>
        </div>
      )}
    </section>
  )
}
