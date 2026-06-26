import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search, Sparkles } from 'lucide-react'
import { useProductsData } from '../../contexts/DataContext'
import { preloadRoute } from '../../utils/route-preload'
import SearchDialog from '../ui/SearchDialog'
import ProductCard from '../product/ProductCard'

const CATEGORY_CHIPS = [
  { label: 'VR Games', to: '/products' },
  { label: 'LED Screens', to: '/products' },
  { label: 'Arcade Games', to: '/products' },
  { label: 'Booths', to: '/products' },
  { label: 'Lighting', to: '/products' },
  { label: 'Event Equipment', to: '/products' },
]

export default function CompactHero() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { featuredProducts } = useProductsData()
  const peekProducts = (featuredProducts ?? []).slice(0, 4)

  return (
    <section className="relative isolate overflow-hidden">
      <div className="site-container relative z-10">
        <div
          className="grid items-center gap-8 pb-8 pt-[calc(var(--app-navbar-height)+1.5rem)] lg:grid-cols-[1fr_0.55fr] lg:gap-12 lg:pb-10 lg:pt-[calc(var(--app-navbar-height)+2.5rem)]"
        >
          {/* Left content */}
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-600" strokeWidth={2.4} />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-700">
                Event Services Marketplace
              </span>
            </div>

            <h1 className="font-display text-[clamp(2.2rem,5.5vw,4rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-900">
              Everything Your Event Needs, All in One Place
            </h1>

            <p className="mt-5 max-w-xl text-[1.05rem] leading-[1.75] text-slate-600">
              Discover event rentals, entertainment games, booths, screens, lighting, and services
              in one organized marketplace built for Jordan.
            </p>

            {/* Search-style input */}
            <div className="mt-7 max-w-lg">
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-brand-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
              >
                <Search className="h-5 w-5 text-slate-400" strokeWidth={2.2} />
                <span className="flex-1 text-[14px] text-slate-400">Search products, services, categories...</span>
                <kbd className="hidden rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 sm:inline">
                  ⌘K
                </kbd>
              </button>
            </div>

            {/* CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/products"
                onMouseEnter={() => preloadRoute('/products')}
                onFocus={() => preloadRoute('/products')}
                className="btn-primary rounded-xl px-6 py-3 text-[12px]"
              >
                Explore Products
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} />
              </Link>
              <Link
                to="/contact"
                onMouseEnter={() => preloadRoute('/contact')}
                onFocus={() => preloadRoute('/contact')}
                className="btn-outline rounded-xl px-6 py-3 text-[12px]"
              >
                Request a Quote
              </Link>
            </div>

            {/* Category chips */}
            <div className="mt-7 flex flex-wrap gap-2">
              {CATEGORY_CHIPS.map(chip => (
                <Link
                  key={chip.label}
                  to={chip.to}
                  className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-semibold text-slate-600 shadow-sm transition-all hover:border-brand-300 hover:text-brand-700"
                >
                  {chip.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right visual */}
          <div className="relative hidden lg:block">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-100 shadow-xl">
              <img
                src="/images/hero-bg-event.webp"
                alt="Event setup"
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent" />
            </div>

            {/* Floating mini card */}
            <div className="absolute -bottom-6 -left-6 max-w-[16rem] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Sparkles className="h-5 w-5" strokeWidth={2} />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">One request</div>
                  <div className="text-[13px] font-bold text-slate-900">Multiple rentals & services</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Peeking product cards */}
        {peekProducts.length > 0 && (
          <div className="pointer-events-none relative -mb-16 mt-2 hidden select-none gap-4 overflow-hidden md:grid md:grid-cols-3 lg:grid-cols-4 lg:-mb-20">
            {peekProducts.map((product, index) => (
              <div
                key={product.slug}
                className="translate-y-8 scale-[0.94] opacity-80"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <ProductCard
                  product={product}
                  index={index}
                  compact
                  revealOnScroll={false}
                  imageLoading="eager"
                  imageFetchPriority={index < 2 ? 'high' : 'auto'}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </section>
  )
}
