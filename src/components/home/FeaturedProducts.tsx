import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useProductsData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import ProductCard from '../product/ProductCard'
import { cn } from '../../utils/cn'

export default function FeaturedProducts() {
  const { featuredProducts } = useProductsData()
  const { isDark } = useTheme()
  const headerReveal = useReveal({ distance: 16, duration: 0.42, margin: '0px 0px 16% 0px' })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 14,
    duration: 0.34,
    margin: '0px 0px 16% 0px',
    stagger: 0.035,
  })
  const items = featuredProducts ?? []

  if (items.length === 0) return null

  return (
    <section className="site-section">
      <div className="site-container">
        <div
          className={cn(
            'relative overflow-hidden rounded-[26px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13',
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.82),rgba(8,8,20,0.72))] shadow-[0_24px_68px_rgba(2,4,16,0.26),inset_0_1px_0_rgba(255,255,255,0.04)]'
              : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          )}
        >
          {isDark && (
            <div
              className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full blur-[80px]"
              style={{ background: 'rgba(97,40,178,0.07)' }}
              aria-hidden="true"
            />
          )}

          <div className="relative mb-9 flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
            <motion.div {...headerReveal}>
              <div className="mb-3 flex items-center gap-2.5">
                <span className="section-label">// Featured</span>
                <div className={cn('h-px w-8', isDark ? 'bg-violet-500/25' : 'bg-violet-300/45')} />
              </div>
              <h2 className={cn('section-title !mt-0 !text-left', !isDark && 'text-gray-900')}>
                What We Build
              </h2>
              <p className={cn('mt-3 max-w-lg text-[14px] leading-relaxed', isDark ? 'text-slate-300/65' : 'text-slate-500')}>
                Hand-selected showcase of our finest productions - each one a real event delivered for real clients.
              </p>
            </motion.div>

            <Link
              to="/products"
              className={cn(
                'hidden shrink-0 lg:inline-flex items-center gap-2.5 rounded-[13px] border px-5 py-2.5 text-[11.5px] font-semibold transition-all duration-300 hover:-translate-y-0.5',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-white/82 hover:border-violet-400/24 hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700 shadow-sm'
              )}
            >
              All Products
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          <motion.div {...containerProps} className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5">
            {items.map((product, index) => (
              <motion.div key={product.slug} {...itemProps} className="h-full">
                <ProductCard
                  product={product}
                  index={index}
                  revealOnScroll={false}
                  imageLoading={index < 3 ? 'eager' : 'lazy'}
                  imageFetchPriority={index < 3 ? 'high' : 'auto'}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-7 flex justify-center lg:hidden">
            <Link
              to="/products"
              className={cn(
                'inline-flex items-center gap-2 rounded-[13px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-300',
                isDark
                  ? 'border-white/[0.10] bg-white/[0.05] text-white/82 hover:border-violet-400/24 hover:bg-white/[0.08] hover:text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-700 shadow-sm'
              )}
            >
              All Products
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
