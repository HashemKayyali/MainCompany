import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  ChevronDown,
  FileText,
  GalleryVerticalEnd,
  LayoutGrid,
  LogOut,
  Menu,
  MessageCircleMore,
  Search,
  ShieldCheck,
  ShoppingCart,
  User2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useAuth } from '../../contexts/AuthContext'
import { usePurchaseQuote } from '../../contexts/PurchaseQuoteContext'
import { useRentalCart } from '../../contexts/RentalCartContext'
import { useUser } from '../../contexts/UserContext'
import { useData } from '../../contexts/DataContext'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import SearchDialog from '../ui/SearchDialog'
import UserAvatar from '../ui/UserAvatar'

type NavChild = {
  to: string
  label: string
  description: string
  icon: LucideIcon
  meta: string
}

type DesktopNavItem = {
  key: string
  label: string
  to?: string
  children?: NavChild[]
  eyebrow?: string
  title?: string
  body?: string
  ctaLabel?: string
  ctaTo?: string
}

const MOBILE_NAV = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/customers', label: 'Customers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function getDesktopNavActive(
  item: DesktopNavItem,
  isRouteActive: (target: string) => boolean
) {
  if (item.to) return isRouteActive(item.to)
  return item.children?.some(child => isRouteActive(child.to)) ?? false
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const { isAuth } = useAuth()
  const { products, customers, galleryAlbums } = useData()
  const purchaseQuote = usePurchaseQuote()
  const rentalCart = useRentalCart()
  const { isLoggedIn, currentUser, logout } = useUser()

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null)
  const [userMenu, setUserMenu] = useState(false)
  const [userMenuPosition, setUserMenuPosition] = useState<{
    top: number
    left: number
    placement: 'top' | 'bottom'
  } | null>(null)

  const userMenuAnchorRef = useRef<HTMLDivElement>(null)
  const userMenuPopoverRef = useRef<HTMLDivElement>(null)
  const navbarBarRef = useRef<HTMLDivElement>(null)
  const desktopPanelFirstLinkRef = useRef<HTMLAnchorElement>(null)
  const desktopOpenTimerRef = useRef<number | null>(null)
  const desktopCloseTimerRef = useRef<number | null>(null)

  useBodyScrollLock(open)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(value => !value)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setDesktopMenu(null)
    setUserMenu(false)
  }, [pathname])

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false)
      if (window.innerWidth < 1024) setDesktopMenu(null)
    }
    window.addEventListener('resize', onResize, { passive: true })
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (!userMenu) return
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (!userMenuAnchorRef.current?.contains(target) && !userMenuPopoverRef.current?.contains(target)) {
        setUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [userMenu])

  const updateUserMenuPosition = useCallback(() => {
    const anchor = userMenuAnchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    const viewportPadding = 16
    const menuWidth = 276
    const menuHeight = userMenuPopoverRef.current?.offsetHeight ?? 260
    const canPlaceAbove = rect.top - 10 - menuHeight > viewportPadding
    const shouldPlaceAbove =
      rect.bottom + 10 + menuHeight > window.innerHeight - viewportPadding && canPlaceAbove
    const left = Math.min(
      window.innerWidth - viewportPadding - menuWidth,
      Math.max(viewportPadding, rect.right - menuWidth)
    )
    const unclampedTop = shouldPlaceAbove ? rect.top - menuHeight - 10 : rect.bottom + 10
    const top = Math.max(viewportPadding, Math.min(unclampedTop, window.innerHeight - viewportPadding - menuHeight))
    setUserMenuPosition({ top, left, placement: shouldPlaceAbove ? 'top' : 'bottom' })
  }, [])

  useEffect(() => {
    if (!userMenu) { setUserMenuPosition(null); return }
    const frame = window.requestAnimationFrame(() => updateUserMenuPosition())
    window.addEventListener('resize', updateUserMenuPosition)
    window.addEventListener('scroll', updateUserMenuPosition, true)
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updateUserMenuPosition)
      window.removeEventListener('scroll', updateUserMenuPosition, true)
    }
  }, [updateUserMenuPosition, userMenu])

  useEffect(
    () => () => {
      if (desktopOpenTimerRef.current) window.clearTimeout(desktopOpenTimerRef.current)
      if (desktopCloseTimerRef.current) window.clearTimeout(desktopCloseTimerRef.current)
    },
    []
  )

  useEffect(() => {
    if (open || searchOpen || userMenu) setDesktopMenu(null)
  }, [open, searchOpen, userMenu])

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return
    const root = document.documentElement
    const navbarBar = navbarBarRef.current
    if (!navbarBar) return
    const updateNavbarHeight = () => {
      const rect = navbarBar.getBoundingClientRect()
      root.style.setProperty('--app-navbar-height', `${Math.round(rect.bottom)}px`)
    }
    updateNavbarHeight()
    const frame = window.requestAnimationFrame(updateNavbarHeight)
    const timeout = window.setTimeout(updateNavbarHeight, 120)
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateNavbarHeight) : null
    resizeObserver?.observe(navbarBar)
    window.addEventListener('resize', updateNavbarHeight, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateNavbarHeight)
      root.style.removeProperty('--app-navbar-height')
    }
  }, [])

  const active = (target: string) =>
    target === '/' ? pathname === '/' : pathname.startsWith(target)

  const focus =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const firstName = currentUser?.name?.split(' ')[0] || 'User'

  // ── Hero mode: transparent nav floating above the homepage hero ──
  const isHome = pathname === '/'
  const heroMode = isHome && !scrolled

  // ── Full-width bar background ──
  const navBarBg = scrolled
    ? isDark
      ? 'border-b border-white/[0.07] bg-[rgba(3,5,14,0.92)] backdrop-blur-2xl shadow-[0_1px_32px_rgba(0,0,0,0.45)]'
      : 'border-b border-violet-200/50 bg-white/95 backdrop-blur-xl shadow-sm'
    : isHome
      ? '' // fully transparent on hero
      : isDark
        ? 'border-b border-white/[0.04] bg-[rgba(3,5,14,0.82)] backdrop-blur-lg'
        : 'border-b border-violet-100/40 bg-white/80 backdrop-blur-md'

  // ── Utility button surface (search, login, etc.) ──
  const utilitySurface = heroMode
    ? 'border-white/[0.13] bg-white/[0.07] text-white/78 hover:border-white/[0.22] hover:bg-white/[0.13] hover:text-white'
    : isDark
      ? 'border-white/10 bg-white/[0.04] text-white/75 hover:border-violet-300/18 hover:bg-white/[0.07] hover:text-white'
      : 'border-violet-200/70 bg-white/82 text-gray-800 hover:border-violet-300 hover:bg-white'

  // ── Mobile menu tiles ──
  const mobileTile = isDark
    ? 'border-white/10 bg-white/[0.05] text-purple-100/80 hover:text-white hover:bg-white/[0.08]'
    : 'border-violet-200/70 bg-white/80 text-gray-700 hover:text-gray-900 hover:bg-white'

  // ── Desktop nav item text color ──
  const menuLink = (isActive: boolean) =>
    isActive
      ? heroMode ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
      : heroMode
        ? 'text-white/62 hover:text-white'
        : isDark ? 'text-purple-100/65 hover:text-white' : 'text-gray-500 hover:text-gray-900'

  const desktopTriggerClass = (isActive: boolean, isOpen: boolean) =>
    isActive || isOpen
      ? heroMode ? 'text-white' : isDark ? 'text-white' : 'text-gray-900'
      : heroMode
        ? 'text-white/62 hover:text-white'
        : isDark ? 'text-purple-100/65 hover:text-white' : 'text-gray-500 hover:text-gray-900'

  // ── Active nav item pill ──
  const navActivePill = heroMode
    ? 'bg-white/10 border border-white/[0.15]'
    : isDark
      ? 'bg-violet-500/[0.14] border border-violet-400/[0.18]'
      : 'bg-violet-50 border border-violet-200/70'

  // ── Logo colors ──
  const logoText = isDark || heroMode ? 'text-white' : 'text-gray-900'
  const logoMeta = heroMode ? 'text-white/38' : isDark ? 'text-purple-100/52' : 'text-violet-600/70'

  const desktopNav = useMemo<DesktopNavItem[]>(
    () => [
      { key: 'home', label: 'Home', to: '/' },
      {
        key: 'explore',
        label: 'Explore',
        eyebrow: 'Explore',
        title: 'Marketplace paths',
        body: 'Products, trusted brands, and visual highlights in one cleaner discovery flow.',
        ctaLabel: 'Products',
        ctaTo: '/products',
        children: [
          {
            to: '/products',
            label: 'Products',
            description: 'Rental-ready activations and premium event setups.',
            icon: LayoutGrid,
            meta: `${products.length}+ items`,
          },
          {
            to: '/customers',
            label: 'Customers',
            description: 'Trusted brands, partners, and credibility highlights.',
            icon: Users,
            meta: `${customers.length}+ brands`,
          },
          {
            to: '/gallery',
            label: 'Gallery',
            description: 'Recent visuals, setups, and standout moments.',
            icon: GalleryVerticalEnd,
            meta: galleryAlbums.length > 0 ? `${galleryAlbums.length} albums` : 'Highlights',
          },
        ],
      },
      {
        key: 'company',
        label: 'Company',
        eyebrow: 'Company',
        title: 'About, support, and planning',
        body: 'Understand the platform and reach the team for tailored help.',
        ctaLabel: 'Contact',
        ctaTo: '/contact',
        children: [
          {
            to: '/about',
            label: 'About',
            description: 'How the marketplace works and what shapes the experience.',
            icon: ShieldCheck,
            meta: 'Overview',
          },
          {
            to: '/contact',
            label: 'Contact',
            description: 'Talk to the team about a brief, timeline, or recommendation.',
            icon: MessageCircleMore,
            meta: 'Support',
          },
        ],
      },
    ],
    [customers.length, galleryAlbums.length, products.length]
  )

  const activeDesktopItem = useMemo(
    () => desktopNav.find(item => item.key === desktopMenu) ?? null,
    [desktopMenu, desktopNav]
  )

  const clearDesktopTimers = useCallback(() => {
    if (desktopOpenTimerRef.current) { window.clearTimeout(desktopOpenTimerRef.current); desktopOpenTimerRef.current = null }
    if (desktopCloseTimerRef.current) { window.clearTimeout(desktopCloseTimerRef.current); desktopCloseTimerRef.current = null }
  }, [])

  const openDesktopMenu = useCallback(
    (key: string) => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return
      clearDesktopTimers()
      desktopOpenTimerRef.current = window.setTimeout(() => setDesktopMenu(key), 36)
    },
    [clearDesktopTimers]
  )

  const scheduleDesktopClose = useCallback(
    (immediate = false) => {
      clearDesktopTimers()
      if (immediate) { setDesktopMenu(null); return }
      desktopCloseTimerRef.current = window.setTimeout(() => setDesktopMenu(null), 140)
    },
    [clearDesktopTimers]
  )

  const cartItemCount = rentalCart.itemCount
  const cartHasItems = cartItemCount > 0
  const cartCountLabel = cartItemCount > 99 ? '99+' : String(cartItemCount)
  const cartActive = pathname.startsWith('/rental-cart') || pathname.startsWith('/checkout')
  const quoteItemCount = purchaseQuote.itemCount
  const quoteHasItems = quoteItemCount > 0
  const quoteCountLabel = quoteItemCount > 99 ? '99+' : String(quoteItemCount)
  const quoteActive = pathname.startsWith('/purchase-quote')

  const cartSurface = cartActive
    ? isDark
      ? 'border-cyan-300/24 bg-[linear-gradient(135deg,rgba(8,30,44,0.94),rgba(11,18,38,0.98))] text-white shadow-[0_18px_54px_rgba(2,8,18,0.46)]'
      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.94))] text-gray-900 shadow-[0_16px_40px_rgba(124,58,237,0.14)]'
    : cartHasItems
      ? isDark
        ? 'border-cyan-300/18 bg-[linear-gradient(135deg,rgba(8,25,38,0.9),rgba(13,18,34,0.94))] text-white hover:border-cyan-300/30'
        : 'border-violet-300/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.92))] text-gray-900 hover:border-violet-300/55'
      : utilitySurface

  const quoteSurface = quoteActive
    ? isDark
      ? 'border-fuchsia-300/24 bg-[linear-gradient(135deg,rgba(39,15,57,0.96),rgba(16,14,36,0.98))] text-white shadow-[0_18px_54px_rgba(17,5,28,0.42)]'
      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,255,0.94))] text-gray-900 shadow-[0_16px_40px_rgba(168,85,247,0.12)]'
    : isDark
      ? 'border-fuchsia-300/16 bg-[linear-gradient(135deg,rgba(31,14,42,0.92),rgba(14,14,31,0.96))] text-white hover:border-fuchsia-300/28'
      : 'border-violet-300/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,255,0.92))] text-gray-900 hover:border-violet-300/50'

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 w-full">
      {/* ── Main bar: full-width, transitions based on scroll + heroMode ── */}
      <div className={`pointer-events-auto w-full transition-all duration-500 ${navBarBg}`}>
        <div className="relative mx-auto max-w-[90rem]">

          {/* ═══ NAV BAR CONTENT ═══ */}
          <div
            ref={navbarBarRef}
            className="flex h-[3.75rem] items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 lg:px-10"
          >
            {/* ── Logo ── */}
            <Link
              to="/"
              className={`flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90 lg:min-w-[160px] ${focus}`}
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/12 bg-[linear-gradient(145deg,#7c3aed_0%,#d946ef_48%,#22d3ee_112%)] shadow-[0_16px_36px_rgba(76,29,149,0.38)]">
                <div className="absolute inset-x-2 top-1.5 h-3.5 rounded-full bg-white/22 blur-md" />
                <span className="relative text-[11px] font-black tracking-[0.22em] text-white">BL</span>
              </div>
              <div className="hidden min-w-0 leading-none sm:block">
                <div className={`font-display text-[11px] font-bold uppercase tracking-[0.2em] transition-colors duration-500 ${logoText}`}>
                  Bike <span className="text-violet-300">Land</span>
                </div>
                <div className={`mt-1 text-[9px] uppercase tracking-[0.16em] transition-colors duration-500 ${logoMeta}`}>
                  Marketplace
                </div>
              </div>
            </Link>

            {/* ── Desktop Nav (center) ── */}
            <div className="hidden flex-1 justify-center lg:flex">
              <div className="flex items-center gap-0.5">
                {desktopNav.map(item => {
                  const isCurrent = getDesktopNavActive(item, active)
                  const isOpen = desktopMenu === item.key
                  const showPill = desktopMenu ? isOpen : isCurrent

                  if (item.to) {
                    return (
                      <Link
                        key={item.key}
                        to={item.to}
                        aria-current={isCurrent ? 'page' : undefined}
                        className={`relative inline-flex h-10 items-center justify-center rounded-[13px] px-4 text-[12.5px] font-medium tracking-[-0.01em] transition-all duration-300 ${menuLink(isCurrent)} ${focus}`}
                      >
                        {showPill && (
                          <motion.div
                            layoutId="desktop-nav-active"
                            className={`absolute inset-0 rounded-[13px] ${navActivePill}`}
                            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                          />
                        )}
                        <span className="relative z-10">{item.label}</span>
                      </Link>
                    )
                  }

                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-expanded={isOpen}
                      aria-haspopup="menu"
                      onMouseEnter={() => openDesktopMenu(item.key)}
                      onMouseLeave={() => scheduleDesktopClose()}
                      onFocus={() => openDesktopMenu(item.key)}
                      onKeyDown={event => {
                        if (event.key === 'Escape') { scheduleDesktopClose(true); return }
                        if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
                          event.preventDefault()
                          if (isOpen) {
                            desktopPanelFirstLinkRef.current?.focus()
                          } else {
                            openDesktopMenu(item.key)
                            window.setTimeout(() => desktopPanelFirstLinkRef.current?.focus(), 60)
                          }
                        }
                      }}
                      className={`relative inline-flex h-10 items-center justify-center gap-2 rounded-[13px] px-4 text-[12.5px] font-medium tracking-[-0.01em] transition-all duration-300 ${desktopTriggerClass(isCurrent, isOpen)} ${focus}`}
                    >
                      {showPill && (
                        <motion.div
                          layoutId="desktop-nav-active"
                          className={`absolute inset-0 rounded-[13px] ${navActivePill}`}
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      )}
                      <span className="relative z-10">{item.label}</span>
                      <ChevronDown
                        className={`relative z-10 h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        strokeWidth={2}
                      />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Actions (right) ── */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:min-w-[160px]">
              {/* Search compact */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`hidden h-9 items-center gap-2 rounded-[12px] border px-3 text-[12px] font-medium transition-all sm:inline-flex xl:hidden ${utilitySurface} ${focus}`}
                aria-label="Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              {/* Search with label */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`hidden h-9 items-center gap-2.5 rounded-[12px] border px-3.5 text-[12px] font-medium transition-all xl:inline-flex ${utilitySurface} ${focus}`}
                aria-label="Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Search</span>
                <span className={`rounded-md border px-2 py-0.5 text-[8.5px] font-mono tracking-[0.1em] ${
                  heroMode
                    ? 'border-white/12 bg-white/[0.06] text-white/38'
                    : isDark
                      ? 'border-white/10 bg-white/[0.05] text-purple-100/46'
                      : 'border-violet-200 bg-violet-50/80 text-violet-500'
                }`}>
                  ⌘K
                </span>
              </button>

              {/* Login / User */}
              {isLoggedIn ? (
                <div ref={userMenuAnchorRef} className="relative hidden sm:block">
                  <button
                    onClick={() => { if (!userMenu) updateUserMenuPosition(); setUserMenu(v => !v) }}
                    className={`inline-flex h-9 items-center gap-2 rounded-[12px] border pl-2 pr-3 transition-all ${utilitySurface} ${focus}`}
                  >
                    <div className={`flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border ${
                      heroMode
                        ? 'border-white/18 bg-white/10 text-white'
                        : isDark
                          ? 'border-violet-300/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.22),rgba(236,72,153,0.12))] text-white'
                          : 'border-violet-300/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.08))] text-violet-700'
                    }`}>
                      <UserAvatar
                        name={currentUser?.name}
                        email={currentUser?.email}
                        avatarUrl={currentUser?.avatarUrl}
                        avatarStyle={currentUser?.avatarStyle}
                        avatarSeed={currentUser?.avatarSeed}
                        avatarOptions={currentUser?.avatarOptions}
                        className="h-full w-full rounded-full"
                        fallbackClassName={
                          isDark
                            ? 'bg-[linear-gradient(135deg,rgba(124,58,237,0.52),rgba(236,72,153,0.35))] text-white'
                            : 'bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.12))] text-violet-700'
                        }
                        imageClassName="object-cover"
                      />
                    </div>
                    <span className="hidden text-[12px] font-medium md:inline">{firstName}</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform ${userMenu ? 'rotate-180' : ''} ${
                        heroMode ? 'text-white/45' : isDark ? 'text-purple-100/46' : 'text-violet-600/56'
                      }`}
                      strokeWidth={2}
                    />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden h-9 items-center rounded-[12px] border px-4 text-[12px] font-medium transition-all sm:inline-flex ${utilitySurface} ${focus}`}
                >
                  Login
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/rental-cart"
                className={`relative inline-flex h-9 items-center gap-2 rounded-[12px] border px-2.5 transition-all sm:px-3 ${cartSurface} ${focus}`}
                aria-label={cartHasItems ? `Cart · ${cartItemCount}` : 'Cart'}
              >
                <span className={`relative flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border ${
                  heroMode
                    ? 'border-white/12 bg-white/[0.05]'
                    : isDark ? 'border-cyan-300/18 bg-white/[0.05]' : 'border-violet-200/80 bg-white/80'
                }`}>
                  <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
                  {cartHasItems && (
                    <span className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1 py-[2px] text-[8.5px] font-mono font-bold leading-none ${
                      isDark
                        ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950 shadow-[0_8px_18px_rgba(34,211,238,0.35)]'
                        : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white shadow-[0_8px_16px_rgba(124,58,237,0.28)]'
                    }`}>
                      {cartCountLabel}
                    </span>
                  )}
                </span>
                <span className="hidden text-[12px] font-medium sm:inline">Cart</span>
              </Link>

              {/* Quote draft */}
              {(quoteHasItems || quoteActive) && (
                <Link
                  to="/purchase-quote"
                  className={`relative hidden h-9 items-center gap-2 rounded-[12px] border px-3 transition-all lg:inline-flex ${quoteSurface} ${focus}`}
                  aria-label={quoteHasItems ? `Quote · ${quoteItemCount}` : 'Quote draft'}
                >
                  <span className={`relative flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border ${
                    isDark ? 'border-fuchsia-300/16 bg-white/[0.05]' : 'border-violet-200/80 bg-white/80'
                  }`}>
                    <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                    {quoteHasItems && (
                      <span className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1 py-[2px] text-[8.5px] font-mono font-bold leading-none ${
                        isDark
                          ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950 shadow-[0_8px_18px_rgba(244,114,182,0.3)]'
                          : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white'
                      }`}>
                        {quoteCountLabel}
                      </span>
                    )}
                  </span>
                  <span className="text-[12px] font-medium">Quote</span>
                </Link>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setOpen(v => !v)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-[12px] border transition-all lg:hidden ${utilitySurface} ${focus}`}
                aria-label="Menu"
                aria-expanded={open}
              >
                {open ? <X className="h-4 w-4" strokeWidth={2} /> : <Menu className="h-4 w-4" strokeWidth={2} />}
              </button>
            </div>
          </div>

          {/* ═══ MOBILE MENU ═══ */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden lg:hidden"
              >
                <div
                  className={`mx-3 mb-3 overflow-y-auto rounded-[22px] border p-3.5 backdrop-blur-2xl ${
                    isDark
                      ? 'border-white/10 bg-[linear-gradient(180deg,rgba(6,8,22,0.97),rgba(4,6,18,0.97))]'
                      : 'border-violet-200/70 bg-white/94'
                  }`}
                  style={{ maxHeight: 'calc(100dvh - 5.5rem)', paddingBottom: 'max(0.875rem, env(safe-area-inset-bottom))' }}
                >
                  <div className={`mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-purple-100/38' : 'text-violet-600/62'}`}>
                    Navigate
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    {MOBILE_NAV.map(item => {
                      const isCurrent = active(item.to)
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`inline-flex min-h-[46px] items-center justify-center rounded-[15px] border px-4 text-[13px] font-medium transition-all ${
                            isCurrent
                              ? isDark
                                ? 'border-violet-300/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08),rgba(34,211,238,0.06))] text-white'
                                : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06),rgba(34,211,238,0.06))] text-gray-900'
                              : mobileTile
                          } ${focus}`}
                        >
                          {item.label}
                        </Link>
                      )
                    })}
                  </div>

                  <div className={`mt-3 border-t pt-3 ${isDark ? 'border-white/8' : 'border-violet-200/60'}`}>
                    <div className={`mb-2 text-[9px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-purple-100/38' : 'text-violet-600/62'}`}>
                      Account & Tools
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => { setOpen(false); setSearchOpen(true) }}
                        className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
                      >
                        <Search className="h-3.5 w-3.5" strokeWidth={2} />
                        Search
                      </button>

                      <Link
                        to="/rental-cart"
                        className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-semibold transition-all ${
                          cartActive
                            ? isDark
                              ? 'border-cyan-300/24 bg-[linear-gradient(135deg,rgba(8,30,44,0.94),rgba(11,18,38,0.98))] text-white'
                              : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(34,211,238,0.06))] text-gray-900'
                            : mobileTile
                        } ${focus}`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
                        Cart
                        {cartHasItems && (
                          <span className={`inline-flex min-w-[1.3rem] items-center justify-center rounded-full px-1 py-[2px] text-[9px] font-mono font-bold leading-none ${
                            isDark ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950' : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white'
                          }`}>{cartCountLabel}</span>
                        )}
                      </Link>

                      {(quoteHasItems || quoteActive) && (
                        <Link
                          to="/purchase-quote"
                          className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${
                            quoteActive
                              ? isDark
                                ? 'border-fuchsia-300/22 bg-[linear-gradient(135deg,rgba(39,15,57,0.96),rgba(16,14,36,0.98))] text-white'
                                : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06))] text-gray-900'
                              : mobileTile
                          } ${focus}`}
                        >
                          <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                          Quote Draft
                          {quoteHasItems && (
                            <span className={`inline-flex min-w-[1.3rem] items-center justify-center rounded-full px-1 py-[2px] text-[9px] font-mono font-bold leading-none ${
                              isDark ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950' : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white'
                            }`}>{quoteCountLabel}</span>
                          )}
                        </Link>
                      )}

                      {isLoggedIn ? (
                        <>
                          <Link to="/my-requests" className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}>
                            <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                            My Requests
                          </Link>
                          <Link to="/profile" className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}>
                            <User2 className="h-3.5 w-3.5" strokeWidth={2} />
                            {firstName}
                          </Link>
                          {isAuth && (
                            <Link to="/admin" className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}>
                              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                              Admin
                            </Link>
                          )}
                          <button
                            onClick={() => void logout()}
                            className={`inline-flex min-h-[46px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${
                              isDark ? 'border-red-400/18 bg-red-500/10 text-red-300' : 'border-red-200 bg-red-50 text-red-600'
                            } ${focus}`}
                          >
                            <LogOut className="h-3.5 w-3.5" strokeWidth={2} />
                            Logout
                          </button>
                        </>
                      ) : (
                        <Link to="/login" className={`inline-flex min-h-[46px] items-center justify-center rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}>
                          Login
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ═══ DESKTOP DROPDOWN PANEL ═══ */}
          <AnimatePresence>
            {activeDesktopItem?.children && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.985 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={clearDesktopTimers}
                onMouseLeave={() => scheduleDesktopClose()}
                onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); scheduleDesktopClose(true) } }}
                className="absolute left-1/2 top-full z-[70] hidden w-full max-w-[54rem] -translate-x-1/2 px-4 pt-2 lg:block"
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-4" />
                <div className={`relative overflow-hidden rounded-[26px] border backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(8,10,24,0.97),rgba(5,7,18,0.96))] shadow-[0_24px_90px_rgba(1,3,12,0.65)]'
                    : 'border-violet-200/80 bg-white/95 shadow-xl shadow-violet-500/12'
                }`}>
                  <div className={`grid gap-px ${isDark ? 'bg-white/8 md:grid-cols-[0.88fr_1.12fr]' : 'bg-violet-200/60 md:grid-cols-[0.88fr_1.12fr]'}`}>
                    <div className={`relative px-6 py-5 ${isDark ? 'bg-slate-950/96' : 'bg-violet-50/94'}`}>
                      <div className={`text-[9px] font-semibold uppercase tracking-[0.22em] ${isDark ? 'text-cyan-200/68' : 'text-violet-700/70'}`}>
                        {activeDesktopItem.eyebrow}
                      </div>
                      <div className={`mt-2 font-display text-[1.12rem] font-bold leading-tight tracking-[-0.04em] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activeDesktopItem.title}
                      </div>
                      <p className={`mt-2.5 max-w-[16rem] text-[11.5px] leading-[1.5] ${isDark ? 'text-purple-100/55' : 'text-gray-600'}`}>
                        {activeDesktopItem.body}
                      </p>
                      {activeDesktopItem.ctaTo && activeDesktopItem.ctaLabel && (
                        <Link
                          to={activeDesktopItem.ctaTo}
                          onClick={() => scheduleDesktopClose(true)}
                          className={`mt-5 inline-flex items-center gap-2 rounded-[14px] border px-4 py-2.5 text-[11px] font-semibold transition-all ${
                            isDark
                              ? 'border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.09]'
                              : 'border-violet-200/80 bg-white/90 text-gray-900 hover:bg-white'
                          } ${focus}`}
                        >
                          {activeDesktopItem.ctaLabel}
                          <ArrowRight className="h-3 w-3" strokeWidth={2} />
                        </Link>
                      )}
                    </div>

                    <div className={`grid gap-2 p-3 ${activeDesktopItem.children.length > 2 ? 'md:grid-cols-2' : 'grid-cols-1'} ${
                      isDark ? 'bg-[linear-gradient(180deg,rgba(6,8,20,0.88),rgba(5,7,16,0.80))]' : 'bg-white/94'
                    }`}>
                      {activeDesktopItem.children.map((child, index) => {
                        const isCurrent = active(child.to)
                        const Icon = child.icon
                        return (
                          <Link
                            key={child.to}
                            ref={index === 0 ? desktopPanelFirstLinkRef : undefined}
                            to={child.to}
                            onClick={() => scheduleDesktopClose(true)}
                            className={`group relative overflow-hidden rounded-[18px] border px-4 py-3.5 transition-all ${
                              isCurrent
                                ? isDark
                                  ? 'border-violet-300/22 bg-[linear-gradient(145deg,rgba(124,58,237,0.16),rgba(236,72,153,0.08),rgba(34,211,238,0.08))]'
                                  : 'border-violet-300/40 bg-[linear-gradient(145deg,rgba(124,58,237,0.08),rgba(236,72,153,0.04),rgba(34,211,238,0.05))]'
                                : isDark
                                  ? 'border-white/[0.07] bg-white/[0.02] hover:border-violet-300/16 hover:bg-white/[0.05]'
                                  : 'border-violet-100 bg-white hover:border-violet-200 hover:bg-violet-50/60'
                            } ${focus}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border ${
                                isDark
                                  ? 'border-white/10 bg-[linear-gradient(145deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08),rgba(34,211,238,0.08))] text-white'
                                  : 'border-violet-200/80 bg-[linear-gradient(145deg,rgba(124,58,237,0.10),rgba(236,72,153,0.05),rgba(34,211,238,0.06))] text-violet-700'
                              }`}>
                                <Icon className="h-4 w-4" strokeWidth={2} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[12px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{child.label}</span>
                                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8.5px] font-semibold uppercase tracking-[0.12em] ${
                                    isDark ? 'border-white/10 bg-white/[0.05] text-cyan-200/60' : 'border-violet-200/80 bg-violet-50/80 text-violet-600/70'
                                  }`}>{child.meta}</span>
                                </div>
                                <p className={`mt-1.5 text-[11px] leading-[1.45] ${isDark ? 'text-purple-100/50' : 'text-gray-500'}`}>{child.description}</p>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ═══ USER MENU PORTAL ═══ */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {userMenu && userMenuPosition && (
              <motion.div
                ref={userMenuPopoverRef}
                initial={{ opacity: 0, y: userMenuPosition.placement === 'bottom' ? -8 : 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: userMenuPosition.placement === 'bottom' ? -8 : 8, scale: 0.97 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed z-[90] w-[276px] overflow-hidden rounded-[22px] border backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(8,10,24,0.97),rgba(5,7,18,0.97))] shadow-[0_22px_80px_rgba(1,3,12,0.62)]'
                    : 'border-violet-200/80 bg-white/95 shadow-xl shadow-violet-500/12'
                } ${userMenuPosition.placement === 'bottom' ? 'origin-top-right' : 'origin-bottom-right'}`}
                style={{ top: `${userMenuPosition.top}px`, left: `${userMenuPosition.left}px` }}
              >
                <div className={`border-b px-4 py-4 ${isDark ? 'border-white/8' : 'border-violet-100'}`}>
                  <div className={`text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{currentUser?.name || 'User'}</div>
                  <div className={`mt-0.5 text-[11px] ${isDark ? 'text-purple-100/40' : 'text-gray-500'}`}>{currentUser?.email || ''}</div>
                </div>
                <div className="p-2">
                  <Link to="/my-requests" className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[12px] font-medium transition-all ${isDark ? 'text-purple-100/72 hover:bg-white/[0.06] hover:text-white' : 'text-gray-700 hover:bg-violet-50 hover:text-gray-900'}`}>
                    <FileText className="h-3.5 w-3.5 opacity-65" strokeWidth={2} />
                    My Requests
                  </Link>
                  <Link to="/profile" className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[12px] font-medium transition-all ${isDark ? 'text-purple-100/72 hover:bg-white/[0.06] hover:text-white' : 'text-gray-700 hover:bg-violet-50 hover:text-gray-900'}`}>
                    <User2 className="h-3.5 w-3.5 opacity-65" strokeWidth={2} />
                    Profile
                  </Link>
                  {isAuth && (
                    <Link to="/admin" className={`flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[12px] font-medium transition-all ${isDark ? 'text-purple-100/72 hover:bg-white/[0.06] hover:text-white' : 'text-gray-700 hover:bg-violet-50 hover:text-gray-900'}`}>
                      <ShieldCheck className="h-3.5 w-3.5 opacity-65" strokeWidth={2} />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { setUserMenu(false); void logout() }}
                    className={`flex w-full items-center gap-3 rounded-[14px] px-3 py-2.5 text-left text-[12px] font-medium transition-all ${isDark ? 'text-red-300/72 hover:bg-red-500/10 hover:text-red-200' : 'text-red-600 hover:bg-red-50'}`}
                  >
                    <LogOut className="h-3.5 w-3.5 opacity-65" strokeWidth={2} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
