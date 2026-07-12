'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronDown, LayoutGrid, Menu, Package, Search, Tag, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { SmartImage } from '@/components/ui/SmartImage'
import { LanguageSwitcher } from './LanguageSwitcher'

/**
 * CAT-024 — site navigation (faithful port of the Vite `Navbar`). Fixed header,
 * transparent over the hero routes and opaque/blurred after scroll. Priority
 * nav (Home · Categories▾ · Services · Gallery); secondary links collapse into a
 * More menu below 1720px. Inline desktop search with live suggestions; mobile
 * drawer with search + link grid + categories. Auth/cart actions are reserved
 * for Phase 3 (no auth in the public app) and intentionally not rendered.
 */
export type NavSearchItem = {
  type: 'product' | 'category'
  name: string
  href: string
  image?: string
  meta: string
}
export type NavCategory = { slug: string; name: string; icon: string; count: number }

const HERO_PATHS = new Set([
  '/',
  '/products',
  '/categories',
  '/customers',
  '/custom-builds',
  '/gallery',
  '/about',
  '/contact',
])

const PRIMARY = [
  { href: '/', key: 'home' as const },
  { href: '/products', key: 'services' as const },
  { href: '/gallery', key: 'gallery' as const },
]
const SECONDARY = [
  { href: '/custom-builds', key: 'customBuilds' as const },
  { href: '/customers', key: 'customers' as const },
  { href: '/about', key: 'about' as const },
  { href: '/contact', key: 'contact' as const },
]

function BrandLogo({ overHero, compact = false }: { overHero: boolean; compact?: boolean }) {
  const size = compact
    ? 'h-[38px] w-[clamp(120px,40vw,176px)]'
    : 'h-9 w-[clamp(104px,34vw,165px)] md:h-11 md:w-[201px] lg:h-10 lg:w-[183px] 2xl:h-11 2xl:w-[201px] min-[1720px]:h-12 min-[1720px]:w-[220px]'
  const tone = overHero ? 'eventies-logo-full--hero' : 'eventies-logo-full--original'
  return (
    <span
      className="eventies-logo-lockup inline-flex shrink-0 items-center"
      dir="ltr"
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- brand logo, CSS tone swap on scroll */}
      <img
        src="/brand/eventies_logo_horizontal_800.webp"
        alt=""
        width={238}
        height={52}
        loading="eager"
        decoding="async"
        className={`${size} eventies-logo-full ${tone} block shrink-0 object-contain transition-[filter] duration-300`}
      />
    </span>
  )
}

