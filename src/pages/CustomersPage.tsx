import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Building2, Search, SlidersHorizontal, UsersRound } from 'lucide-react'
import CustomersGrid from '../components/customer/CustomersGrid'
import Chip from '../components/ui/Chip'
import { useData } from '../contexts/DataContext'
import { useTheme } from '../contexts/ThemeContext'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1]

export default function CustomersPage() {
  usePageMeta({
    title: 'Eventies Clients & Event Partners in Jordan',
    description:
      'See the brands, schools, venues, and organizations that trust Eventies for event activations and experiences across Jordan.',
    canonical: 'https://www.eventiesjo.com/customers',
  })

  const { customers } = useData()
  const { isDark } = useTheme()
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')

  const cats = useMemo(
    () =>
      Array.from(new Set(customers.map(customer => customer.category).filter(Boolean))).sort((a, b) =>
        String(a).localeCompare(String(b))
      ) as string[],
    [customers]
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()

    return customers.filter(customer => {
      const matchesCategory = cat === 'All' || customer.category === cat
      if (!matchesCategory) return false
      if (!needle) return true

      return (
        customer.name.toLowerCase().includes(needle) ||
        (customer.category || '').toLowerCase().includes(needle)
      )
    })
  }, [cat, customers, search])

  const countForCat = (category: string) =>
    customers.filter(customer => customer.category === category).length

  const clearFilters = () => {
    setSearch('')
    setCat('All')
  }

  return (
    <section className="site-section bg-transparent">
      <div className="site-container">
        <div
          className={`relative overflow-hidden rounded-[28px] border px-5 py-9 sm:px-7 sm:py-11 lg:px-10 lg:py-13 ${
            isDark
              ? 'border-white/[0.07] bg-[linear-gradient(180deg,rgba(14,12,32,0.74),rgba(8,8,20,0.56))] shadow-[0_28px_84px_rgba(2,4,16,0.42),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm'
              : 'border-violet-100/80 bg-white/93 shadow-[0_24px_64px_rgba(15,23,42,0.07)]'
          }`}
        >
          {isDark && (
            <div
              className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-violet-600/[0.07] blur-[100px]"
              aria-hidden="true"
            />
          )}

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, ease }}
            className="relative mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between"
          >
            <div className="max-w-2xl">
              <div className="mb-3 flex items-center gap-2.5">
                <span className="section-label">// Partner Network</span>
                <div className={`h-px w-8 ${isDark ? 'bg-violet-500/30' : 'bg-violet-300/50'}`} />
              </div>
              <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
                Trusted <span className="text-glow">partners</span>
              </h1>
              <p
                className={`mt-4 max-w-xl text-[0.98rem] leading-[1.72] ${
                  isDark ? 'text-slate-300/70' : 'text-slate-500'
                }`}
              >
                A curated view of the brands, schools, venues, and organizations that have trusted
                Eventies experiences across the region.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.52, delay: 0.1, ease }}
              className={`shrink-0 rounded-[20px] border px-6 py-5 ${
                isDark
                  ? 'border-white/[0.09] bg-white/[0.04]'
                  : 'border-violet-200/60 bg-white shadow-[0_6px_24px_rgba(124,58,237,0.07)]'
              }`}
            >
              <div
                className={`flex items-center gap-1.5 text-[9.5px] font-bold uppercase tracking-[0.18em] ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                <UsersRound size={10} />
                Partners
              </div>
              <div
                className={`mt-1.5 font-display text-[2.6rem] font-black leading-none tracking-[-0.05em] ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                {filtered.length}
              </div>
              <div className={`mt-1.5 text-[11.5px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {cat === 'All' ? 'trusted partners' : `in ${cat}`}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.08, ease }}
            className={`relative mb-9 rounded-[22px] border p-4 ${
              isDark
                ? 'border-white/[0.07] bg-white/[0.025]'
                : 'border-violet-100/80 bg-white/80 shadow-[0_14px_36px_-24px_rgba(89,23,196,0.20)]'
            }`}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(240px,320px)_1fr] lg:items-start">
              <div>
                <div className="mb-3.5 flex items-center gap-2">
                  <Search size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${
                      isDark ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    Search partners
                  </span>
                </div>
                <div className="relative">
                  <Search
                    size={15}
                    className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
                      isDark ? 'text-slate-500' : 'text-slate-400'
                    }`}
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Search by name or category..."
                    className={`h-11 w-full rounded-[14px] border py-2 pl-10 pr-3 text-[13px] font-medium outline-none transition ${
                      isDark
                        ? 'border-white/[0.08] bg-white/[0.04] text-white placeholder:text-slate-600 focus:border-violet-400/40 focus:bg-white/[0.06]'
                        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-violet-300 focus:ring-2 focus:ring-violet-100'
                    }`}
                  />
                </div>
              </div>

              <div className="min-w-0">
                <div className="mb-3.5 flex items-center gap-2">
                  <SlidersHorizontal size={12} className={isDark ? 'text-slate-600' : 'text-slate-400'} />
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${
                      isDark ? 'text-slate-600' : 'text-slate-400'
                    }`}
                  >
                    Filter by category
                  </span>
                </div>
                <div className="-mx-4 overflow-x-auto px-4 pb-1">
                  <div className="flex w-max min-w-full gap-2 sm:flex-wrap">
                    <Chip active={cat === 'All'} onClick={() => setCat('All')}>
                      All ({customers.length})
                    </Chip>
                    {cats.map(category => (
                      <Chip key={category} active={cat === category} onClick={() => setCat(category)}>
                        {category} ({countForCat(category)})
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <hr className="hr-glow mb-9" />

          <AnimatePresence mode="wait">
            <motion.div
              key={`${cat}-${search}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              {filtered.length > 0 ? (
                <CustomersGrid customers={filtered} />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-[22px] border border-dashed py-18 text-center ${
                    isDark
                      ? 'border-white/[0.10] bg-white/[0.025]'
                      : 'border-violet-200/70 bg-slate-50/60'
                  }`}
                >
                  <div
                    className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] ${
                      isDark ? 'border border-white/[0.07] bg-white/[0.06]' : 'border border-violet-100 bg-violet-50'
                    }`}
                  >
                    <Building2 size={20} className={isDark ? 'text-slate-600' : 'text-violet-400'} />
                  </div>
                  <p className={`font-display text-[1.08rem] font-semibold ${isDark ? 'text-white/55' : 'text-slate-700'}`}>
                    No partners match this filter
                  </p>
                  <p className={`mt-2 text-[13px] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                    Try adjusting the search or selecting a different category.
                  </p>
                  <button
                    onClick={clearFilters}
                    className={`mt-5 rounded-[12px] border px-5 py-2.5 text-[12px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                      isDark
                        ? 'border-white/[0.10] bg-white/[0.04] text-white/70 hover:border-white/[0.16] hover:bg-white/[0.08]'
                        : 'border-slate-200 bg-white text-slate-600 shadow-sm hover:border-violet-300 hover:text-violet-700'
                    }`}
                  >
                    Clear filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
