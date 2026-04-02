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
    <section className="site-section">
      <div className="site-container">
        <div className="section-shell px-3 py-4 sm:px-3.5 sm:py-4.5 lg:px-4">
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
            className="relative mb-4 flex flex-col gap-2.5 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <span className="section-label">// Marketplace Collection</span>
              <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
                Explore the <span className="text-glow">marketplace catalog</span>
              </h1>
              <p className={`mt-1.75 max-w-xl text-[0.78rem] leading-[1.45] ${isDark ? 'text-purple-200/66' : 'text-gray-500'}`}>
                Browse categories, compare listings, and move through the collection with a more curated premium marketplace experience.
              </p>
            </div>

            <div
              className={`rounded-[14px] border px-2.75 py-2 ${
                isDark
                  ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))]'
                  : 'border-violet-200/70 bg-white/80'
              }`}
            >
              <div className={`text-[9px] font-mono uppercase tracking-[0.2em] ${isDark ? 'text-purple-200/48' : 'text-violet-600/72'}`}>
                Available now
              </div>
              <div className={`mt-0.75 text-[1.22rem] font-display font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {filtered.length}
              </div>
              <div className={`text-[9.75px] ${isDark ? 'text-purple-100/60' : 'text-gray-500'}`}>
                curated listings and services
              </div>
            </div>
          </motion.div>

          <div className="mb-3.5 flex flex-wrap gap-1">
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

          <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2 md:gap-2.75 lg:grid-cols-3 xl:gap-3">
            {filtered.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div
              className={`rounded-[16px] border border-dashed py-7 text-center font-display text-[0.9rem] ${
                isDark
                  ? 'border-violet-300/14 text-purple-200/40'
                  : 'border-violet-200 text-gray-300'
              }`}
            >
              No products match this filter.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
