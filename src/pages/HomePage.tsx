import { useState } from 'react'
import CustomersGrid from '../components/customer/CustomersGrid'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from '../components/home/Hero'
import StatsStrip from '../components/home/StatsStrip'

import ProductCard from '../components/product/ProductCard'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'
const ease = [0.16, 1, 0.3, 1]

export default function HomePage() {
  usePageMeta({ title: 'Home', description: 'Interactive bike-powered activations for events — LED races, smoothie bikes, VR cycling and more across Jordan.' })
  const { products, customers, categories, getProductsByCategory, loading } = useData()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('all')

  const filtered = activeTab === 'all'
    ? products
    : getProductsByCategory(activeTab)

  const activeCat = categories.find(c => c.id === activeTab)

  return (<>
    <Hero /><StatsStrip />

    {/* ── Products with Category Tabs ── */}
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, ease }} className="text-center mb-12">
          <span className="section-label">// Our Products</span>
          <h2 className={`section-title ${!isDark ? 'text-gray-900' : ''}`}>What We <span className="text-glow">Offer</span></h2>
        </motion.div>

        {/* ── Tabs ── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className={`text-center ${isDark ? 'text-purple-300/60' : 'text-gray-400'}`}>
              <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-3" />
              <p className="text-sm font-medium">Loading products...</p>
            </div>
          </div>
        ) : (<>
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {/* All Products tab */}
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 ${
              activeTab === 'all'
                ? isDark
                  ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                  : 'bg-gradient-to-r from-violet-50 to-cyan-50 text-violet-700 border border-violet-300 shadow-sm'
                : isDark
                  ? 'text-purple-300/70 hover:text-purple-100 border border-transparent hover:border-purple-500/20 hover:bg-purple-500/[0.06]'
                  : 'text-gray-400 hover:text-gray-600 border border-transparent hover:border-violet-200 hover:bg-violet-50/50'
            }`}
          >
            All Products
            <span className={`ml-2 text-[11px] font-mono ${activeTab === 'all' ? isDark ? 'text-cyan-400' : 'text-violet-500' : ''}`}>{products.length}</span>
          </button>

          {/* Category tabs */}
          {categories.map(cat => {
            const count = getProductsByCategory(cat.id).length
            const isActive = activeTab === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`relative px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all duration-300 flex items-center gap-2 ${
                  isActive
                    ? isDark
                      ? 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border border-purple-500/40 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
                      : 'bg-gradient-to-r from-violet-50 to-cyan-50 text-violet-700 border border-violet-300 shadow-sm'
                    : isDark
                      ? 'text-purple-300/70 hover:text-purple-100 border border-transparent hover:border-purple-500/20 hover:bg-purple-500/[0.06]'
                      : 'text-gray-400 hover:text-gray-600 border border-transparent hover:border-violet-200 hover:bg-violet-50/50'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                {cat.name}
                <span className={`text-[11px] font-mono ${isActive ? isDark ? 'text-cyan-400' : 'text-violet-500' : ''}`}>{count}</span>
              </button>
            )
          })}
        </div>

        {/* ── Active category description ── */}
        <AnimatePresence mode="wait">
          {activeCat && activeCat.description && (
            <motion.div
              key={activeCat.id + '-desc'}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-10"
            >
              <p className={`text-sm max-w-xl mx-auto ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>{activeCat.description}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Products Grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease }}
          >
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((p, i) => <ProductCard key={p.slug} product={p} index={i} />)}
              </div>
            ) : (
              <div className={`text-center py-20 rounded-2xl border border-dashed ${isDark ? 'border-purple-500/15 text-purple-300/40' : 'border-violet-200 text-gray-300'}`}>
                <span className="text-4xl mb-3 block">📭</span>
                <p className="text-sm font-medium">No products in this category yet</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* View all link */}
        {filtered.length > 0 && (
          <div className="text-center mt-10">
            <Link to={activeTab === 'all' ? '/products' : `/products?category=${activeCat?.slug || ''}`} className={`text-sm font-semibold ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-violet-600 hover:text-violet-500'} transition-colors`}>
              Browse All {activeTab === 'all' ? 'Products' : activeCat?.name} →
            </Link>
          </div>
        )}
        </>)}
      </div>
    </section>

{/* ── Customers Section ── */}
<section className="py-24 relative">
  <div className="relative max-w-7xl mx-auto px-6">
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease }}
      className="text-center mb-12"
    >
      <span className="section-label">// Trusted By</span>
      <h2 className={`section-title ${!isDark ? 'text-gray-900' : ''}`}>
        Our <span className="text-glow">Customers</span>
      </h2>
    </motion.div>

    <CustomersGrid customers={customers.slice(0, 12)} />

    <div className="text-center mt-8">
      <Link
        to="/customers"
        className={`text-sm font-medium ${
          isDark ? 'text-prism-violet hover:text-prism-violet' : 'text-violet-600'
        }`}
      >
        View All {customers.length} Customers
      </Link>
    </div>
  </div>
</section>


    {/* ── CTA ── */}
    <section className="py-28 relative overflow-hidden"><div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,_rgba(124,58,237,0.06),_transparent_70%)]" /><div className="relative max-w-3xl mx-auto px-6 text-center"><motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease }}><h2 className={`font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[0.95] ${!isDark ? 'text-gray-900' : ''}`}>Let us make your<br /><span className="text-glow">next event unforgettable</span></h2><p className={`mt-5 text-lg max-w-xl mx-auto ${isDark ? 'text-purple-200/70' : 'text-gray-500'}`}>Tell us about your event. We handle everything.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/contact" className="btn-primary">Book Your Event</Link><a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline">WhatsApp</a></div></motion.div></div></section>
  </>)
}
