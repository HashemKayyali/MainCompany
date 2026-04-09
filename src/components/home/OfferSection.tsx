import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, LayoutGrid, Sparkles } from 'lucide-react'
import ProductCard from '../product/ProductCard'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { parseMediaValue } from '../../utils/media-frame'
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

// ── Premium neon/glass category card ─────────────────────────────────────────
function CategoryTile({
  category,
  active,
  index,
  isDark,
  onClick,
}: {
  category: CategoryItem
  active: boolean
  index: number
  isDark: boolean
  onClick: () => void
}) {
  const imageSrc = category.image ? parseMediaValue(category.image).src : ''

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.52, delay: index * 0.055, ease }}
      className="group relative w-full cursor-pointer text-left focus:outline-none"
      style={{ willChange: 'transform' }}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-[18px] transition-all duration-400',
          isDark
            ? cn(
                'bg-[linear-gradient(168deg,rgba(15,12,32,0.97),rgba(9,8,22,0.98))]',
                active
                  ? 'border border-violet-400/55 shadow-[0_0_0_1px_rgba(124,58,237,0.28),0_0_36px_rgba(124,58,237,0.22),0_24px_56px_rgba(0,0,0,0.48)]'
                  : 'border border-white/[0.08] hover:border-violet-400/28 hover:shadow-[0_0_20px_rgba(124,58,237,0.13),0_14px_40px_rgba(0,0,0,0.38)]'
              )
            : cn(
                'bg-white',
                active
                  ? 'border border-violet-500/55 shadow-[0_0_0_1px_rgba(124,58,237,0.18),0_16px_40px_rgba(124,58,237,0.18)]'
                  : 'border border-slate-200/80 hover:border-violet-300/50 hover:shadow-[0_8px_32px_rgba(124,58,237,0.12)]'
              )
        )}
      >
        {/* Hover glow */}
        {isDark && (
          <div
            className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(124,58,237,0.13) 0%, transparent 65%)',
            }}
          />
        )}

        {/* ── Image area ── */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={category.name}
              loading="lazy"
              draggable={false}
              className={cn(
                'absolute inset-0 h-full w-full select-none object-cover object-center transition-transform duration-700 ease-out',
                active ? 'scale-[1.08]' : 'scale-100 group-hover:scale-[1.06]'
              )}
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
              style={{
                background: isDark
                  ? 'linear-gradient(148deg, rgba(91,33,182,0.78), rgba(12,12,28,0.94) 55%, rgba(8,47,73,0.82))'
                  : 'linear-gradient(148deg, rgba(124,58,237,0.16), rgba(255,255,255,0.94) 55%, rgba(34,211,238,0.10))',
              }}
            />
          )}

          {/* Gradient overlay — bottom fade into info section */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background: isDark
                ? 'linear-gradient(to bottom, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.18) 55%, rgba(10,8,22,0.97) 100%)'
                : 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.06) 55%, rgba(255,255,255,0.96) 100%)',
            }}
          />

          {/* Active indicator */}
          {active && (
            <div className="absolute right-2.5 top-2.5 z-20">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 shadow-[0_0_14px_rgba(124,58,237,0.85)]">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
          )}
        </div>

        {/* ── Info area ── */}
        <div
          className={cn(
            'px-3.5 py-3 transition-colors duration-300',
            isDark ? 'bg-[rgba(9,8,22,0.97)]' : 'bg-white'
          )}
        >
          {/* Service count label */}
          <div
            className={cn(
              'mb-0.5 text-[9px] font-bold uppercase tracking-[0.20em] transition-colors duration-300',
              active
                ? isDark ? 'text-violet-400' : 'text-violet-600'
                : isDark
                  ? 'text-violet-400/52 group-hover:text-violet-400/80'
                  : 'text-violet-500/60 group-hover:text-violet-500/85'
            )}
          >
            {category.count} Service{category.count !== 1 ? 's' : ''}
          </div>

          {/* Category name */}
          <h3
            className={cn(
              'font-display text-[0.96rem] font-bold leading-tight tracking-[-0.02em] line-clamp-1',
              isDark ? 'text-white/92' : 'text-slate-900'
            )}
          >
            {category.name}
          </h3>
        </div>

        {/* Active bottom accent line */}
        {active && (
          <div
            className="absolute inset-x-0 bottom-0 h-[2px]"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(124,58,237,0.72), rgba(6,182,212,0.52), transparent)',
            }}
          />
        )}
      </div>
    </motion.button>
  )
}

