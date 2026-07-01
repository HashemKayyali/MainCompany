import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  LayoutGrid,
  Search,
  SlidersHorizontal,
} from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import SectionHeading from '../components/home/SectionHeading'
import Chip from '../components/ui/Chip'
import FramedImage from '../components/ui/FramedImage'
import EventiesHero from '../components/layout/EventiesHero'
import { useData } from '../contexts/DataContext'
import type { Category, Product } from '../data/products/types'
import { useMotionEnabled } from '../hooks/useMotionEnabled'
import { usePageMeta } from '../hooks/usePageMeta'
import { useTheme } from '../contexts/ThemeContext'
import { preloadRoute } from '../utils/route-preload'
import { useI18n } from '../contexts/LanguageContext'

const ease = [0.16, 1, 0.3, 1]
const HERO_CARD_COUNT = 5
const HERO_CARD_ROTATION_MS = 1250
const HERO_CARD_ROTATION_BATCH = 3

const heroCardLayouts = [
  {
    className: 'left-[5%] top-[5%] w-[47%] max-w-[230px]',
    rotate: -6,
    floatX: -5,
    floatY: -12,
    sway: 3,
    z: 20,
  },
  {
    className: 'right-[3%] top-[13%] w-[43%] max-w-[214px]',
    rotate: 5,
    floatX: 6,
    floatY: -10,
    sway: -3,
    z: 30,
  },
  {
    className: 'left-[27%] top-[35%] w-[49%] max-w-[244px]',
    rotate: -1,
    floatX: 4,
    floatY: -14,
    sway: 2,
    z: 40,
  },
  {
    className: 'left-[8%] bottom-[8%] w-[41%] max-w-[198px]',
    rotate: 7,
    floatX: -4,
    floatY: -9,
    sway: -4,
    z: 25,
  },
  {
    className: 'right-[7%] bottom-[5%] w-[43%] max-w-[208px]',
    rotate: -5,
    floatX: 5,
    floatY: -11,
    sway: 3,
    z: 35,
  },
] as const

