import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useProductsData } from '../../contexts/DataContext'
import { useReveal, useRevealGroup } from '../../hooks/useReveal'
import ProductCard from '../product/ProductCard'
import SectionHeader from './SectionHeader'

export default function PopularRentals() {
  const { featuredProducts } = useProductsData()
  const headerReveal = useReveal({ distance: 14, duration: 0.4 })
  const { containerProps, itemProps } = useRevealGroup({
    distance: 12,
    duration: 0.34,
    stagger: 0.04,
  })

  const items = (featuredProducts ?? []).slice(0, 6)
  if (items.length === 0) return null

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:p-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <motion.div {...headerReveal}>
              <SectionHeader
                eyebrow="Featured"
                title="Popular Event Rentals"
                description="Explore frequently requested products and services for parties, activations, exhibitions, and corporate events."
              />
            </motion.div>

            <Link
              to="/products"
              className="hidden shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-700 shadow-sm transition-all hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
            >
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
              View all products
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>

          <motion.div
            {...containerProps}
            className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5 2xl:grid-cols-4"
          >
            {items.map((product, index) => (
              <motion.div key={product.slug} {...itemProps} className="h-full">
                <ProductCard
                  product={product}
                  index={index}
                  revealOnScroll={false}
                  imageLoading={index < 4 ? 'eager' : 'lazy'}
                  imageFetchPriority={index < 2 ? 'high' : 'auto'}
                />
              </motion.div>
            ))}
          </motion.div>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[12px] font-semibold text-slate-700 shadow-sm"
            >
              View all products
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
