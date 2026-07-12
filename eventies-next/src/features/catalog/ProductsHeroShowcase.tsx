'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useMotionEnabled } from '@/hooks/usePerfMode'
import { Link } from '@/i18n/navigation'
import { SmartImage } from '@/components/ui/SmartImage'

/**
 * CAT-024 — Products hero showcase (faithful port of the Vite
 * `ProductsHeroShowcase`): five floating product cards that gently sway and
 * periodically rotate to other products. Motion-gated; static (no rotation)
 * under reduced-motion / low-power.
 */
export type ShowcaseProduct = { name: string; slug: string; image?: string; category: string }

const LAYOUTS = [
  {
    className: 'left-[5%] top-[5%] w-[47%] max-w-[230px]',
    rotate: -6,
    floatY: -12,
    sway: 3,
    z: 20,
  },
  {
    className: 'right-[3%] top-[13%] w-[43%] max-w-[214px]',
    rotate: 5,
    floatY: -10,
    sway: -3,
    z: 30,
  },
  {
    className: 'left-[27%] top-[35%] w-[49%] max-w-[244px]',
    rotate: -1,
    floatY: -14,
    sway: 2,
    z: 40,
  },
  {
    className: 'left-[8%] bottom-[8%] w-[41%] max-w-[198px]',
    rotate: 7,
    floatY: -9,
    sway: -4,
    z: 25,
  },
  {
    className: 'right-[7%] bottom-[5%] w-[43%] max-w-[208px]',
    rotate: -5,
    floatY: -11,
    sway: 3,
    z: 35,
  },
] as const

const COUNT = 5
const ROTATION_MS = 1250
const BATCH = 3

function Card({
  product,
  index,
  motionEnabled,
}: {
  product: ShowcaseProduct
  index: number
  motionEnabled: boolean
}) {
  const layout = LAYOUTS[index % LAYOUTS.length]!
  return (
    <motion.div
      className={`absolute ${layout.className}`}
      style={{ zIndex: layout.z, rotate: layout.rotate }}
      animate={
        motionEnabled
          ? {
              y: [0, layout.floatY, 0],
              rotate: [layout.rotate, layout.rotate + layout.sway, layout.rotate],
            }
          : undefined
      }
      transition={{ duration: 5 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-[18px] border border-white/15 bg-white/[0.10] backdrop-blur-xl transition-transform duration-300 hover:scale-[1.03]"
      >
        <div className="relative aspect-[4/3] bg-white/12">
          <SmartImage
            media={product.image ?? ''}
            alt={product.name}
            fill
            sizes="240px"
            className="object-cover"
          />
        </div>
        <div className="p-3.5">
          <div className="truncate text-[9px] font-bold uppercase tracking-[0.14em] text-fuchsia-100/80">
            {product.category}
          </div>
          <div className="mt-1 truncate text-[13px] font-bold text-white">{product.name}</div>
        </div>
      </Link>
    </motion.div>
  )
}

export function ProductsHeroShowcase({ products }: { products: ShowcaseProduct[] }) {
  const motionEnabled = useMotionEnabled()
  const [slots, setSlots] = useState<number[]>(() =>
    Array.from({ length: Math.min(COUNT, products.length) }, (_, i) => i)
  )

  useEffect(() => {
    if (!motionEnabled || products.length <= 1) return
    const timer = window.setInterval(() => {
      setSlots((prev) => {
        if (prev.length === 0) return prev
        const next = [...prev]
        const toUpdate = new Set<number>()
        while (toUpdate.size < Math.min(BATCH, next.length))
          toUpdate.add(Math.floor(Math.random() * next.length))
        toUpdate.forEach((slot) => {
          const used = new Set(next)
          let candidate = next[slot]!
          for (let a = 0; a < products.length * 3; a += 1) {
            const r = Math.floor(Math.random() * products.length)
            if (r !== next[slot] && (products.length <= next.length || !used.has(r))) {
              candidate = r
              break
            }
          }
          if (candidate === next[slot]) candidate = (next[slot]! + 1) % products.length
          next[slot] = candidate
        })
        return next
      })
    }, ROTATION_MS)
    return () => window.clearInterval(timer)
  }, [motionEnabled, products.length])

  const cards = useMemo(
    () => slots.map((i) => products[i % products.length]!).filter(Boolean),
    [slots, products]
  )
  if (products.length === 0) return null

  return (
    <div className="relative h-[430px] sm:h-[500px] lg:h-[540px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(58% 48% at 47% 38%, rgba(255,255,255,0.18) 0%, transparent 62%),radial-gradient(46% 38% at 72% 18%, rgba(217,70,239,0.18) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />
      {cards.map((product, index) => (
        <Card key={`slot-${index}`} product={product} index={index} motionEnabled={motionEnabled} />
      ))}
    </div>
  )
}
