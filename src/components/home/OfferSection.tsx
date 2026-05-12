import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, LayoutGrid, Sparkles } from 'lucide-react'
import ProductCard from '../product/ProductCard'
import CategoryTileView from './CategoryTileView'
import { useCategoriesData, useDataMeta, useProductsData } from '../../contexts/DataContext'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import { usePerfMode } from '../../hooks/usePerfMode'
import { useTheme } from '../../contexts/ThemeContext'
import { scrollToPosition } from '../../utils/scroll'
import { cn } from '../../utils/cn'

const ease = [0.16, 1, 0.3, 1] as const

type CategoryItem = {
  id: string
  name: string
  description?: string
  image?: string
  count: number
}

const CategoryTile = memo(function CategoryTile({
  category,
  active,
  isDark,
  onClick,
  reducedVisualEffects,
}: {
  category: CategoryItem
  active: boolean
  isDark: boolean
  onClick: () => void
  reducedVisualEffects: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full cursor-pointer text-left focus:outline-none"
    >
      <CategoryTileView
        name={category.name}
        image={category.image}
        count={category.count}
        active={active}
        reducedVisualEffects={reducedVisualEffects}
        isDarkOverride={isDark}
      />
    </button>
  )
}, (prev, next) =>
  prev.active === next.active &&
  prev.isDark === next.isDark &&
  prev.category.id === next.category.id &&
  prev.category.count === next.category.count &&
  prev.category.name === next.category.name &&
  prev.category.image === next.category.image
)

function ViewAllTile({ isDark, reducedVisualEffects }: { isDark: boolean; reducedVisualEffects: boolean }) {
  return (
    <div>
      <Link
        to="/products"
        className={cn(
          'group relative block overflow-hidden rounded-[18px] border transition-all duration-400',
          isDark
            ? 'border-white/[0.08] hover:border-violet-400/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.14),0_16px_44px_rgba(124,58,237,0.18)]'
            : 'border-slate-200/80 hover:border-violet-300/60 hover:shadow-[0_12px_36px_rgba(124,58,237,0.14)]'
        )}
      >
        <div
          className="relative aspect-[4/3]"
          style={{
            background: isDark
              ? 'linear-gradient(148deg, rgba(124,58,237,0.14), rgba(10,12,28,0.82) 50%, rgba(34,211,238,0.08))'
              : 'linear-gradient(148deg, rgba(124,58,237,0.06), rgba(240,237,255,0.96) 50%, rgba(34,211,238,0.04))',
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.22]"
            style={{
              backgroundImage: isDark
                ? 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(124,58,237,0.14) 1px, transparent 1px)',
              backgroundSize: '18px 18px',
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div
              className={cn(
                'mb-3.5 flex h-12 w-12 items-center justify-center rounded-[14px] border',
                !reducedVisualEffects && 'transition-all duration-400 group-hover:scale-105 group-hover:-rotate-6',
                isDark
                  ? 'border-white/[0.12] bg-white/[0.07] text-white'
                  : 'border-violet-200 bg-violet-50 text-violet-700'
              )}
            >
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h3
              className={cn(
                'font-display text-[1rem] font-bold tracking-tight',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Explore All
            </h3>
            <p className={cn('mt-1 text-[10.5px] font-medium', isDark ? 'text-slate-400' : 'text-slate-500')}>
              Full marketplace catalog
            </p>
            <div
              className={cn(
                'mt-3.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-bold transition-all duration-300',
                isDark
                  ? 'border-violet-400/22 bg-violet-500/[0.11] text-violet-300 group-hover:border-violet-400/38 group-hover:bg-violet-500/[0.17]'
                  : 'border-violet-200 bg-violet-50 text-violet-600 group-hover:border-violet-300 group-hover:bg-violet-100'
              )}
            >
              Browse now
              <ArrowUpRight size={11} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>

        <div className={cn('px-3.5 py-3', isDark ? 'bg-[rgba(9,8,22,0.97)]' : 'bg-white')}>
          <div
            className={cn(
              'mb-0.5 text-[9px] font-bold uppercase tracking-[0.20em]',
              isDark ? 'text-violet-400/52' : 'text-violet-500/60'
            )}
          >
            All Categories
          </div>
          <h3
            className={cn(
              'font-display text-[0.96rem] font-bold leading-tight tracking-[-0.02em]',
              isDark ? 'text-white/92' : 'text-slate-900'
            )}
          >
            Marketplace
          </h3>
        </div>
      </Link>
    </div>
  )
}

function CategoryTileSkeleton({ index, isDark }: { index: number; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease }}
      className={cn(
        'overflow-hidden rounded-[18px] border',
        isDark ? 'border-white/[0.08] bg-white/[0.03]' : 'border-slate-200 bg-slate-100'
      )}
    >
      <div className="aspect-[4/3] animate-pulse bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      <div className={cn('px-3.5 py-3', isDark ? 'bg-[rgba(9,8,22,0.97)]' : 'bg-white')}>
        <div className={cn('mb-1.5 h-2 w-10 rounded-full', isDark ? 'bg-white/10' : 'bg-slate-300')} />
        <div className={cn('h-3.5 w-3/4 rounded-full', isDark ? 'bg-white/16' : 'bg-slate-400')} />
      </div>
    </motion.div>
  )
}

function SelectedCategoryHeader({
  category,
  count,
  isDark,
}: {
  category: CategoryItem
  count: number
  isDark: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease }}
      className={cn(
        'mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between overflow-hidden rounded-[16px] border px-5 py-4',
        isDark
          ? 'border-violet-500/16 bg-[linear-gradient(135deg,rgba(124,58,237,0.09),rgba(34,211,238,0.045))]'
          : 'border-violet-200/55 bg-gradient-to-r from-violet-50/80 to-cyan-50/40'
      )}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px]',
            isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'
          )}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div
            className={cn(
              'text-[9px] font-bold uppercase tracking-[0.18em]',
              isDark ? 'text-violet-300/60' : 'text-violet-500/70'
            )}
          >
            Category Focus
          </div>
          <h3
            className={cn(
              'font-display text-[1.18rem] font-bold tracking-tight leading-tight',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {category.name}
          </h3>
        </div>
      </div>
      <span
        className={cn(
          'self-start sm:self-auto inline-flex items-center rounded-full border px-4 py-1.5 text-[10.5px] font-semibold',
          isDark
            ? 'border-white/[0.10] bg-white/[0.05] text-white/75'
            : 'border-violet-200/70 bg-white text-slate-700 shadow-sm'
        )}
      >
        {count} Available
      </span>
    </motion.div>
  )
}

