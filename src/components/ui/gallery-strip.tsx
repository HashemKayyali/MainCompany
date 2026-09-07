import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { useElementActivity } from '../../hooks/useElementActivity'
import { cn } from '../../utils/cn'
import FramedImage from './FramedImage'

export type GalleryStripItem = {
  id: number | string
  title: string
  desc?: string
  url: string
}

interface GalleryStripProps {
  imageItems: GalleryStripItem[]
}

const AUTO_SCROLL_SPEED = 54
const INERTIA_FRICTION = 2.8
const MAX_RELEASE_VELOCITY = 2200
const MIN_SEQUENCE_ITEMS = 12
const DEFAULT_RATIO = 4 / 3
// Guard rails only, wide enough to hold every ordinary shape (9:16 portrait
// through 2.5:1 landscape) at its exact proportions. A true panorama would
// otherwise run several screens wide; it is letterboxed, never cropped.
const MIN_RATIO = 0.5
const MAX_RATIO = 2.6

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function wrapTrackX(value: number, cycleWidth: number) {
  if (cycleWidth <= 0) return value

  let next = value
  while (next <= -cycleWidth) next += cycleWidth
  while (next > 0) next -= cycleWidth
  return next
}

export default function GalleryStrip({ imageItems }: GalleryStripProps) {
  const [cycleWidth, setCycleWidth] = useState(0)
  // Tile width comes from the image's own proportions, so nothing is cropped to
  // fit a preset frame. Keyed by url: both marquee copies share one measurement.
  const [ratios, setRatios] = useState<Record<string, number>>({})
  const x = useMotionValue(0)
  const reduceMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement | null>(null)
  const firstSequenceRef = useRef<HTMLDivElement | null>(null)
  const secondSequenceRef = useRef<HTMLDivElement | null>(null)
  const measuredCycleWidthRef = useRef(0)
  const pointerIdRef = useRef<number | null>(null)
  const lastPointerXRef = useRef(0)
  const lastPointerTimeRef = useRef(0)
  const dragVelocityRef = useRef(0)
  const inertiaVelocityRef = useRef(0)
  const isDraggingRef = useRef(false)
  const { ref: activityRef, active: activityActive } = useElementActivity<HTMLDivElement>()

  const sequenceItems = useMemo(() => {
    if (imageItems.length === 0) return []
    if (imageItems.length >= MIN_SEQUENCE_ITEMS) return imageItems

    return Array.from({ length: MIN_SEQUENCE_ITEMS }, (_, index) => {
      const source = imageItems[index % imageItems.length]
      return {
        ...source,
        id: `${source.id}-repeat-${Math.floor(index / imageItems.length)}`,
      }
    })
  }, [imageItems])

  const normalizeX = useCallback(
    (value: number) => wrapTrackX(value, cycleWidth),
    [cycleWidth],
  )

  useLayoutEffect(() => {
    const calculateCycleWidth = () => {
      const first = firstSequenceRef.current
      const second = secondSequenceRef.current
      if (!first || !second) return

      const width = second.offsetLeft - first.offsetLeft
      if (width <= 0) return

      const previousWidth = measuredCycleWidthRef.current
      if (Math.abs(previousWidth - width) < 0.5) return

      if (previousWidth > 0) {
        const previousX = x.get()
        const phase = ((-previousX % previousWidth) + previousWidth) % previousWidth
        x.set(-(phase / previousWidth) * width)
      } else {
        x.set(0)
      }

      measuredCycleWidthRef.current = width
      setCycleWidth(width)
      inertiaVelocityRef.current = 0
    }

    calculateCycleWidth()

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(calculateCycleWidth)
      : null

    if (observer) {
      if (firstSequenceRef.current) observer.observe(firstSequenceRef.current)
      if (secondSequenceRef.current) observer.observe(secondSequenceRef.current)
      if (containerRef.current) observer.observe(containerRef.current)
    }

    window.addEventListener('resize', calculateCycleWidth)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', calculateCycleWidth)
    }
  }, [sequenceItems, x])

  useEffect(() => {
    if (!activityActive || cycleWidth <= 0) return undefined

    let frameId = 0
    let previousTime = performance.now()

    const tick = (time: number) => {
      const deltaSeconds = Math.min((time - previousTime) / 1000, 0.064)
      previousTime = time

      if (!isDraggingRef.current) {
        let nextX = x.get()
        const inertiaVelocity = inertiaVelocityRef.current

        if (Math.abs(inertiaVelocity) > 4) {
          nextX += inertiaVelocity * deltaSeconds
          inertiaVelocityRef.current = inertiaVelocity * Math.exp(-INERTIA_FRICTION * deltaSeconds)
        } else {
          inertiaVelocityRef.current = 0
          if (!reduceMotion) nextX -= AUTO_SCROLL_SPEED * deltaSeconds
        }

        x.set(wrapTrackX(nextX, cycleWidth))
      }

      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [activityActive, cycleWidth, reduceMotion, x])

  const rememberRatio = useCallback((url: string, image: HTMLImageElement) => {
    const { naturalWidth, naturalHeight } = image
    if (!naturalWidth || !naturalHeight) return
    const ratio = clamp(naturalWidth / naturalHeight, MIN_RATIO, MAX_RATIO)
    setRatios(current => (
      Math.abs((current[url] ?? 0) - ratio) < 0.001 ? current : { ...current, [url]: ratio }
    ))
  }, [])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== null) return

    pointerIdRef.current = event.pointerId
    isDraggingRef.current = true
    inertiaVelocityRef.current = 0
    dragVelocityRef.current = 0
    lastPointerXRef.current = event.clientX
    lastPointerTimeRef.current = performance.now()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId || !isDraggingRef.current) return

    const now = performance.now()
    const deltaX = event.clientX - lastPointerXRef.current
    const deltaSeconds = Math.max((now - lastPointerTimeRef.current) / 1000, 0.001)
    const instantVelocity = deltaX / deltaSeconds

    dragVelocityRef.current = dragVelocityRef.current * 0.68 + instantVelocity * 0.32
    x.set(normalizeX(x.get() + deltaX))

    lastPointerXRef.current = event.clientX
    lastPointerTimeRef.current = now
  }

  const releasePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return

    inertiaVelocityRef.current = clamp(
      dragVelocityRef.current,
      -MAX_RELEASE_VELOCITY,
      MAX_RELEASE_VELOCITY,
    )
    dragVelocityRef.current = 0
    isDraggingRef.current = false
    pointerIdRef.current = null

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleLostPointerCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    dragVelocityRef.current = 0
    isDraggingRef.current = false
    pointerIdRef.current = null
  }

  const renderSequence = (copyIndex: number, ref?: (node: HTMLDivElement | null) => void) => (
    <div ref={ref} className="flex h-full shrink-0 items-stretch gap-2 sm:gap-2.5">
      {sequenceItems.map((item, index) => (
        <figure
          key={`${copyIndex}-${item.id}`}
          className="group relative h-full shrink-0 cursor-grab overflow-hidden rounded-[16px] bg-violet-50 ring-1 ring-violet-200/50 transition-[transform,box-shadow] duration-500 ease-out will-change-transform hover:z-10 hover:scale-[1.025] hover:shadow-[0_26px_60px_-26px_rgba(46,10,114,0.6)] active:cursor-grabbing"
          style={{ aspectRatio: ratios[item.url] ?? DEFAULT_RATIO }}
        >
          <FramedImage
            media={item.url}
            alt={copyIndex === 0 ? item.title : ''}
            width={640}
            height={640}
            preset="card"
            loading={copyIndex === 0 && index < 12 ? 'eager' : 'lazy'}
            data-image-group="home-gallery"
            fetchPriority="auto"
            draggable={false}
            revealMode="crisp"
            fallbackTransform={{ fit: 'contain' }}
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 32vw, 24vw"
            className="h-full w-full select-none object-contain"
            onLoad={event => rememberRatio(item.url, event.currentTarget)}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/78 via-ink-900/18 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="line-clamp-1 text-sm font-extrabold text-white sm:text-base">
              {item.title}
            </h3>
            {item.desc ? (
              <p className="mt-1 line-clamp-2 text-xs font-semibold leading-5 text-white/82">
                {item.desc}
              </p>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  )

  return (
    <div
      ref={node => {
        containerRef.current = node
        activityRef(node)
      }}
      className="gallery-strip relative w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
      dir="ltr"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={releasePointer}
      onPointerCancel={releasePointer}
      onLostPointerCapture={handleLostPointerCapture}
    >
      <motion.div
        className="flex h-[10.5rem] w-max gap-2 py-2 will-change-transform sm:h-[13.5rem] sm:gap-2.5 lg:h-[17rem]"
        style={{ x }}
      >
        {renderSequence(0, node => {
          firstSequenceRef.current = node
        })}
        {renderSequence(1, node => {
          secondSequenceRef.current = node
        })}
      </motion.div>
    </div>
  )
}
