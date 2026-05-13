import { memo, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { usePerfMode } from '../../hooks/usePerfMode'
import { preloadRoute } from '../../utils/route-preload'
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

const MOBILE_CHIPS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Explore' },
  { to: '/customers', label: 'Customers' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/about', label: 'Company' },
] as const

const DESKTOP_NAV: DesktopNavItem[] = [
  { key: 'home', label: 'Home', to: '/' },
  {
    key: 'explore',
    label: 'Explore',
    children: [
      {
        to: '/products',
        label: 'Products',
        description: 'Rental-ready activations and premium event setups.',
        icon: LayoutGrid,
        meta: 'Catalog',
      },
      {
        to: '/customers',
        label: 'Customers',
        description: 'Trusted brands, partners, and credibility highlights.',
        icon: Users,
        meta: 'Trusted',
      },
      {
        to: '/gallery',
        label: 'Gallery',
        description: 'Recent visuals, setups, and standout moments.',
        icon: GalleryVerticalEnd,
        meta: 'Highlights',
      },
    ],
    eyebrow: 'Discover',
    title: 'Explore the marketplace',
    body: 'Browse products, customer success, and real event visuals from a single polished surface.',
    ctaLabel: 'See all services',
    ctaTo: '/products',
  },
  {
    key: 'company',
    label: 'Company',
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
        description: 'Talk with our team about planning, procurement, and event execution.',
        icon: MessageCircleMore,
        meta: 'Reach us',
      },
    ],
    eyebrow: 'Connect',
    title: 'Meet the team behind Eventies',
    body: 'Learn how we curate premium event services and how to get in touch for your next project.',
    ctaLabel: 'Contact us',
    ctaTo: '/contact',
  },
]

function getDesktopNavActive(
  item: DesktopNavItem,
  isRouteActive: (target: string) => boolean
) {
  if (item.to) return isRouteActive(item.to)
  return item.children?.some(child => isRouteActive(child.to)) ?? false
}

function preloadDesktopNavItem(item: DesktopNavItem) {
  if (item.to) {
    preloadRoute(item.to)
    return
  }

  item.children?.forEach(child => preloadRoute(child.to))
}

