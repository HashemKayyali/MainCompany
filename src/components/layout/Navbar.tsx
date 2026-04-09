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

// ── Logo wordmark ─────────────────────────────────────────────────────────────
function EventiesLogo({
  heroMode,
  isDark,
}: {
  heroMode: boolean
  isDark: boolean
}) {
  const textColor = isDark || heroMode ? 'text-white' : 'text-gray-900'
  const metaColor = heroMode
    ? 'text-white/38'
    : isDark
      ? 'text-purple-100/50'
      : 'text-violet-600/70'

  return (
    <div className="flex items-center gap-2.5">
      {/* Badge */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/14 bg-[linear-gradient(145deg,#7c3aed_0%,#d946ef_48%,#22d3ee_112%)] shadow-[0_12px_32px_rgba(124,58,237,0.42)]">
        <div className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/20 blur-sm" />
        <span className="relative text-[10.5px] font-black tracking-[0.12em] text-white">Ev</span>
      </div>
      {/* Text mark */}
      <div className="min-w-0 leading-none">
        <div className={`font-display text-[12.5px] font-bold tracking-[-0.01em] transition-colors duration-500 sm:text-[13px] ${textColor}`}>
          Eventies
        </div>
        <div className={`mt-[3px] text-[8.5px] uppercase tracking-[0.15em] transition-colors duration-500 sm:text-[9px] sm:tracking-[0.18em] ${metaColor}`}>
          Marketplace
        </div>
      </div>
    </div>
  )
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

  // Cmd/Ctrl+K search shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(v => !v)
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
      if (
        !userMenuAnchorRef.current?.contains(target) &&
        !userMenuPopoverRef.current?.contains(target)
      ) {
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
    const pad = 16
    const menuW = 280
    const menuH = userMenuPopoverRef.current?.offsetHeight ?? 260
    const canAbove = rect.top - 10 - menuH > pad
    const shouldAbove = rect.bottom + 10 + menuH > window.innerHeight - pad && canAbove
    const left = Math.min(
      window.innerWidth - pad - menuW,
      Math.max(pad, rect.right - menuW)
    )
    const rawTop = shouldAbove ? rect.top - menuH - 10 : rect.bottom + 10
    const top = Math.max(pad, Math.min(rawTop, window.innerHeight - pad - menuH))
    setUserMenuPosition({ top, left, placement: shouldAbove ? 'top' : 'bottom' })
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
    const bar = navbarBarRef.current
    if (!bar) return
    const update = () => {
      const rect = bar.getBoundingClientRect()
      root.style.setProperty('--app-navbar-height', `${Math.round(rect.bottom)}px`)
    }
    update()
    const frame = window.requestAnimationFrame(update)
    const timeout = window.setTimeout(update, 120)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    ro?.observe(bar)
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      ro?.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty('--app-navbar-height')
    }
  }, [])

  // ── Derived state ──────────────────────────────────────────────────────────
  const active = (target: string) =>
    target === '/' ? pathname === '/' : pathname.startsWith(target)

  const focus =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  const firstName = currentUser?.name?.split(' ')[0] || 'User'
  const isHome = pathname === '/'
  const heroMode = isHome && !scrolled

  // ── Nav bar background ────────────────────────────────────────────────────
  const navBarBg = scrolled
    ? isDark
      ? 'border-b border-white/[0.06] bg-[rgba(3,5,14,0.94)] backdrop-blur-2xl shadow-[0_1px_40px_rgba(0,0,0,0.5)]'
      : 'border-b border-violet-200/40 bg-white/96 backdrop-blur-xl shadow-[0_1px_20px_rgba(124,58,237,0.06)]'
    : isHome
      ? ''
      : isDark
        ? 'border-b border-white/[0.04] bg-[rgba(3,5,14,0.82)] backdrop-blur-lg'
        : 'border-b border-violet-100/40 bg-white/80 backdrop-blur-md'

  // ── Utility pill (search, login) ───────────────────────────────────────────
  const utilityPill = heroMode
    ? 'border-white/[0.14] bg-white/[0.08] text-white/78 hover:border-white/[0.24] hover:bg-white/[0.14] hover:text-white'
    : isDark
      ? 'border-white/[0.09] bg-white/[0.04] text-white/72 hover:border-violet-300/20 hover:bg-white/[0.07] hover:text-white'
      : 'border-violet-200/65 bg-white/85 text-gray-700 hover:border-violet-300 hover:bg-white hover:text-gray-900'

  // ── Desktop nav link text ──────────────────────────────────────────────────
  const navLinkColor = (isActive: boolean) =>
    isActive
      ? heroMode || isDark ? 'text-white' : 'text-gray-900'
      : heroMode
        ? 'text-white/58 hover:text-white'
        : isDark
          ? 'text-purple-100/62 hover:text-white'
          : 'text-gray-500 hover:text-gray-900'

  const navTriggerColor = (isActive: boolean, isOpen: boolean) =>
    isActive || isOpen
      ? heroMode || isDark ? 'text-white' : 'text-gray-900'
      : heroMode
        ? 'text-white/58 hover:text-white'
        : isDark
          ? 'text-purple-100/62 hover:text-white'
          : 'text-gray-500 hover:text-gray-900'

  // ── Active pill ────────────────────────────────────────────────────────────
  const navActivePill = heroMode
    ? 'bg-white/[0.11] border border-white/[0.16]'
    : isDark
      ? 'bg-violet-500/[0.13] border border-violet-400/[0.17]'
      : 'bg-violet-50 border border-violet-200/70'

  // ── Mobile tile ────────────────────────────────────────────────────────────
  const mobileTile = isDark
    ? 'border-white/[0.09] bg-white/[0.04] text-purple-100/78 hover:text-white hover:bg-white/[0.08]'
    : 'border-violet-200/60 bg-white/80 text-gray-700 hover:text-gray-900 hover:bg-white'

  const mobileActiveTile = isDark
    ? 'border-violet-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08),rgba(34,211,238,0.06))] text-white'
    : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06),rgba(34,211,238,0.06))] text-gray-900'

  // ── Cart / Quote surfaces ──────────────────────────────────────────────────
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
      ? 'border-cyan-300/28 bg-[linear-gradient(135deg,rgba(8,30,44,0.95),rgba(11,18,38,0.98))] text-white shadow-[0_16px_48px_rgba(2,8,18,0.46)]'
      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.94))] text-gray-900 shadow-[0_12px_32px_rgba(124,58,237,0.14)]'
    : cartHasItems
      ? isDark
        ? 'border-cyan-300/18 bg-[linear-gradient(135deg,rgba(8,25,38,0.9),rgba(13,18,34,0.94))] text-white hover:border-cyan-300/30'
        : 'border-violet-300/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.92))] text-gray-900 hover:border-violet-300/55'
      : utilityPill

  const quoteSurface = quoteActive
    ? isDark
      ? 'border-fuchsia-300/24 bg-[linear-gradient(135deg,rgba(39,15,57,0.96),rgba(16,14,36,0.98))] text-white shadow-[0_16px_48px_rgba(17,5,28,0.42)]'
      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,255,0.94))] text-gray-900 shadow-[0_12px_32px_rgba(168,85,247,0.12)]'
    : isDark
      ? 'border-fuchsia-300/16 bg-[linear-gradient(135deg,rgba(31,14,42,0.92),rgba(14,14,31,0.96))] text-white hover:border-fuchsia-300/28'
      : 'border-violet-300/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,255,0.92))] text-gray-900 hover:border-violet-300/50'

  // ── Desktop nav data ────────────────────────────────────────────────────────
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

  // ── Badge count pill ────────────────────────────────────────────────────────
  function CountBadge({ count, color }: { count: string; color: 'cyan' | 'pink' }) {
    return (
      <span
        className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[1.1rem] items-center justify-center rounded-full px-1 py-[2px] text-[8px] font-mono font-bold leading-none shadow-md ${
          color === 'cyan'
            ? isDark
              ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950 shadow-cyan-400/30'
              : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white shadow-violet-400/25'
            : isDark
              ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950 shadow-pink-400/30'
              : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white shadow-pink-400/20'
        }`}
      >
        {count}
      </span>
    )
  }

  // ── Shared icon circle (navbar action buttons) ─────────────────────────────
  function IconCircle({
    children,
    active: isActive = false,
    colorScheme = 'neutral',
  }: {
    children: React.ReactNode
    active?: boolean
    colorScheme?: 'neutral' | 'cyan' | 'pink'
  }) {
    const base = 'relative flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border'
    if (heroMode) return <span className={`${base} border-white/12 bg-white/[0.06]`}>{children}</span>
    if (colorScheme === 'cyan' && isActive)
      return <span className={`${base} ${isDark ? 'border-cyan-300/22 bg-cyan-500/10' : 'border-violet-200/80 bg-white/80'}`}>{children}</span>
    if (colorScheme === 'pink' && isActive)
      return <span className={`${base} ${isDark ? 'border-fuchsia-300/20 bg-fuchsia-500/10' : 'border-violet-200/80 bg-white/80'}`}>{children}</span>
    return <span className={`${base} ${isDark ? 'border-white/10 bg-white/[0.04]' : 'border-violet-200/70 bg-white/70'}`}>{children}</span>
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 w-full">
      {/* ══════════════════════ MAIN BAR ══════════════════════ */}
      <div className={`pointer-events-auto w-full transition-all duration-500 ${navBarBg}`}>
        <div className="relative mx-auto max-w-[90rem]">

          {/* ─── Nav bar row ─── */}
          <div
            ref={navbarBarRef}
            className="flex h-[3.75rem] items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 lg:px-10"
          >

            {/* ── Logo ── */}
            <Link
              to="/"
              className={`flex min-w-0 items-center transition-opacity hover:opacity-88 lg:min-w-[160px] ${focus}`}
            >
              <EventiesLogo heroMode={heroMode} isDark={isDark} />
            </Link>

            {/* ── Desktop nav (center) ── */}
            <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Main navigation">
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
                        className={`relative inline-flex h-[2.375rem] items-center justify-center rounded-[13px] px-4 text-[12.5px] font-medium tracking-[-0.01em] transition-all duration-300 ${navLinkColor(isCurrent)} ${focus}`}
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
                      onKeyDown={e => {
                        if (e.key === 'Escape') { scheduleDesktopClose(true); return }
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                          e.preventDefault()
                          if (isOpen) desktopPanelFirstLinkRef.current?.focus()
                          else {
                            openDesktopMenu(item.key)
                            window.setTimeout(() => desktopPanelFirstLinkRef.current?.focus(), 60)
                          }
                        }
                      }}
                      className={`relative inline-flex h-[2.375rem] items-center justify-center gap-1.5 rounded-[13px] px-4 text-[12.5px] font-medium tracking-[-0.01em] transition-all duration-300 ${navTriggerColor(isCurrent, isOpen)} ${focus}`}
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
                        strokeWidth={2.2}
                      />
                    </button>
                  )
                })}
              </div>
            </nav>

            {/* ── Right actions ── */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:min-w-[160px]">

              {/* Search compact (sm–xl) */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`hidden h-[2.375rem] items-center gap-2 rounded-[12px] border px-3 text-[12px] font-medium transition-all sm:inline-flex xl:hidden ${utilityPill} ${focus}`}
                aria-label="Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2} />
              </button>

              {/* Search with label (xl+) */}
              <button
                onClick={() => setSearchOpen(true)}
                className={`hidden h-[2.375rem] items-center gap-2 rounded-[12px] border px-3.5 text-[12px] font-medium transition-all xl:inline-flex ${utilityPill} ${focus}`}
                aria-label="Search (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5" strokeWidth={2} />
                <span>Search</span>
                <kbd className={`rounded-md border px-2 py-0.5 text-[8.5px] font-mono tracking-[0.1em] ${
                  heroMode
                    ? 'border-white/12 bg-white/[0.06] text-white/38'
                    : isDark
                      ? 'border-white/10 bg-white/[0.04] text-purple-100/44'
                      : 'border-violet-200 bg-violet-50/80 text-violet-500'
                }`}>
                  ⌘K
                </kbd>
              </button>

              {/* User / Login */}
              {isLoggedIn ? (
                <div ref={userMenuAnchorRef} className="relative hidden sm:block">
                  <button
                    onClick={() => { if (!userMenu) updateUserMenuPosition(); setUserMenu(v => !v) }}
                    className={`inline-flex h-[2.375rem] items-center gap-2 rounded-[12px] border pl-2 pr-3 transition-all ${utilityPill} ${focus}`}
                    aria-label="User menu"
                    aria-expanded={userMenu}
                  >
                    <div className={`flex h-[1.75rem] w-[1.75rem] items-center justify-center rounded-full border ${
                      heroMode
                        ? 'border-white/18 bg-white/10 text-white'
                        : isDark
                          ? 'border-violet-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.22),rgba(236,72,153,0.12))] text-white'
                          : 'border-violet-300/38 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.08))] text-violet-700'
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
                      className={`h-3 w-3 transition-transform duration-200 ${userMenu ? 'rotate-180' : ''} ${
                        heroMode ? 'text-white/45' : isDark ? 'text-purple-100/44' : 'text-violet-600/55'
                      }`}
                      strokeWidth={2.2}
                    />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`hidden h-[2.375rem] items-center rounded-[12px] border px-4 text-[12px] font-medium transition-all sm:inline-flex ${utilityPill} ${focus}`}
                >
                  Login
                </Link>
              )}

              {/* Cart */}
              <Link
                to="/rental-cart"
                className={`relative inline-flex h-[2.375rem] items-center gap-2 rounded-[12px] border px-2.5 transition-all sm:px-3 ${cartSurface} ${focus}`}
                aria-label={cartHasItems ? `Cart · ${cartItemCount}` : 'Cart'}
              >
                <IconCircle active={cartHasItems || cartActive} colorScheme="cyan">
                  <ShoppingCart className="h-3.5 w-3.5" strokeWidth={2} />
                  {cartHasItems && <CountBadge count={cartCountLabel} color="cyan" />}
                </IconCircle>
                <span className="hidden text-[12px] font-medium sm:inline">Cart</span>
              </Link>

              {/* Purchase quote */}
              {(quoteHasItems || quoteActive) && (
                <Link
                  to="/purchase-quote"
                  className={`relative hidden h-[2.375rem] items-center gap-2 rounded-[12px] border px-3 transition-all lg:inline-flex ${quoteSurface} ${focus}`}
                  aria-label={quoteHasItems ? `Quote · ${quoteItemCount}` : 'Quote draft'}
                >
                  <IconCircle active={quoteHasItems || quoteActive} colorScheme="pink">
                    <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                    {quoteHasItems && <CountBadge count={quoteCountLabel} color="pink" />}
                  </IconCircle>
                  <span className="text-[12px] font-medium">Quote</span>
                </Link>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setOpen(v => !v)}
                className={`inline-flex h-[2.375rem] w-[2.375rem] items-center justify-center rounded-[12px] border transition-all lg:hidden ${
                  open
                    ? isDark
                      ? 'border-violet-400/22 bg-violet-500/12 text-white'
                      : 'border-violet-300/45 bg-violet-50 text-violet-800'
                    : utilityPill
                } ${focus}`}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {open ? (
                    <motion.span
                      key="x"
                      initial={{ rotate: -45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 45, opacity: 0 }}
                      transition={{ duration: 0.14 }}
                    >
                      <X className="h-4 w-4" strokeWidth={2} />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="menu"
                      initial={{ rotate: 45, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -45, opacity: 0 }}
                      transition={{ duration: 0.14 }}
                    >
                      <Menu className="h-4 w-4" strokeWidth={2} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>

          {/* ══════════════════════ MOBILE MENU ══════════════════════ */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden lg:hidden"
              >
                <div
                  className={`mx-3 mb-3 overflow-y-auto rounded-[22px] border ${
                    isDark
                      ? 'border-white/[0.09] bg-[linear-gradient(180deg,rgba(6,8,22,0.98),rgba(4,6,18,0.98))] shadow-[0_20px_72px_rgba(1,3,14,0.6)]'
                      : 'border-violet-200/65 bg-white/96 shadow-[0_12px_40px_rgba(124,58,237,0.1)]'
                  }`}
                  style={{
                    backdropFilter: 'blur(28px)',
                    WebkitBackdropFilter: 'blur(28px)',
                    maxHeight: 'calc(100dvh - 5.5rem)',
                    paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                  }}
                >

                  {/* ─── Brand stripe ─── */}
                  <div className={`flex items-center gap-3 px-4 py-4 ${
                    isDark ? 'border-b border-white/[0.06]' : 'border-b border-violet-100/80'
                  }`}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/14 bg-[linear-gradient(145deg,#7c3aed_0%,#d946ef_48%,#22d3ee_112%)] shadow-[0_8px_24px_rgba(124,58,237,0.38)]">
                      <span className="text-[10.5px] font-black tracking-[0.12em] text-white">Ev</span>
                    </div>
                    <div className="leading-none">
                      <div className={`font-display text-[13px] font-bold tracking-[-0.01em] ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Eventies
                      </div>
                      <div className={`mt-0.5 text-[9px] uppercase tracking-[0.16em] ${isDark ? 'text-purple-100/45' : 'text-violet-600/65'}`}>
                        Marketplace
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 px-3 pt-3">

                    {/* ─── Home ─── */}
                    <div>
                      <Link
                        to="/"
                        className={`inline-flex w-full min-h-[48px] items-center gap-3 rounded-[15px] border px-4 text-[13px] font-semibold tracking-[-0.01em] transition-all duration-300 ${
                          active('/') ? mobileActiveTile : mobileTile
                        } ${focus}`}
                      >
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] ${
                          isDark ? 'bg-white/[0.06] border border-white/[0.08]' : 'bg-violet-50 border border-violet-200/60'
                        }`}>
                          <LayoutGrid className="h-3.5 w-3.5 opacity-75" strokeWidth={2} />
                        </div>
                        <div>
                          <div>Home</div>
                          <div className={`text-[10px] font-normal tracking-normal ${isDark ? 'text-purple-100/38' : 'text-gray-400'}`}>
                            Back to start
                          </div>
                        </div>
                      </Link>
                    </div>

                    {/* ─── Explore ─── */}
                    <div>
                      <div className={`mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.22em] ${isDark ? 'text-purple-100/36' : 'text-violet-600/58'}`}>
                        Explore
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          to="/products"
                          className={`inline-flex min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-[15px] border px-3 text-[12.5px] font-medium tracking-[-0.01em] transition-all duration-300 ${
                            active('/products') ? mobileActiveTile : mobileTile
                          } ${focus}`}
                        >
                          <LayoutGrid className="h-4 w-4 opacity-70" strokeWidth={2} />
                          <span>Products</span>
                        </Link>
                        <Link
                          to="/customers"
                          className={`inline-flex min-h-[56px] flex-col items-center justify-center gap-1.5 rounded-[15px] border px-3 text-[12.5px] font-medium tracking-[-0.01em] transition-all duration-300 ${
                            active('/customers') ? mobileActiveTile : mobileTile
                          } ${focus}`}
                        >
                          <Users className="h-4 w-4 opacity-70" strokeWidth={2} />
                          <span>Customers</span>
                        </Link>
                        <Link
                          to="/gallery"
                          className={`col-span-2 inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-[15px] border px-4 text-[13px] font-medium tracking-[-0.01em] transition-all duration-300 ${
                            active('/gallery') ? mobileActiveTile : mobileTile
                          } ${focus}`}
                        >
                          <GalleryVerticalEnd className="h-4 w-4 opacity-70" strokeWidth={2} />
                          Gallery
                        </Link>
                      </div>
                    </div>

                    {/* ─── Company ─── */}
                    <div>
                      <div className={`mb-2 px-1 text-[9px] font-bold uppercase tracking-[0.22em] ${isDark ? 'text-purple-100/36' : 'text-violet-600/58'}`}>
                        Company
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <Link
                          to="/about"
                          className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium tracking-[-0.01em] transition-all duration-300 ${
                            active('/about') ? mobileActiveTile : mobileTile
                          } ${focus}`}
                        >
                          <ShieldCheck className="h-4 w-4 opacity-70" strokeWidth={2} />
                          About
                        </Link>
                        <Link
                          to="/contact"
                          className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium tracking-[-0.01em] transition-all duration-300 ${
                            active('/contact') ? mobileActiveTile : mobileTile
                          } ${focus}`}
                        >
                          <MessageCircleMore className="h-4 w-4 opacity-70" strokeWidth={2} />
                          Contact
                        </Link>
                      </div>
                    </div>

                    {/* ─── Account & Tools ─── */}
                    <div className={`pb-1 pt-0 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-violet-100/70'}`}>
                      <div className={`mb-2 mt-3 px-1 text-[9px] font-bold uppercase tracking-[0.22em] ${isDark ? 'text-purple-100/36' : 'text-violet-600/58'}`}>
                        Account &amp; Tools
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">

                        {/* Search */}
                        <button
                          type="button"
                          onClick={() => { setOpen(false); setSearchOpen(true) }}
                          className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
                        >
                          <Search className="h-4 w-4 opacity-70" strokeWidth={2} />
                          Search
                        </button>

                        {/* Cart */}
                        <Link
                          to="/rental-cart"
                          className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-semibold transition-all ${
                            cartActive ? mobileActiveTile : mobileTile
                          } ${focus}`}
                        >
                          <ShoppingCart className="h-4 w-4 opacity-70" strokeWidth={2} />
                          Cart
                          {cartHasItems && (
                            <span className={`inline-flex min-w-[1.3rem] items-center justify-center rounded-full px-1 py-[2px] text-[8.5px] font-mono font-bold leading-none ${
                              isDark
                                ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950'
                                : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white'
                            }`}>
                              {cartCountLabel}
                            </span>
                          )}
                        </Link>

                        {/* Quote (when exists) */}
                        {(quoteHasItems || quoteActive) && (
                          <Link
                            to="/purchase-quote"
                            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${
                              quoteActive ? mobileActiveTile : mobileTile
                            } ${focus}`}
                          >
                            <FileText className="h-4 w-4 opacity-70" strokeWidth={2} />
                            Quote
                            {quoteHasItems && (
                              <span className={`inline-flex min-w-[1.3rem] items-center justify-center rounded-full px-1 py-[2px] text-[8.5px] font-mono font-bold leading-none ${
                                isDark
                                  ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950'
                                  : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white'
                              }`}>
                                {quoteCountLabel}
                              </span>
                            )}
                          </Link>
                        )}

                        {/* Authenticated */}
                        {isLoggedIn ? (
                          <>
                            <Link
                              to="/my-requests"
                              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
                            >
                              <FileText className="h-4 w-4 opacity-70" strokeWidth={2} />
                              Requests
                            </Link>
                            <Link
                              to="/profile"
                              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
                            >
                              <User2 className="h-4 w-4 opacity-70" strokeWidth={2} />
                              {firstName}
                            </Link>
                            {isAuth && (
                              <Link
                                to="/admin"
                                className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
                              >
                                <ShieldCheck className="h-4 w-4 opacity-70" strokeWidth={2} />
                                Admin
                              </Link>
                            )}
                            <button
                              type="button"
                              onClick={() => void logout()}
                              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${
                                isDark
                                  ? 'border-red-400/20 bg-red-500/10 text-red-300 hover:bg-red-500/16'
                                  : 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                              } ${focus}`}
                            >
                              <LogOut className="h-4 w-4 opacity-80" strokeWidth={2} />
                              Logout
                            </button>
                          </>
                        ) : (
                          <Link
                            to="/login"
                            className={`col-span-2 inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[15px] border px-4 text-[13px] font-semibold transition-all ${
                              isDark
                                ? 'border-violet-400/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08))] text-white hover:border-violet-400/35'
                                : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.08),rgba(236,72,153,0.04))] text-violet-800 hover:border-violet-300/65'
                            } ${focus}`}
                          >
                            <User2 className="h-4 w-4" strokeWidth={2} />
                            Login to your account
                            <ArrowRight className="h-3.5 w-3.5 opacity-60" strokeWidth={2} />
                          </Link>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════ DESKTOP DROPDOWN ══════════════════════ */}
          <AnimatePresence>
            {activeDesktopItem?.children && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.982 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.982 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={clearDesktopTimers}
                onMouseLeave={() => scheduleDesktopClose()}
                onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); scheduleDesktopClose(true) } }}
                className="absolute left-1/2 top-full z-[70] hidden w-full max-w-[52rem] -translate-x-1/2 px-4 pt-2 lg:block"
                role="menu"
                aria-label={`${activeDesktopItem.label} menu`}
              >
                {/* Invisible hover bridge */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-4" />

                <div
                  className={`relative overflow-hidden rounded-[24px] border ${
                    isDark
                      ? 'border-white/[0.09] bg-[linear-gradient(180deg,rgba(8,10,24,0.98),rgba(5,7,18,0.97))] shadow-[0_28px_100px_rgba(1,3,12,0.68),inset_0_1px_0_rgba(255,255,255,0.04)]'
                      : 'border-violet-200/70 bg-white/97 shadow-[0_20px_80px_rgba(124,58,237,0.14),0_4px_20px_rgba(0,0,0,0.06)]'
                  }`}
                  style={{ backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)' }}
                >
                  {/* Top accent line */}
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{
                      background: isDark
                        ? 'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.45) 35%, rgba(6,182,212,0.35) 65%, transparent 95%)'
                        : 'linear-gradient(90deg, transparent 5%, rgba(124,58,237,0.2) 35%, rgba(6,182,212,0.15) 65%, transparent 95%)',
                    }}
                  />

                  <div className={`grid ${isDark ? 'divide-x divide-white/[0.06]' : 'divide-x divide-violet-100'} md:grid-cols-[0.9fr_1.1fr]`}>

                    {/* ── Left panel: title + CTA ── */}
                    <div className={`relative flex flex-col justify-between px-7 py-6 ${
                      isDark
                        ? 'bg-[linear-gradient(160deg,rgba(14,10,30,0.96),rgba(8,9,20,0.88))]'
                        : 'bg-[linear-gradient(160deg,rgba(249,246,255,0.98),rgba(243,240,255,0.94))]'
                    }`}>
                      {/* Corner accent glow */}
                      {isDark && (
                        <div
                          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl"
                          style={{ background: 'rgba(124,58,237,0.10)' }}
                        />
                      )}

                      <div className="relative">
                        <div className={`text-[9px] font-bold uppercase tracking-[0.24em] ${
                          isDark ? 'text-violet-300/68' : 'text-violet-600/72'
                        }`}>
                          {activeDesktopItem.eyebrow}
                        </div>
                        <h3 className={`mt-2 font-display text-[1.12rem] font-bold leading-tight tracking-[-0.03em] ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {activeDesktopItem.title}
                        </h3>
                        <p className={`mt-2.5 max-w-[15rem] text-[11.5px] leading-[1.52] ${
                          isDark ? 'text-purple-100/52' : 'text-gray-500'
                        }`}>
                          {activeDesktopItem.body}
                        </p>
                      </div>

                      {activeDesktopItem.ctaTo && activeDesktopItem.ctaLabel && (
                        <Link
                          to={activeDesktopItem.ctaTo}
                          onClick={() => scheduleDesktopClose(true)}
                          className={`mt-5 inline-flex w-fit items-center gap-2 rounded-[13px] border px-4 py-2.5 text-[11px] font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                            isDark
                              ? 'border-white/[0.11] bg-white/[0.05] text-white hover:border-violet-400/22 hover:bg-white/[0.08]'
                              : 'border-violet-200/80 bg-white text-gray-800 shadow-sm hover:border-violet-300 hover:bg-violet-50/60 hover:text-violet-800'
                          } ${focus}`}
                        >
                          {activeDesktopItem.ctaLabel}
                          <ArrowRight className="h-3 w-3" strokeWidth={2.2} />
                        </Link>
                      )}
                    </div>

                    {/* ── Right panel: nav items ── */}
                    <div className={`p-3 ${
                      isDark
                        ? 'bg-[linear-gradient(180deg,rgba(6,8,20,0.90),rgba(5,7,16,0.82))]'
                        : 'bg-white/95'
                    }`}>
                      <div className={`grid gap-2 ${activeDesktopItem.children.length > 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                        {activeDesktopItem.children.map((child, index) => {
                          const isCurrent = active(child.to)
                          const Icon = child.icon
                          return (
                            <Link
                              key={child.to}
                              ref={index === 0 ? desktopPanelFirstLinkRef : undefined}
                              to={child.to}
                              onClick={() => scheduleDesktopClose(true)}
                              role="menuitem"
                              className={`group relative flex items-start gap-3.5 overflow-hidden rounded-[17px] border p-4 transition-all duration-300 ${
                                isCurrent
                                  ? isDark
                                    ? 'border-violet-300/24 bg-[linear-gradient(148deg,rgba(124,58,237,0.16),rgba(236,72,153,0.07),rgba(34,211,238,0.07))]'
                                    : 'border-violet-300/40 bg-[linear-gradient(148deg,rgba(124,58,237,0.08),rgba(236,72,153,0.04),rgba(34,211,238,0.04))]'
                                  : isDark
                                    ? 'border-white/[0.06] bg-white/[0.02] hover:border-violet-400/18 hover:bg-white/[0.05]'
                                    : 'border-violet-100/80 bg-white/60 hover:border-violet-200 hover:bg-violet-50/60'
                              } ${focus}`}
                            >
                              {/* Hover glow on item */}
                              {isDark && !isCurrent && (
                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                                  style={{ background: 'radial-gradient(ellipse 90% 70% at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
                                />
                              )}

                              {/* Icon */}
                              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border transition-transform duration-300 group-hover:scale-105 ${
                                isCurrent
                                  ? isDark
                                    ? 'border-violet-400/28 bg-[linear-gradient(145deg,rgba(124,58,237,0.28),rgba(236,72,153,0.14))] text-violet-200'
                                    : 'border-violet-300/55 bg-[linear-gradient(145deg,rgba(124,58,237,0.14),rgba(236,72,153,0.07))] text-violet-700'
                                  : isDark
                                    ? 'border-white/[0.09] bg-white/[0.05] text-white/75 group-hover:border-violet-400/22 group-hover:text-white'
                                    : 'border-violet-200/65 bg-violet-50/80 text-violet-600 group-hover:border-violet-300 group-hover:bg-violet-100/70'
                              }`}>
                                <Icon className="h-4 w-4" strokeWidth={2} />
                              </div>

                              {/* Text */}
                              <div className="relative min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[12.5px] font-semibold tracking-[-0.01em] transition-colors ${
                                    isDark ? 'text-white/90 group-hover:text-white' : 'text-gray-800 group-hover:text-gray-900'
                                  }`}>
                                    {child.label}
                                  </span>
                                  <span className={`shrink-0 rounded-full border px-2 py-[3px] text-[8px] font-bold uppercase tracking-[0.12em] ${
                                    isDark
                                      ? 'border-white/[0.09] bg-white/[0.04] text-cyan-200/58'
                                      : 'border-violet-200/70 bg-violet-50/80 text-violet-600/65'
                                  }`}>
                                    {child.meta}
                                  </span>
                                </div>
                                <p className={`mt-1.5 text-[11px] leading-[1.48] ${
                                  isDark ? 'text-purple-100/48 group-hover:text-purple-100/65' : 'text-gray-500'
                                }`}>
                                  {child.description}
                                </p>
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* ══════════════════════ USER MENU PORTAL ══════════════════════ */}
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
                className={`fixed z-[90] w-[280px] overflow-hidden rounded-[22px] border ${
                  isDark
                    ? 'border-white/[0.09] bg-[linear-gradient(180deg,rgba(9,11,26,0.98),rgba(6,8,20,0.98))] shadow-[0_24px_80px_rgba(1,3,12,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]'
                    : 'border-violet-200/70 bg-white/97 shadow-[0_16px_60px_rgba(124,58,237,0.14),0_4px_16px_rgba(0,0,0,0.06)]'
                } ${userMenuPosition.placement === 'bottom' ? 'origin-top-right' : 'origin-bottom-right'}`}
                style={{
                  top: `${userMenuPosition.top}px`,
                  left: `${userMenuPosition.left}px`,
                  backdropFilter: 'blur(28px)',
                  WebkitBackdropFilter: 'blur(28px)',
                }}
              >
                {/* Top accent */}
                <div
                  className="absolute inset-x-0 top-0 h-px"
                  style={{
                    background: isDark
                      ? 'linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.5) 50%, transparent 90%)'
                      : 'linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.2) 50%, transparent 90%)',
                  }}
                />

                {/* User header */}
                <div className={`flex items-center gap-3 px-4 py-4 ${isDark ? 'border-b border-white/[0.07]' : 'border-b border-violet-100'}`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                    isDark
                      ? 'border-violet-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.28),rgba(236,72,153,0.16))]'
                      : 'border-violet-200/60 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.08))]'
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
                          ? 'bg-[linear-gradient(135deg,rgba(124,58,237,0.52),rgba(236,72,153,0.35))] text-white text-[11px]'
                          : 'bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.12))] text-violet-700 text-[11px]'
                      }
                      imageClassName="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className={`truncate text-[13px] font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {currentUser?.name || 'User'}
                    </div>
                    <div className={`truncate text-[11px] ${isDark ? 'text-purple-100/42' : 'text-gray-400'}`}>
                      {currentUser?.email || ''}
                    </div>
                  </div>
                </div>

                {/* Menu items */}
                <div className="p-2">
                  {[
                    { to: '/my-requests', label: 'My Requests', icon: FileText },
                    { to: '/profile', label: 'Profile', icon: User2 },
                    ...(isAuth ? [{ to: '/admin', label: 'Admin Panel', icon: ShieldCheck }] : []),
                  ].map(item => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[12px] font-medium transition-all duration-200 ${
                          isDark
                            ? 'text-purple-100/70 hover:bg-white/[0.06] hover:text-white'
                            : 'text-gray-600 hover:bg-violet-50 hover:text-gray-900'
                        } ${focus}`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isDark ? 'text-white/38' : 'text-violet-400/70'}`} strokeWidth={2} />
                        {item.label}
                      </Link>
                    )
                  })}

                  <div className={`my-1.5 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-violet-100'}`} />

                  <button
                    type="button"
                    onClick={() => { setUserMenu(false); void logout() }}
                    className={`flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left text-[12px] font-medium transition-all duration-200 ${
                      isDark
                        ? 'text-red-300/72 hover:bg-red-500/[0.10] hover:text-red-200'
                        : 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    } ${focus}`}
                  >
                    <LogOut className={`h-3.5 w-3.5 ${isDark ? 'text-red-300/55' : 'text-red-400/70'}`} strokeWidth={2} />
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
