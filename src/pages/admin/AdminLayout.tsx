import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Menu } from 'lucide-react'
import { usePageMeta } from '../../hooks/usePageMeta'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock'
import { useUser } from '../../contexts/UserContext'
import Sidebar from '../../components/admin/Sidebar'
import AdminBottomBar from '../../components/admin/AdminBottomBar'
import AdminUserMenu from '../../components/admin/AdminUserMenu'
import LanguageSwitcher from '../../components/layout/LanguageSwitcher'
import { useI18n } from '../../contexts/LanguageContext'
import AnimatedBackground from '../../components/theme/AnimatedBackground'
import { cn } from '../../utils/cn'
import '../../styles/admin.css'

type Crumb = { label: string; to?: string }

function usePageTitle(pathname: string) {
  return useMemo(() => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) return 'Products'
    if (pathname.startsWith('/admin/requests')) return 'Requests'
    if (pathname.startsWith('/admin/parts')) return 'Parts'
    if (pathname.startsWith('/admin/customers')) return 'Customers'
    if (pathname.startsWith('/admin/categories')) return 'Categories'
    if (pathname.startsWith('/admin/custom-builds')) return 'Custom Builds'
    if (pathname.startsWith('/admin/gallery')) return 'Gallery'
    if (pathname.startsWith('/admin/users')) return 'Users'
    if (pathname.startsWith('/admin/admins')) return 'Admins'
    if (pathname.startsWith('/admin/logs')) return 'Logs'
    return 'Admin'
  }, [pathname])
}

function buildBreadcrumbs(pathname: string): Crumb[] {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length === 1) return [{ label: 'Dashboard', to: '/admin' }]

  const section = parts[1] || ''
  const baseTo = `/admin/${section}`
  const labelMap: Record<string, string> = {
    products: 'Products',
    requests: 'Requests',
    parts: 'Parts',
    customers: 'Customers',
    categories: 'Categories',
    'custom-builds': 'Custom Builds',
    gallery: 'Gallery',
    users: 'Users',
    admins: 'Admins',
    logs: 'Logs',
  }

  const crumbs: Crumb[] = [{ label: 'Dashboard', to: '/admin' }]
  crumbs.push({ label: labelMap[section] || 'Admin', to: baseTo })

  if (parts.length >= 3) {
    const sub = parts[2]
    const nice =
      section === 'requests'
        ? sub === 'rental'
          ? 'Rental'
          : sub === 'purchase_quote'
            ? 'Purchase Quote Request'
            : 'Details'
        : sub === 'create'
          ? 'Create'
          : sub === 'edit'
            ? 'Edit'
            : sub === 'new'
              ? 'New'
              : sub.charAt(0).toUpperCase() + sub.slice(1)
    crumbs.push({ label: nice })
  }

  if (section === 'requests' && parts.length >= 4) {
    crumbs.push({ label: 'Details' })
  }

  return crumbs
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

function getFocusableElements(container: HTMLElement | null) {
  if (!container) return []
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    element => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true'
  )
}

/**
 * Overlay navigation drawer for < lg viewports. Slides in from the start
 * side (dir-aware), traps focus, closes on Escape/backdrop, and locks
 * body scroll while open.
 */