// ── Logo wordmark ─────────────────────────────────────────────────────────────
function EventiesLogo({
  heroMode: _heroMode,
  isDark: _isDark,
}: {
  heroMode: boolean
  isDark: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Badge */}
      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-[13px] border border-white/40 bg-[linear-gradient(145deg,#7126e3_0%,#a855f7_48%,#d946ef_112%)] shadow-[0_14px_34px_-6px_rgba(89,23,196,0.6)]">
        <div className="absolute inset-x-2 top-1.5 h-3 rounded-full bg-white/35 blur-sm" />
        <span className="relative text-[10.5px] font-black tracking-[0.12em] text-white">Ev</span>
      </div>
      {/* Text mark */}
      <div className="min-w-0 leading-none">
        <div className="font-display text-[12.75px] font-extrabold tracking-[-0.01em] sm:text-[13.5px]" style={{ color: '#140832' }}>
          Eventies
        </div>
        <div className="mt-[3px] text-[8.5px] font-semibold uppercase tracking-[0.16em] text-violet-700 sm:text-[9px] sm:tracking-[0.18em]">
          Marketplace
        </div>
      </div>
    </div>
  )
}

// ── Badge count pill (module-level to avoid re-creation on every Navbar render) ─
function CountBadge({ count, color, isDark }: { count: string; color: 'cyan' | 'pink'; isDark: boolean }) {
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

// ── Shared icon circle (module-level to avoid re-creation on every Navbar render) ─
function IconCircle({
  children,
  active: isActive = false,
  colorScheme = 'neutral',
}: {
  children: React.ReactNode
  active?: boolean
  colorScheme?: 'neutral' | 'cyan' | 'pink'
  isDark?: boolean
  heroMode?: boolean
}) {
  const base = 'relative flex h-[1.875rem] w-[1.875rem] items-center justify-center rounded-full border'
  if (colorScheme === 'cyan' && isActive)
    return <span className={`${base} border-violet-400/85 bg-[linear-gradient(135deg,rgba(113,38,227,0.18),rgba(168,85,247,0.10))] text-violet-800`}>{children}</span>
  if (colorScheme === 'pink' && isActive)
    return <span className={`${base} border-fuchsia-400/85 bg-[linear-gradient(135deg,rgba(192,38,211,0.18),rgba(168,85,247,0.10))] text-fuchsia-800`}>{children}</span>
  return <span className={`${base} border-violet-300/75 bg-white/95 text-violet-700`}>{children}</span>
}

const DesktopPrimaryNav = memo(function DesktopPrimaryNav({
  active,
  canHoverDesktopNav,
  desktopMenu,
  desktopPanelFirstLinkRef,
  focus,
  navActivePill,
  navLinkColor,
  navTriggerColor,
  openDesktopMenu,
  scheduleDesktopClose,
  setDesktopTriggerRef,
}: {
  active: (target: string) => boolean
  canHoverDesktopNav: boolean
  desktopMenu: string | null
  desktopPanelFirstLinkRef: React.RefObject<HTMLAnchorElement | null>
  focus: string
  navActivePill: string
  navLinkColor: (isActive: boolean) => string
  navTriggerColor: (isActive: boolean, isOpen: boolean) => string
  openDesktopMenu: (key: string, immediate?: boolean) => void
  scheduleDesktopClose: (immediate?: boolean) => void
  setDesktopTriggerRef: (key: string, node: HTMLElement | null) => void
}) {
  return (
    <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Main navigation">
      <div className="flex items-center gap-0.5 rounded-xl px-1">
        {DESKTOP_NAV.map(item => {
          const isCurrent = getDesktopNavActive(item, active)
          const isOpen = desktopMenu === item.key
          const showPill = desktopMenu ? isOpen : isCurrent

          if (item.to) {
            return (
              <Link
                key={item.key}
                ref={node => setDesktopTriggerRef(item.key, node)}
                to={item.to}
                onMouseEnter={() => preloadRoute(item.to!)}
                onFocus={() => preloadRoute(item.to!)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`relative inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium tracking-[-0.01em] transition-all duration-200 ${navLinkColor(isCurrent)} ${focus}`}
              >
                {showPill && (
                  <motion.div
                    layoutId="desktop-nav-active"
                    className={`absolute inset-0 rounded-md ${navActivePill}`}
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
              ref={node => setDesktopTriggerRef(item.key, node)}
              type="button"
              aria-expanded={isOpen}
              aria-haspopup="menu"
              onMouseEnter={() => {
                preloadDesktopNavItem(item)
                if (canHoverDesktopNav) openDesktopMenu(item.key)
              }}
              onMouseLeave={() => {
                if (canHoverDesktopNav) scheduleDesktopClose()
              }}
              onFocus={() => preloadDesktopNavItem(item)}
              onClick={e => {
                if (!canHoverDesktopNav) {
                  e.preventDefault()
                  if (isOpen) scheduleDesktopClose(true)
                  else openDesktopMenu(item.key, true)
                  return
                }

                if (isOpen) scheduleDesktopClose(true)
                else openDesktopMenu(item.key, true)
              }}
              onKeyDown={e => {
                if (e.key === 'Escape') {
                  scheduleDesktopClose(true)
                  return
                }

                if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  if (isOpen) desktopPanelFirstLinkRef.current?.focus()
                  else {
                    openDesktopMenu(item.key, true)
                    window.setTimeout(() => desktopPanelFirstLinkRef.current?.focus(), 60)
                  }
                }
              }}
              className={`relative inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 text-sm font-medium tracking-[-0.01em] transition-all duration-200 ${navTriggerColor(isCurrent, isOpen)} ${focus}`}
            >
              {showPill && (
                <motion.div
                  layoutId="desktop-nav-active"
                  className={`absolute inset-0 rounded-md ${navActivePill}`}
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
  )
})

const MobileTopChips = memo(function MobileTopChips({
  active,
  heroMode,
  isDark,
}: {
  active: (target: string) => boolean
  heroMode: boolean
  isDark: boolean
}) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto px-4 pb-2.5 lg:hidden"
      style={{ scrollbarWidth: 'none' }}
    >
      {MOBILE_CHIPS.map(chip => {
        const isChipActive = active(chip.to)
        return (
          <Link
            key={chip.to}
            to={chip.to}
            onMouseEnter={() => preloadRoute(chip.to)}
            onFocus={() => preloadRoute(chip.to)}
            className={`inline-flex h-[1.875rem] shrink-0 items-center rounded-full border px-3.5 text-[11.5px] font-semibold whitespace-nowrap transition-all duration-300 ${
              isChipActive
                ? 'border-violet-400/80 bg-[linear-gradient(135deg,rgba(113,38,227,0.18),rgba(168,85,247,0.10))] text-violet-950 shadow-[0_4px_14px_-4px_rgba(89,23,196,0.32)]'
                : 'border-violet-300/60 bg-white/95 text-violet-800 hover:text-violet-950 hover:bg-white hover:border-violet-400/80'
            }`}
          >
            {chip.label}
          </Link>
        )
      })}
    </div>
  )
})

const NavbarAccountActions = memo(function NavbarAccountActions({
  focus,
  heroMode,
  isDark,
  pathname,
  utilityPill,
  userMenu,
  userMenuAnchorRef,
  onToggleUserMenu,
}: {
  focus: string
  heroMode: boolean
  isDark: boolean
  pathname: string
  utilityPill: string
  userMenu: boolean
  // Note: `useRef<HTMLDivElement>(null)` returns `RefObject<HTMLDivElement>`
  // (not `RefObject<HTMLDivElement | null>`) under @types/react 18. Mirror
  // that shape here so the value can be passed straight to a JSX `ref`
  // prop without an invariance error.
  userMenuAnchorRef: React.RefObject<HTMLDivElement>
  onToggleUserMenu: () => void
}) {
  const purchaseQuote = usePurchaseQuote()
  const rentalCart = useRentalCart()
  const { isLoggedIn, currentUser } = useUser()
  const deferredUser = useDeferredValue(currentUser)
  const cartItemCount = useDeferredValue(rentalCart.itemCount)
  const quoteItemCount = useDeferredValue(purchaseQuote.itemCount)

  const firstName = deferredUser?.name?.split(' ')[0] || 'User'
  const cartHasItems = cartItemCount > 0
  const cartCountLabel = cartItemCount > 99 ? '99+' : String(cartItemCount)
  const cartActive = pathname.startsWith('/rental-cart') || pathname.startsWith('/checkout')
  const quoteHasItems = quoteItemCount > 0
  const quoteCountLabel = quoteItemCount > 99 ? '99+' : String(quoteItemCount)
  const quoteActive = pathname.startsWith('/purchase-quote')

  const cartSurface = cartActive
    ? isDark
      ? 'border-cyan-300/28 bg-[linear-gradient(135deg,rgba(8,30,44,0.95),rgba(11,18,38,0.98))] text-white shadow-[0_16px_48px_rgba(2,8,18,0.46)]'
      : 'border-violet-400/60 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(244,234,255,0.98))] text-ink-900 shadow-[0_12px_32px_-10px_rgba(89,23,196,0.30)]'
    : cartHasItems
      ? isDark
        ? 'border-cyan-300/18 bg-[linear-gradient(135deg,rgba(8,25,38,0.9),rgba(13,18,34,0.94))] text-white hover:border-cyan-300/30'
        : 'border-violet-300/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,238,255,0.96))] text-ink-900 hover:border-violet-400/80'
      : utilityPill

  const quoteSurface = quoteActive
    ? isDark
      ? 'border-fuchsia-300/24 bg-[linear-gradient(135deg,rgba(39,15,57,0.96),rgba(16,14,36,0.98))] text-white shadow-[0_16px_48px_rgba(17,5,28,0.42)]'
      : 'border-violet-400/60 bg-[linear-gradient(135deg,rgba(255,255,255,1),rgba(248,236,255,0.98))] text-ink-900 shadow-[0_12px_32px_-10px_rgba(168,85,247,0.28)]'
    : isDark
      ? 'border-fuchsia-300/16 bg-[linear-gradient(135deg,rgba(31,14,42,0.92),rgba(14,14,31,0.96))] text-white hover:border-fuchsia-300/28'
      : 'border-violet-300/55 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,236,255,0.96))] text-ink-900 hover:border-violet-400/75'

  return (
    <>
      <Link
        to="/rental-cart"
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-md border transition-all sm:w-auto sm:justify-start sm:gap-2 sm:px-3.5 ${cartSurface} ${focus}`}
        aria-label={cartHasItems ? `Cart · ${cartItemCount}` : 'Cart'}
      >
        {/* Unified pill content — same visual structure as Search / Login:
            a 16-px outlined icon followed by the label. No coloured icon
            circle, so the three nav buttons feel like one family. The
            count badge anchors to the icon directly. */}
        <span className="relative inline-flex">
          <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
          {cartHasItems && <CountBadge count={cartCountLabel} color="cyan" isDark={isDark} />}
        </span>
        <span className="hidden text-[12px] font-semibold sm:inline">Cart</span>
      </Link>

      {isLoggedIn ? (
        <div ref={userMenuAnchorRef} className="relative hidden sm:block">
          <button
            onClick={onToggleUserMenu}
            className={`inline-flex h-10 items-center gap-2 rounded-md border pl-2 pr-3 transition-all ${utilityPill} ${focus}`}
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
                name={deferredUser?.name}
                email={deferredUser?.email}
                avatarUrl={deferredUser?.avatarUrl}
                avatarStyle={deferredUser?.avatarStyle}
                avatarSeed={deferredUser?.avatarSeed}
                avatarOptions={deferredUser?.avatarOptions}
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
          className={`hidden h-10 items-center gap-2 rounded-md border px-3.5 text-[12px] font-semibold transition-all sm:inline-flex ${utilityPill} ${focus}`}
        >
          <User2 className="h-4 w-4" strokeWidth={2.2} />
          <span>Login</span>
        </Link>
      )}

      {(quoteHasItems || quoteActive) && (
        <Link
          to="/purchase-quote"
          className={`relative hidden h-10 items-center gap-2 rounded-md border px-3 transition-all lg:inline-flex ${quoteSurface} ${focus}`}
          aria-label={quoteHasItems ? `Quote · ${quoteItemCount}` : 'Quote draft'}
        >
          <IconCircle active={quoteHasItems || quoteActive} colorScheme="pink" isDark={isDark} heroMode={heroMode}>
            <FileText className="h-3.5 w-3.5" strokeWidth={2} />
            {quoteHasItems && <CountBadge count={quoteCountLabel} color="pink" isDark={isDark} />}
          </IconCircle>
          <span className="text-[12px] font-medium">Quote</span>
        </Link>
      )}
    </>
  )
})

const NavbarMobileUtilityGrid = memo(function NavbarMobileUtilityGrid({
  focus,
  isDark,
  mobileActiveTile,
  mobileTile,
  openSearchDialog,
  pathname,
}: {
  focus: string
  isDark: boolean
  mobileActiveTile: string
  mobileTile: string
  openSearchDialog: () => void
  pathname: string
}) {
  const { isAuth } = useAuth()
  const { isLoggedIn, currentUser, logout } = useUser()
  const purchaseQuote = usePurchaseQuote()
  const rentalCart = useRentalCart()
  const deferredUser = useDeferredValue(currentUser)
  const firstName = deferredUser?.name?.split(' ')[0] || 'User'
  const cartItemCount = useDeferredValue(rentalCart.itemCount)
  const quoteItemCount = useDeferredValue(purchaseQuote.itemCount)
  const cartHasItems = cartItemCount > 0
  const cartCountLabel = cartItemCount > 99 ? '99+' : String(cartItemCount)
  const cartActive = pathname.startsWith('/rental-cart') || pathname.startsWith('/checkout')
  const quoteHasItems = quoteItemCount > 0
  const quoteCountLabel = quoteItemCount > 99 ? '99+' : String(quoteItemCount)
  const quoteActive = pathname.startsWith('/purchase-quote')

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <button
        type="button"
        onClick={openSearchDialog}
        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
      >
        <Search className="h-4 w-4 opacity-70" strokeWidth={2} />
        Search
      </button>

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
  )
})

const NavbarUserMenuPortal = memo(function NavbarUserMenuPortal({
  focus,
  isDark,
  onClose,
  userMenu,
  userMenuPopoverRef,
  userMenuPosition,
}: {
  focus: string
  isDark: boolean
  onClose: () => void
  userMenu: boolean
  userMenuPopoverRef: React.RefObject<HTMLDivElement>
  userMenuPosition: { top: number; left: number; placement: 'top' | 'bottom' } | null
}) {
  const { isAuth } = useAuth()
  const { currentUser, logout } = useUser()
  const deferredUser = useDeferredValue(currentUser)

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {userMenu && userMenuPosition && (
        <motion.div
          ref={userMenuPopoverRef}
          initial={{ opacity: 0, y: userMenuPosition.placement === 'bottom' ? -8 : 8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: userMenuPosition.placement === 'bottom' ? -8 : 8, scale: 0.97 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed z-[110] w-[288px] overflow-hidden rounded-[20px] border ${
            isDark
              ? 'border-white/[0.08] bg-[linear-gradient(170deg,rgba(7,9,22,0.995),rgba(4,6,16,0.995))] shadow-[0_28px_90px_rgba(0,2,10,0.68),inset_0_1px_0_rgba(255,255,255,0.05)]'
              : 'border-violet-300/70 bg-white shadow-[0_32px_80px_-18px_rgba(46,10,114,0.32),0_10px_28px_-8px_rgba(89,23,196,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]'
          } ${userMenuPosition.placement === 'bottom' ? 'origin-top-right' : 'origin-bottom-right'}`}
          style={{
            top: `${userMenuPosition.top}px`,
            left: `${userMenuPosition.left}px`,
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background: isDark
                ? 'linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.5) 50%, transparent 90%)'
                : 'linear-gradient(90deg, transparent 10%, rgba(124,58,237,0.2) 50%, transparent 90%)',
            }}
          />

          <div className={`flex items-center gap-3 px-4 py-4 ${isDark ? 'border-b border-white/[0.07]' : 'border-b border-violet-200/70 bg-gradient-to-b from-violet-50/60 to-transparent'}`}>
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
              isDark
                ? 'border-violet-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.28),rgba(236,72,153,0.16))]'
                : 'border-violet-300/60 bg-[linear-gradient(135deg,rgba(113,38,227,0.18),rgba(217,70,239,0.10))] shadow-[0_4px_12px_-4px_rgba(89,23,196,0.32)]'
            }`}>
              <UserAvatar
                name={deferredUser?.name}
                email={deferredUser?.email}
                avatarUrl={deferredUser?.avatarUrl}
                avatarStyle={deferredUser?.avatarStyle}
                avatarSeed={deferredUser?.avatarSeed}
                avatarOptions={deferredUser?.avatarOptions}
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
              <div className={`truncate text-[13px] font-bold tracking-[-0.01em] ${isDark ? 'text-white' : 'text-ink-900'}`}>
                {deferredUser?.name || 'User'}
              </div>
              <div className={`truncate text-[11px] ${isDark ? 'text-purple-100/42' : 'text-ink-500'}`}>
                {deferredUser?.email || ''}
              </div>
            </div>
          </div>

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
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[12.5px] font-semibold transition-all duration-200 ${
                    isDark
                      ? 'text-purple-100/70 hover:bg-white/[0.06] hover:text-white'
                      : 'text-ink-800 hover:bg-violet-100/70 hover:text-violet-950'
                  } ${focus}`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isDark ? 'text-white/38' : 'text-violet-600'}`} strokeWidth={2} />
                  {item.label}
                </Link>
              )
            })}

            <div className={`my-1.5 h-px ${isDark ? 'bg-white/[0.06]' : 'bg-violet-200/70'}`} />

            <button
              type="button"
              onClick={() => {
                onClose()
                void logout()
              }}
              className={`flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left text-[12.5px] font-semibold transition-all duration-200 ${
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
  )
})

export default function Navbar() {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const { perfLow } = usePerfMode()

  // ── Route-derived flags (declared up-front so any effect/state hook below
  //    can reference them in deps arrays without hitting a TDZ in production).
  const isHome = pathname === '/'
  // Hero is now light/purple, so the navbar uses the same light treatment over hero
  const heroMode = false

  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [desktopMenu, setDesktopMenu] = useState<string | null>(null)
  const [desktopMenuPosition, setDesktopMenuPosition] = useState<{
    top: number
    left: number
    width: number
    compact: boolean
  } | null>(null)
  const [userMenu, setUserMenu] = useState(false)
  const [userMenuPosition, setUserMenuPosition] = useState<{
    top: number
    left: number
    placement: 'top' | 'bottom'
  } | null>(null)

  const userMenuAnchorRef = useRef<HTMLDivElement>(null)
  const userMenuPopoverRef = useRef<HTMLDivElement>(null)
  const desktopMenuPopoverRef = useRef<HTMLDivElement>(null)
  const navbarBarRef = useRef<HTMLDivElement>(null)
  const navSurfaceRef = useRef<HTMLDivElement>(null)
  const desktopPanelFirstLinkRef = useRef<HTMLAnchorElement>(null)
  const desktopTriggerRefs = useRef<Record<string, HTMLElement | null>>({})
  const desktopOpenTimerRef = useRef<number | null>(null)
  const desktopCloseTimerRef = useRef<number | null>(null)
  const scrolledRef = useRef(false)
  const [canHoverDesktopNav, setCanHoverDesktopNav] = useState(true)

  useBodyScrollLock(open)

  const openSearchDialog = useCallback(() => {
    if (desktopOpenTimerRef.current) {
      window.clearTimeout(desktopOpenTimerRef.current)
      desktopOpenTimerRef.current = null
    }
    if (desktopCloseTimerRef.current) {
      window.clearTimeout(desktopCloseTimerRef.current)
      desktopCloseTimerRef.current = null
    }
    setOpen(false)
    setDesktopMenu(null)
    setUserMenu(false)
    setSearchOpen(true)
  }, [])

  // Cmd/Ctrl+K search shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(current => {
          const next = !current
          if (next) {
            if (desktopOpenTimerRef.current) {
              window.clearTimeout(desktopOpenTimerRef.current)
              desktopOpenTimerRef.current = null
            }
            if (desktopCloseTimerRef.current) {
              window.clearTimeout(desktopCloseTimerRef.current)
              desktopCloseTimerRef.current = null
            }
            setOpen(false)
            setDesktopMenu(null)
            setUserMenu(false)
          }
          return next
        })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    const update = () => setCanHoverDesktopNav(media.matches)

    update()

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    }

    media.addListener(update)
    return () => media.removeListener(update)
  }, [])

  useEffect(() => {
    // Binary "scrolled" flag used by non-home routes. The home page does
    // not depend on this — it drives the navbar surface via a continuous
    // scroll-based ramp (see the navSurfaceRef effect below).
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        const nextScrolled = window.scrollY > 18
        if (scrolledRef.current !== nextScrolled) {
          scrolledRef.current = nextScrolled
          setScrolled(nextScrolled)
        }
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── Home: drive navbar surface continuously from scroll position ────────
  // The bar starts fully transparent at scrollY = 0 and ramps to a solid
  // white surface within the first ~60 px of scroll. Non-home routes keep
  // their static class-based surface (see navBarBg).
  useEffect(() => {
    const el = navSurfaceRef.current
    if (!el) return

    if (!isHome) {
      // Clear any inline styles left over from the home page.
      el.style.backgroundColor = ''
      el.style.borderBottomColor = ''
      el.style.boxShadow = ''
      el.style.backdropFilter = ''
      ;(el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = ''
      el.style.transition = ''
      return
    }

    // Disable the wrapper's CSS transition while we're driving it via
    // requestAnimationFrame — otherwise the transition would fight every
    // frame and feel laggy. The ramp itself is already smooth.
    el.style.transition = 'none'

    let raf = 0
    const apply = () => {
      raf = 0
      const y = window.scrollY
      const p = Math.min(1, Math.max(0, y / 60)) // 0 → 1 over 60px

      el.style.backgroundColor = `rgba(255, 255, 255, ${p * 0.92})`
      el.style.borderBottomColor = `rgba(196, 165, 255, ${p * 0.55})`
      el.style.boxShadow =
        p > 0.04 ? `0 2px 28px rgba(46, 10, 114, ${p * 0.16})` : 'none'

      const blur = `${(p * 16).toFixed(2)}px`
      const filter = p > 0.04 ? `blur(${blur}) saturate(1.2)` : 'none'
      el.style.backdropFilter = filter
      ;(el.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = filter
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(apply)
    }

    apply()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (raf) window.cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isHome])

  useEffect(() => {
    setOpen(false)
    setDesktopMenu(null)
    setUserMenu(false)
    setSearchOpen(false)
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
    const handleOutsideClose = (e: Event) => {
      const target = e.target as Node
      if (
        !userMenuAnchorRef.current?.contains(target) &&
        !userMenuPopoverRef.current?.contains(target)
      ) {
        setUserMenu(false)
      }
    }
    // mousedown for mouse; touchstart for iPad/touch devices (mousedown never fires on tap)
    document.addEventListener('mousedown', handleOutsideClose)
    document.addEventListener('touchstart', handleOutsideClose, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handleOutsideClose)
      document.removeEventListener('touchstart', handleOutsideClose)
    }
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
    const placement = shouldAbove ? 'top' : 'bottom'

    setUserMenuPosition(prev =>
      prev && prev.top === top && prev.left === left && prev.placement === placement
        ? prev
        : { top, left, placement }
    )
  }, [])

  const toggleUserMenu = useCallback(() => {
    if (!userMenu) updateUserMenuPosition()
    setUserMenu(value => !value)
  }, [updateUserMenuPosition, userMenu])

  useEffect(() => {
    if (!userMenu) { setUserMenuPosition(null); return }

    let frame = 0
    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateUserMenuPosition()
      })
    }

    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    window.addEventListener('scroll', scheduleUpdate, true)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate, true)
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

  useEffect(() => {
    if (!searchOpen) return
    if (desktopOpenTimerRef.current) {
      window.clearTimeout(desktopOpenTimerRef.current)
      desktopOpenTimerRef.current = null
    }
    if (desktopCloseTimerRef.current) {
      window.clearTimeout(desktopCloseTimerRef.current)
      desktopCloseTimerRef.current = null
    }
    setOpen(false)
    setUserMenu(false)
  }, [searchOpen])

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
  const active = useCallback(
    (target: string) => (target === '/' ? pathname === '/' : pathname.startsWith(target)),
    [pathname]
  )

  const focus =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent'

  // ── Nav bar background ────────────────────────────────────────────────────
  // Home page: handled by the navSurfaceRef effect — surface ramps from
  // transparent → white over the first 60 px of scroll. We leave the class
  // empty here so the inline styles win cleanly.
  //
  // Other pages: keep the existing static white surface, with the
  // "scrolled" variant kicking in after a tiny 18 px scroll.
  const navBarBg = isHome
    ? 'border-b border-transparent'
    : scrolled
      ? perfLow
        ? 'border-b border-violet-300/55 bg-white/[0.97] shadow-[0_2px_28px_rgba(46,10,114,0.14)]'
        : 'border-b border-violet-300/55 bg-white/[0.92] backdrop-blur-xl shadow-[0_2px_28px_rgba(46,10,114,0.14)]'
      : perfLow
        ? 'border-b border-violet-200/55 bg-white/[0.95]'
        : 'border-b border-violet-200/55 bg-white/[0.86] backdrop-blur-xl shadow-[0_1px_22px_rgba(46,10,114,0.08)]'

  // ── Utility pill (search, login) ───────────────────────────────────────────
  const utilityPill =
    'border-violet-300/70 bg-white/95 text-violet-900 hover:border-violet-500/70 hover:bg-white hover:text-violet-950 hover:shadow-[0_10px_26px_-10px_rgba(89,23,196,0.32)]'

  // ── Desktop nav link text ──────────────────────────────────────────────────
  const navLinkColor = useCallback(
    (isActive: boolean) =>
      isActive
        ? 'text-violet-950'
        : 'text-ink-700 hover:text-violet-900',
    []
  )

  const navTriggerColor = useCallback(
    (isActive: boolean, isOpen: boolean) =>
      isActive || isOpen
        ? 'text-violet-950'
        : 'text-ink-700 hover:text-violet-900',
    []
  )

  // ── Active pill ────────────────────────────────────────────────────────────
  const navActivePill =
    'bg-white border border-violet-300/80 shadow-[0_10px_24px_-10px_rgba(89,23,196,0.32)]'

  // ── Mobile tile ────────────────────────────────────────────────────────────
  const mobileTile =
    'border-violet-300/55 bg-white/95 text-violet-900 hover:text-violet-950 hover:bg-white hover:border-violet-400/70'

  const mobileActiveTile =
    'border-violet-400/70 bg-[linear-gradient(135deg,rgba(113,38,227,0.18),rgba(168,85,247,0.10),rgba(217,70,239,0.08))] text-violet-950 shadow-[0_6px_18px_-6px_rgba(89,23,196,0.32)]'

  // ── Cart / Quote surfaces ──────────────────────────────────────────────────
  // ── Desktop nav data ────────────────────────────────────────────────────────

  const activeDesktopItem = useMemo(
    () => DESKTOP_NAV.find(item => item.key === desktopMenu) ?? null,
    [desktopMenu]
  )

  const setDesktopTriggerRef = useCallback((key: string, node: HTMLElement | null) => {
    desktopTriggerRefs.current[key] = node
  }, [])

  const updateDesktopMenuPosition = useCallback(
    (key: string) => {
      if (typeof window === 'undefined' || window.innerWidth < 1024) return
      const trigger = desktopTriggerRefs.current[key]
      const item = DESKTOP_NAV.find(entry => entry.key === key)
      if (!trigger || !item?.children?.length) return

      const rect = trigger.getBoundingClientRect()
      const pad = 16
      const compact = window.innerWidth < 1360
      const preferredWidth =
        key === 'explore'
          ? compact
            ? 400
            : 470
          : compact
            ? 360
            : 420
      const width = Math.min(window.innerWidth - pad * 2, preferredWidth)
      const rawLeft =
        key === 'company'
          ? rect.right - width + (compact ? 0 : 10)
          : compact
            ? rect.left - 20
            : rect.left + rect.width / 2 - width / 2
      const left = Math.min(
        window.innerWidth - pad - width,
        Math.max(pad, rawLeft)
      )
      const top = rect.bottom + 4

      setDesktopMenuPosition(prev =>
        prev &&
        prev.top === top &&
        prev.left === left &&
        prev.width === width &&
        prev.compact === compact
          ? prev
          : { top, left, width, compact }
      )
    },
    []
  )

  const clearDesktopTimers = useCallback(() => {
    if (desktopOpenTimerRef.current) { window.clearTimeout(desktopOpenTimerRef.current); desktopOpenTimerRef.current = null }
    if (desktopCloseTimerRef.current) { window.clearTimeout(desktopCloseTimerRef.current); desktopCloseTimerRef.current = null }
  }, [])

  const openDesktopMenu = useCallback(
    (key: string, immediate = false) => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return
      clearDesktopTimers()
      const show = () => {
        setDesktopMenu(key)
        window.requestAnimationFrame(() => updateDesktopMenuPosition(key))
      }

      if (immediate) {
        show()
        return
      }

      desktopOpenTimerRef.current = window.setTimeout(show, 36)
    },
    [clearDesktopTimers, updateDesktopMenuPosition]
  )

  const scheduleDesktopClose = useCallback(
    (immediate = false) => {
      clearDesktopTimers()
      if (immediate) {
        setDesktopMenu(null)
        setDesktopMenuPosition(null)
        return
      }
      desktopCloseTimerRef.current = window.setTimeout(() => {
        setDesktopMenu(null)
        setDesktopMenuPosition(null)
      }, 140)
    },
    [clearDesktopTimers]
  )

  useEffect(() => {
    if (!desktopMenu) {
      setDesktopMenuPosition(null)
      return
    }
    if (typeof window === 'undefined' || window.innerWidth < 1024) {
      setDesktopMenuPosition(null)
      return
    }

    let frame = 0
    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        updateDesktopMenuPosition(desktopMenu)
      })
    }

    scheduleUpdate()
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    window.addEventListener('scroll', scheduleUpdate, true)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate, true)
    }
  }, [desktopMenu, updateDesktopMenuPosition])

  useEffect(() => {
    if (!desktopMenu) return

    const handleOutsidePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      if (desktopMenuPopoverRef.current?.contains(target)) return
      if (Object.values(desktopTriggerRefs.current).some(node => node?.contains(target))) return

      scheduleDesktopClose(true)
    }

    document.addEventListener('mousedown', handleOutsidePointer)
    document.addEventListener('touchstart', handleOutsidePointer, { passive: true })

    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer)
      document.removeEventListener('touchstart', handleOutsidePointer)
    }
  }, [desktopMenu, scheduleDesktopClose])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 w-full">
      {/* ══════════════════════ MAIN BAR ══════════════════════ */}
      <div ref={navSurfaceRef} className={`pointer-events-auto w-full transition-all duration-500 ${navBarBg}`}>
        <div className="relative mx-auto max-w-[84rem]">

          {/* ─── Nav bar rows (ref covers both rows so --app-navbar-height includes chip row) ─── */}
          <div ref={navbarBarRef}>
          <div className="flex h-[3.75rem] items-center justify-between px-4 sm:h-[4.25rem] sm:px-6 lg:mx-auto lg:h-14 lg:max-w-[78rem] lg:px-4">

            {/* ── Logo ── */}
            <Link
              to="/"
              className={`flex min-w-0 items-center transition-opacity hover:opacity-88 lg:min-w-[180px] ${focus}`}
            >
              <EventiesLogo heroMode={heroMode} isDark={isDark} />
            </Link>

            {/* ── Desktop nav (center) ── */}
            <DesktopPrimaryNav
              active={active}
              canHoverDesktopNav={canHoverDesktopNav}
              desktopMenu={desktopMenu}
              desktopPanelFirstLinkRef={desktopPanelFirstLinkRef}
              focus={focus}
              navActivePill={navActivePill}
              navLinkColor={navLinkColor}
              navTriggerColor={navTriggerColor}
              openDesktopMenu={openDesktopMenu}
              scheduleDesktopClose={scheduleDesktopClose}
              setDesktopTriggerRef={setDesktopTriggerRef}
            />

            {/* ── Right actions ── */}
            <div className="flex items-center justify-end gap-1.5 sm:gap-2 lg:min-w-[160px]">

              {/* Search compact (sm–xl) — same square footprint as Cart
                  & hamburger so the right-side controls line up. */}
              <button
                onClick={openSearchDialog}
                className={`hidden h-10 w-10 items-center justify-center rounded-md border text-[12px] font-medium transition-all sm:inline-flex xl:hidden ${utilityPill} ${focus}`}
                aria-label="Search (Ctrl+K)"
              >
                <Search className="h-4 w-4" strokeWidth={2.2} />
              </button>

              {/* Search with label (xl+) */}
              <button
                onClick={openSearchDialog}
                className={`hidden h-10 items-center gap-2 rounded-md border px-3.5 text-[12px] font-semibold transition-all xl:inline-flex ${utilityPill} ${focus}`}
                aria-label="Search (Ctrl+K)"
              >
                <Search className="h-4 w-4" strokeWidth={2.2} />
                <span>Search</span>
                <kbd className={`ml-0.5 rounded-md border px-1.5 py-0.5 text-[8.5px] font-mono tracking-[0.08em] ${
                  heroMode
                    ? 'border-white/12 bg-white/[0.06] text-white/38'
                    : isDark
                      ? 'border-white/10 bg-white/[0.04] text-purple-100/44'
                      : 'border-violet-200 bg-violet-50/80 text-violet-600'
                }`}>
                  ⌘K
                </kbd>
              </button>

              <NavbarAccountActions
                focus={focus}
                heroMode={heroMode}
                isDark={isDark}
                pathname={pathname}
                utilityPill={utilityPill}
                userMenu={userMenu}
                userMenuAnchorRef={userMenuAnchorRef}
                onToggleUserMenu={toggleUserMenu}
              />

              {/* Hamburger — matches the Cart button's mobile footprint
                  exactly (h-10 w-10 rounded-md), so on phones the two
                  right-side controls read as a tidy pair. */}
              <button
                onClick={() => setOpen(v => !v)}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-md border transition-all lg:hidden ${
                  open
                    ? isDark
                      ? 'border-violet-400/30 bg-violet-500/14 text-white'
                      : 'border-violet-400/70 bg-violet-50 text-violet-900'
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

          {/* ── Mobile nav chip row (row 2 — only shows below lg breakpoint) ── */}
          <MobileTopChips active={active} heroMode={heroMode} isDark={isDark} />
          </div>{/* closes navbarBarRef wrapper */}

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
                      ? 'border-white/[0.08] bg-[linear-gradient(180deg,rgba(5,7,20,0.99),rgba(3,5,16,0.99))] shadow-[0_24px_80px_rgba(0,2,12,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]'
                      : 'border-violet-300/70 bg-white shadow-[0_24px_64px_-12px_rgba(46,10,114,0.28),0_8px_22px_-6px_rgba(89,23,196,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]'
                  }`}
                  style={{
                    maxHeight: 'calc(100dvh - 5.5rem)',
                    paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
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
                      <NavbarMobileUtilityGrid
                        focus={focus}
                        isDark={isDark}
                        mobileActiveTile={mobileActiveTile}
                        mobileTile={mobileTile}
                        openSearchDialog={openSearchDialog}
                        pathname={pathname}
                      />
                    </div>

                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ══════════════════════ DESKTOP DROPDOWN ══════════════════════ */}
          <AnimatePresence>
            {activeDesktopItem?.children && desktopMenuPosition && (
              <motion.div
                ref={desktopMenuPopoverRef}
                initial={{ opacity: 0, y: -10, scale: 0.982 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.982 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onMouseEnter={() => {
                  if (canHoverDesktopNav) clearDesktopTimers()
                }}
                onMouseLeave={() => {
                  if (canHoverDesktopNav) scheduleDesktopClose()
                }}
                onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); scheduleDesktopClose(true) } }}
                className="fixed z-[100] hidden lg:block"
                role="menu"
                aria-label={`${activeDesktopItem.label} menu`}
                style={{
                  top: desktopMenuPosition.top,
                  left: desktopMenuPosition.left,
                  width: desktopMenuPosition.width,
                }}
              >
                {/* Hover bridge — keeps menu open while mouse travels from trigger to panel.
                    pointer-events-none on touch devices so it doesn't intercept taps. */}
                <div className={`absolute inset-x-0 -top-4 h-5 ${canHoverDesktopNav ? 'pointer-events-auto' : 'pointer-events-none'}`} />

                <div
                  className={`relative overflow-hidden rounded-[18px] border ${
                    isDark
                      ? 'border-white/[0.08] bg-[rgba(7,9,22,0.92)] shadow-[0_24px_72px_rgba(0,2,10,0.56),inset_0_1px_0_rgba(255,255,255,0.04)]'
                      : 'border-violet-300/70 bg-white shadow-[0_30px_80px_-18px_rgba(46,10,114,0.32),0_10px_28px_-8px_rgba(89,23,196,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]'
                  }`}
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

                  <div>

                    {/* ── Left panel: title + CTA ── */}
                    <div className={`relative flex flex-col justify-between px-6 py-5 ${
                      isDark
                        ? 'bg-[linear-gradient(160deg,rgba(12,10,28,0.96),rgba(8,9,20,0.9))]'
                        : 'bg-[linear-gradient(160deg,rgba(247,241,255,1),rgba(241,231,255,0.96))] border-b border-violet-200/60'
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
                          isDark ? 'text-violet-300/68' : 'text-violet-800'
                        }`}>
                          {activeDesktopItem.eyebrow}
                        </div>
                        <h3 className={`mt-2 font-display text-[1.04rem] font-bold leading-tight tracking-[-0.025em] ${
                          isDark ? 'text-white' : 'text-ink-900'
                        }`}>
                          {activeDesktopItem.title}
                        </h3>
                        <p className={`mt-2.5 max-w-[14rem] text-[11.5px] leading-[1.55] ${
                          isDark ? 'text-purple-100/52' : 'text-ink-600'
                        }`}>
                          {activeDesktopItem.body}
                        </p>
                      </div>

                      {activeDesktopItem.ctaTo && activeDesktopItem.ctaLabel && (
                        <Link
                          to={activeDesktopItem.ctaTo}
                          onClick={() => scheduleDesktopClose(true)}
                          className={`mt-5 inline-flex h-10 w-fit items-center gap-2 rounded-md border px-4 text-[11px] font-bold transition-all duration-200 hover:-translate-y-0.5 ${
                            isDark
                              ? 'border-white/[0.11] bg-white/[0.05] text-white hover:border-violet-400/22 hover:bg-white/[0.08]'
                              : 'border-violet-300/80 bg-white text-violet-800 shadow-[0_4px_14px_-6px_rgba(89,23,196,0.22)] hover:border-violet-500 hover:bg-violet-50 hover:text-violet-900'
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
                        ? 'bg-[linear-gradient(180deg,rgba(6,8,20,0.9),rgba(5,7,16,0.84))]'
                        : 'bg-white'
                    }`}>
                      <div
                        className={`grid gap-2 ${
                          desktopMenuPosition.compact
                            ? 'grid-cols-1'
                            : activeDesktopItem.children.length > 2
                              ? 'grid-cols-2'
                              : 'grid-cols-1'
                        }`}
                      >
                        {activeDesktopItem.children.map((child, index) => {
                          const isCurrent = active(child.to)
                          const Icon = child.icon
                          return (
                            <Link
                              key={child.to}
                              ref={index === 0 ? desktopPanelFirstLinkRef : undefined}
                              to={child.to}
                              onMouseEnter={() => preloadRoute(child.to)}
                              onFocus={() => preloadRoute(child.to)}
                              onClick={() => scheduleDesktopClose(true)}
                              role="menuitem"
                              className={`group relative flex items-start gap-3 overflow-hidden rounded-[14px] border p-3 transition-all duration-200 ${
                                isCurrent
                                  ? isDark
                                    ? 'border-violet-300/24 bg-[linear-gradient(148deg,rgba(124,58,237,0.16),rgba(236,72,153,0.07),rgba(34,211,238,0.07))]'
                                    : 'border-violet-400/60 bg-[linear-gradient(148deg,rgba(113,38,227,0.14),rgba(217,70,239,0.08))] shadow-[0_4px_14px_-6px_rgba(89,23,196,0.28)]'
                                  : isDark
                                    ? 'border-white/[0.06] bg-white/[0.02] hover:border-violet-400/18 hover:bg-white/[0.05]'
                                    : 'border-violet-200/70 bg-white hover:border-violet-400/60 hover:bg-violet-50/70 hover:shadow-[0_6px_18px_-8px_rgba(89,23,196,0.24)]'
                              } ${focus}`}
                            >
                              {/* Hover glow on item */}
                              {isDark && !isCurrent && (
                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100"
                                  style={{ background: 'radial-gradient(ellipse 90% 70% at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 70%)' }}
                                />
                              )}

                              {/* Icon */}
                              <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md border transition-transform duration-200 group-hover:scale-105 ${
                                isCurrent
                                  ? isDark
                                    ? 'border-violet-400/28 bg-[linear-gradient(145deg,rgba(124,58,237,0.28),rgba(236,72,153,0.14))] text-violet-200'
                                    : 'border-violet-400/70 bg-[linear-gradient(145deg,rgba(113,38,227,0.22),rgba(217,70,239,0.12))] text-violet-800'
                                  : isDark
                                    ? 'border-white/[0.09] bg-white/[0.05] text-white/75 group-hover:border-violet-400/22 group-hover:text-white'
                                    : 'border-violet-200/80 bg-violet-50 text-violet-700 group-hover:border-violet-400 group-hover:bg-violet-100'
                              }`}>
                                <Icon className="h-4 w-4" strokeWidth={2} />
                              </div>

                              {/* Text */}
                              <div className="relative min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <span className={`text-[12.5px] font-bold tracking-[-0.01em] transition-colors ${
                                    isDark ? 'text-white/90 group-hover:text-white' : 'text-ink-900 group-hover:text-violet-900'
                                  }`}>
                                    {child.label}
                                  </span>
                                  <span className={`shrink-0 rounded-full border px-2 py-[3px] text-[7.5px] font-bold uppercase tracking-[0.12em] ${
                                    isDark
                                      ? 'border-white/[0.09] bg-white/[0.04] text-cyan-200/58'
                                      : 'border-violet-300/70 bg-violet-100/80 text-violet-800'
                                  }`}>
                                    {child.meta}
                                  </span>
                                </div>
                                <p className={`mt-1.5 text-[11px] leading-[1.5] ${
                                  isDark ? 'text-purple-100/48 group-hover:text-purple-100/65' : 'text-ink-600'
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
      <NavbarUserMenuPortal
        focus={focus}
        isDark={isDark}
        onClose={() => setUserMenu(false)}
        userMenu={userMenu}
        userMenuPopoverRef={userMenuPopoverRef}
        userMenuPosition={userMenuPosition}
      />

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
