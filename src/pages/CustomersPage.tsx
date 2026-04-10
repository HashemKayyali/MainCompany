import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import CustomersGrid from '../components/customer/CustomersGrid'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { getDeferredRenderStyle, useReveal } from '../hooks/useReveal'
import { usePageMeta } from '../hooks/usePageMeta'

export default function CustomersPage() {
  const { customers } = useData()
  const { isDark } = useTheme()
  const heroReveal = useReveal({ distance: 24, duration: 0.64, margin: '-32px' })
  const toolbarReveal = useReveal({ delay: 0.06, distance: 18, duration: 0.46, margin: '-16px' })
  const ctaReveal = useReveal({ distance: 20, duration: 0.54, margin: '-24px' })

  usePageMeta({
    title: 'Global Partners | Elite Network',
    description: 'Trusted by leading premium brands, enterprises, and organizations across the region.',
  })

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')

  const cats = useMemo(
    () => Array.from(new Set(customers.map(customer => customer.category).filter(Boolean))) as string[],
    [customers]
  )

  const filtered = useMemo(
    () =>
      customers.filter(
        customer =>
          customer.name.toLowerCase().includes(search.toLowerCase()) &&
          (cat === 'All' || customer.category === cat)
      ),
    [cat, customers, search]
  )

  return (
    <div className="relative min-h-screen pb-24">
      {isDark && (
        <div
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse at 50% -10%, rgba(124,58,237,0.12) 0%, transparent 46%), radial-gradient(ellipse at 82% 78%, rgba(34,211,238,0.05) 0%, transparent 42%)',
          }}
        />
      )}

      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24 lg:pt-48 lg:pb-32">
        <div className="site-container relative z-10 text-center">
          <motion.div {...heroReveal} className="mx-auto max-w-4xl">
            <div
              className={`mx-auto mb-6 inline-flex h-8 items-center rounded-full border px-4 text-[11px] font-bold uppercase tracking-[0.2em] shadow-2xl backdrop-blur-md ${
                isDark
                  ? 'border-white/[0.15] bg-white/[0.05] text-purple-100 shadow-[0_0_40px_rgba(124,58,237,0.2)]'
                  : 'border-violet-200 bg-white/80 text-violet-700 shadow-violet-200/50'
              }`}
            >
              <span
                className={`mr-2.5 inline-block h-1.5 w-1.5 rounded-full ${
                  isDark ? 'bg-cyan-400' : 'bg-violet-500'
                } animate-pulse`}
              />
              Trusted by {customers.length} Elite Brands
            </div>

            <h1
              className={`font-display text-[2.75rem] font-black tracking-tight leading-[1.05] sm:text-[4rem] lg:text-[5rem] ${
                !isDark ? 'text-gray-900' : 'text-white'
              }`}
            >
              The network behind <br className="hidden sm:block" />
              <span className="text-glow opacity-90 drop-shadow-xl">world-class events.</span>
            </h1>

            <p
              className={`mx-auto mt-8 max-w-2xl text-[1.1rem] font-medium leading-relaxed sm:text-[1.35rem] ${
                isDark ? 'text-purple-100/60' : 'text-gray-600'
              }`}
            >
              From global enterprises to luxury brands, the most demanding clients trust us to
              deliver flawless experiences.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="site-container relative z-10">
        <motion.div {...toolbarReveal} className="mb-12 sm:mb-16">
          <div
            className={`relative flex flex-col items-start justify-between gap-5 rounded-[24px] border p-4 sm:flex-row sm:items-center sm:p-5 ${
              isDark
                ? 'border-white/[0.06] bg-white/[0.02] shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)]'
                : 'border-violet-100 bg-white/60 shadow-xl shadow-violet-100/40'
            }`}
            style={{ backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
          >
            <div className="relative w-full sm:max-w-[280px]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-50">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search partners..."
                className={`w-full rounded-[14px] border-none py-3 pl-11 pr-4 text-[0.95rem] font-medium outline-none transition-all ${
                  isDark
                    ? 'bg-white/[0.04] text-white placeholder:text-white/30 focus:bg-white/[0.08] focus:ring-2 focus:ring-purple-500/50'
                    : 'bg-white text-gray-900 placeholder:text-gray-400 focus:bg-violet-50 focus:ring-2 focus:ring-violet-500/30'
                }`}
              />
            </div>

            <div className="flex w-full flex-wrap gap-2 sm:w-auto">
              <button
                onClick={() => setCat('All')}
                className={`rounded-[12px] px-5 py-2.5 text-[0.85rem] font-bold uppercase tracking-wide transition-all duration-300 ${
                  cat === 'All'
                    ? isDark
                      ? 'bg-white text-black shadow-lg shadow-white/10'
                      : 'bg-gray-900 text-white shadow-md'
                    : isDark
                      ? 'bg-transparent text-white/50 hover:bg-white/10 hover:text-white'
                      : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                All
              </button>
              {cats.map(category => (
                <button
                  key={category}
                  onClick={() => setCat(category)}
                  className={`rounded-[12px] px-5 py-2.5 text-[0.85rem] font-bold uppercase tracking-wide transition-all duration-300 ${
                    cat === category
                      ? isDark
                        ? 'bg-white text-black shadow-lg shadow-white/10'
                        : 'bg-gray-900 text-white shadow-md'
                      : isDark
                        ? 'bg-transparent text-white/50 hover:bg-white/10 hover:text-white'
                        : 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {filtered.length > 0 ? (
          <div
            className="rounded-[32px] border border-white/5 bg-white/[0.01] p-4 sm:p-8 md:p-12"
            style={{
              ...getDeferredRenderStyle('780px'),
              boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : '',
            }}
          >
            <CustomersGrid customers={filtered} />
          </div>
        ) : (
          <div
            className={`rounded-[32px] border py-32 text-center ${
              isDark ? 'border-white/5 bg-white/[0.01]' : 'border-gray-100 bg-gray-50'
            }`}
          >
            <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No partners found
            </h3>
            <p className={`mt-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              Try adjusting your search or category filter.
            </p>
            <button
              onClick={() => {
                setSearch('')
                setCat('All')
              }}
              className={`mt-6 rounded-full px-8 py-3 text-sm font-semibold transition-colors ${
                isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              Clear Filters
            </button>
          </div>
        )}

        <motion.div {...ctaReveal} className="mt-24 text-center sm:mt-32">
          <div
            className={`mx-auto max-w-3xl rounded-[32px] border p-12 sm:p-16 ${
              isDark
                ? 'border-white/[0.08] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]'
                : 'border-violet-100 bg-[linear-gradient(180deg,rgba(124,58,237,0.03),transparent)] shadow-2xl shadow-violet-100/50'
            }`}
          >
            <h2
              className={`font-display text-3xl font-bold sm:text-4xl ${
                !isDark ? 'text-gray-900' : 'text-white'
              }`}
            >
              Ready to create something <span className="text-glow">extraordinary?</span>
            </h2>
            <p className={`mt-4 text-base sm:text-lg ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
              Partner with the platform trusted by the very best.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                to="/contact"
                className="btn-primary group relative !min-h-[56px] !rounded-[18px] !px-10 !text-[14px]"
              >
                <span>Start Your Project</span>
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