export function SiteNav({
  locale,
  search,
  categories,
}: {
  locale: string
  search: NavSearchItem[]
  categories: NavCategory[]
}) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)

  const catsRef = useRef<HTMLDivElement>(null)
  const moreRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const overHero = HERO_PATHS.has(pathname) && !scrolled

  const active = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close transient surfaces on route change (incl. browser back/forward, where
  // link onClick handlers never fire). This is a legitimate reset-on-navigation
  // effect, hence the scoped rule suppression.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setMobileOpen(false)
    setCatsOpen(false)
    setMoreOpen(false)
    setSearchFocused(false)
    setQuery('')
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [pathname])

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (catsRef.current && !catsRef.current.contains(target)) setCatsOpen(false)
      if (moreRef.current && !moreRef.current.contains(target)) setMoreOpen(false)
      if (searchRef.current && !searchRef.current.contains(target)) setSearchFocused(false)
    }
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setCatsOpen(false)
      setMoreOpen(false)
      setMobileOpen(false)
      setSearchFocused(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  // Body scroll lock when the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileOpen])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []
    const cats = search
      .filter((s) => s.type === 'category' && s.name.toLowerCase().includes(q))
      .slice(0, 3)
    const prods = search
      .filter((s) => s.type === 'product' && s.name.toLowerCase().includes(q))
      .slice(0, 6)
    return [...cats, ...prods].slice(0, 8)
  }, [query, search])
  const showSuggestions = searchFocused && query.trim().length >= 1

  // ── surfaces ──
  const barSurface = overHero
    ? 'border-white/[0.07] bg-[rgba(12,4,38,0.18)] backdrop-blur-lg'
    : 'border-violet-100/90 bg-white/90 shadow-[0_6px_30px_-12px_rgba(46,10,114,0.2)] backdrop-blur-xl'
  const linkColor = (isActive: boolean) =>
    overHero
      ? isActive
        ? 'text-white'
        : 'text-white/75 hover:text-white'
      : isActive
        ? 'text-violet-900'
        : 'text-ink-600 hover:text-violet-900'
  const activePill = overHero ? 'bg-white/18' : 'bg-violet-100'
  const utilityBtn = overHero
    ? 'border-white/30 bg-white/[0.16] text-white hover:bg-white/25'
    : 'border-violet-200 bg-white text-ink-800 hover:border-violet-300 hover:bg-violet-50'
  const searchSurface = overHero
    ? 'border-white/50 bg-white/95 shadow-[0_8px_24px_-12px_rgba(8,3,26,0.6)] focus-within:border-violet-300 focus-within:bg-white'
    : 'border-violet-200 bg-white focus-within:border-violet-300'

  const navLink = (
    item: {
      href: string
      key: 'home' | 'services' | 'gallery' | 'customBuilds' | 'customers' | 'about' | 'contact'
    },
    extra = ''
  ) => {
    const isCurrent = active(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={isCurrent ? 'page' : undefined}
        className={`relative inline-flex h-9 shrink-0 items-center whitespace-nowrap rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors ${linkColor(isCurrent)} ${extra}`}
      >
        {isCurrent && <span className={`absolute inset-0 rounded-full ${activePill}`} />}
        <span className="relative z-10">{t(item.key)}</span>
      </Link>
    )
  }

  const suggestionRow = (r: NavSearchItem, small = false) => (
    <Link
      key={`${r.type}-${r.href}`}
      href={r.href}
      onClick={() => {
        setSearchFocused(false)
        setQuery('')
        setMobileOpen(false)
      }}
      className={`flex items-center gap-3 ${small ? 'border-b border-violet-50 px-3 py-2.5 last:border-0 hover:bg-violet-50' : 'rounded-[14px] px-2.5 py-2.5 hover:bg-violet-50'}`}
    >
      <span
        className={`flex ${small ? 'h-8 w-8 rounded-[9px] text-[13px]' : 'h-10 w-10 rounded-[11px]'} shrink-0 items-center justify-center overflow-hidden border border-violet-200 bg-violet-50 text-violet-600`}
      >
        {r.type === 'product' && r.image ? (
          <SmartImage media={r.image} alt="" fill sizes="40px" className="object-cover" />
        ) : r.type === 'category' ? (
          <Tag className="h-4 w-4" strokeWidth={2.2} />
        ) : (
          <Package className="h-4 w-4" strokeWidth={2.2} />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block truncate font-bold text-ink-900 ${small ? 'text-[12.5px]' : 'text-[13.5px]'}`}
        >
          {r.name}
        </span>
        <span
          className={`block truncate font-medium text-ink-500 ${small ? 'text-[10.5px]' : 'text-[11px]'}`}
        >
          {r.meta}
        </span>
      </span>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${r.type === 'category' ? 'bg-violet-100 text-violet-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}
      >
        {r.type === 'category' ? t('category') : t('service')}
      </span>
    </Link>
  )

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`border-b transition-colors duration-300 ${barSurface}`} dir="ltr">
        <div
          className={`site-container flex h-[74px] min-w-0 items-center gap-[clamp(8px,1.2vw,18px)] ${dir === 'rtl' ? 'nav-shell-ar' : ''}`}
        >
          <Link href="/" className="flex shrink-0 items-center" aria-label={t('eventiesHome')}>
            <BrandLogo overHero={overHero} />
          </Link>

          {/* Desktop priority nav */}
          <nav
            className="hidden shrink-0 items-center gap-0.5 lg:flex"
            aria-label={t('mainNavigation')}
          >
            {navLink(PRIMARY[0]!)}

            <div ref={catsRef} className="relative">
              <button
                type="button"
                onClick={() => setCatsOpen((o) => !o)}
                aria-expanded={catsOpen}
                aria-haspopup="menu"
                className={`relative inline-flex h-9 items-center gap-1 rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors ${linkColor(active('/categories'))}`}
              >
                {(active('/categories') || catsOpen) && (
                  <span className={`absolute inset-0 rounded-full ${activePill}`} />
                )}
                <span className="relative z-10">{t('categories')}</span>
                <ChevronDown
                  className={`relative z-10 h-3.5 w-3.5 transition-transform ${catsOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2.4}
                />
              </button>
              <AnimatePresence>
                {catsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    dir={dir}
                    className="absolute start-0 top-[calc(100%+12px)] z-50 w-[336px] overflow-hidden rounded-[20px] border border-violet-200/80 bg-white p-2.5 shadow-[0_36px_80px_-26px_rgba(46,10,114,0.45)]"
                    role="menu"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 12%, rgba(168,85,247,0.5) 50%, transparent 88%)',
                      }}
                    />
                    <div className="mb-1.5 flex items-center justify-between px-2.5 pt-1.5">
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">
                        {t('browseCategories')}
                      </span>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                        {categories.length}
                      </span>
                    </div>
                    <div className="max-h-[58vh] overflow-y-auto pe-0.5">
                      {categories.map((c) => (
                        <Link
                          key={c.slug}
                          href={`/categories/${c.slug}`}
                          onClick={() => setCatsOpen(false)}
                          className="group/cat flex items-center gap-3 rounded-[14px] px-2.5 py-2.5 transition-colors hover:bg-violet-50"
                          role="menuitem"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-violet-200/80 bg-gradient-to-br from-violet-100 to-fuchsia-100 text-[1.1rem] transition-transform duration-200 group-hover/cat:scale-105">
                            {c.icon || '✦'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[13.5px] font-bold text-ink-900">
                              {c.name}
                            </span>
                            <span className="block text-[11px] font-semibold text-violet-500">
                              {t('servicesCount', { count: c.count })}
                            </span>
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-violet-500 transition-all duration-200 group-hover/cat:bg-violet-600 group-hover/cat:text-white">
                            <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" strokeWidth={2.2} />
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href="/categories"
                      onClick={() => setCatsOpen(false)}
                      className="mt-1.5 flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-3 font-display text-[12.5px] font-bold text-white transition-all hover:-translate-y-0.5"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.2} />
                      {t('viewAllCategories')}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {PRIMARY.slice(1).map((item) => navLink(item))}
            {SECONDARY.map((item) => navLink(item, 'hidden min-[1720px]:inline-flex'))}

            <div ref={moreRef} className="relative min-[1720px]:hidden">
              <button
                type="button"
                onClick={() => setMoreOpen((o) => !o)}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                className={`relative inline-flex h-9 items-center gap-1 whitespace-nowrap rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors ${linkColor(SECONDARY.some((i) => active(i.href)))}`}
              >
                {(SECONDARY.some((i) => active(i.href)) || moreOpen) && (
                  <span className={`absolute inset-0 rounded-full ${activePill}`} />
                )}
                <span className="relative z-10">{t('more')}</span>
                <ChevronDown
                  className={`relative z-10 h-3.5 w-3.5 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2.4}
                />
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    dir={dir}
                    className="absolute start-0 top-[calc(100%+12px)] z-50 w-[224px] overflow-hidden rounded-[20px] border border-violet-200/80 bg-white p-2 shadow-[0_36px_80px_-26px_rgba(46,10,114,0.45)]"
                    role="menu"
                  >
                    {SECONDARY.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        role="menuitem"
                        aria-current={active(item.href) ? 'page' : undefined}
                        className={`flex items-center rounded-[13px] px-3 py-2.5 font-display text-[13px] font-semibold transition-colors ${active(item.href) ? 'bg-violet-50 text-violet-900' : 'text-ink-800 hover:bg-violet-50 hover:text-violet-900'}`}
                      >
                        {t(item.key)}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right cluster: search + language + mobile toggle */}
          <div className="ms-auto flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-2.5">
            <div
              ref={searchRef}
              className="relative hidden w-full min-w-[150px] max-w-[430px] lg:block"
            >
              <div
                className={`flex h-11 w-full min-w-0 items-center gap-2.5 rounded-full border px-4 transition-all duration-200 ${searchSurface}`}
              >
                <Search className="h-[18px] w-[18px] shrink-0 text-violet-500" strokeWidth={2.2} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchAria')}
                  dir={dir}
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-normal text-ink-900 outline-none placeholder:text-ink-400"
                />
              </div>
              <AnimatePresence>
                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    dir={dir}
                    className="absolute end-0 top-[calc(100%+10px)] z-50 w-[min(460px,92vw)] overflow-hidden rounded-[20px] border border-violet-200/80 bg-white p-2 shadow-[0_36px_80px_-26px_rgba(46,10,114,0.45)]"
                  >
                    {results.length === 0 ? (
                      <div className="px-3 py-6 text-center text-[12.5px] font-medium text-ink-500">
                        {t('noMatchesFor')} “{query.trim()}”. {t('pressEnterToBrowse')}
                      </div>
                    ) : (
                      results.map((r) => suggestionRow(r))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <LanguageSwitcher
              locale={locale}
              className={`hidden shrink-0 border md:inline-flex ${utilityBtn}`}
            />

            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={t('menu')}
              aria-expanded={mobileOpen}
              className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all lg:hidden ${utilityBtn}`}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" strokeWidth={2.2} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={2.2} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-ink-900/40 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              dir={dir}
              className="fixed inset-x-0 top-0 z-50 max-h-[92dvh] overflow-y-auto rounded-b-[24px] border-b border-violet-100 bg-white p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-2xl lg:hidden"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              role="dialog"
              aria-modal="true"
              aria-label={t('mobileNavigation')}
            >
              <div className="mb-3 flex items-center justify-between">
                <BrandLogo overHero={false} compact />
                <div className="flex items-center gap-2">
                  <LanguageSwitcher
                    locale={locale}
                    compact
                    className="border-violet-200 bg-white text-ink-700"
                  />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label={t('closeMenu')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-violet-200 bg-white text-ink-700"
                  >
                    <X className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <div className="mb-3 flex h-12 items-center gap-2 rounded-full border border-violet-200 bg-white px-4">
                <Search className="h-4 w-4 text-violet-500" strokeWidth={2.2} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  dir={dir}
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
                  aria-label={t('searchAria')}
                />
              </div>

              {query.trim().length >= 1 && results.length > 0 && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-violet-100">
                  {results.map((r) => suggestionRow(r, true))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  PRIMARY[0]!,
                  { href: '/products', key: 'services' as const },
                  ...SECONDARY,
                  { href: '/gallery', key: 'gallery' as const },
                ].map((item) => (
                  <Link
                    key={item.href + item.key}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`inline-flex min-h-[46px] items-center rounded-xl border px-3.5 font-display text-[13px] font-semibold transition-all ${active(item.href) ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-violet-100 bg-white text-ink-700 hover:bg-violet-50'}`}
                  >
                    {t(item.key)}
                  </Link>
                ))}
              </div>

              <Link
                href="/categories"
                onClick={() => setMobileOpen(false)}
                className={`mt-3 inline-flex min-h-[48px] w-full items-center justify-between rounded-xl border px-3.5 font-display text-[13px] font-semibold transition-all ${active('/categories') ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-violet-100 bg-white text-ink-700 hover:bg-violet-50'}`}
              >
                <span className="inline-flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-violet-600" strokeWidth={2.2} />
                  {t('categories')}
                </span>
                <ArrowRight className="h-4 w-4 text-violet-500 rtl:rotate-180" strokeWidth={2.2} />
              </Link>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
