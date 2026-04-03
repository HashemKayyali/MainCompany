import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Sparkles } from 'lucide-react'
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
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.04, ease }}
      className={`group relative w-full text-left transition-all duration-300 ${
        active ? '-translate-y-1 scale-[1.02]' : 'hover:-translate-y-1 hover:scale-[1.01]'
      }`}
    >
      <div
        className={`relative aspect-[1.4/1] sm:aspect-[1.5/1] lg:aspect-[1.4/1] overflow-hidden rounded-[18px] border transition-colors duration-300 ${
          active
            ? isDark
              ? 'border-cyan-400/40 bg-[linear-gradient(180deg,rgba(11,15,28,0.8),rgba(6,9,18,0.6))] shadow-[0_0_30px_rgba(34,211,238,0.15)]'
              : 'border-violet-500/40 bg-white/90 shadow-[0_0_30px_rgba(124,58,237,0.15)]'
            : isDark
              ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,26,0.6),rgba(7,9,18,0.4))] hover:border-white/20'
              : 'border-slate-200 bg-white/80 hover:border-violet-300'
        }`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={category.name}
            loading="lazy"
            draggable={false}
            className={`absolute inset-0 h-full w-full select-none object-cover object-center transition-transform duration-700 ${
              active ? 'scale-105' : 'group-hover:scale-105'
            }`}
          />
        ) : (
          <div
            className="absolute inset-0 transition-transform duration-700 group-hover:scale-105"
            style={{
              background: isDark
                ? 'linear-gradient(150deg, rgba(91,33,182,0.60), rgba(15,23,42,0.88) 48%, rgba(8,47,73,0.74))'
                : 'linear-gradient(150deg, rgba(124,58,237,0.15), rgba(255,255,255,0.8) 48%, rgba(34,211,238,0.1))',
            }}
          />
        )}

        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 40%, transparent 100%)',
            opacity: active ? 0.9 : 0.7,
          }}
        />

        {active && (
          <div className="absolute inset-0 rounded-[18px] ring-2 ring-inset ring-cyan-400/50 dark:ring-cyan-400/30 ring-offset-0 pointer-events-none" />
        )}

        <div className="relative flex h-full flex-col justify-end p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${
                active ? 'text-cyan-300' : 'text-slate-300'
              }`}
            >
              {category.count} Services
            </span>
          </div>
          <h3
            className={`font-display text-[1.15rem] font-bold leading-tight ${
              active ? 'text-white' : 'text-slate-100'
            }`}
          >
            {category.name}
          </h3>
        </div>
      </div>
    </motion.button>
  )
}

function ViewAllTile({ isDark, delay }: { isDark: boolean; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay, ease }}
      className="w-full h-full"
    >
      <Link
        to="/products"
        className="group relative block h-full w-full overflow-hidden rounded-[18px] border transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(124,58,237,0.15), rgba(236,72,153,0.1))'
            : 'linear-gradient(135deg, rgba(34,211,238,0.05), rgba(124,58,237,0.08), rgba(236,72,153,0.05))',
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.2)',
        }}
      >
        <div className="relative aspect-[1.4/1] sm:aspect-[1.5/1] lg:aspect-[1.4/1] flex flex-col items-center justify-center p-4 text-center">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 ${
              isDark
                ? 'bg-white/10 text-white'
                : 'bg-violet-100 text-violet-700'
            }`}
          >
            <ArrowUpRight className="h-6 w-6" strokeWidth={2} />
          </div>
          <h3 className={`font-display text-[1.1rem] font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Explore All
          </h3>
          <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            View complete marketplace
          </p>
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
      className={`aspect-[1.4/1] sm:aspect-[1.5/1] lg:aspect-[1.4/1] rounded-[18px] border overflow-hidden relative ${
        isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'
      }`}
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-tr from-transparent via-white/5 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2">
        <div className={`h-3 w-16 rounded ${isDark ? 'bg-white/10' : 'bg-slate-300'}`} />
        <div className={`h-5 w-3/4 rounded ${isDark ? 'bg-white/20' : 'bg-slate-400'}`} />
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
    <div
      className={`mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between rounded-[20px] border px-5 py-4 ${
        isDark
          ? 'border-white/10 bg-white/5 backdrop-blur-md'
          : 'border-slate-200 bg-white/80 backdrop-blur-md'
      }`}
    >
      <div>
        <div className={`mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider ${isDark ? 'text-cyan-400' : 'text-violet-600'}`}>
          <Sparkles className="h-3.5 w-3.5" />
          <span>Category Focus</span>
        </div>
        <h3 className={`font-display text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {category.name}
        </h3>
      </div>
      <div
        className={`inline-flex items-center self-start sm:self-auto rounded-full border px-4 py-1.5 text-xs font-semibold ${
          isDark
            ? 'border-white/10 bg-white/10 text-white'
            : 'border-slate-200 bg-slate-100 text-slate-800'
        }`}
      >
        {count} Services Available
      </div>
    </div>
  )
}

export default function OfferSection() {
  const { products, categories, loading } = useData()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('')
  const selectedCategoryRef = useRef<HTMLDivElement | null>(null)

  const categoryItems = useMemo(
    () =>
      categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        image: category.image,
        count: products.filter((product) => product.categoryId === category.id).length,
      })).filter(c => c.count > 0).sort((a,b) => b.count - a.count),
    [categories, products]
  )

  const activeCat = categoryItems.find((category) => category.id === activeTab)
  const filtered = activeCat
    ? products.filter((product) => product.categoryId === activeCat.id)
    : []

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
    <section className="site-section bg-transparent">
      <div className="site-container">
        <div className="section-shell px-4 py-8 sm:px-6 lg:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, ease }}
            className="mb-8 flex flex-col gap-4 text-center sm:text-left"
          >
            <div>
              <span className="section-label">// Marketplace Core</span>
              <h2 className={`section-title mt-2 ${!isDark ? 'text-gray-900' : ''}`}>
                What We <span className="text-glow">Offer</span>
              </h2>
            </div>
            <p className={`max-w-2xl text-[14px] leading-relaxed mx-auto sm:mx-0 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Browse our hand-picked categories to find exactly what you need for your next event. Select a category below to reveal tailored services and packages.
            </p>
          </motion.div>

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
                        onClick={() => setActiveTab(category.id)}
                      />
                    ))}
                    <ViewAllTile isDark={isDark} delay={categoryItems.length * 0.04} />
                  </>
                )}
          </div>

          <AnimatePresence mode="wait">
            {activeCat && (
              <motion.div
                ref={selectedCategoryRef}
                key={activeCat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease }}
                className="pt-4 border-t border-white/10 dark:border-white/10"
              >
                <SelectedCategoryHeader category={activeCat} count={filtered.length} isDark={isDark} />

                {filtered.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:gap-6">
                    {filtered.map((product, index) => (
                      <ProductCard key={product.slug} product={product} index={index} />
                    ))}
                  </div>
                ) : (
                  <div
                    className={`rounded-2xl border px-6 py-12 text-center ${
                      isDark
                        ? 'border-white/10 bg-white/5 text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <p className="text-lg font-medium text-slate-900 dark:text-white">No services found</p>
                    <p className="mt-2 text-sm">Please check back later or browse other categories.</p>
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
