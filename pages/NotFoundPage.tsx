import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1] as const

export default function NotFoundPage() {
  usePageMeta({ title: '404 — Not Found', noIndex: true })
  const { products } = useData()
  const { isDark } = useTheme()
  const suggested = products.slice(0, 3)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/60' : 'text-gray-500'

  return (
    <section className="pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease }}
        >
          <div className="text-6xl mb-6" aria-hidden="true">🚲💨</div>
          <h1 className={`font-display text-4xl sm:text-5xl font-extrabold tracking-tight ${txt}`}>
            Page not <span className="text-glow">found</span>
          </h1>
          <p className={`mt-4 text-lg leading-relaxed ${sub}`}>
            This page doesn't exist or has been moved. Let's get you back on track.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/products" className="btn-outline">Browse Products</Link>
            <Link to="/contact" className="btn-outline">Contact Us</Link>
          </div>

          {/* ✅ Suggested products */}
          {suggested.length > 0 && (
            <div className="mt-14">
              <p className={`text-sm font-medium mb-4 ${isDark ? 'text-purple-300/60' : 'text-gray-400'}`}>
                Maybe you were looking for:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggested.map(p => (
                  <Link
                    key={p.slug}
                    to={`/products/${p.slug}`}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all ${
                      isDark
                        ? 'border-purple-500/20 text-purple-200/80 hover:border-purple-500/40 hover:bg-purple-500/10'
                        : 'border-violet-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50'
                    }`}
                  >
                    {p.name}
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
