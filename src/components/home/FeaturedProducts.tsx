import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import ProductCard from '../product/ProductCard'
import { cn } from '../../utils/cn'

const ease = [0.16, 1, 0.3, 1] as const

export default function FeaturedProducts() {
  const { featuredProducts } = useData()
  const { isDark } = useTheme()
  const reduceMotion = useReducedMotion()

  const items = useMemo(() => featuredProducts ?? [], [featuredProducts])

  if (items.length === 0) return null

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: reduceMotion
        ? { duration: 0 }
        : { staggerChildren: 0.07, delayChildren: 0.06 },
    },
  } as const

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: reduceMotion
      ? { opacity: 1, y: 0, transition: { duration: 0 } }
      : { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  } as const

  return (
    <section className="site-section">
      <div className="site-container">

        {/* ── Section header ── */}
        <div className="mb-9 flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="mb-3 flex items-center gap-2.5">
              <span className="section-label">// Featured</span>
              <div className={cn('h-px w-8', isDark ? 'bg-violet-500/28' : 'bg-violet-300/45')} />
            </div>
            <h2 className={cn('section-title !mt-0 !text-left', !isDark && 'text-gray-900')}>
              What We <span className="text-glow">Build</span>
            </h2>
            <p className={cn('mt-3 max-w-lg text-[14px] leading-relaxed', isDark ? 'text-slate-300/70' : 'text-slate-500')}>
              Hand-selected showcase of our finest productions — each one a real event delivered for real clients.
            </p>
          </motion.div>

          <Link
            to="/products"
            className="btn-outline group inline-flex items-center gap-2 self-start lg:self-auto"
          >
            <span>All Products</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </div>

        {/* ── Products grid ── */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5"
        >
          {items.map((p, i) => (
            <motion.div key={p.slug} variants={item} className="h-full">
              <ProductCard product={p} index={i} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
