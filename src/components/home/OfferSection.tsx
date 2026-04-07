import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, LayoutGrid, Sparkles } from 'lucide-react'
import ProductCard from '../product/ProductCard'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { parseMediaValue } from '../../utils/media-frame'
import { scrollToPosition } from '../../utils/scroll'

const ease = [0.16, 1, 0.3, 1] as const

type CategoryItem = {
  id: string
  name: string
  description?: string
  image?: string
  count: number
}

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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.48, delay: index * 0.045, ease }}
      className={`group relative w-full cursor-pointer text-left transition-all duration-350 ${
        active ? '-translate-y-1.5' : 'hover:-translate-y-1'
      }`}
      style={{ willChange: 'transform' }}
    >
      <div
        className={`relative overflow-hidden rounded-[20px] border transition-all duration-350 ${
          active
            ? isDark
              ? 'border-violet-400/50 shadow-[0_0_0_1px_rgba(124,58,237,0.24),0_20px_50px_rgba(124,58,237,0.2)]'
              : 'border-violet-500/50 shadow-[0_0_0_1px_rgba(124,58,237,0.2),0_16px_40px_rgba(124,58,237,0.18)]'
            : isDark
              ? 'border-white/[0.09] hover:border-white/[0.18] hover:shadow-[0_12px_36px_rgba(0,0,0,0.3)]'
              : 'border-slate-200 hover:border-violet-300/60 hover:shadow-[0_10px_30px_rgba(124,58,237,0.1)]'
        }`}
      >
        {/* Aspect ratio container */}
        <div className="relative aspect-[3/2] overflow-hidden">
          {/* Background image or gradient */}
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={category.name}
              loading="lazy"
              draggable={false}
              className={`absolute inset-0 h-full w-full select-none object-cover object-center transition-transform duration-700 ease-out ${
                active ? 'scale-[1.06]' : 'group-hover:scale-[1.06]'
              }`}
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.06]"
              style={{
                background: isDark
                  ? 'linear-gradient(145deg, rgba(91,33,182,0.7), rgba(15,23,42,0.9) 52%, rgba(8,47,73,0.8))'
                  : 'linear-gradient(145deg, rgba(124,58,237,0.18), rgba(255,255,255,0.9) 52%, rgba(34,211,238,0.12))',
              }}
            />
          )}

          {/* Gradient overlay */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-350"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.42) 44%, rgba(0,0,0,0.08) 100%)',
              opacity: active ? 1 : 0.82,
            }}
          />

          {/* Active glow ring */}
          {active && (
            <div
              className={`pointer-events-none absolute inset-0 rounded-[20px] ${
                isDark ? 'ring-2 ring-inset ring-violet-400/40' : 'ring-2 ring-inset ring-violet-500/35'
              }`}
            />
          )}

          {/* Content overlay */}
          <div className="relative flex h-full flex-col justify-end p-3.5 sm:p-4">
            <div className="mb-1">
              <span
                className={`text-[9.5px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  active ? 'text-violet-300' : 'text-slate-400/90'
                }`}
              >
                {category.count} service{category.count !== 1 ? 's' : ''}
              </span>
            </div>
            <h3 className="font-display text-[1.05rem] font-bold leading-tight text-white sm:text-[1.12rem]">
              {category.name}
            </h3>
          </div>

          {/* Active indicator dot */}
          {active && (
            <div className="absolute right-3 top-3 z-10">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 shadow-[0_0_12px_rgba(124,58,237,0.7)]">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.button>
  )
}

