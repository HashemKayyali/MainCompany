import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Search, MessageCircle } from 'lucide-react'
import { useData } from '../contexts/DataContext'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1] as const

export default function NotFoundPage() {
  usePageMeta({ title: '404 - Not Found', noIndex: true })

  const { products } = useData()
  const suggested = products.slice(0, 3)

  return (
    <section className="site-section">
      <div className="site-container max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="relative inline-block mb-6">
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{ background: 'radial-gradient(circle, rgba(168,85,247,0.34) 0%, transparent 70%)' }}
            />
            <div className="relative font-display text-7xl font-black sm:text-8xl">
              <span style={{ color: '#1a0b3d' }}>
                404
              </span>
            </div>
          </div>

          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-[3.25rem]" style={{ color: '#1a0b3d' }}>
            Page not <span className="text-glow">found</span>
          </h1>

          <p className="mt-4 text-base leading-7" style={{ color: 'rgba(61, 35, 112, 0.78)' }}>
            This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">
              <Home className="h-4 w-4" strokeWidth={2.2} />
              Go Home
            </Link>
            <Link to="/products" className="btn-outline">
              <Search className="h-4 w-4" strokeWidth={2.2} />
              Browse Products
            </Link>
            <Link to="/contact" className="btn-outline">
              <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
              Contact Us
            </Link>
          </div>

          {suggested.length > 0 && (
            <div className="mt-12">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600/75">
                Maybe you were looking for
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggested.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/products/${product.slug}`}
                    className="rounded-full border border-violet-200/80 bg-white/85 px-5 py-2.5 text-sm font-medium text-violet-700 shadow-[0_4px_14px_-6px_rgba(124,58,237,0.18)] transition-all hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50/90 hover:text-violet-900 hover:shadow-[0_8px_22px_-8px_rgba(124,58,237,0.28)]"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
