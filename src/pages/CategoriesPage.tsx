import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { useCategoriesData, useProductsData } from '../contexts/DataContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { preloadRoute } from '../utils/route-preload'
import CategoryGridCard, { type CategoryGridCardData } from '../components/category/CategoryGridCard'
import EventiesHero from '../components/layout/EventiesHero'
import SectionHeading from '../components/home/SectionHeading'
import { useI18n } from '../contexts/LanguageContext'

type CategoriesHeroShowcaseProps = {
  query: string
  onQueryChange: (value: string) => void
  totalCategories: number
  totalServices: number
  featured: CategoryGridCardData[]
}

function CategoriesHeroShowcase({
  query,
  onQueryChange,
  totalCategories,
  totalServices,
  featured,
}: CategoriesHeroShowcaseProps) {
  const { translateText } = useI18n()

  return (
    <div className="relative mx-auto w-full max-w-[520px]">
      <div className="absolute inset-5 rounded-[30px] bg-fuchsia-400/20 blur-3xl" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[26px] border border-white/14 bg-white/[0.08] p-5 shadow-[0_28px_70px_-34px_rgba(8,3,26,0.9)] backdrop-blur-xl sm:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
          aria-hidden="true"
        />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{translateText('Directory')}</p>
              <h2 className="mt-2 font-display text-[1.45rem] font-bold leading-tight text-white">{translateText('Find the right category')}</h2>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-700 shadow-[0_18px_34px_-20px_rgba(255,255,255,0.8)]">
              <Search className="h-5 w-5" strokeWidth={2.3} />
            </span>
          </div>

          <label className="mt-5 flex h-12 items-center gap-2.5 rounded-full border border-white/20 bg-white/95 px-4">
            <Search className="h-[18px] w-[18px] shrink-0 text-violet-500" strokeWidth={2.2} />
            <input
              type="text"
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              placeholder={translateText('Search categories...')}
              aria-label={translateText('Search categories')}
              className="min-w-0 flex-1 bg-transparent text-[13.5px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
            />
          </label>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
              <div className="text-[2rem] font-bold leading-none text-white">{totalCategories}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{translateText('Categories')}</div>
            </div>
            <div className="rounded-[18px] border border-white/12 bg-white/[0.08] p-4">
              <div className="text-[2rem] font-bold leading-none text-white">{totalServices}</div>
              <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">{translateText('Services')}</div>
            </div>
          </div>

          {featured.length > 0 && (
            <div className="mt-5 space-y-2">
              {featured.slice(0, 4).map(category => {
                const route = `/categories/${encodeURIComponent(category.slug)}`
                return (
                  <Link
                    key={category.slug}
                    to={route}
                    onMouseEnter={() => preloadRoute(route)}
                    onFocus={() => preloadRoute(route)}
                    className="group flex items-center justify-between gap-3 rounded-[16px] border border-white/12 bg-white/[0.07] px-4 py-3 text-white transition-colors hover:border-fuchsia-300/45 hover:bg-white/[0.12]"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold">{translateText(category.name)}</span>
                      <span className="mt-0.5 block text-[11px] font-semibold text-white/45">
                        {category.count} {translateText(category.count === 1 ? 'service' : 'services')}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white/45 transition-transform group-hover:translate-x-1 group-hover:text-white" strokeWidth={2.4} />
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  const { categories } = useCategoriesData()
  const { getProductsByCategory } = useProductsData()
  const { translateText } = useI18n()
  const [query, setQuery] = useState('')

  usePageMeta({
    title: 'Event Service Categories | Eventies',
    description:
      'Browse every event service category on Eventies — interactive experiences, displays, production, activations and more, across Jordan.',
    canonical: 'https://www.eventiesjo.com/categories',
  })

  const items = useMemo<CategoryGridCardData[]>(
    () =>
      categories
        .filter(category => category.slug.trim().length > 0)
        .map(category => ({
          name: category.name,
          slug: category.slug,
          icon: category.icon,
          image: category.image,
          count: getProductsByCategory(category.id).length,
        }))
        .sort((a, b) => b.count - a.count),
    [categories, getProductsByCategory]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(category => category.name.toLowerCase().includes(q))
  }, [items, query])

  const totalServices = useMemo(() => items.reduce((sum, category) => sum + category.count, 0), [items])
  const heroChips = useMemo(
    () => items.slice(0, 5).map(category => ({ label: category.name, to: `/categories/${encodeURIComponent(category.slug)}` })),
    [items]
  )
  const featuredCategories = useMemo(() => items.filter(category => category.count > 0).slice(0, 4), [items])

  return (
    <>
      <EventiesHero
        eyebrow="All categories"
        title="Browse every event category."
        description={`${items.length} ${items.length === 1 ? 'category' : 'categories'} and ${totalServices} service${totalServices === 1 ? '' : 's'} from trusted providers. Open any category to see what's available for your event.`}
        primaryAction={{ label: 'View Categories', href: '#categories-grid' }}
        secondaryAction={{ label: 'All services', to: '/products' }}
        chipsLabel="Popular"
        chips={heroChips}
        rightSlot={
          <CategoriesHeroShowcase
            query={query}
            onQueryChange={setQuery}
            totalCategories={items.length}
            totalServices={totalServices}
            featured={featuredCategories}
          />
        }
      />

      <div className="bg-[#f8f3ff]">
      <section id="categories-grid" className="site-section scroll-mt-[calc(var(--app-navbar-height)+1rem)]">
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Categories"
            title="Browse service categories"
            description="Start with the type of event service you need, then open a category to compare the available services and providers."
            className="mb-10"
          />

          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[15px] font-semibold text-ink-700">{translateText('No categories match')} “{query.trim()}”.</p>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-5 py-2.5 text-[12px] font-bold text-violet-700 transition-colors hover:bg-violet-50"
              >
                {translateText('Clear search')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map(category => (
                <CategoryGridCard key={category.slug} category={category} />
              ))}
            </div>
          )}

          {/* Footer CTA */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 rounded-[22px] border border-violet-200/70 bg-white p-6 text-center sm:flex-row sm:text-left">
            <div>
              <div className="font-display text-[1.2rem] font-bold tracking-[-0.02em] text-ink-900">{translateText("Can't find what you need?")}</div>
              <p className="mt-1 text-[13px] text-ink-600">{translateText("Browse the full catalog or send us a request and we'll help.")}</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Link
                to="/products"
                onMouseEnter={() => preloadRoute('/products')}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-[12.5px] font-bold text-white transition-all hover:-translate-y-0.5"
              >
                {translateText('All services')}
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
              </Link>
              <Link
                to="/contact"
                onMouseEnter={() => preloadRoute('/contact')}
                className="inline-flex items-center rounded-full border border-violet-200 bg-white px-6 py-3 text-[12.5px] font-bold text-ink-800 transition-colors hover:border-violet-300 hover:bg-violet-50"
              >
                {translateText('Request a quote')}
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}