function ProductHeroCard({
  product,
  categoryName,
  index,
  motionEnabled,
}: {
  product: Product
  categoryName: string
  index: number
  motionEnabled: boolean
}) {
  const layout = heroCardLayouts[index % heroCardLayouts.length]
  const href = `/products/${product.slug}`

  return (
    <motion.div
      className={`absolute ${layout.className}`}
      style={{ zIndex: layout.z }}
      initial={motionEnabled ? { opacity: 0, y: 22, scale: 0.92 } : false}
      animate={motionEnabled ? { opacity: 1, y: 0, scale: 1 } : undefined}
      exit={motionEnabled ? { opacity: 0, y: -18, scale: 0.94 } : undefined}
      transition={{ duration: 0.5, ease }}
    >
      <motion.div
        style={{ rotate: layout.rotate }}
        animate={
          motionEnabled
            ? {
                x: [0, layout.floatX, 0],
                y: [0, layout.floatY, 0],
                rotate: [layout.rotate, layout.rotate + layout.sway, layout.rotate],
              }
            : undefined
        }
        transition={{
          duration: 5.2 + index * 0.45,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: index * 0.18,
        }}
      >
        <Link
          to={href}
          onMouseEnter={() => preloadRoute(href)}
          onFocus={() => preloadRoute(href)}
          className="group block overflow-hidden rounded-[18px] border border-white/20 bg-white/[0.11] text-left shadow-[0_30px_70px_-34px_rgba(8,3,26,0.95)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-fuchsia-200/50 hover:bg-white/[0.16]"
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-white/10">
            <AnimatePresence initial={false}>
              <motion.div
                key={`${product.slug}-${product.heroImage}`}
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
              >
                <FramedImage
                  media={product.heroImage}
                  alt={product.name}
                  width={800}
                  height={600}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  sizes="(max-width: 1024px) 45vw, 220px"
                  revealMode="crisp"
                  fallbackTransform={{ fit: 'cover' }}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/45" />
          </div>
          <div className="p-3.5">
            <div className="relative min-h-[38px] overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${product.slug}-copy`}
                  className="absolute inset-x-0 top-0"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  <div className="mb-1.5 truncate text-[8.5px] font-bold uppercase tracking-[0.16em] text-fuchsia-100">
                    {categoryName}
                  </div>
                  <h3 className="truncate font-sans text-[13px] font-black tracking-[-0.03em] text-white">
                    {product.name}
                  </h3>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

function ProductHeroSkeletonCards({ motionEnabled }: { motionEnabled: boolean }) {
  return (
    <>
      {heroCardLayouts.slice(0, 3).map((layout, index) => (
        <motion.div
          key={`hero-product-skeleton-${index}`}
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
          <div className="overflow-hidden rounded-[18px] border border-white/15 bg-white/[0.10] backdrop-blur-xl">
            <div className="aspect-[4/3] bg-white/12" />
            <div className="p-3.5">
              <div className="h-2.5 w-2/3 rounded-full bg-white/14" />
              <div className="mt-2 h-3 w-4/5 rounded-full bg-white/10" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  )
}

function ProductsHeroShowcase({
  heroProducts,
  categoryNameById,
  motionEnabled,
}: {
  heroProducts: Product[]
  categoryNameById: Map<string, string>
  motionEnabled: boolean
}) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(58% 48% at 47% 38%, rgba(255,255,255,0.18) 0%, transparent 62%),' +
            'radial-gradient(46% 38% at 72% 18%, rgba(217,70,239,0.18) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />

      {heroProducts.length > 0 ? (
        heroProducts.map((product, index) => (
          <ProductHeroCard
            key={`hero-product-slot-${index}`}
            product={product}
            categoryName={categoryNameById.get(product.categoryId) || 'Marketplace'}
            index={index}
            motionEnabled={motionEnabled}
          />
        ))
      ) : (
        <ProductHeroSkeletonCards motionEnabled={motionEnabled} />
      )}
    </>
  )
}

function ProductsHero({
  products,
  categories,
}: {
  products: Product[]
  categories: Category[]
}) {
  const motionEnabled = useMotionEnabled()
  const [heroSlotIndexes, setHeroSlotIndexes] = useState<number[]>([])

  useEffect(() => {
    const count = Math.min(HERO_CARD_COUNT, products.length)
    setHeroSlotIndexes(previous => {
      if (count === 0) return []

      const next = previous.slice(0, count).map((productIndex, slotIndex) =>
        productIndex < products.length ? productIndex : slotIndex % products.length
      )

      while (next.length < count) {
        next.push(next.length % products.length)
      }

      return next
    })
  }, [products.length])

  useEffect(() => {
    if (!motionEnabled || products.length <= 1) return

    const timer = window.setInterval(() => {
      setHeroSlotIndexes(previous => {
        if (previous.length === 0) return previous

        const next = [...previous]
        const batchSize = Math.min(HERO_CARD_ROTATION_BATCH, next.length)
        const slotsToUpdate = new Set<number>()

        while (slotsToUpdate.size < batchSize) {
          slotsToUpdate.add(Math.floor(Math.random() * next.length))
        }

        slotsToUpdate.forEach(slotIndex => {
          const currentProductIndex = next[slotIndex]
          const usedIndexes = new Set(next)
          let candidateIndex = currentProductIndex

          for (let attempt = 0; attempt < products.length * 3; attempt += 1) {
            const randomIndex = Math.floor(Math.random() * products.length)
            const uniqueEnough = products.length <= next.length || !usedIndexes.has(randomIndex)

            if (randomIndex !== currentProductIndex && uniqueEnough) {
              candidateIndex = randomIndex
              break
            }
          }

          if (candidateIndex === currentProductIndex) {
            candidateIndex = (currentProductIndex + 1) % products.length
          }

          next[slotIndex] = candidateIndex
        })

        return next
      })
    }, HERO_CARD_ROTATION_MS)

    return () => window.clearInterval(timer)
  }, [motionEnabled, products.length])

  const categoryNameById = useMemo(
    () => new Map(categories.map(category => [category.id, category.name])),
    [categories]
  )

  const heroProducts = useMemo(() => {
    if (products.length === 0) return []

    const count = Math.min(HERO_CARD_COUNT, products.length)
    const slotIndexes = heroSlotIndexes.length > 0
      ? heroSlotIndexes.slice(0, count)
      : Array.from({ length: count }, (_, index) => index)

    return slotIndexes.map(productIndex => products[productIndex % products.length])
  }, [heroSlotIndexes, products])

  const categoryChips = useMemo(
    () => categories.filter(category => category.slug.trim().length > 0).slice(0, 5),
    [categories]
  )

  return (
    <EventiesHero
      eyebrow="Service Catalog - Jordan"
      title="Discover event services and rentals for every kind of occasion."
      description="Browse interactive games, screens, booths, production support, and event services from trusted providers across Jordan. Compare options and submit a rental or purchase quote request for review."
      primaryAction={{ label: 'Browse Services', href: '#products-catalog' }}
      secondaryAction={{ label: 'Explore Categories', to: '/categories' }}
      chips={categoryChips.map(category => ({
        label: category.name,
        to: `/categories/${encodeURIComponent(category.slug)}`,
      }))}
      rightSlotClassName="h-[430px] sm:h-[500px] lg:h-[540px]"
      rightSlot={
        <ProductsHeroShowcase
          heroProducts={heroProducts}
          categoryNameById={categoryNameById}
          motionEnabled={motionEnabled}
        />
      }
    />
  )
}

export default function ProductsPage() {
  usePageMeta({
    title: 'Event Services & Rentals in Jordan | Eventies',
    description:
      'Browse event rentals, interactive games, VR experiences, screens, booths, entertainment, and production services from trusted providers in Jordan, then submit a rental or purchase quote request for review.',
    canonical: 'https://www.eventiesjo.com/products',
  })

  const { products, categories, getProductsByCategory } = useData()
  const { isDark } = useTheme()
  const { translateText } = useI18n()
  const [searchParams] = useSearchParams()
  const preCategory = searchParams.get('category') || 'all'
  const [filter, setFilter] = useState(preCategory)

  const filtered = useMemo(() => {
    if (filter === 'all') return products

    const catId = categories.find(c => c.slug === filter)?.id || ''
    const byCategory = catId ? getProductsByCategory(catId) : []
    const byTags = products.filter(p =>
      p.categoryTags?.some(t => t.toLowerCase() === filter.toLowerCase())
    )

    return byCategory
      .concat(byTags)
      .filter((p, i, arr) => arr.findIndex(x => x.slug === p.slug) === i)
  }, [filter, products, categories, getProductsByCategory])

  return (
    <>
      <ProductsHero products={products} categories={categories} />

      <div className="bg-[#f8f3ff]">
      <section id="products-catalog" className="site-section scroll-mt-[96px] bg-transparent">
        <div className="site-container">
          <SectionHeading
            eyebrow="Services"
            title="Discover event services and rentals for every kind of occasion."
            description="Filter the catalog by category, compare the available options, and open any service to rent it or request a purchase quote for review."
            className="mb-10"
          />

          <div
            className={`relative overflow-hidden rounded-[28px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13 ${
              isDark
                ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.74),rgba(8,8,20,0.56))] shadow-[0_28px_84px_rgba(2,4,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
                : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
            }`}
          >
            {isDark && (
              <div
                className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/[0.07] blur-[100px]"
                aria-hidden="true"
              />
            )}

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.52, delay: 0.08, ease }}
              className="mb-9"
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="mb-3.5 flex items-center gap-2">
                    <SlidersHorizontal size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                    <span className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Service category
                    </span>
                  </div>
                  <h2 className={`font-display text-[1.45rem] font-black tracking-[-0.04em] sm:text-[1.8rem] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Service Catalog
                  </h2>
                </div>

                <div
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2.5 ${
                    isDark
                      ? 'border-white/[0.09] bg-white/[0.04] text-white/78'
                      : 'border-violet-200/70 bg-violet-50/70 text-violet-900'
                  }`}
                >
                  <LayoutGrid size={14} />
                  <span className="text-[12px] font-bold">{filtered.length}</span>
                  <span className="text-[11px] font-semibold opacity-70">
                    {translateText(filter === 'all' ? 'total services' : 'in this category')}
                  </span>
                </div>
              </div>

              <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
                <div className="flex w-max min-w-full gap-2 sm:flex-wrap">
                  <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
                    {translateText('All')} ({products.length})
                  </Chip>
                  {categories.map(c => {
                    const count = getProductsByCategory(c.id).length
                    return (
                      <Chip key={c.id} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
                        {c.icon} {c.name} ({count})
                      </Chip>
                    )
                  })}
                </div>
              </div>
            </motion.div>

            <hr className="hr-glow mb-9" />

            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease }}
              >
                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5 2xl:grid-cols-5">
                    {filtered.map((p, i) => (
                      <ProductCard key={p.slug} product={p} index={i} />
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-[22px] border border-dashed py-18 text-center ${
                      isDark
                        ? 'border-white/[0.10] bg-white/[0.025]'
                        : 'border-violet-200/70 bg-slate-50/60'
                    }`}
                  >
                    <div
                      className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] ${
                        isDark ? 'bg-white/[0.06] border border-white/[0.07]' : 'bg-violet-50 border border-violet-100'
                      }`}
                    >
                      <Search size={20} className={isDark ? 'text-slate-600' : 'text-violet-400'} />
                    </div>
                    <p className={`text-[1.08rem] font-semibold ${isDark ? 'text-white/55' : 'text-slate-700'}`}>
                      No services match this filter
                    </p>
                    <p className={`mt-2 text-[13px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      Try selecting a different category to see more results.
                    </p>
                    <button
                      onClick={() => setFilter('all')}
                      className={`mt-5 rounded-[12px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                        isDark
                          ? 'border-white/[0.10] bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:border-white/[0.16]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700 shadow-sm'
                      }`}
                    >
                      Show all services
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