// ── "View All" tile ───────────────────────────────────────────────────────────
function ViewAllTile({ isDark, delay }: { isDark: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.52, delay, ease }}
    >
      <Link
        to="/products"
        className={cn(
          'group relative block overflow-hidden rounded-[18px] border transition-all duration-400',
          isDark
            ? 'border-white/[0.08] hover:border-violet-400/30 hover:shadow-[0_0_20px_rgba(124,58,237,0.14),0_16px_44px_rgba(124,58,237,0.18)]'
            : 'border-slate-200/80 hover:border-violet-300/60 hover:shadow-[0_12px_36px_rgba(124,58,237,0.14)]'
        )}
        style={{ willChange: 'transform' }}
      >
        <div
          className="relative aspect-[4/3]"
          style={{
            background: isDark
              ? 'linear-gradient(148deg, rgba(124,58,237,0.14), rgba(10,12,28,0.82) 50%, rgba(34,211,238,0.08))'
              : 'linear-gradient(148deg, rgba(124,58,237,0.06), rgba(240,237,255,0.96) 50%, rgba(34,211,238,0.04))',
          }}
        >
          {/* Dot pattern */}
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
                'mb-3.5 flex h-12 w-12 items-center justify-center rounded-[14px] border transition-all duration-400 group-hover:scale-105 group-hover:-rotate-6',
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

        {/* Info area — matches CategoryTile height */}
        <div
          className={cn(
            'px-3.5 py-3',
            isDark ? 'bg-[rgba(9,8,22,0.97)]' : 'bg-white'
          )}
        >
          <div className={cn(
            'mb-0.5 text-[9px] font-bold uppercase tracking-[0.20em]',
            isDark ? 'text-violet-400/52' : 'text-violet-500/60'
          )}>
            All Categories
          </div>
          <h3 className={cn(
            'font-display text-[0.96rem] font-bold leading-tight tracking-[-0.02em]',
            isDark ? 'text-white/92' : 'text-slate-900'
          )}>
            Marketplace
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
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
      {/* Image skeleton */}
      <div className="aspect-[4/3] animate-pulse bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      {/* Info skeleton */}
      <div className={cn('px-3.5 py-3', isDark ? 'bg-[rgba(9,8,22,0.97)]' : 'bg-white')}>
        <div className={cn('mb-1.5 h-2 w-10 rounded-full', isDark ? 'bg-white/10' : 'bg-slate-300')} />
        <div className={cn('h-3.5 w-3/4 rounded-full', isDark ? 'bg-white/16' : 'bg-slate-400')} />
      </div>
    </motion.div>
  )
}

// ── Selected category header ──────────────────────────────────────────────────
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

// ── Main section ──────────────────────────────────────────────────────────────
export default function OfferSection() {
  const { products, categories, loading } = useData()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('')
  const selectedCategoryRef = useRef<HTMLDivElement | null>(null)

  const categoryItems = useMemo(
    () =>
      categories
        .map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          count: products.filter(product => product.categoryId === category.id).length,
        }))
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count),
    [categories, products]
  )

  const activeCat = categoryItems.find(category => category.id === activeTab)
  const filtered = activeCat ? products.filter(product => product.categoryId === activeCat.id) : []

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

        {/* ── Section shell ── */}
        <div
          className={cn(
            'relative overflow-hidden rounded-[26px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13',
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.76),rgba(8,8,20,0.58))] shadow-[0_28px_84px_rgba(2,4,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
              : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          )}
        >
          {/* Corner glow */}
          {isDark && (
            <div
              className="pointer-events-none absolute -right-28 -top-28 h-72 w-72 rounded-full blur-[90px]"
              style={{ background: 'rgba(124,58,237,0.07)' }}
              aria-hidden="true"
            />
          )}

          {/* ── Section header ── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.68, ease }}
            className="relative mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="section-label">// Marketplace Core</span>
                <div className={cn('h-px w-8', isDark ? 'bg-violet-500/28' : 'bg-violet-300/45')} />
              </div>
              <h2 className={cn('section-title', !isDark && 'text-gray-900')}>
                What We <span className="text-glow">Offer</span>
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

          {/* ── Category grid ── */}
          <div className="relative mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <CategoryTileSkeleton key={`skel-${i}`} index={i} isDark={isDark} />
                ))
              : (
                <>
                  {categoryItems.map((category, index) => (
                    <CategoryTile
                      key={category.id}
                      category={category}
                      active={activeCat?.id === category.id}
                      index={index}
                      isDark={isDark}
                      onClick={() => setActiveTab(prev => prev === category.id ? '' : category.id)}
                    />
                  ))}
                  <ViewAllTile isDark={isDark} delay={categoryItems.length * 0.055} />
                </>
              )}
          </div>

          {/* ── Expanded category products ── */}
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
