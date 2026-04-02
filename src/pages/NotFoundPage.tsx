import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1] as const

export default function NotFoundPage() {
  usePageMeta({ title: '404 - Not Found', noIndex: true })

  const { products } = useData()
  const { isDark } = useTheme()
  const suggested = products.slice(0, 3)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/60' : 'text-gray-500'

  return (
    <section className="site-section">
      <div className="site-container max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="mb-5 text-5xl font-display font-black text-prism-violet" aria-hidden="true">
            404
          </div>

          <h1 className={`font-display text-4xl font-extrabold tracking-tight sm:text-[3.25rem] ${txt}`}>
            Page not <span className="text-glow">found</span>
          </h1>

          <p className={`mt-3 text-base leading-7 ${sub}`}>
            This page doesn&apos;t exist or has been moved. Let&apos;s get you back on track.
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">
              Go Home
            </Link>
            <Link to="/products" className="btn-outline">
              Browse Products
            </Link>
            <Link to="/contact" className="btn-outline">
              Contact Us
            </Link>
          </div>

          {suggested.length > 0 && (
            <div className="mt-10">
              <p className={`mb-4 text-sm font-medium ${isDark ? 'text-purple-300/60' : 'text-gray-400'}`}>
                Maybe you were looking for:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggested.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/products/${product.slug}`}
                    className={`rounded-full border px-4 py-2.5 text-sm font-medium transition-all ${
                      isDark
                        ? 'border-purple-500/20 text-purple-200/80 hover:border-purple-500/40 hover:bg-purple-500/10'
                        : 'border-violet-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50'
                    }`}
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
