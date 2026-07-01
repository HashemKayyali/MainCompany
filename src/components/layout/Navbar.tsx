import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Search,
  ShieldCheck,
  ShoppingCart,
  Tag,
  User2,
  X,
} from 'lucide-react'
import { BRAND_ICON, BRAND_LOGO_HORIZONTAL } from '../../config/brand'
import { useAuth } from '../../contexts/AuthContext'
import { useCategoriesData, useProductsData } from '../../contexts/DataContext'
import { useRentalCart } from '../../contexts/RentalCartContext'
import { useUser } from '../../contexts/UserContext'
import { useI18n } from '../../contexts/LanguageContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { preloadRoute } from '../../utils/route-preload'
import LanguageSwitcher from './LanguageSwitcher'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Services' },
  { to: '/custom-builds', label: 'Custom Builds' },
  { to: '/customers', label: 'Customers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

type SearchResult = {
  type: 'category' | 'product'
  label: string
  to: string
  meta: string
  image?: string
}

function initialsOf(name?: string | null, email?: string | null) {
  const source = (name || '').trim() || (email || '').trim()
  if (!source) return 'U'
  const parts = source.split(/[\s@._-]+/).filter(Boolean)
  if (parts.length === 0) return source.slice(0, 2).toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/** Brand initials badge — replaces the plain avatar chip. */
function Avatar({
  name,
  email,
  className = 'h-8 w-8 text-[12px]',
  ring = 'ring-2 ring-white/40',
}: {
  name?: string | null
  email?: string | null
  className?: string
  ring?: string
}) {
  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full font-display font-black text-white ${ring} ${className}`}
      style={{ background: 'linear-gradient(140deg, #7c3aed 0%, #9333ea 45%, #d946ef 100%)' }}
      aria-hidden="true"
    >
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15" />
      <span className="relative tracking-tight">{initialsOf(name, email)}</span>
    </span>
  )
}

function BrandLogo({ overHero, compact = false }: { overHero: boolean; compact?: boolean }) {
  // Use the approved full logo asset as one image so the wordmark never changes
  // between English and Arabic modes. The only allowed change is color treatment:
  // white over dark hero sections, original colored/black logo after scrolling.
  const logoSize = compact
    ? 'h-[38px] w-[176px]'
    : 'h-[48px] w-[220px] sm:h-[52px] sm:w-[238px]'
  const logoTone = overHero ? 'eventies-logo-full--hero' : 'eventies-logo-full--original'

  return (
    <span className="eventies-logo-lockup inline-flex shrink-0 items-center" dir="ltr" aria-hidden="true">
      <img
        src={BRAND_LOGO_HORIZONTAL}
        alt=""
        width={238}
        height={52}
        loading="eager"
        decoding="async"
        className={`${logoSize} eventies-logo-full ${logoTone} block shrink-0 object-contain transition-[filter] duration-300`}
        onError={event => {
          const image = event.currentTarget
          if (image.dataset.fallbackLogoIcon === 'true') return
          image.dataset.fallbackLogoIcon = 'true'
          image.src = BRAND_ICON
          image.className = `${compact ? 'h-10 w-10' : 'h-12 w-12'} eventies-logo-icon ${logoTone} block shrink-0 object-contain transition-[filter] duration-300`
        }}
      />
    </span>
  )
}

export default function Navbar() {
  const location = useLocation()
  const { pathname, search, hash } = location
  const navigate = useNavigate()
  const { categories } = useCategoriesData()
  const { products, getProductsByCategory } = useProductsData()
  const { isLoggedIn, currentUser, logout } = useUser()
  const { isAuth } = useAuth()
  const { itemCount } = useRentalCart()
  const { translateText, dir } = useI18n()

  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catsOpen, setCatsOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const catsRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)
  const fastNavIntentRef = useRef<{ to: string; at: number } | null>(null)

  const hasDarkHero =
    pathname === '/' ||
    pathname === '/products' ||
    pathname === '/categories' ||
    pathname === '/customers' ||
    pathname === '/custom-builds' ||
    pathname === '/gallery' ||
    pathname === '/about' ||
    pathname === '/contact'
  const overHero = hasDarkHero && !scrolled
  const cartCount = itemCount > 99 ? '99+' : String(itemCount)
  const userName = currentUser?.name?.trim() || ''
  const emailName = currentUser?.email?.split('@')[0]?.replace(/[._-]+/g, ' ').trim() || ''
  const accountButtonLabel = userName.split(/\s+/)[0] || emailName.split(/\s+/)[0] || translateText('My Account')
  const isArabic = dir === 'rtl'
  const tr = useCallback((value: string) => translateText(value), [translateText])
  const serviceCountLabel = useCallback(
    (count: number) => `${count} ${translateText(count === 1 ? 'service' : 'services')}`,
    [translateText]
  )

  useBodyScrollLock(mobileOpen)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setCatsOpen(false)
    setUserOpen(false)
    setSearchFocused(false)
    setQuery('')
  }, [pathname])

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (catsRef.current && !catsRef.current.contains(target)) setCatsOpen(false)
      if (userRef.current && !userRef.current.contains(target)) setUserOpen(false)
      if (searchRef.current && !searchRef.current.contains(target)) setSearchFocused(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
        setSearchFocused(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const normalizeNavTarget = useCallback((to: string) => {
    if (typeof window === 'undefined') return to
    try {
      const url = new URL(to, window.location.origin)
      if (url.origin !== window.location.origin) return to
      return `${url.pathname}${url.search}${url.hash}`
    } catch {
      return to
    }
  }, [])

  const runFastNav = useCallback(
    (to: string, afterNavigate?: () => void) => {
      const target = normalizeNavTarget(to)
      afterNavigate?.()
      preloadRoute(to)

      if (target === `${pathname}${search}${hash}`) return

      fastNavIntentRef.current = {
        to: target,
        at: typeof performance !== 'undefined' ? performance.now() : Date.now(),
      }
      navigate(to)
    },
    [hash, navigate, normalizeNavTarget, pathname, search]
  )

  const fastNavProps = useCallback(
    (to: string, afterNavigate?: () => void) => ({
      onPointerDown: (event: ReactPointerEvent<HTMLAnchorElement>) => {
        if (event.pointerType === 'touch') return
        if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
        if (event.currentTarget.target && event.currentTarget.target !== '_self') return

        event.preventDefault()
        runFastNav(to, afterNavigate)
      },
      onClick: (event: ReactMouseEvent<HTMLAnchorElement>) => {
        const target = normalizeNavTarget(to)
        const intent = fastNavIntentRef.current
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now()

        if (intent?.to === target && now - intent.at < 900) {
          event.preventDefault()
          return
        }

        afterNavigate?.()
        preloadRoute(to)
      },
    }),
    [normalizeNavTarget, runFastNav]
  )

  const active = useCallback(
    (to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to.split('#')[0])),
    [pathname]
  )

  const categoryList = useMemo(
    () =>
      categories
        .filter(category => category.slug.trim().length > 0)
        .map(category => ({ ...category, count: getProductsByCategory(category.id).length }))
        .sort((a, b) => b.count - a.count),
    [categories, getProductsByCategory]
  )

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 1) return []

    const catHits: SearchResult[] = categoryList
      .filter(category => category.name.toLowerCase().includes(q))
      .slice(0, 3)
      .map(category => ({
        type: 'category',
        label: category.name,
        to: `/categories/${encodeURIComponent(category.slug)}`,
        meta: `${category.count} ${category.count === 1 ? 'service' : 'services'}`,
      }))

    const prodHits: SearchResult[] = products
      .filter(
        product =>
          product.name.toLowerCase().includes(q) ||
          (product.shortDescription || '').toLowerCase().includes(q) ||
          (product.categoryTags || []).some(tag => tag.toLowerCase().includes(q))
      )
      .slice(0, 6)
      .map(product => ({
        type: 'product',
        label: product.name,
        to: `/products/${product.slug}`,
        meta: categories.find(category => category.id === product.categoryId)?.name || 'Service',
        image: product.heroImage,
      }))

    return [...catHits, ...prodHits].slice(0, 8)
  }, [query, categoryList, products, categories])

  const showSuggestions = searchFocused && query.trim().length >= 1
  useEffect(() => setActiveIndex(-1), [query])

  const runSearch = useCallback(() => {
    const chosen = activeIndex >= 0 ? results[activeIndex] : results[0]
    const closeSearch = () => {
      setSearchFocused(false)
      setQuery('')
    }

    if (chosen) runFastNav(chosen.to, closeSearch)
    else if (query.trim()) runFastNav('/products', closeSearch)
    else closeSearch()
  }, [activeIndex, results, query, runFastNav])

  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex(index => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex(index => Math.max(index - 1, -1))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      runSearch()
    } else if (event.key === 'Escape') {
      setSearchFocused(false)
      searchInputRef.current?.blur()
    }
  }

  // ── Surfaces ─────────────────────────────────────────────────────────────────
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

  // More opaque utility buttons so they don't blend into the hero.
  const utilityBtn = overHero
    ? 'border-white/30 bg-white/[0.16] text-white hover:bg-white/25'
    : 'border-violet-200 bg-white text-ink-800 hover:border-violet-300 hover:bg-violet-50'

  // Search is a near-white pill in both states (clear and legible).
  const searchSurface = overHero
    ? 'border-white/50 bg-white/95 shadow-[0_8px_24px_-12px_rgba(8,3,26,0.6)] focus-within:border-violet-300 focus-within:bg-white'
    : 'border-violet-200 bg-white focus-within:border-violet-300'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className={`border-b transition-colors duration-300 ${barSurface}`} dir="ltr">
        <div className={`site-container flex h-[74px] items-center gap-4 ${isArabic ? 'nav-shell-ar' : ''}`}>
          {/* Logo — larger */}
          <Link
            to="/"
            onMouseEnter={() => preloadRoute('/')}
            onFocus={() => preloadRoute('/')}
            {...fastNavProps('/')}
            className="flex shrink-0 items-center"
            aria-label={tr('Eventies home')}
          >
            <BrandLogo overHero={overHero} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.slice(0, 1).map(item => {
              const isCurrent = active(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onMouseEnter={() => preloadRoute(item.to)}
                  onFocus={() => preloadRoute(item.to)}
                  {...fastNavProps(item.to)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`relative inline-flex h-9 items-center rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors ${linkColor(isCurrent)}`}
                >
                  {isCurrent && <span className={`absolute inset-0 rounded-full ${activePill}`} />}
                  <span className="relative z-10">{tr(item.label)}</span>
                </Link>
              )
            })}

            <div ref={catsRef} className="relative">
              <button
                type="button"
                onClick={() => setCatsOpen(open => !open)}
                aria-expanded={catsOpen}
                aria-haspopup="menu"
                className={`relative inline-flex h-9 items-center gap-1 rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors ${linkColor(
                  active('/categories') || pathname.includes('#categories')
                )}`}
              >
                {(active('/categories') || catsOpen) && <span className={`absolute inset-0 rounded-full ${activePill}`} />}
                <span className="relative z-10">{tr('Categories')}</span>
                <ChevronDown className={`relative z-10 h-3.5 w-3.5 transition-transform ${catsOpen ? 'rotate-180' : ''}`} strokeWidth={2.4} />
              </button>

              <AnimatePresence>
                {catsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.97 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    dir={dir}
                    className="absolute left-0 top-[calc(100%+12px)] z-50 w-[336px] overflow-hidden rounded-[20px] border border-violet-200/80 bg-white p-2.5 shadow-[0_36px_80px_-26px_rgba(46,10,114,0.45)]"
                    role="menu"
                  >
                    <div
                      className="pointer-events-none absolute inset-x-0 top-0 h-px"
                      style={{ background: 'linear-gradient(90deg, transparent 12%, rgba(168,85,247,0.5) 50%, transparent 88%)' }}
                    />
                    <div className="mb-1.5 flex items-center justify-between px-2.5 pt-1.5">
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">{tr('Browse categories')}</span>
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">{categoryList.length}</span>
                    </div>
                    <div className="max-h-[58vh] overflow-y-auto pr-0.5">
                      {categoryList.map(category => (
                        <Link
                          key={category.id}
                          to={`/categories/${encodeURIComponent(category.slug)}`}
                          onMouseEnter={() => preloadRoute(`/categories/${encodeURIComponent(category.slug)}`)}
                          onFocus={() => preloadRoute(`/categories/${encodeURIComponent(category.slug)}`)}
                          {...fastNavProps(`/categories/${encodeURIComponent(category.slug)}`, () => setCatsOpen(false))}
                          className="group/cat flex items-center gap-3 rounded-[14px] px-2.5 py-2.5 transition-colors hover:bg-violet-50"
                          role="menuitem"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-violet-200/80 bg-gradient-to-br from-violet-100 to-fuchsia-100 text-[1.1rem] transition-transform duration-200 group-hover/cat:scale-105">
                            {category.icon || '✦'}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-display text-[13.5px] font-bold text-ink-900">{category.name}</span>
                            <span className="block text-[11px] font-semibold text-violet-500">
                              {serviceCountLabel(category.count)}
                            </span>
                          </span>
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-violet-500 transition-all duration-200 group-hover/cat:bg-violet-600 group-hover/cat:text-white">
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link
                      to="/categories"
                      onMouseEnter={() => preloadRoute('/categories')}
                      onFocus={() => preloadRoute('/categories')}
                      {...fastNavProps('/categories', () => setCatsOpen(false))}
                      className="mt-1.5 flex items-center justify-center gap-2 rounded-[14px] bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-3 font-display text-[12.5px] font-bold text-white transition-all hover:-translate-y-0.5"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2.2} />
                      {tr('View all categories')}
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.slice(1).map(item => {
              const isCurrent = active(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onMouseEnter={() => preloadRoute(item.to)}
                  onFocus={() => preloadRoute(item.to)}
                  {...fastNavProps(item.to)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`relative inline-flex h-9 items-center rounded-full px-3.5 font-display text-[13px] font-semibold transition-colors ${linkColor(isCurrent)}`}
                >
                  {isCurrent && <span className={`absolute inset-0 rounded-full ${activePill}`} />}
                  <span className="relative z-10">{tr(item.label)}</span>
                </Link>
              )
            })}
          </nav>

          {/* Right cluster: search + utilities */}
          <div className="ml-auto flex items-center gap-2.5">
            {/* Inline search — wider */}
            <div ref={searchRef} className="relative hidden lg:block">
              <div className={`flex h-11 w-[clamp(260px,28vw,430px)] items-center gap-2.5 rounded-full border px-4 transition-all duration-200 ${searchSurface}`}>
                <Search className="h-[18px] w-[18px] shrink-0 text-violet-500" strokeWidth={2.2} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onKeyDown={onSearchKeyDown}
                  placeholder={tr('Search categories or services...')}
                  aria-label={tr('Search categories or services')}
                  dir={dir}
                  className="nav-search-input min-w-0 flex-1 bg-transparent text-[13px] font-normal text-ink-900 outline-none placeholder:text-ink-400 focus:outline-none focus-visible:outline-none"
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
                    className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(460px,92vw)] overflow-hidden rounded-[20px] border border-violet-200/80 bg-white p-2 shadow-[0_36px_80px_-26px_rgba(46,10,114,0.45)]"
                  >
                    {results.length === 0 ? (
                      <div className="px-3 py-6 text-center text-[12.5px] font-medium text-ink-500">
                        {tr('No matches for')} “{query.trim()}”. {tr('Press Enter to browse all services.')}
                      </div>
                    ) : (
                      results.map((result, index) => (
                        <Link
                          key={`${result.type}-${result.to}`}
                          to={result.to}
                          onMouseEnter={() => {
                            setActiveIndex(index)
                            preloadRoute(result.to)
                          }}
                          onFocus={() => preloadRoute(result.to)}
                          {...fastNavProps(result.to, () => {
                            setSearchFocused(false)
                            setQuery('')
                          })}
                          className={`flex items-center gap-3 rounded-[14px] px-2.5 py-2.5 transition-colors ${
                            index === activeIndex ? 'bg-violet-50' : 'hover:bg-violet-50'
                          }`}
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[11px] border border-violet-200 bg-violet-50 text-violet-600">
                            {result.type === 'product' && result.image ? (
                              <img src={result.image} alt="" width={40} height={40} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                            ) : result.type === 'category' ? (
                              <Tag className="h-4 w-4" strokeWidth={2.2} />
                            ) : (
                              <Package className="h-4 w-4" strokeWidth={2.2} />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[13.5px] font-bold text-ink-900">{result.label}</span>
                            <span className="block truncate text-[11px] font-medium text-ink-500">{tr(result.meta)}</span>
                          </span>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${
                              result.type === 'category' ? 'bg-violet-100 text-violet-700' : 'bg-fuchsia-100 text-fuchsia-700'
                            }`}
                          >
                            {tr(result.type === 'category' ? 'Category' : 'Service')}
                          </span>
                        </Link>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <LanguageSwitcher className={`hidden sm:inline-flex ${utilityBtn}`} />

            {/* Request draft */}
            <Link
              to="/rental-cart"
              onMouseEnter={() => preloadRoute('/rental-cart')}
              onFocus={() => preloadRoute('/rental-cart')}
              {...fastNavProps('/rental-cart')}
              aria-label={itemCount > 0 ? `${tr('Request draft')}, ${itemCount} ${tr('items')}` : tr('Request draft')}
              className={`relative inline-flex h-11 items-center gap-2 rounded-full border px-3.5 transition-all ${utilityBtn}`}
            >
              <span className="relative inline-flex">
                <ShoppingCart className="h-[18px] w-[18px]" strokeWidth={2.2} />
                {itemCount > 0 && (
                  <span className="absolute -right-2 -top-2 inline-flex min-w-[1.05rem] items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 px-1 py-[1px] text-[9px] font-bold leading-none text-white ring-2 ring-white/70">
                    {cartCount}
                  </span>
                )}
              </span>
              <span className="hidden font-display text-[13px] font-semibold sm:inline">{tr('Request Draft')}</span>
            </Link>

            {/* User / Login */}
            {isLoggedIn ? (
              <div ref={userRef} className="relative">
                <button
                  type="button"
                  onClick={() => setUserOpen(open => !open)}
                  aria-expanded={userOpen}
                  aria-label={tr('Account menu')}
                  className={`inline-flex h-11 items-center gap-2 rounded-full border pl-1.5 pr-3 transition-all ${utilityBtn}`}
                >
                  <Avatar name={currentUser?.name} email={currentUser?.email} className="h-8 w-8 text-[12px]" ring={overHero ? 'ring-2 ring-white/50' : 'ring-2 ring-white'} />
                  <span className="hidden max-w-[96px] truncate font-display text-[13px] font-bold md:inline">
                    {accountButtonLabel}
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userOpen ? 'rotate-180' : ''}`} strokeWidth={2.2} />
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      dir={dir}
                      className="absolute right-0 top-[calc(100%+12px)] z-50 w-[272px] overflow-hidden rounded-[20px] border border-violet-200/80 bg-white shadow-[0_36px_80px_-26px_rgba(46,10,114,0.45)]"
                    >
                      <div className="flex items-center gap-3 border-b border-violet-100 bg-gradient-to-br from-violet-100 to-fuchsia-50 px-4 py-4">
                        <Avatar name={currentUser?.name} email={currentUser?.email} className="h-11 w-11 text-[15px]" ring="ring-2 ring-white" />
                        <span className="min-w-0">
                          <span className="block truncate font-display text-[13.5px] font-bold text-ink-900">{currentUser?.name || emailName || tr('User')}</span>
                          <span className="block truncate text-[11px] font-medium text-ink-500">{currentUser?.email || ''}</span>
                        </span>
                      </div>
                      <div className="p-2">
                        {[
                          { to: '/my-requests', label: 'My Requests', icon: Package },
                          { to: '/profile', label: 'Profile', icon: User2 },
                          ...(isAuth ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
                        ].map(item => {
                          const Icon = item.icon
                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              onMouseEnter={() => preloadRoute(item.to)}
                              onFocus={() => preloadRoute(item.to)}
                              {...fastNavProps(item.to, () => setUserOpen(false))}
                              className="flex items-center gap-3 rounded-[13px] px-3 py-2.5 font-display text-[12.5px] font-semibold text-ink-800 transition-colors hover:bg-violet-50 hover:text-violet-900"
                            >
                              <Icon className="h-4 w-4 text-violet-600" strokeWidth={2} />
                              {tr(item.label)}
                            </Link>
                          )
                        })}
                        <div className="my-1 h-px bg-violet-100" />
                        <button
                          type="button"
                          onClick={() => void logout()}
                          className="flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left font-display text-[12.5px] font-semibold text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" strokeWidth={2} />
                          {tr('Logout')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                onMouseEnter={() => preloadRoute('/login')}
                onFocus={() => preloadRoute('/login')}
                {...fastNavProps('/login')}
                className={`group inline-flex h-11 items-center gap-2 rounded-full border pl-1.5 pr-4 font-bold transition-all hover:-translate-y-0.5 ${
                  overHero
                    ? 'border-white/45 bg-white text-ink-900'
                    : 'border-violet-200 bg-white text-ink-900 hover:border-violet-300 hover:shadow-[0_12px_26px_-12px_rgba(124,58,237,0.45)]'
                }`}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_6px_14px_-6px_rgba(192,38,211,0.7)] transition-transform group-hover:scale-105">
                  <User2 className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <span className="hidden font-display text-[13px] sm:inline">{tr('Login')}</span>
              </Link>
            )}

            {/* Mobile toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen(open => !open)}
              aria-label={tr('Menu')}
              aria-expanded={mobileOpen}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-all lg:hidden ${utilityBtn}`}
            >
              {mobileOpen ? <X className="h-5 w-5" strokeWidth={2.2} /> : <Menu className="h-5 w-5" strokeWidth={2.2} />}
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
              className="fixed inset-x-0 top-0 z-50 max-h-[92vh] overflow-y-auto rounded-b-[24px] border-b border-violet-100 bg-white p-4 shadow-2xl lg:hidden"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', stiffness: 360, damping: 36 }}
              role="dialog"
              aria-modal="true"
              aria-label={tr('Mobile navigation')}
            >
              <div className="mb-3 flex items-center justify-between">
                <BrandLogo overHero={false} compact />
                <div className="flex items-center gap-2">
                  <LanguageSwitcher compact className="border-violet-200 bg-white text-ink-700" />
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label={tr('Close menu')}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-violet-200 bg-white text-ink-700"
                  >
                    <X className="h-5 w-5" strokeWidth={2.2} />
                  </button>
                </div>
              </div>

              <form
                onSubmit={event => {
                  event.preventDefault()
                  runFastNav('/products', () => setMobileOpen(false))
                }}
                className="mb-3 flex h-12 items-center gap-2 rounded-full border border-violet-200 bg-white px-4"
              >
                <Search className="h-4 w-4 text-violet-500" strokeWidth={2.2} />
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder={tr('Search categories or services...')}
                  dir={dir}
                  className="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
                  aria-label={tr('Search')}
                />
              </form>

              {query.trim().length >= 1 && results.length > 0 && (
                <div className="mb-3 overflow-hidden rounded-2xl border border-violet-100">
                  {results.map(result => (
                    <Link
                      key={`m-${result.type}-${result.to}`}
                      to={result.to}
                      onMouseEnter={() => preloadRoute(result.to)}
                      onFocus={() => preloadRoute(result.to)}
                      {...fastNavProps(result.to, () => setMobileOpen(false))}
                      className="flex items-center gap-3 border-b border-violet-50 px-3 py-2.5 last:border-0 hover:bg-violet-50"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px] border border-violet-200 bg-violet-50 text-violet-600">
                        {result.type === 'product' && result.image ? (
                          <img src={result.image} alt="" width={32} height={32} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                        ) : result.type === 'category' ? (
                          <Tag className="h-3.5 w-3.5" strokeWidth={2.2} />
                        ) : (
                          <Package className="h-3.5 w-3.5" strokeWidth={2.2} />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-bold text-ink-900">{result.label}</span>
                        <span className="block truncate text-[10.5px] text-ink-500">{tr(result.meta)}</span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[8.5px] font-bold uppercase tracking-[0.1em] ${
                          result.type === 'category' ? 'bg-violet-100 text-violet-700' : 'bg-fuchsia-100 text-fuchsia-700'
                        }`}
                      >
                        {tr(result.type === 'category' ? 'Category' : 'Service')}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {[{ to: '/', label: 'Home' }, ...NAV_LINKS.slice(1)].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onMouseEnter={() => preloadRoute(item.to)}
                    onFocus={() => preloadRoute(item.to)}
                    {...fastNavProps(item.to, () => setMobileOpen(false))}
                    className={`inline-flex min-h-[46px] items-center rounded-xl border px-3.5 font-display text-[13px] font-semibold transition-all ${
                      active(item.to) ? 'border-violet-300 bg-violet-50 text-violet-900' : 'border-violet-100 bg-white text-ink-700 hover:bg-violet-50'
                    }`}
                  >
                    {tr(item.label)}
                  </Link>
                ))}
              </div>

              <div className="mt-3 font-display text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">{tr('Categories')}</div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {categoryList.slice(0, 8).map(category => (
                  <Link
                    key={category.id}
                    to={`/categories/${encodeURIComponent(category.slug)}`}
                    onMouseEnter={() => preloadRoute(`/categories/${encodeURIComponent(category.slug)}`)}
                    onFocus={() => preloadRoute(`/categories/${encodeURIComponent(category.slug)}`)}
                    {...fastNavProps(`/categories/${encodeURIComponent(category.slug)}`, () => setMobileOpen(false))}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-3 py-1.5 font-display text-[12px] font-semibold text-ink-700 hover:bg-violet-50"
                  >
                    <span>{category.icon || '*'}</span>
                    {category.name}
                  </Link>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-1.5">
                <Link
                  to="/rental-cart"
                  onMouseEnter={() => preloadRoute('/rental-cart')}
                  onFocus={() => preloadRoute('/rental-cart')}
                  {...fastNavProps('/rental-cart', () => setMobileOpen(false))}
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white font-display text-[13px] font-semibold text-ink-800"
                >
                  <ShoppingCart className="h-4 w-4" strokeWidth={2} /> {tr('Request Draft')} {itemCount > 0 && `(${cartCount})`}
                </Link>
                {isLoggedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileOpen(false)
                      void logout()
                    }}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 font-display text-[13px] font-semibold text-red-600"
                  >
                    <LogOut className="h-4 w-4" strokeWidth={2} /> {tr('Logout')}
                  </button>
                ) : (
                  <Link
                    to="/login"
                    onMouseEnter={() => preloadRoute('/login')}
                    onFocus={() => preloadRoute('/login')}
                    {...fastNavProps('/login', () => setMobileOpen(false))}
                    className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white font-display text-[13px] font-semibold text-ink-800 transition-all hover:bg-violet-50"
                  >
                    <User2 className="h-4 w-4 text-violet-600" strokeWidth={2} />
                    {tr('Login')}
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
