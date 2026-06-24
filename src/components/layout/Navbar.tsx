import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  GalleryVerticalEnd,
  LayoutGrid,
  Menu,
  MessageCircleMore,
  Search,
  ShieldCheck,
  Users,
  X,
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
import { DESKTOP_NAV } from './navbar/navConfig'
import { EventiesLogo } from './navbar/NavbarPrimitives'
import {
  DesktopPrimaryNav,
  MobileTopChips,
  NavbarAccountActions,
  NavbarMobileUtilityGrid,
  NavbarUserMenuPortal,
} from './navbar/NavbarSections'

export default function Navbar() {
  const { pathname, hash } = useLocation()
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
        const y = window.scrollY
        const nextScrolled = scrolledRef.current ? y > 8 : y > 24
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

    let frame = 0
    let lastHeight = ''

    const update = () => {
      frame = 0
      const nextHeight = `${Math.ceil(bar.getBoundingClientRect().height)}px`
      if (nextHeight === lastHeight) return
      lastHeight = nextHeight
      root.style.setProperty('--app-navbar-height', nextHeight)
    }

    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    const timeout = window.setTimeout(scheduleUpdate, 120)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(scheduleUpdate) : null
    ro?.observe(bar)
    window.addEventListener('resize', scheduleUpdate, { passive: true })
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.clearTimeout(timeout)
      ro?.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
      root.style.removeProperty('--app-navbar-height')
    }
  }, [])

  // ── Derived state ──────────────────────────────────────────────────────────
  const active = useCallback(
    (target: string) => {
      const [targetPath, targetHash] = target.split('#')
      const normalizedPath = targetPath || '/'
      if (targetHash) return pathname === normalizedPath && hash === `#${targetHash}`
      if (target === '/') return pathname === '/' && !hash
      return pathname.startsWith(target)
    },
    [hash, pathname]
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
        <div className="relative mx-auto w-full">

          {/* ─── Nav bar rows (ref covers both rows so --app-navbar-height includes chip row) ─── */}
          <div ref={navbarBarRef}>
          <div className="flex h-[4.25rem] w-full items-center justify-between px-4 sm:h-[4.75rem] sm:px-6 lg:h-[4.15rem] lg:px-8 2xl:px-10">

            {/* ── Logo ── */}
            <Link
              to="/"
              className={`flex min-w-0 items-center transition-opacity hover:opacity-88 lg:min-w-[200px] ${focus}`}
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
                    maxHeight: 'calc(100dvh - 6rem)',
                    paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))',
                  }}
                >

                  {/* ─── Brand stripe ─── */}
                  <div className={`flex items-center gap-3 px-4 py-4 ${
                    isDark ? 'border-b border-white/[0.06]' : 'border-b border-violet-100/80'
                  }`}>
                    <Link
                      to="/"
                      onClick={() => setOpen(false)}
                      className={`inline-flex items-center transition-opacity hover:opacity-88 ${focus}`}
                    >
                      <EventiesLogo heroMode={heroMode} isDark={isDark} />
                    </Link>
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
