import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import ProductCard from '../components/product/ProductCard'
import Chip from '../components/ui/Chip'
import { usePageMeta } from '../hooks/usePageMeta'

export default function ProductsPage() {
  usePageMeta({ title: 'Products', description: 'Browse our interactive bike experiences — LED races, smoothie bikes, VR cycling, arcade scoring and more.' })
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

    // merge + dedupe
    return byCategory.concat(byTags).filter((p, i, arr) => arr.findIndex(x => x.slug === p.slug) === i)
  }, [filter, products, categories, getProductsByCategory])

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* count reflects all products */}
          <span className="section-label">// {products.length} Products</span>
          <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
            Interactive Bike <span className="text-glow">Experiences</span>
          </h1>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-10">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <ProductCard key={p.slug} product={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={`text-center py-20 font-display text-lg ${isDark ? 'text-purple-300/50' : 'text-gray-300'}`}>
            No products match this filter.
          </div>
        )}
      </div>
    </section>
  )
}