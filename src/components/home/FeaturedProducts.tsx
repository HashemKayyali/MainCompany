import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useProductsData } from '../../contexts/DataContext'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import ProductCard from '../product/ProductCard'

export default function FeaturedProducts() {
  const { featuredProducts } = useProductsData()
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
          className="relative overflow-hidden rounded-[28px] border border-violet-200/65 bg-white/95 px-5 py-10 sm:px-7 sm:py-12 lg:px-10 lg:py-14"
          style={{
            boxShadow:
              '0 28px 72px -24px rgba(124,58,237,0.20), 0 8px 22px -8px rgba(124,58,237,0.10), inset 0 1px 0 rgba(255,255,255,0.95)',
          }}
        >
          {/* Decorative orbs */}
          <div
            className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full blur-[100px]"
            style={{ background: 'rgba(168,85,247,0.16)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-32 -bottom-32 h-80 w-80 rounded-full blur-[100px]"
            style={{ background: 'rgba(217,70,239,0.10)' }}
            aria-hidden="true"
          />

          {/* Top glowing line */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 8%, rgba(168,85,247,0.55) 50%, transparent 92%)',
            }}
          />

          <div className="relative mb-10 flex flex-col gap-3.5 lg:flex-row lg:items-end lg:justify-between">
            <motion.div {...headerReveal}>
              <span className="section-label">Featured</span>
              <h2 className="section-title !mt-3 !text-left">
                Featured Event <span className="text-glow">Services</span>
              </h2>
              <p
                className="mt-4 max-w-lg text-[14px] leading-[1.7]"
                style={{ color: 'rgba(61, 35, 112, 0.78)' }}
              >
                A selected showcase of popular rentals, activations, and event-ready setups available through Eventies.
              </p>
            </motion.div>

            <Link
              to="/products"
              className="hidden shrink-0 items-center gap-2.5 rounded-[14px] border border-violet-200/85 bg-white px-5 py-2.5 text-[11.5px] font-semibold text-violet-700 shadow-[0_8px_22px_-10px_rgba(124,58,237,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50/85 hover:text-violet-900 hover:shadow-[0_14px_34px_-12px_rgba(124,58,237,0.32)] lg:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              View All Services
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
          </div>

          <motion.div
            {...containerProps}
            className="relative grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5 2xl:grid-cols-4"
          >
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

          <div className="relative mt-8 flex justify-center lg:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-[14px] border border-violet-200/85 bg-white px-6 py-3 text-[12px] font-semibold text-violet-700 shadow-[0_8px_22px_-10px_rgba(124,58,237,0.22)] transition-all duration-300 hover:border-violet-400 hover:bg-violet-50/85 hover:text-violet-900"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              View All Services
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
