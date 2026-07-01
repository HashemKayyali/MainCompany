import { memo, useDeferredValue, type RefObject } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import {
  ArrowRight,
  ChevronDown,
  FileText,
  LogOut,
  Search,
  ShieldCheck,
  ShoppingCart,
  User2,
} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'
import { usePurchaseQuote } from '../../../contexts/PurchaseQuoteContext'
import { useRentalCart } from '../../../contexts/RentalCartContext'
import { useUser } from '../../../contexts/UserContext'
import { preloadRoute } from '../../../utils/route-preload'
import UserAvatar from '../../ui/UserAvatar'
import { CountBadge, IconCircle } from './NavbarPrimitives'
import { DESKTOP_NAV, MOBILE_CHIPS, getDesktopNavActive, preloadDesktopNavItem } from './navConfig'

export const DesktopPrimaryNav = memo(function DesktopPrimaryNav({
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
  desktopPanelFirstLinkRef: RefObject<HTMLAnchorElement | null>
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
                className={`relative inline-flex h-10 items-center justify-center rounded-md px-4 font-display text-sm font-medium tracking-[-0.01em] transition-all duration-200 ${navLinkColor(isCurrent)} ${focus}`}
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
              className={`relative inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-4 font-display text-sm font-medium tracking-[-0.01em] transition-all duration-200 ${navTriggerColor(isCurrent, isOpen)} ${focus}`}
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

export const MobileTopChips = memo(function MobileTopChips({
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
            className={`inline-flex h-[1.875rem] shrink-0 items-center rounded-full border px-3.5 font-display text-[11.5px] font-semibold whitespace-nowrap transition-all duration-300 ${
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

export const NavbarAccountActions = memo(function NavbarAccountActions({
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
  userMenuAnchorRef: RefObject<HTMLDivElement>
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
        aria-label={cartHasItems ? `Request draft · ${cartItemCount}` : 'Request draft'}
      >
        {/* Unified pill content — same visual structure as Search / Login:
            a 16-px outlined icon followed by the label. No coloured icon
            circle, so the three nav buttons feel like one family. The
            count badge anchors to the icon directly. */}
        <span className="relative inline-flex">
          <ShoppingCart className="h-4 w-4" strokeWidth={2.2} />
          {cartHasItems && <CountBadge count={cartCountLabel} color="cyan" isDark={isDark} />}
        </span>
        <span className="hidden font-display text-[12px] font-semibold sm:inline">Request Draft</span>
      </Link>

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
          <span className="font-display text-[12px] font-medium">Quote</span>
        </Link>
      )}

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
                className="h-full w-full rounded-full"
                fallbackClassName={
                  isDark
                    ? 'bg-[linear-gradient(135deg,rgba(124,58,237,0.52),rgba(236,72,153,0.35))] text-white'
                    : 'bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.12))] text-violet-700'
                }
              />
            </div>
            <span className="hidden font-display text-[12px] font-medium md:inline">{firstName}</span>
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
          className={`hidden h-10 items-center gap-2 rounded-md border px-3.5 font-display text-[12px] font-semibold transition-all sm:inline-flex ${utilityPill} ${focus}`}
        >
          <User2 className="h-4 w-4" strokeWidth={2.2} />
          <span>Login</span>
        </Link>
      )}
    </>
  )
})

export const NavbarMobileUtilityGrid = memo(function NavbarMobileUtilityGrid({
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
        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
      >
        <Search className="h-4 w-4 opacity-70" strokeWidth={2} />
        Search
      </button>

      <Link
        to="/rental-cart"
        className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-semibold transition-all ${
          cartActive ? mobileActiveTile : mobileTile
        } ${focus}`}
      >
        <ShoppingCart className="h-4 w-4 opacity-70" strokeWidth={2} />
        Request Draft
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
          className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-medium transition-all ${
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
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
          >
            <FileText className="h-4 w-4 opacity-70" strokeWidth={2} />
            Requests
          </Link>
          <Link
            to="/profile"
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
          >
            <User2 className="h-4 w-4 opacity-70" strokeWidth={2} />
            {firstName}
          </Link>
          {isAuth && (
            <Link
              to="/admin"
              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-medium transition-all ${mobileTile} ${focus}`}
            >
              <ShieldCheck className="h-4 w-4 opacity-70" strokeWidth={2} />
              Admin
            </Link>
          )}
          <button
            type="button"
            onClick={() => void logout()}
            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[15px] border px-4 font-display text-[13px] font-medium transition-all ${
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
          className={`col-span-2 inline-flex min-h-[52px] items-center justify-center gap-2.5 rounded-[15px] border px-4 font-display text-[13px] font-semibold transition-all ${
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

export const NavbarUserMenuPortal = memo(function NavbarUserMenuPortal({
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
  userMenuPopoverRef: RefObject<HTMLDivElement>
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
                className="h-full w-full rounded-full"
                fallbackClassName={
                  isDark
                    ? 'bg-[linear-gradient(135deg,rgba(124,58,237,0.52),rgba(236,72,153,0.35))] text-white text-[11px]'
                    : 'bg-[linear-gradient(135deg,rgba(124,58,237,0.18),rgba(236,72,153,0.12))] text-violet-700 text-[11px]'
                }
              />
            </div>
            <div className="min-w-0">
              <div className={`truncate font-display text-[13px] font-bold tracking-[-0.01em] ${isDark ? 'text-white' : 'text-ink-900'}`}>
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
                  className={`flex items-center gap-3 rounded-[13px] px-3 py-2.5 font-display text-[12.5px] font-semibold transition-all duration-200 ${
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
              className={`flex w-full items-center gap-3 rounded-[13px] px-3 py-2.5 text-left font-display text-[12.5px] font-semibold transition-all duration-200 ${
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
