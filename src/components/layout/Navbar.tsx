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
        setSearchOpen((value) => !value)
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
      const clickedAnchor = userMenuAnchorRef.current?.contains(target)
      const clickedPopover = userMenuPopoverRef.current?.contains(target)

      if (!clickedAnchor && !clickedPopover) {
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
    const top = Math.max(
      viewportPadding,
      Math.min(unclampedTop, window.innerHeight - viewportPadding - menuHeight)
    )

    setUserMenuPosition({
      top,
      left,
      placement: shouldPlaceAbove ? 'top' : 'bottom',
    })
  }, [])

  useEffect(() => {
    if (!userMenu) {
      setUserMenuPosition(null)
      return
    }

    const frame = window.requestAnimationFrame(() => {
      updateUserMenuPosition()
    })

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
      const { bottom } = navbarBar.getBoundingClientRect()
      root.style.setProperty('--app-navbar-height', `${Math.max(0, Math.round(bottom))}px`)
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
    if (desktopOpenTimerRef.current) {
      window.clearTimeout(desktopOpenTimerRef.current)
      desktopOpenTimerRef.current = null
    }
    if (desktopCloseTimerRef.current) {
      window.clearTimeout(desktopCloseTimerRef.current)
      desktopCloseTimerRef.current = null
    }
  }, [])

  const openDesktopMenu = useCallback(
    (key: string) => {
      if (typeof window !== 'undefined' && window.innerWidth < 1024) return

      clearDesktopTimers()
      desktopOpenTimerRef.current = window.setTimeout(() => {
        setDesktopMenu(key)
      }, 36)
    },
    [clearDesktopTimers]
  )

  const scheduleDesktopClose = useCallback(
    (immediate = false) => {
      clearDesktopTimers()
      if (immediate) {
        setDesktopMenu(null)
        return
      }

      desktopCloseTimerRef.current = window.setTimeout(() => {
        setDesktopMenu(null)
      }, 140)
    },
    [clearDesktopTimers]
  )

  const shellClass = useMemo(() => {
    if (isDark) {
      return scrolled
        ? 'border-white/12 bg-[linear-gradient(180deg,rgba(9,11,24,0.94),rgba(7,9,20,0.90))] shadow-[0_28px_110px_rgba(1,3,12,0.64)]'
        : 'border-white/10 bg-[linear-gradient(180deg,rgba(10,12,26,0.76),rgba(7,9,20,0.70))] shadow-[0_18px_82px_rgba(1,3,12,0.44)]'
    }

    return scrolled
      ? 'border-violet-200/75 bg-white/86 shadow-xl shadow-violet-500/10'
      : 'border-violet-200/70 bg-white/70 shadow-lg shadow-violet-500/8'
  }, [isDark, scrolled])

  const navTrayClass = isDark
    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.055),rgba(255,255,255,0.02))] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]'
    : 'border-violet-200/65 bg-white/80'

  const utilitySurface = isDark
    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] text-white/82 hover:border-violet-300/18 hover:bg-white/[0.07]'
    : 'border-violet-200/70 bg-white/82 text-gray-800 hover:border-violet-300 hover:bg-white'

  const mobileTile = isDark
    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] text-purple-100/80 hover:text-white hover:bg-white/[0.08]'
    : 'border-violet-200/70 bg-white/80 text-gray-700 hover:text-gray-900 hover:bg-white'

  const menuLink = (isActive: boolean) =>
    isActive
      ? isDark
        ? 'text-white'
        : 'text-gray-900'
      : isDark
        ? 'text-purple-100/72 hover:text-white'
        : 'text-gray-600 hover:text-gray-900'

  const desktopTriggerClass = (isActive: boolean, isOpen: boolean) =>
    isActive || isOpen
      ? isDark
        ? 'text-white'
        : 'text-gray-900'
      : isDark
        ? 'text-purple-100/70 hover:text-white'
        : 'text-gray-600 hover:text-gray-900'

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
        ? 'border-cyan-300/18 bg-[linear-gradient(135deg,rgba(8,25,38,0.9),rgba(13,18,34,0.94))] text-white hover:border-cyan-300/30 hover:bg-[linear-gradient(135deg,rgba(10,31,47,0.96),rgba(15,22,40,0.98))]'
        : 'border-violet-300/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(245,243,255,0.92))] text-gray-900 hover:border-violet-300/55 hover:bg-white'
      : utilitySurface
  const quoteSurface = quoteActive
    ? isDark
      ? 'border-fuchsia-300/24 bg-[linear-gradient(135deg,rgba(39,15,57,0.96),rgba(16,14,36,0.98))] text-white shadow-[0_18px_54px_rgba(17,5,28,0.42)]'
      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,255,0.94))] text-gray-900 shadow-[0_16px_40px_rgba(168,85,247,0.12)]'
    : isDark
      ? 'border-fuchsia-300/16 bg-[linear-gradient(135deg,rgba(31,14,42,0.92),rgba(14,14,31,0.96))] text-white hover:border-fuchsia-300/28 hover:bg-[linear-gradient(135deg,rgba(40,16,54,0.96),rgba(17,16,38,0.98))]'
      : 'border-violet-300/30 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(250,244,255,0.92))] text-gray-900 hover:border-violet-300/50 hover:bg-white'

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="px-3 pt-2.5 sm:px-5 sm:pt-3 lg:px-6">
        <nav className="mx-auto max-w-[86rem]">
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-px rounded-[30px] opacity-90"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, rgba(124,58,237,0.32), rgba(236,72,153,0.16), rgba(34,211,238,0.2), rgba(124,58,237,0.12))'
                  : 'linear-gradient(90deg, rgba(124,58,237,0.18), rgba(236,72,153,0.1), rgba(34,211,238,0.12), rgba(124,58,237,0.12))',
              }}
            />

            <div
              className="pointer-events-none absolute left-[10%] right-[10%] top-0 h-24 rounded-full opacity-85 blur-3xl"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, rgba(124,58,237,0.16), rgba(236,72,153,0.12), rgba(34,211,238,0.14))'
                  : 'linear-gradient(90deg, rgba(124,58,237,0.1), rgba(236,72,153,0.08), rgba(34,211,238,0.08))',
              }}
            />

            <div
              className={`relative overflow-hidden rounded-[24px] border backdrop-blur-2xl sm:rounded-[28px] ${shellClass}`}
            >
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.02)_18%,transparent_70%,rgba(255,255,255,0.02))]" />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage: isDark
                    ? 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)'
                    : 'linear-gradient(rgba(124,58,237,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.05) 1px, transparent 1px)',
                  backgroundSize: '96px 96px',
                  maskImage:
                    'linear-gradient(180deg, rgba(0,0,0,0.38), transparent 46%, transparent 80%, rgba(0,0,0,0.18))',
                  WebkitMaskImage:
                    'linear-gradient(180deg, rgba(0,0,0,0.38), transparent 46%, transparent 80%, rgba(0,0,0,0.18))',
                }}
              />

              <div
                ref={navbarBarRef}
                className="relative px-3 py-2.5 sm:px-[1.125rem] sm:py-3 lg:px-5"
              >
                <div className="flex items-center justify-between gap-4 lg:gap-5">
                  <Link
                    to="/"
                    className={`flex min-w-0 flex-1 items-center gap-3.5 lg:flex-none ${focus}`}
                  >
                    <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/12 bg-[linear-gradient(145deg,#7c3aed_0%,#d946ef_48%,#22d3ee_112%)] shadow-[0_22px_44px_rgba(76,29,149,0.32)]">
                      <div className="absolute inset-x-2.5 top-2 h-[1.125rem] rounded-full bg-white/20 blur-md" />
                      <span className="relative text-[12px] font-black tracking-[0.22em] text-white">
                        BL
                      </span>
                    </div>

                    <div className="min-w-0 leading-none">
                      <div
                        className={`truncate font-display text-[11.25px] font-bold uppercase tracking-[0.2em] ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        Bike <span className="text-violet-300">Land</span>
                      </div>
                      <div
                        className={`mt-1.5 truncate text-[10px] uppercase tracking-[0.16em] max-[379px]:hidden ${
                          isDark ? 'text-purple-100/52' : 'text-violet-600/70'
                        }`}
                      >
                        Marketplace
                      </div>
                    </div>
                  </Link>

                  <div className="hidden flex-1 justify-center lg:flex">
                    <div className={`relative rounded-[22px] border p-1 backdrop-blur-xl ${navTrayClass}`}>
                      <div className="flex items-center gap-2">
                        {desktopNav.map((item) => {
                          const isCurrent = getDesktopNavActive(item, active)
                          const isOpen = desktopMenu === item.key
                          const showPill = desktopMenu ? isOpen : isCurrent

                          if (item.to) {
                            return (
                              <Link
                                key={item.key}
                                to={item.to}
                                aria-current={isCurrent ? 'page' : undefined}
                                className={`relative inline-flex h-11 items-center justify-center rounded-[17px] px-5 text-[12px] font-semibold tracking-[0.01em] transition-all ${menuLink(
                                  isCurrent
                                )} ${focus}`}
                              >
                                {showPill && (
                                  <motion.div
                                    layoutId="desktop-nav-active"
                                    className={`absolute inset-0 rounded-[17px] border ${
                                      isDark
                                        ? 'border-violet-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.24),rgba(236,72,153,0.10),rgba(34,211,238,0.08))]'
                                        : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06),rgba(34,211,238,0.06))]'
                                    }`}
                                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
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
                                if (event.key === 'Escape') {
                                  scheduleDesktopClose(true)
                                  return
                                }

                                if (
                                  event.key === 'Enter' ||
                                  event.key === ' ' ||
                                  event.key === 'ArrowDown'
                                ) {
                                  event.preventDefault()
                                  if (isOpen) {
                                    desktopPanelFirstLinkRef.current?.focus()
                                  } else {
                                    openDesktopMenu(item.key)
                                    window.setTimeout(() => {
                                      desktopPanelFirstLinkRef.current?.focus()
                                    }, 60)
                                  }
                                }
                              }}
                              className={`relative inline-flex h-11 items-center justify-center gap-2.5 rounded-[17px] px-5 text-[12px] font-semibold tracking-[0.01em] transition-all ${desktopTriggerClass(
                                isCurrent,
                                isOpen
                              )} ${focus}`}
                            >
                              {showPill && (
                                <motion.div
                                  layoutId="desktop-nav-active"
                                  className={`absolute inset-0 rounded-[17px] border ${
                                    isDark
                                      ? 'border-violet-300/22 bg-[linear-gradient(135deg,rgba(124,58,237,0.24),rgba(236,72,153,0.10),rgba(34,211,238,0.08))]'
                                      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06),rgba(34,211,238,0.06))]'
                                  }`}
                                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                                />
                              )}
                              <span className="relative z-10">{item.label}</span>
                              <ChevronDown
                                className={`relative z-10 h-3.5 w-3.5 transition-transform duration-200 ${
                                  isOpen ? 'translate-y-[1px] rotate-180' : ''
                                }`}
                                strokeWidth={1.9}
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-0 items-center justify-end gap-2 sm:min-w-[252px] sm:gap-2.5 xl:min-w-[368px]">
                    <button
                      onClick={() => setSearchOpen(true)}
                      className={`hidden h-11 items-center gap-3 rounded-[18px] border px-3.5 transition-all sm:inline-flex xl:hidden ${utilitySurface} ${focus}`}
                      aria-label="Search (Ctrl+K)"
                    >
                      <Search className="h-4 w-4" strokeWidth={1.9} />
                    </button>

                    <button
                      onClick={() => setSearchOpen(true)}
                      className={`hidden h-11 items-center gap-3 rounded-[18px] border px-4 transition-all xl:inline-flex ${utilitySurface} ${focus}`}
                      aria-label="Search (Ctrl+K)"
                    >
                      <Search className="h-4 w-4" strokeWidth={1.9} />
                      <span className="text-[12px] font-semibold">Search</span>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.12em] ${
                          isDark
                            ? 'border-white/10 bg-white/[0.05] text-purple-100/56'
                            : 'border-violet-200/80 bg-violet-50/80 text-violet-600'
                        }`}
                      >
                        Ctrl K
                      </span>
                    </button>

                    {isLoggedIn ? (
                      <div ref={userMenuAnchorRef} className="relative hidden sm:block">
                        <button
                          onClick={() => {
                            if (!userMenu) updateUserMenuPosition()
                            setUserMenu((value) => !value)
                          }}
                          className={`inline-flex h-11 items-center gap-2.5 rounded-[18px] border pl-2.5 pr-3.5 transition-all ${utilitySurface} ${focus}`}
                        >
                          <div
                            className={`flex h-[2.125rem] w-[2.125rem] items-center justify-center rounded-full border ${
                              isDark
                                ? 'border-violet-300/20 bg-[linear-gradient(135deg,rgba(124,58,237,0.22),rgba(236,72,153,0.12))] text-white'
                                : 'border-violet-300/40 bg-[linear-gradient(135deg,rgba(124,58,237,0.12),rgba(236,72,153,0.08))] text-violet-700'
                            }`}
                          >
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

                          <div className="hidden text-left md:block">
                            <div
                              className={`text-[12px] font-semibold ${
                                isDark ? 'text-white/88' : 'text-gray-900'
                              }`}
                            >
                              {firstName}
                            </div>
                            <div
                              className={`text-[9.75px] uppercase tracking-[0.18em] ${
                                isDark ? 'text-purple-100/44' : 'text-violet-600/64'
                              }`}
                            >
                              Account
                            </div>
                          </div>

                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${
                              userMenu ? 'rotate-180' : ''
                            } ${isDark ? 'text-purple-100/52' : 'text-violet-600/60'}`}
                            strokeWidth={1.9}
                          />
                        </button>
                      </div>
                    ) : (
                      <Link
                        to="/login"
                      className={`hidden h-11 items-center rounded-[18px] border px-4 text-[12px] font-semibold transition-all sm:inline-flex ${utilitySurface} ${focus}`}
                      >
                        Login
                      </Link>
                    )}

                    <Link
                      to="/rental-cart"
                      className={`relative inline-flex h-11 items-center gap-2 rounded-[18px] border px-3 transition-all sm:gap-2.5 sm:px-3.5 ${cartSurface} ${focus}`}
                      aria-label={cartHasItems ? `Cart with ${cartItemCount} item${cartItemCount === 1 ? '' : 's'}` : 'Cart'}
                    >
                      <span
                        className={`relative flex h-8 w-8 items-center justify-center rounded-full border ${
                          isDark
                            ? 'border-cyan-300/18 bg-white/[0.05]'
                            : 'border-violet-200/80 bg-white/80'
                        }`}
                      >
                        <ShoppingCart className="h-4 w-4" strokeWidth={1.9} />
                        {cartHasItems && (
                          <span
                            className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[1.15rem] items-center justify-center rounded-full px-1.5 py-[2px] text-[9px] font-mono font-bold leading-none ${
                              isDark
                                ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950 shadow-[0_10px_22px_rgba(34,211,238,0.35)]'
                                : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white shadow-[0_10px_18px_rgba(124,58,237,0.28)]'
                            }`}
                          >
                            {cartCountLabel}
                          </span>
                        )}
                      </span>
                      <span className="hidden text-[12px] font-semibold sm:inline">Cart</span>
                    </Link>

                    {(quoteHasItems || quoteActive) && (
                      <Link
                        to="/purchase-quote"
                        className={`relative hidden h-11 items-center gap-2.5 rounded-[18px] border px-3.5 transition-all lg:inline-flex ${quoteSurface} ${focus}`}
                        aria-label={
                          quoteHasItems
                            ? `Quote draft with ${quoteItemCount} item${quoteItemCount === 1 ? '' : 's'}`
                            : 'Purchase quote draft'
                        }
                        >
                          <span
                          className={`relative flex h-8 w-8 items-center justify-center rounded-full border ${
                            isDark
                              ? 'border-fuchsia-300/16 bg-white/[0.05]'
                              : 'border-violet-200/80 bg-white/80'
                          }`}
                        >
                          <FileText className="h-4 w-4" strokeWidth={1.9} />
                          {quoteHasItems && (
                            <span
                              className={`absolute -right-1.5 -top-1.5 inline-flex min-w-[1.15rem] items-center justify-center rounded-full px-1.5 py-[2px] text-[9px] font-mono font-bold leading-none ${
                                isDark
                                  ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950 shadow-[0_10px_20px_rgba(244,114,182,0.32)]'
                                  : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white shadow-[0_10px_18px_rgba(236,72,153,0.24)]'
                              }`}
                            >
                              {quoteCountLabel}
                            </span>
                          )}
                          </span>
                        <span className="text-[12px] font-semibold">Quote</span>
                      </Link>
                    )}

                    <button
                      onClick={() => setOpen((value) => !value)}
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-[18px] border transition-all lg:hidden ${utilitySurface} ${focus}`}
                      aria-label="Menu"
                      aria-expanded={open}
                    >
                      {open ? (
                          <X className="h-4 w-4" strokeWidth={2} />
                      ) : (
                          <Menu className="h-4 w-4" strokeWidth={2} />
                      )}
                    </button>
                  </div>
                </div>

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
                          className={`mt-4 max-h-[calc(100dvh-5.75rem)] overflow-y-auto rounded-[26px] border p-4 backdrop-blur-2xl ${
                            isDark
                              ? 'border-white/10 bg-[linear-gradient(180deg,rgba(9,11,24,0.88),rgba(7,9,20,0.88))]'
                              : 'border-violet-200/70 bg-white/88'
                          }`}
                          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                        >
                          <div className={`mb-2 text-[10px] font-mono uppercase tracking-[0.18em] ${isDark ? 'text-purple-100/48' : 'text-violet-600/72'}`}>
                            Explore
                          </div>

                          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                            {MOBILE_NAV.map((item) => {
                              const isCurrent = active(item.to)

                            return (
                              <Link
                                key={item.to}
                                to={item.to}
                                  className={`inline-flex min-h-[48px] items-center justify-center rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${
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

                        <div
                          className={`mt-4 grid gap-2.5 border-t pt-3.5 ${
                            isDark ? 'border-white/8' : 'border-violet-200/60'
                          }`}
                        >
                          <div className={`text-[10px] font-mono uppercase tracking-[0.18em] ${isDark ? 'text-purple-100/48' : 'text-violet-600/72'}`}>
                            Tools & Account
                          </div>

                          <button
                            onClick={() => {
                              setOpen(false)
                              setSearchOpen(true)
                            }}
                            className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${mobileTile} ${focus}`}
                          >
                            <Search className="h-4 w-4" strokeWidth={1.9} />
                            Search
                          </button>

                          <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                            {(quoteHasItems || quoteActive) && (
                              <Link
                                to="/purchase-quote"
                                className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${
                                  quoteActive
                                    ? isDark
                                      ? 'border-fuchsia-300/22 bg-[linear-gradient(135deg,rgba(39,15,57,0.96),rgba(16,14,36,0.98))] text-white'
                                      : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.06))] text-gray-900'
                                    : mobileTile
                                } ${focus}`}
                              >
                                <FileText className="h-4 w-4" strokeWidth={1.9} />
                                Quote Draft
                                {quoteHasItems && (
                                  <span
                                    className={`inline-flex min-w-[1.4rem] items-center justify-center rounded-full px-1.5 py-[3px] text-[10px] font-mono font-bold leading-none ${
                                      isDark
                                        ? 'bg-[linear-gradient(135deg,#f472b6,#8b5cf6)] text-slate-950'
                                        : 'bg-[linear-gradient(135deg,#ec4899,#7c3aed)] text-white'
                                    }`}
                                  >
                                    {quoteCountLabel}
                                  </span>
                                )}
                              </Link>
                            )}

                            <Link
                              to="/rental-cart"
                              className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-semibold transition-all ${
                                cartActive
                                  ? isDark
                                    ? 'border-cyan-300/24 bg-[linear-gradient(135deg,rgba(8,30,44,0.94),rgba(11,18,38,0.98))] text-white'
                                    : 'border-violet-300/45 bg-[linear-gradient(135deg,rgba(124,58,237,0.1),rgba(34,211,238,0.06))] text-gray-900'
                                  : mobileTile
                              } ${focus}`}
                            >
                              <ShoppingCart className="h-4 w-4" strokeWidth={1.9} />
                              Cart
                              {cartHasItems && (
                                <span
                                  className={`inline-flex min-w-[1.4rem] items-center justify-center rounded-full px-1.5 py-[3px] text-[10px] font-mono font-bold leading-none ${
                                    isDark
                                      ? 'bg-[linear-gradient(135deg,#22d3ee,#7c3aed)] text-slate-950'
                                      : 'bg-[linear-gradient(135deg,#7c3aed,#22d3ee)] text-white'
                                  }`}
                                >
                                  {cartCountLabel}
                                </span>
                              )}
                            </Link>
                          </div>

                          {isLoggedIn ? (
                            <>
                              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                                <Link
                                  to="/my-requests"
                                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${mobileTile} ${focus}`}
                                >
                                  <FileText className="h-4 w-4" strokeWidth={1.9} />
                                  My Requests
                                </Link>

                                <Link
                                  to="/profile"
                                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${mobileTile} ${focus}`}
                                >
                                  <User2 className="h-4 w-4" strokeWidth={1.9} />
                                  {firstName}
                                </Link>

                                {isAuth && (
                                  <Link
                                    to="/admin"
                                    className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${mobileTile} ${focus}`}
                                  >
                                    <ShieldCheck className="h-4 w-4" strokeWidth={1.9} />
                                    Admin
                                  </Link>
                                )}

                                <button
                                  onClick={() => {
                                    void logout()
                                  }}
                                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${
                                    isDark
                                      ? 'border-red-400/18 bg-red-500/10 text-red-300'
                                      : 'border-red-200 bg-red-50 text-red-600'
                                  } ${focus}`}
                                >
                                  <LogOut className="h-4 w-4" strokeWidth={1.9} />
                                  Logout
                                </button>
                              </div>
                            </>
                          ) : (
                              <Link
                                to="/login"
                              className={`inline-flex min-h-[48px] items-center justify-center rounded-[18px] border px-4 text-[13.5px] font-medium transition-all ${mobileTile} ${focus}`}
                            >
                              Login
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {activeDesktopItem?.children && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.985 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.985 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                  onMouseEnter={clearDesktopTimers}
                  onMouseLeave={() => scheduleDesktopClose()}
                  onKeyDown={event => {
                    if (event.key === 'Escape') {
                      event.preventDefault()
                      scheduleDesktopClose(true)
                    }
                  }}
                  className="absolute left-1/2 top-full z-[70] hidden w-full max-w-[54rem] -translate-x-1/2 px-4 pt-3 lg:block"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-4" />
                  <div
                    className={`relative overflow-hidden rounded-[28px] border backdrop-blur-2xl ${
                      isDark
                        ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,12,25,0.96),rgba(7,9,20,0.95))] shadow-[0_28px_110px_rgba(1,3,12,0.62)]'
                        : 'border-violet-200/80 bg-white/92 shadow-xl shadow-violet-500/12'
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/60 to-transparent" />
                    <div
                      className={`grid gap-px ${isDark ? 'bg-white/8 md:grid-cols-[0.88fr_1.12fr]' : 'bg-violet-200/60 md:grid-cols-[0.88fr_1.12fr]'}`}
                    >
                      <div
                        className={`relative overflow-hidden px-6 py-[1.375rem] ${
                          isDark
                            ? 'bg-[linear-gradient(155deg,rgba(20,16,38,0.94),rgba(10,12,26,0.96),rgba(7,14,28,0.94))]'
                            : 'bg-[linear-gradient(155deg,rgba(248,245,255,0.98),rgba(255,255,255,0.96),rgba(240,249,255,0.96))]'
                        }`}
                      >
                        <div
                          className="pointer-events-none absolute -right-10 top-4 h-32 w-32 rounded-full blur-3xl"
                          style={{
                            background: isDark
                              ? 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(34,211,238,0.10) 58%, transparent 76%)'
                              : 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, rgba(34,211,238,0.08) 58%, transparent 76%)',
                          }}
                        />
                        <div
                          className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                            isDark ? 'text-cyan-200/76' : 'text-violet-700/78'
                          }`}
                        >
                          {activeDesktopItem.eyebrow}
                        </div>
                        <div
                          className={`mt-2 font-display text-[1.18rem] font-bold leading-[1.02] tracking-[-0.04em] ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}
                        >
                          {activeDesktopItem.title}
                        </div>
                        <p
                          className={`mt-3 max-w-[17rem] text-[12.25px] leading-[1.42rem] ${
                            isDark ? 'text-purple-100/60' : 'text-gray-600'
                          }`}
                        >
                          {activeDesktopItem.body}
                        </p>
                        {activeDesktopItem.ctaTo && activeDesktopItem.ctaLabel && (
                          <Link
                            to={activeDesktopItem.ctaTo}
                            onClick={() => scheduleDesktopClose(true)}
                            className={`mt-5 inline-flex items-center gap-2 rounded-[16px] border px-[1.125rem] py-2.5 text-[11px] font-semibold transition-all ${
                              isDark
                                ? 'border-white/12 bg-white/[0.05] text-white hover:bg-white/[0.08]'
                                : 'border-violet-200/80 bg-white/82 text-gray-900 hover:bg-white'
                            } ${focus}`}
                          >
                            {activeDesktopItem.ctaLabel}
                            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.9} />
                          </Link>
                        )}
                      </div>

                      <div
                        className={`grid gap-2.5 p-3.5 ${
                          activeDesktopItem.children.length > 2 ? 'md:grid-cols-2' : 'grid-cols-1'
                        } ${
                          isDark
                            ? 'bg-[linear-gradient(180deg,rgba(8,10,22,0.86),rgba(7,9,18,0.78))]'
                            : 'bg-white/90'
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
                              onClick={() => scheduleDesktopClose(true)}
                              className={`group relative overflow-hidden rounded-[20px] border px-4 py-4 transition-all ${
                                isCurrent
                                  ? isDark
                                    ? 'border-violet-300/22 bg-[linear-gradient(145deg,rgba(124,58,237,0.16),rgba(236,72,153,0.08),rgba(34,211,238,0.08))]'
                                    : 'border-violet-300/40 bg-[linear-gradient(145deg,rgba(124,58,237,0.08),rgba(236,72,153,0.04),rgba(34,211,238,0.05))]'
                                  : isDark
                                    ? 'border-white/8 bg-white/[0.03] hover:border-violet-300/18 hover:bg-white/[0.05]'
                                    : 'border-violet-100 bg-white hover:border-violet-200 hover:bg-violet-50/60'
                              } ${focus}`}
                            >
                              <div
                                className="pointer-events-none absolute -right-6 top-0 h-20 w-20 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                                style={{
                                  background: isDark
                                    ? 'radial-gradient(circle, rgba(124,58,237,0.16) 0%, rgba(34,211,238,0.08) 62%, transparent 78%)'
                                    : 'radial-gradient(circle, rgba(124,58,237,0.10) 0%, rgba(34,211,238,0.06) 62%, transparent 78%)',
                                }}
                              />
                              <div className="relative flex items-start gap-3.5">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] border ${
                                    isDark
                                      ? 'border-white/10 bg-[linear-gradient(145deg,rgba(124,58,237,0.18),rgba(236,72,153,0.08),rgba(34,211,238,0.08))] text-white'
                                      : 'border-violet-200/80 bg-[linear-gradient(145deg,rgba(124,58,237,0.10),rgba(236,72,153,0.05),rgba(34,211,238,0.06))] text-violet-700'
                                  }`}
                                >
                                  <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.9} />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div
                                      className={`text-[12.5px] font-semibold ${
                                        isDark ? 'text-white' : 'text-gray-900'
                                      }`}
                                    >
                                      {child.label}
                                    </div>
                                    <div
                                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                                        isDark
                                          ? 'border-white/10 bg-white/[0.05] text-cyan-200/72'
                                          : 'border-violet-200/80 bg-violet-50/80 text-violet-700/76'
                                      }`}
                                    >
                                      {child.meta}
                                    </div>
                                  </div>
                                  <p
                                    className={`mt-2 text-[11.5px] leading-5 ${
                                      isDark ? 'text-purple-100/56' : 'text-gray-600'
                                    }`}
                                  >
                                    {child.description}
                                  </p>
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
        </nav>
      </div>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {userMenu && userMenuPosition && (
              <motion.div
                ref={userMenuPopoverRef}
                initial={{
                  opacity: 0,
                  y: userMenuPosition.placement === 'bottom' ? -8 : 8,
                  scale: 0.97,
                }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: userMenuPosition.placement === 'bottom' ? -8 : 8,
                  scale: 0.97,
                }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={`fixed z-[90] w-[286px] overflow-hidden rounded-[24px] border backdrop-blur-2xl ${
                  isDark
                    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,12,25,0.96),rgba(7,9,20,0.96))] shadow-[0_24px_90px_rgba(1,3,12,0.62)]'
                    : 'border-violet-200/80 bg-white/92 shadow-xl shadow-violet-500/12'
                } ${userMenuPosition.placement === 'bottom' ? 'origin-top-right' : 'origin-bottom-right'}`}
                style={{
                  top: `${userMenuPosition.top}px`,
                  left: `${userMenuPosition.left}px`,
                }}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/55 to-transparent" />
                <div
                  className={`border-b px-[1.125rem] py-[1.125rem] ${
                    isDark ? 'border-white/8' : 'border-violet-100'
                  }`}
                >
                  <div
                    className={`text-[13px] font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {currentUser?.name || 'User'}
                  </div>
                  <div
                    className={`mt-1 text-[11px] ${
                      isDark ? 'text-purple-100/46' : 'text-gray-500'
                    }`}
                  >
                    {currentUser?.email || ''}
                  </div>
                </div>

                <div className="p-2.5">
                  <Link
                    to="/my-requests"
                    className={`flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-[12.5px] font-medium transition-all ${
                      isDark
                        ? 'text-purple-100/78 hover:bg-white/[0.06] hover:text-white'
                        : 'text-gray-700 hover:bg-violet-50 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="h-4 w-4 opacity-70" strokeWidth={1.9} />
                    My Requests
                  </Link>

                  <Link
                    to="/profile"
                    className={`flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-[12.5px] font-medium transition-all ${
                      isDark
                        ? 'text-purple-100/78 hover:bg-white/[0.06] hover:text-white'
                        : 'text-gray-700 hover:bg-violet-50 hover:text-gray-900'
                    }`}
                  >
                    <User2 className="h-4 w-4 opacity-70" strokeWidth={1.9} />
                    Profile
                  </Link>

                  {isAuth && (
                    <Link
                      to="/admin"
                      className={`flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-[12.5px] font-medium transition-all ${
                        isDark
                          ? 'text-purple-100/78 hover:bg-white/[0.06] hover:text-white'
                          : 'text-gray-700 hover:bg-violet-50 hover:text-gray-900'
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 opacity-70" strokeWidth={1.9} />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setUserMenu(false)
                      void logout()
                    }}
                    className={`flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left text-[12.5px] font-medium transition-all ${
                      isDark
                        ? 'text-red-300/78 hover:bg-red-500/10 hover:text-red-200'
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <LogOut className="h-4 w-4 opacity-70" strokeWidth={1.9} />
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
