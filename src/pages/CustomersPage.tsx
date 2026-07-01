import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Building2 } from 'lucide-react'
import CustomersGrid from '../components/customer/CustomersGrid'
import ShuffleGrid, { type ShuffleGridItem } from '../components/ui/shuffle-grid'
import EventiesHero from '../components/layout/EventiesHero'
import { useData } from '../contexts/DataContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { preloadRoute } from '../utils/route-preload'
import { useI18n } from '../contexts/LanguageContext'

const ease = [0.16, 1, 0.3, 1] as const

/** Light, theme-consistent filter pill used for the category row. */
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2 text-[12px] font-bold transition ${
        active
          ? 'border-[#190453] bg-[#190453] text-white shadow-[0_14px_30px_-18px_rgba(25,4,83,0.7)]'
          : 'border-violet-200 bg-white text-[#31195f] hover:border-violet-400 hover:bg-violet-50'
      }`}
    >
      {children}
    </button>
  )
}

function CustomersHeroShowcase({ items }: { items: ShuffleGridItem[] }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(58% 48% at 47% 38%, rgba(255,255,255,0.18) 0%, transparent 62%),' +
            'radial-gradient(46% 38% at 72% 18%, rgba(217,70,239,0.18) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />
      <ShuffleGrid
        items={items}
        className="relative h-[300px] sm:h-[360px] lg:h-[420px]"
        cellClassName="border-white/50 bg-white/[0.94]"
        logoClassName="max-h-[64%] max-w-[86%]"
      />
    </>
  )
}

export default function CustomersPage() {
  usePageMeta({
    title: 'Eventies Clients & Event Partners in Jordan',
    description:
      'A curated look at brands, schools, venues, and organizations connected to Eventies activations, custom builds, and event services across Jordan and the region.',
    canonical: 'https://www.eventiesjo.com/customers',
  })

  const { customers } = useData()
  const { translateText } = useI18n()
  const [cat, setCat] = useState('All')

  const cats = useMemo(
    () =>
      Array.from(new Set(customers.map(customer => customer.category).filter(Boolean))).sort((a, b) =>
        String(a).localeCompare(String(b))
      ) as string[],
    [customers]
  )

  const heroLogos = useMemo<ShuffleGridItem[]>(
    () =>
      customers.map(customer => ({
        id: customer.slug,
        name: customer.name,
        image: customer.logo,
      })),
    [customers]
  )

  const filtered = useMemo(
    () => customers.filter(customer => cat === 'All' || customer.category === cat),
    [cat, customers]
  )

  const heroCats = useMemo(() => cats.slice(0, 5), [cats])

  const countForCat = (category: string) =>
    customers.filter(customer => customer.category === category).length

  const clearFilters = () => {
    setCat('All')
  }

  return (
    <>
      <EventiesHero
        eyebrow="Partner Network - Jordan"
        title="Trusted by leading brands and teams."
        description="A curated look at brands, schools, venues, and organizations connected to Eventies activations, custom builds, and event services across Jordan and the region."
        primaryAction={{ label: 'Browse Partners', href: '#customers-list' }}
        secondaryAction={{ label: 'See our work', to: '/gallery' }}
        chips={heroCats.map(category => ({ label: category, onClick: () => setCat(category) }))}
        rightSlot={<CustomersHeroShowcase items={heroLogos} />}
      />

      <div className="bg-[#f8f3ff]">
      <section id="customers-list" className="site-section scroll-mt-[96px]">
        <div className="site-container-wide">
          {/* Category filter row */}
          <div className="mt-7 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
            <FilterChip active={cat === 'All'} onClick={() => setCat('All')}>
              {translateText('All')} ({customers.length})
            </FilterChip>
            {cats.map(category => (
              <FilterChip key={category} active={cat === category} onClick={() => setCat(category)}>
                {translateText(category)} ({countForCat(category)})
              </FilterChip>
            ))}
          </div>

          {/* Grid */}
          <div className="mt-8">
            <AnimatePresence mode="wait">
              {filtered.length > 0 ? (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <CustomersGrid customers={filtered} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-[22px] border border-dashed border-violet-200 bg-violet-50/40 py-16 text-center"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] border border-violet-100 bg-white">
                    <Building2 className="h-5 w-5 text-violet-400" strokeWidth={2.2} />
                  </div>
                  <p className="text-[1.08rem] font-bold text-ink-800">{translateText('No partners match this filter')}</p>
                  <p className="mt-2 text-[13px] text-ink-500">
                    {translateText('Try selecting a different category.')}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-2.5 text-[12px] font-bold text-violet-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50"
                  >
                    {translateText('Clear filters')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer CTA */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[22px] border border-violet-200/70 bg-white p-6 text-center sm:flex-row sm:text-left">
            <div>
              <div className="font-display text-[1.2rem] font-bold tracking-[-0.02em] text-ink-900">
                {translateText('Want your brand on this wall?')}
              </div>
              <p className="mt-1 text-[13px] text-ink-600">
                {translateText('Join the brands that trust Eventies for their event experiences across the region.')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/contact"
                onMouseEnter={() => preloadRoute('/contact')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-[12.5px] font-bold text-white transition-all hover:-translate-y-0.5"
              >
                {translateText('Become a partner')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
              <Link
                to="/gallery"
                onMouseEnter={() => preloadRoute('/gallery')}
                className="inline-flex items-center rounded-full border border-violet-200 bg-white px-6 py-3 text-[12.5px] font-bold text-ink-800 transition-colors hover:border-violet-300 hover:bg-violet-50"
              >
                {translateText('See our work')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
