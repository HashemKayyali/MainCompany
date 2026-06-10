import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useUser } from '../../contexts/UserContext'
import Sidebar from '../../components/admin/Sidebar'
import UserAvatar from '../../components/ui/UserAvatar'
import AnimatedBackground from '../../components/theme/AnimatedBackground'
import { cn } from '../../utils/cn'

type Crumb = { label: string; to?: string }

const ADMIN_HEADER_HEIGHT = 72

function usePageTitle(pathname: string) {
  return useMemo(() => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) return 'Products'
    if (pathname.startsWith('/admin/requests')) return 'Requests'
    if (pathname.startsWith('/admin/parts')) return 'Parts'
    if (pathname.startsWith('/admin/customers')) return 'Customers'
    if (pathname.startsWith('/admin/categories')) return 'Categories'
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
            ? 'Purchase Quote'
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

function Icon({ name, className }: { name: 'menu' | 'logout' | 'chev' | 'external'; className?: string }) {
  const cls = `h-[18px] w-[18px] ${className || ''}`
  switch (name) {
    case 'menu':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'logout':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3 12h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'chev':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'external':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 5h5v5M19 5l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

export default function AdminLayout() {
  const { currentUser, logout } = useUser()
  const { pathname } = useLocation()
  const title = usePageTitle(pathname)
  const crumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname])
  const mainScrollRef = useRef<HTMLDivElement | null>(null)
  const layoutVars = useMemo(
    () =>
      ({
        '--app-header-offset': `${ADMIN_HEADER_HEIGHT}px`,
      }) as CSSProperties,
    []
  )

  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    const container = mainScrollRef.current
    if (!container) return
    container.scrollTop = 0
  }, [pathname])

  const displayName = currentUser?.name?.trim() || 'Admin'

  const quickLinkClass = (target: string) =>
    cn(
      'inline-flex min-h-[38px] items-center justify-center rounded-[12px] px-4 text-[12px] font-bold transition active:translate-y-[1px]',
      pathname.startsWith(target)
        ? 'border border-violet-200 bg-[linear-gradient(135deg,rgba(124,58,237,0.14),rgba(157,107,255,0.10))] text-[#2e0a72] shadow-[0_8px_22px_-12px_rgba(89,23,196,0.35)]'
        : 'border border-violet-200/70 bg-white text-[#4b3a63] hover:border-violet-400 hover:text-[#1a0b3d]'
    )

  return (
    <div
      className="admin-scope relative h-screen overflow-hidden bg-[#f4eeff] text-ink-900"
      style={layoutVars}
    >
      <AnimatedBackground position="absolute" className="z-0 overflow-hidden" variant="lightweight" />

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-[#1a0b3d]/55 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0">
            <Sidebar variant="drawer" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative z-10 grid h-full grid-rows-[72px_minmax(0,1fr)]">
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-violet-200/60 bg-white/85 backdrop-blur-xl">
          <div className="flex h-full items-center gap-3 px-4 sm:px-5 md:px-6">
            <button
              onClick={() => setOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] border border-violet-200 bg-white text-[#4b3a63] transition hover:border-violet-400 hover:text-[#1a0b3d] active:translate-y-[1px] md:hidden"
              aria-label="Open sidebar"
              title="Menu"
            >
              <Icon name="menu" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-[#1a0b3d] sm:text-[1.28rem]">
                {title}
              </div>
              <div className="mt-0.5 hidden items-center gap-1.5 sm:flex">
                {crumbs.map((crumb, index) => {
                  const last = index === crumbs.length - 1
                  return (
                    <div key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                      {index > 0 && (
                        <Icon name="chev" className="h-3 w-3 text-violet-300" />
                      )}
                      {crumb.to && !last ? (
                        <Link
                          to={crumb.to}
                          className="text-[11px] font-semibold text-[#6b5a82] transition hover:text-[#7126e3]"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-[11px] font-bold text-[#2e0a72]">{crumb.label}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/admin/requests" className={quickLinkClass('/admin/requests')}>
                Requests
              </Link>
              <Link to="/admin/products" className={quickLinkClass('/admin/products')}>
                Products
              </Link>
            </div>

            <div className="hidden items-center gap-2.5 sm:flex">
              <Link
                to="/"
                className="inline-flex min-h-[38px] items-center gap-1.5 rounded-[12px] border border-violet-200/70 bg-white px-3.5 text-[11px] font-bold text-[#4b3a63] transition hover:border-violet-400 hover:text-[#1a0b3d] active:translate-y-[1px]"
              >
                <Icon name="external" className="h-3.5 w-3.5" />
                Open Site
              </Link>

              <div className="flex items-center gap-2.5 rounded-[14px] border border-violet-200/70 bg-white px-3 py-1.5">
                <div className="flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-[11px] bg-[linear-gradient(135deg,#7c3aed,#c026d3)] text-[10px] font-bold text-white">
                  <UserAvatar
                    name={currentUser?.name || displayName}
                    email={currentUser?.email || null}
                    className="h-full w-full rounded-[11px]"
                    fallbackClassName="bg-[linear-gradient(135deg,#7c3aed,#c026d3)] text-white"
                  />
                </div>
                <div className="hidden leading-4 xl:block">
                  <div className="text-[11.5px] font-bold text-[#1a0b3d]">{displayName}</div>
                  <div className="mt-0.5 text-[10px] font-semibold text-[#6b5a82]">
                    Control shell
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  void logout()
                }}
                className="inline-flex min-h-[38px] items-center gap-2 rounded-[12px] border border-red-200 bg-red-50 px-3.5 text-[11px] font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 hover:text-red-800 active:translate-y-[1px]"
                title="Logout"
              >
                <Icon name="logout" className="h-4 w-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </header>

        <div className="h-full min-h-0 overflow-hidden md:grid md:grid-cols-[270px_minmax(0,1fr)]">
          <Sidebar variant="desktop" />

          <main
            ref={mainScrollRef}
            className="min-h-0 overflow-y-auto overflow-x-hidden"
            style={{ scrollPaddingTop: 'calc(var(--app-header-offset) + var(--app-header-gap))' }}
          >
            <div className="admin-scope mx-auto flex h-full min-h-0 w-full max-w-[1640px] flex-col px-4 py-6 sm:px-6 sm:py-7 md:px-8 md:py-8 2xl:px-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
