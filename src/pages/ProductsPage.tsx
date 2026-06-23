import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutGrid, SlidersHorizontal, Search } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import Chip from '../components/ui/Chip'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1]

export default function ProductsPage() {
  usePageMeta({
    title: 'Event Services & Equipment in Jordan | Eventies',
    description:
      'Browse event rentals, interactive games, VR experiences, screens, booths, entertainment, and production services from trusted providers in Jordan.',
    canonical: 'https://www.eventiesjo.com/products',
  })

  const { products, categories, getProductsByCategory } = useData()
  const { isDark } = useTheme()
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
    <section className="site-section bg-transparent">
      <div className="site-container">

        {/* ── Page shell ── */}
        <div
          className={`relative overflow-hidden rounded-[28px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13 ${
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.74),rgba(8,8,20,0.56))] shadow-[0_28px_84px_rgba(2,4,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
              : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          }`}
        >
          {/* Ambient top-right glow */}
          {isDark && (
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/[0.07] blur-[100px]"
              aria-hidden="true"
            />
          )}

          {/* ── Page Header ── */}
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease }}
            className="relative mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="section-label">// Marketplace Collection</span>
                <div className={`h-px w-8 ${isDark ? 'bg-violet-500/30' : 'bg-violet-300/50'}`} />
              </div>
              <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
                Explore the <span className="text-glow">marketplace</span>
              </h1>
              <p className={`mt-4 max-w-xl text-[0.98rem] leading-[1.72] ${isDark ? 'text-slate-300/70' : 'text-slate-500'}`}>
                Browse premium event services across all categories. Filter by type to find exactly what your event needs.
              </p>
            </div>

            {/* Stat card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.52, delay: 0.1, ease }}
              className={`shrink-0 rounded-[20px] border px-6 py-5 ${
                isDark
                  ? 'border-white/[0.09] bg-white/[0.04]'
                  : 'border-violet-200/60 bg-white shadow-[0_6px_24px_rgba(124,58,237,0.07)]'
              }`}
            >
              <div className={`flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                <LayoutGrid size={10} />
                Listings
              </div>
              <div className={`mt-1.5 font-display text-[2.6rem] font-black leading-none tracking-[-0.05em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {filtered.length}
              </div>
              <div className={`mt-1.5 text-[11.5px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {filter === 'all' ? 'total services' : 'in this category'}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Category Filter ── */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.08, ease }}
            className="mb-9"
          >
            <div className="mb-3.5 flex items-center gap-2">
              <SlidersHorizontal size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
              <span className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                Filter by category
              </span>
            </div>
            <div className="-mx-5 overflow-x-auto px-5 pb-2 sm:-mx-7 sm:px-7 lg:-mx-10 lg:px-10">
              <div className="flex w-max min-w-full gap-2 sm:flex-wrap">
                <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
                  All ({products.length})
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

          {/* ── Divider ── */}
          <hr className="hr-glow mb-9" />

          {/* ── Product Grid ── */}
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
                  <p className={`font-display text-[1.08rem] font-semibold ${isDark ? 'text-white/55' : 'text-slate-700'}`}>
                    No products match this filter
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
                    Show all products
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </div>
    </section>
  )
}