function ViewAllTile({ isDark, delay }: { isDark: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.48, delay, ease }}
    >
      <Link
        to="/products"
        className={`group relative block overflow-hidden rounded-[20px] border transition-all duration-350 hover:-translate-y-1 ${
          isDark
            ? 'border-white/[0.09] hover:border-violet-400/30 hover:shadow-[0_12px_40px_rgba(124,58,237,0.18)]'
            : 'border-slate-200 hover:border-violet-300/60 hover:shadow-[0_10px_30px_rgba(124,58,237,0.12)]'
        }`}
        style={{ willChange: 'transform' }}
      >
        <div
          className="relative aspect-[3/2]"
          style={{
            background: isDark
              ? 'linear-gradient(145deg, rgba(124,58,237,0.14), rgba(34,211,238,0.08) 50%, rgba(236,72,153,0.1))'
              : 'linear-gradient(145deg, rgba(124,58,237,0.07), rgba(34,211,238,0.04) 50%, rgba(236,72,153,0.05))',
          }}
        >
          {/* Pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.3]"
            style={{
              backgroundImage: isDark
                ? 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'
                : 'radial-gradient(circle, rgba(124,58,237,0.12) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
            <div
              className={`mb-3 flex h-12 w-12 items-center justify-center rounded-[16px] border transition-all duration-350 group-hover:scale-110 group-hover:-rotate-6 ${
                isDark
                  ? 'border-white/[0.12] bg-white/[0.07] text-white'
                  : 'border-violet-200/80 bg-violet-50 text-violet-700'
              }`}
            >
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h3 className={`font-display text-[1.05rem] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Explore All
            </h3>
            <p className={`mt-1 text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Full marketplace catalog
            </p>
            <div
              className={`mt-3 inline-flex items-center gap-1 text-[10.5px] font-semibold transition-colors ${
                isDark ? 'text-violet-400 group-hover:text-violet-300' : 'text-violet-600 group-hover:text-violet-700'
              }`}
            >
              Browse now
              <ArrowUpRight size={12} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function CategoryTileSkeleton({ index, isDark }: { index: number; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease }}
      className={`aspect-[3/2] rounded-[20px] border overflow-hidden relative ${
        isDark ? 'border-white/[0.09] bg-white/[0.04]' : 'border-slate-200 bg-slate-100'
      }`}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-3.5 left-3.5 right-3.5 flex flex-col gap-1.5">
        <div className={`h-2.5 w-14 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
        <div className={`h-4 w-3/4 rounded-full ${isDark ? 'bg-white/18' : 'bg-slate-400'}`} />
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-[18px] border px-5 py-4 ${
        isDark
          ? 'border-violet-500/15 bg-[linear-gradient(135deg,rgba(124,58,237,0.09),rgba(34,211,238,0.04))]'
          : 'border-violet-200/60 bg-gradient-to-r from-violet-50/80 to-cyan-50/40'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${
            isDark ? 'bg-violet-500/20 text-violet-300' : 'bg-violet-100 text-violet-600'
          }`}
        >
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <div className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-violet-300/70' : 'text-violet-500/80'}`}>
            Category Focus
          </div>
          <h3 className={`font-display text-[1.2rem] font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {category.name}
          </h3>
        </div>
      </div>
      <span
        className={`self-start sm:self-auto inline-flex items-center rounded-full border px-4 py-1.5 text-[11px] font-semibold ${
          isDark
            ? 'border-white/[0.10] bg-white/[0.06] text-white/80'
            : 'border-violet-200/70 bg-white text-slate-700'
        }`}
      >
        {count} Available
      </span>
    </motion.div>
  )
}

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

        {/* Section shell */}
        <div
          className={`overflow-hidden rounded-[28px] border px-5 py-8 sm:px-7 sm:py-10 lg:px-9 lg:py-12 ${
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.72),rgba(8,8,20,0.55))] shadow-[0_24px_80px_rgba(2,4,16,0.4),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
              : 'border-violet-100/80 bg-white/92 shadow-[0_20px_60px_rgba(15,23,42,0.06)]'
          }`}
        >
          {/* ── Section Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease }}
            className="mb-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <span className="section-label">// Marketplace Core</span>
              <h2 className={`section-title mt-2.5 ${!isDark ? 'text-gray-900' : ''}`}>
                What We <span className="text-glow">Offer</span>
              </h2>
              <p className={`mt-4 max-w-xl text-[14px] leading-relaxed ${isDark ? 'text-slate-300/75' : 'text-slate-600'}`}>
                Browse our hand-picked service categories. Select any category below to reveal tailored services, packages, and event-ready solutions.
              </p>
            </div>

            <Link
              to="/products"
              className={`hidden shrink-0 lg:inline-flex items-center gap-2 rounded-[14px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-white hover:border-white/[0.18] hover:bg-white/[0.08]'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'
              }`}
            >
              All Services
              <ArrowUpRight size={13} />
            </Link>
          </motion.div>

          {/* ── Category Grid ── */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
                    <ViewAllTile isDark={isDark} delay={categoryItems.length * 0.045} />
                  </>
                )}
          </div>

          {/* ── Expanded Category Products ── */}
          <AnimatePresence mode="wait">
            {activeCat && (
              <motion.div
                ref={selectedCategoryRef}
                key={activeCat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.38, ease }}
                className={`pt-7 border-t ${isDark ? 'border-white/[0.07]' : 'border-violet-100/60'}`}
              >
                <SelectedCategoryHeader category={activeCat} count={filtered.length} isDark={isDark} />

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-5">
                    {filtered.map((product, index) => (
                      <ProductCard key={product.slug} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div
                    className={`rounded-[20px] border border-dashed px-6 py-12 text-center ${
                      isDark
                        ? 'border-white/[0.10] bg-white/[0.03] text-slate-500'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                    }`}
                  >
                    <p className={`font-display text-[1.05rem] font-semibold ${isDark ? 'text-white/60' : 'text-slate-700'}`}>
                      No services in this category yet
                    </p>
                    <p className={`mt-2 text-[13px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
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
