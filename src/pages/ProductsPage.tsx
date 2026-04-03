import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '../components/product/ProductCard'
import Chip from '../components/ui/Chip'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProductsPage() {
  usePageMeta({
    title: 'Products',
    description:
      'Browse premium marketplace services, event-ready activations, and curated experiences across the platform.',
  })

  const { products, categories, getProductsByCategory } = useData()
  const { isDark } = useTheme()
  const [searchParams] = useSearchParams()
  const preCategory = searchParams.get('category') || 'all'
  const [filter, setFilter] = useState(preCategory)

  const filtered = useMemo(() => {
    if (filter === 'all') return products

    const catId = categories.find((c) => c.slug === filter)?.id || ''
    const byCategory = catId ? getProductsByCategory(catId) : []
    const byTags = products.filter((p) =>
      p.categoryTags?.some((t) => t.toLowerCase() === filter.toLowerCase())
    )

    return byCategory
      .concat(byTags)
      .filter((p, i, arr) => arr.findIndex((x) => x.slug === p.slug) === i)
  }, [filter, products, categories, getProductsByCategory])

  return (
    <section className="site-section bg-transparent">
      <div className="site-container">
        <div className="section-shell px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          <div
            className="pointer-events-none absolute left-0 top-0 h-44 w-80 opacity-75 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, rgba(124,58,237,0.14) 0%, transparent 72%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-8 flex flex-col gap-6 lg:mb-10 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl px-1">
              <span className="section-label">// Marketplace Collection</span>
              <h1 className={`section-title !text-left mt-2 ${!isDark ? 'text-gray-900' : ''}`}>
                Explore the <span className="text-glow">marketplace catalog</span>
              </h1>
              <p className={`mt-4 max-w-xl text-[1rem] leading-relaxed ${isDark ? 'text-purple-200/66' : 'text-gray-500'}`}>
                Browse categories, compare listings, and move through the collection with a more curated premium marketplace experience.
              </p>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 min-w-[200px] ${
                isDark
                  ? 'border-white/10 bg-white/5 backdrop-blur-md'
                  : 'border-violet-200 bg-white/80 backdrop-blur-md'
              }`}
            >
              <div className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-purple-300/80' : 'text-violet-600'}`}>
                Format
              </div>
              <div className={`mt-1 text-3xl font-display font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filtered.length}
              </div>
              <div className={`text-sm mt-1 ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>
                premium listings
              </div>
            </div>
          </motion.div>

          <div className="mb-8 -mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
            <div className="flex w-max min-w-full gap-2 sm:flex-wrap">
              <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
                All ({products.length})
              </Chip>

              {categories.map((c) => {
                const count = getProductsByCategory(c.id).length
                return (
                  <Chip key={c.id} active={filter === c.slug} onClick={() => setFilter(c.slug)}>
                    {c.icon} {c.name} ({count})
                  </Chip>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {filtered.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              className={`mt-8 rounded-2xl border border-dashed py-16 text-center ${
                isDark
                  ? 'border-white/10 bg-white/5 text-purple-200/40'
                  : 'border-violet-200 bg-slate-50 text-gray-500'
              }`}
            >
              <p className="font-display text-lg font-medium">No products match this filter.</p>
              <p className="mt-2 text-sm">Try removing filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
