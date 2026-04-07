import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import Sidebar from '../../components/admin/Sidebar'
import UserAvatar from '../../components/ui/UserAvatar'

type Crumb = { label: string; to?: string }

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

const ADMIN_HEADER_HEIGHT = 70

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

function Icon({ name, className }: { name: 'menu' | 'logout' | 'chev'; className?: string }) {
  const cls = `h-5 w-5 ${className || ''}`
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
  }
}

export default function AdminLayout() {
  const { isDark } = useTheme()
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
      'inline-flex min-h-[42px] items-center justify-center rounded-[15px] px-4 py-2 text-[11.5px] font-semibold transition active:translate-y-[1px]',
      pathname.startsWith(target)
        ? isDark
          ? 'bg-[linear-gradient(180deg,rgba(17,39,72,0.96),rgba(14,28,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/18 shadow-[0_12px_26px_-18px_rgba(34,211,238,0.26)]'
          : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.18)]'
        : isDark
          ? 'bg-[#0d1430]/88 text-purple-100/76 ring-1 ring-inset ring-cyan-400/10 hover:text-white hover:ring-cyan-300/16'
          : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 hover:text-gray-900'
    )

  return (
    <div
      className={cn(
        'relative min-h-screen overflow-x-clip',
        isDark ? 'bg-[#060914] text-white' : 'bg-gray-50 text-gray-900'
      )}
      style={layoutVars}
    >
      {isDark && (
        <>
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.11),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.14),transparent_28%),linear-gradient(180deg,#060813_0%,#09101f_46%,#06070f_100%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="pointer-events-none absolute left-[6%] top-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />
          <div className="pointer-events-none absolute right-[8%] top-12 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-[140px]" />
          <div className="pointer-events-none absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-violet-500/10 blur-[150px]" />
        </>
      )}

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute inset-y-0 left-0">
            <Sidebar variant="drawer" onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <div className="relative z-10 grid min-h-screen grid-rows-[70px_minmax(0,1fr)]">
        <header
          className={cn(
            'sticky top-0 z-30 border-b backdrop-blur-xl',
            isDark
              ? 'border-cyan-400/10 bg-[linear-gradient(180deg,rgba(10,14,31,0.96),rgba(9,13,28,0.88))]'
              : 'border-gray-200 bg-white/92'
          )}
        >
          <div className="flex h-full items-center gap-3 px-4 sm:px-5 md:px-5.5">
            <button
              onClick={() => setOpen(true)}
              className={cn(
                'inline-flex h-11 w-11 items-center justify-center rounded-[16px] transition active:translate-y-[1px] md:hidden',
                isDark
                  ? 'bg-[linear-gradient(180deg,rgba(20,29,56,0.98),rgba(13,20,42,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-400/16 shadow-[0_12px_24px_-18px_rgba(34,211,238,0.24)]'
                  : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)]'
              )}
              aria-label="Open sidebar"
              title="Menu"
            >
              <Icon name="menu" />
            </button>

            <div className="min-w-0 flex-1">
              <div className="min-w-0">
                <div className={cn('truncate font-display text-[1.05rem] font-bold sm:text-[1.12rem]', isDark ? 'text-white' : 'text-gray-900')}>
                  {title}
                </div>
                <div className="mt-1.5 hidden items-center gap-1.75 sm:flex">
                  {crumbs.map((crumb, index) => {
                    const last = index === crumbs.length - 1
                    const tone = last
                      ? isDark
                        ? 'text-cyan-100/74'
                        : 'text-gray-800'
                      : isDark
                        ? 'text-purple-100/40'
                        : 'text-gray-500'

                    return (
                      <div key={`${crumb.label}-${index}`} className="flex items-center gap-1.75">
                        {index > 0 && <Icon name="chev" className={isDark ? 'text-purple-100/26' : 'text-gray-400'} />}
                        {crumb.to && !last ? (
                      <Link to={crumb.to} className={cn('text-[11px] transition hover:text-cyan-200', tone)}>
                            {crumb.label}
                          </Link>
                        ) : (
                          <span className={cn('text-[11px]', tone)}>{crumb.label}</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="hidden items-center gap-2.5 lg:flex">
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
                className={cn(
                  'inline-flex min-h-[38px] items-center justify-center rounded-[14px] px-3.5 py-1.75 text-[10.5px] font-semibold transition active:translate-y-[1px]',
                  isDark
                    ? 'bg-[linear-gradient(180deg,rgba(20,29,56,0.98),rgba(13,20,42,0.98))] text-purple-100/86 ring-1 ring-inset ring-cyan-400/14 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)] hover:text-white'
                    : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)]'
                )}
              >
                Open Site
              </Link>

              <div
                className={cn(
                  'flex items-center gap-2.25 rounded-[15px] px-3 py-2',
                  isDark
                    ? 'bg-[#0d1430]/88 ring-1 ring-inset ring-cyan-400/10'
                    : 'bg-white ring-1 ring-inset ring-gray-200'
                )}
              >
                <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[11px] bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber text-[10px] font-bold text-white shadow-[0_0_24px_rgba(236,72,153,0.24)]">
                  <UserAvatar
                    name={currentUser?.name || displayName}
                    email={currentUser?.email || null}
                    avatarUrl={currentUser?.avatarUrl}
                    avatarStyle={currentUser?.avatarStyle}
                    avatarSeed={currentUser?.avatarSeed}
                    avatarOptions={currentUser?.avatarOptions}
                    className="h-full w-full rounded-[11px]"
                    fallbackClassName="bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber text-white"
                  />
                </div>

                <div className="hidden leading-4 xl:block">
                  <div className={cn('text-[11.5px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                    {displayName}
                  </div>
                  <div className={cn('mt-0.5 text-[10px]', isDark ? 'text-cyan-100/46' : 'text-gray-500')}>
                    Control shell
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  void logout()
                }}
                className={cn(
                  'inline-flex min-h-[38px] items-center gap-2 rounded-[14px] px-3.5 py-1.75 text-[10.5px] font-semibold transition active:translate-y-[1px]',
                  isDark
                    ? 'bg-[linear-gradient(180deg,rgba(82,24,36,0.98),rgba(52,15,24,0.98))] text-red-100 ring-1 ring-inset ring-red-300/24 shadow-[0_12px_28px_-18px_rgba(248,113,113,0.28)] hover:brightness-110'
                    : 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200 shadow-[0_10px_24px_-18px_rgba(239,68,68,0.22)]'
                )}
                title="Logout"
              >
                <Icon name="logout" className="h-4 w-4" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 md:grid md:grid-cols-[216px_minmax(0,1fr)]">
          <Sidebar variant="desktop" />

          <main
            ref={mainScrollRef}
            className="min-h-0 overflow-y-auto overflow-x-hidden"
            style={{ scrollPaddingTop: 'calc(var(--app-header-offset) + var(--app-header-gap))' }}
          >
            <div className="mx-auto flex min-h-full w-full max-w-[1280px] flex-col px-3.5 py-4 sm:px-4.5 sm:py-5 md:px-5 md:py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