export default function OfferSection() {
  const { products } = useProductsData()
  const { categories } = useCategoriesData()
  const { loading } = useDataMeta()
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()
  const [activeTab, setActiveTab] = useState('')
  const selectedCategoryRef = useRef<HTMLDivElement | null>(null)
  const headerReveal = useReveal({ distance: 16, duration: 0.42, margin: '0px 0px 16% 0px' })
  const { containerProps: categoryGridRevealProps, itemProps: categoryGridItemProps } = useRevealGroup({
    distance: 14,
    duration: 0.34,
    margin: '0px 0px 14% 0px',
    stagger: 0.03,
  })

  const productsByCategory = useMemo(() => {
    const next = new Map<string, typeof products>()

    for (const product of products) {
      const existing = next.get(product.categoryId)
      if (existing) existing.push(product)
      else next.set(product.categoryId, [product])
    }

    return next
  }, [products])

  const categoryItems = useMemo(
    () =>
      categories
        .map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          count: productsByCategory.get(category.id)?.length ?? 0,
        }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count),
    [categories, productsByCategory]
  )

  const activeCat = useMemo(
    () => categoryItems.find(category => category.id === activeTab),
    [categoryItems, activeTab]
  )
  const filtered = useMemo(
    () => (activeCat ? productsByCategory.get(activeCat.id) ?? [] : []),
    [activeCat, productsByCategory]
  )

  const handleCategoryClick = useCallback((id: string) => {
    setActiveTab(prev => (prev === id ? '' : id))
  }, [])

  useEffect(() => {
    if (!activeCat || !selectedCategoryRef.current || typeof window === 'undefined') return

    let frameOne = 0
    let frameTwo = 0

    frameOne = window.requestAnimationFrame(() => {
      frameTwo = window.requestAnimationFrame(() => {
        const header = document.querySelector('header')
        const headerHeight = header instanceof HTMLElement ? header.offsetHeight : 0
        const viewportPadding = 20
        const rect = selectedCategoryRef.current?.getBoundingClientRect()
        if (!rect) return

        const top = window.scrollY + rect.top - headerHeight - viewportPadding
        const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
        const targetTop = Math.max(0, Math.min(top, maxTop))
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        scrollToPosition(targetTop, { immediate: prefersReducedMotion })
      })
    })

    return () => {
      window.cancelAnimationFrame(frameOne)
      window.cancelAnimationFrame(frameTwo)
    }
  }, [activeTab, activeCat])

  return (
    <section className="site-section">
      <div className="site-container">
        <div
          className={cn(
            'relative overflow-hidden rounded-[26px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13',
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.84),rgba(8,8,20,0.72))] shadow-[0_24px_68px_rgba(2,4,16,0.28),inset_0_1px_0_rgba(255,255,255,0.04)]'
              : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          )}
        >
          {isDark && !perfLow && (
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-60 w-60 rounded-full blur-[72px]"
              style={{ background: 'rgba(124,58,237,0.06)' }}
              aria-hidden="true"
            />
          )}

          <motion.div {...headerReveal} className="relative mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="section-label">// Marketplace Core</span>
                <div className={cn('h-px w-8', isDark ? 'bg-violet-500/28' : 'bg-violet-300/45')} />
              </div>
              <h2 className={cn('section-title', !isDark && 'text-gray-900')}>
                What We Offer
              </h2>
              <p className={cn('mt-4 max-w-xl text-[14.5px] leading-[1.72]', isDark ? 'text-slate-300/70' : 'text-slate-500')}>
                Browse our hand-picked service categories. Select any category below to reveal tailored services, packages, and event-ready solutions.
              </p>
            </div>

            <Link
              to="/products"
              className={cn(
                'hidden shrink-0 lg:inline-flex items-center gap-2.5 rounded-[13px] border px-5 py-2.5 text-[11.5px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-white/82 hover:border-violet-400/24 hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700 shadow-sm'
              )}
            >
              All Services
              <ArrowUpRight size={13} />
            </Link>
          </motion.div>

          <motion.div {...categoryGridRevealProps} className="relative mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <CategoryTileSkeleton key={`skel-${index}`} index={index} isDark={isDark} />
                ))
              : (
                <>
                  {categoryItems.map(category => (
                    <motion.div key={category.id} {...categoryGridItemProps}>
                      <CategoryTile
                        category={category}
                        active={activeCat?.id === category.id}
                        isDark={isDark}
                        onClick={() => handleCategoryClick(category.id)}
                        reducedVisualEffects={perfLow}
                      />
                    </motion.div>
                  ))}
                  <motion.div {...categoryGridItemProps}>
                    <ViewAllTile isDark={isDark} reducedVisualEffects={perfLow} />
                  </motion.div>
                </>
              )}
          </motion.div>

          <AnimatePresence mode="wait">
            {activeCat && (
              <motion.div
                ref={selectedCategoryRef}
                key={activeCat.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease }}
                className={cn('pt-8 border-t', isDark ? 'border-white/[0.07]' : 'border-violet-100/55')}
              >
                <SelectedCategoryHeader category={activeCat} count={filtered.length} isDark={isDark} />

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:gap-5">
                    {filtered.map((product, index) => (
                      <ProductCard key={product.slug} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div
                    className={cn(
                      'rounded-[18px] border border-dashed px-6 py-14 text-center',
                      isDark ? 'border-white/[0.10] bg-white/[0.02] text-slate-500' : 'border-slate-200 bg-slate-50 text-slate-400'
                    )}
                  >
                    <p className={cn('font-display text-[1.05rem] font-semibold', isDark ? 'text-white/52' : 'text-slate-700')}>
                      No services in this category yet
                    </p>
                    <p className={cn('mt-2 text-[13px]', isDark ? 'text-slate-600' : 'text-slate-400')}>
                      Check back soon or browse other categories.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