function MobileDrawer({
  open,
  onClose,
  dir,
  label,
  children,
}: {
  open: boolean
  onClose: () => void
  dir: 'ltr' | 'rtl'
  label: string
  children: ReactNode
}) {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useBodyScrollLock(open)

  useEffect(() => {
    if (!open) return

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null

    const frame = window.requestAnimationFrame(() => {
      getFocusableElements(panelRef.current)[0]?.focus()
    })

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(panelRef.current)
      if (!focusable.length) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null

      if (event.shiftKey) {
        if (active === first || !panelRef.current?.contains(active)) {
          event.preventDefault()
          last.focus()
        }
        return
      }

      if (active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      previousFocusRef.current?.focus()
    }
  }, [open, onClose])

  const hiddenX = dir === 'rtl' ? '100%' : '-100%'

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={label}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[rgba(26,11,61,0.45)] backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            initial={{ x: hiddenX }}
            animate={{ x: 0 }}
            exit={{ x: hiddenX }}
            transition={{ type: 'spring', stiffness: 380, damping: 36 }}
            className="absolute inset-y-0 start-0 flex"
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default function AdminLayout() {
  const { currentUser, logout } = useUser()
  const { pathname } = useLocation()
  const { translateText, dir } = useI18n()
  usePageMeta({ title: translateText('Admin Panel'), noIndex: true })
  const rawTitle = usePageTitle(pathname)
  const title = translateText(rawTitle)
  const rawCrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname])
  const crumbs = useMemo(
    () => rawCrumbs.map(crumb => ({ ...crumb, label: translateText(crumb.label) })),
    [rawCrumbs, translateText]
  )
  const mainScrollRef = useRef<HTMLDivElement | null>(null)
  const layoutVars = useMemo(
    () =>
      ({
        '--app-header-offset': 'var(--admin-header-h)',
      }) as CSSProperties,
    []
  )

  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useLocalStorage('eventies.admin.sidebar-collapsed', false)
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const container = mainScrollRef.current
    if (!container) return
    container.scrollTop = 0
  }, [pathname])

  const displayName = currentUser?.name?.trim() || translateText('Admin')

  return (
    <div
      className="admin-scope relative h-[100dvh] overflow-hidden bg-[var(--admin-bg)] text-[var(--admin-text)]"
      dir={dir}
      style={layoutVars}
    >
      <AnimatedBackground position="absolute" className="z-0 overflow-hidden" variant="lightweight" />

      <MobileDrawer open={open} onClose={() => setOpen(false)} dir={dir} label={translateText('Admin navigation')}>
        <Sidebar variant="drawer" onNavigate={() => setOpen(false)} />
      </MobileDrawer>

      <div className="relative z-10 grid h-full grid-rows-[var(--admin-header-h)_minmax(0,1fr)]">
        {/* Topbar */}
        <header className="admin-topbar sticky top-0 z-30">
          <div className="flex h-full items-center gap-2.5 px-3 sm:px-5 md:px-6">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="admin-icon-btn lg:!hidden"
              aria-label={translateText('Open navigation')}
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2.1} aria-hidden="true" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate font-sans text-[1.05rem] font-extrabold tracking-[-0.03em] text-[var(--admin-text)] sm:text-[1.2rem]">
                {title}
              </div>
              <nav
                aria-label={translateText('Breadcrumbs')}
                className="mt-0.5 hidden items-center gap-1.5 md:flex"
              >
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1
                  return (
                    <div key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                      {index > 0 && (
                        <ChevronRight
                          className="h-3 w-3 text-[var(--admin-text-muted)] rtl:rotate-180"
                          aria-hidden="true"
                        />
                      )}
                      {crumb.to && !last ? (
                        <Link
                          to={crumb.to}
                          className="text-[11px] font-semibold text-[var(--admin-text-muted)] transition hover:text-[var(--admin-accent)]"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span aria-current="page" className="text-[11px] font-bold text-[var(--admin-accent)]">
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </nav>
            </div>

            <LanguageSwitcher
              compact
              className="hidden border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)] sm:inline-flex"
            />

            <AdminUserMenu
              name={displayName}
              email={currentUser?.email || null}
              subtitle={translateText('Eventies Admin')}
              onLogout={() => {
                void logout()
              }}
            />
          </div>
        </header>

        <div
          className={cn(
            'h-full min-h-0 overflow-hidden transition-[grid-template-columns] duration-300 lg:grid',
            collapsed
              ? 'lg:grid-cols-[72px_minmax(0,1fr)]'
              : 'lg:grid-cols-[var(--admin-sidebar-w)_minmax(0,1fr)]'
          )}
        >
          <Sidebar
            variant="desktop"
            collapsed={collapsed}
            onToggleCollapse={() => setCollapsed(value => !value)}
          />

          <main
            ref={mainScrollRef}
            className="h-full min-h-0 overflow-y-auto overflow-x-hidden"
            style={{ scrollPaddingTop: 'calc(var(--app-header-offset) + var(--app-header-gap))' }}
          >
            <div className="admin-scope mx-auto flex min-h-full w-full max-w-[1640px] flex-col px-4 pt-6 pb-[calc(var(--admin-bottombar-h)+16px)] sm:px-6 sm:pt-7 md:h-full md:min-h-0 md:px-8 md:pt-8 md:pb-8 2xl:px-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <AdminBottomBar onMore={() => setOpen(true)} />
    </div>
  )
}
