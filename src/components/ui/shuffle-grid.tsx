import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import { cn } from '../../utils/cn'
import FramedImage from './FramedImage'

export interface ShuffleGridItem {
  id: string
  name: string
  image?: string
}

interface NormalizedShuffleGridItem extends ShuffleGridItem {
  instanceId: string
}

interface ShuffleGridProps {
  items: ShuffleGridItem[]
  cellsPerPage?: number
  intervalMs?: number
  className?: string
  cellClassName?: string
  logoClassName?: string
}

function shuffle<T>(array: T[]) {
  const next = [...array]
  let currentIndex = next.length

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    ;[next[currentIndex], next[randomIndex]] = [next[randomIndex], next[currentIndex]]
  }

  return next
}

function normalizeItems(items: ShuffleGridItem[], cellsPerPage: number): NormalizedShuffleGridItem[] {
  const clean = items.filter(item => item.name.trim().length > 0)

  if (clean.length === 0) return []

  if (clean.length >= cellsPerPage) {
    return clean.map((item, index) => ({
      ...item,
      instanceId: `${item.id || item.name}-${index}`,
    }))
  }

  const pool: NormalizedShuffleGridItem[] = []
  let copy = 0

  while (pool.length < cellsPerPage) {
    clean.forEach((item, index) => {
      if (pool.length >= cellsPerPage) return

      pool.push({
        ...item,
        instanceId: `${item.id || item.name}-${index}-${copy}`,
      })
    })
    copy += 1
  }

  return pool
}

function takeVisibleItems(pool: NormalizedShuffleGridItem[], cellsPerPage: number) {
  if (pool.length <= cellsPerPage) return pool
  return shuffle(pool).slice(0, cellsPerPage)
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

function ShuffleGridCell({
  item,
  motionEnabled,
  cellClassName,
  logoClassName,
}: {
  item: NormalizedShuffleGridItem
  motionEnabled: boolean
  cellClassName?: string
  logoClassName?: string
}) {
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    setImageFailed(false)
  }, [item.image])

  const showImage = Boolean(item.image && !imageFailed)

  return (
    <motion.div
      layout={motionEnabled}
      transition={{ duration: 1.25, type: 'spring', bounce: 0.18 }}
      className={cn(
        'group relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/40 bg-white/[0.92] p-2.5 shadow-[0_16px_34px_-24px_rgba(8,3,26,0.85)] backdrop-blur-sm sm:rounded-[18px] sm:p-3.5',
        cellClassName
      )}
    >
      <span
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(70% 70% at 50% 20%, rgba(168,85,247,0.13) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />
      {showImage ? (
        <FramedImage
          media={item.image}
          alt={item.name}
          width={320}
          height={180}
          loading="lazy"
          sizes="(max-width: 640px) 18vw, (max-width: 1024px) 120px, 150px"
          fallbackTransform={{ fit: 'contain' }}
          onError={() => setImageFailed(true)}
          className={cn(
            'relative max-h-[58%] w-auto max-w-[82%] object-contain opacity-85 mix-blend-multiply transition-all duration-300 group-hover:scale-105 group-hover:opacity-100',
            logoClassName
          )}
        />
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center text-center">
          <span className="font-sans text-[clamp(0.76rem,1.25vw,1.08rem)] font-black uppercase leading-[1.05] tracking-[0.02em] text-violet-800">
            {item.name}
          </span>
          <span className="mt-1.5 text-[clamp(0.55rem,0.75vw,0.68rem)] font-black uppercase tracking-[0.18em] text-violet-300">
            {getInitials(item.name)}
          </span>
        </div>
      )}
    </motion.div>
  )
}

export function ShuffleGrid({
  items,
  cellsPerPage = 16,
  intervalMs = 3000,
  className,
  cellClassName,
  logoClassName,
}: ShuffleGridProps) {
  const motionEnabled = useMotionEnabled()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pool = useMemo(() => normalizeItems(items, cellsPerPage), [cellsPerPage, items])
  const [visibleItems, setVisibleItems] = useState(() => takeVisibleItems(pool, cellsPerPage))

  useEffect(() => {
    setVisibleItems(takeVisibleItems(pool, cellsPerPage))

    if (!motionEnabled || pool.length <= 1) return undefined

    const shuffleSquares = () => {
      setVisibleItems(takeVisibleItems(pool, cellsPerPage))
      timeoutRef.current = setTimeout(shuffleSquares, intervalMs)
    }

    timeoutRef.current = setTimeout(shuffleSquares, intervalMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [cellsPerPage, intervalMs, motionEnabled, pool])

  const skeletons = Array.from({ length: cellsPerPage }, (_, index) => index)

  return (
    <div
      className={cn(
        'grid grid-cols-4 grid-rows-4 gap-2 sm:gap-2.5',
        className ?? 'h-[450px]'
      )}
      aria-label="Customer logo shuffle grid"
    >
      {visibleItems.length > 0
        ? visibleItems.slice(0, cellsPerPage).map(item => (
            <ShuffleGridCell
              key={item.instanceId}
              item={item}
              motionEnabled={motionEnabled}
              cellClassName={cellClassName}
              logoClassName={logoClassName}
            />
          ))
        : skeletons.map(index => (
            <div
              key={index}
              className={cn(
                'relative overflow-hidden rounded-[16px] border border-white/25 bg-white/10 sm:rounded-[18px]',
                cellClassName
              )}
            >
              <span className="absolute inset-0 animate-pulse bg-white/10" />
            </div>
          ))}
    </div>
  )
}

export default ShuffleGrid
