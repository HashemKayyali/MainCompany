import { Outlet, Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useUser } from '../../contexts/UserContext'
import Sidebar from '../../components/admin/Sidebar'

type Crumb = { label: string; to?: string }

function usePageTitle(pathname: string) {
  return useMemo(() => {
    if (pathname === '/admin') return 'Dashboard'
    if (pathname.startsWith('/admin/products')) return 'Products'
    if (pathname.startsWith('/admin/parts')) return 'Parts'
    if (pathname.startsWith('/admin/customers')) return 'Customers'
    if (pathname.startsWith('/admin/categories')) return 'Categories'
    if (pathname.startsWith('/admin/gallery')) return 'Gallery'
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
    parts: 'Parts',
    customers: 'Customers',
    categories: 'Categories',
    gallery: 'Gallery',
    admins: 'Admins',
    logs: 'Logs',
  }

  const crumbs: Crumb[] = [{ label: 'Dashboard', to: '/admin' }]
  if (labelMap[section]) crumbs.push({ label: labelMap[section], to: baseTo })
  else crumbs.push({ label: 'Admin', to: '/admin' })

  if (parts.length >= 3) {
    const sub = parts[2]
    const nice =
      sub === 'create'
        ? 'Create'
        : sub === 'edit'
          ? 'Edit'
          : sub === 'new'
            ? 'New'
            : sub.charAt(0).toUpperCase() + sub.slice(1)
    crumbs.push({ label: nice })
  }

  return crumbs
}

function Icon({ name, className }: { name: 'menu' | 'search' | 'logout' | 'chev'; className?: string }) {
  const cls = `w-5 h-5 ${className || ''}`
  switch (name) {
    case 'menu':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'search':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M16.8 16.8 21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'logout':
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
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

  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])

  const bg = isDark ? 'bg-void-950 text-white' : 'bg-gray-50 text-gray-900'
  const border = isDark ? 'border-purple-500/15' : 'border-gray-200'
  const topbarBg = isDark ? 'bg-void-950/70' : 'bg-white/70'

  const displayName = currentUser?.name?.trim() || 'Admin'
  const avatarLetter = displayName.charAt(0).toUpperCase()
  const crumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname])

  return (
    <div className={`min-h-screen ${bg}`}>
      {/* ✅ Topbar fixed height: 64px (h-16) */}
      <header className={`sticky top-0 z-30 h-16 backdrop-blur border-b ${border} ${topbarBg}`}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-full flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className={`md:hidden w-10 h-10 rounded-xl border transition flex items-center justify-center ${
              isDark ? 'border-purple-500/20 hover:bg-purple-500/10 text-purple-100' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
            aria-label="Open sidebar"
            title="Menu"
          >
            <Icon name="menu" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`font-display text-lg sm:text-xl font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
              </h1>

              <div className="hidden sm:flex items-center gap-1.5 text-[12px]">
                {crumbs.map((c, idx) => {
                  const last = idx === crumbs.length - 1
                  const baseCls = isDark ? 'text-purple-200/60' : 'text-gray-500'
                  const activeCls = isDark ? 'text-purple-100' : 'text-gray-800'
                  return (
                    <div key={`${c.label}-${idx}`} className="flex items-center gap-1.5">
                      {idx !== 0 && <Icon name="chev" className={baseCls} />}
                      {c.to && !last ? (
                        <Link to={c.to} className={`${baseCls} hover:underline`}>
                          {c.label}
                        </Link>
                      ) : (
                        <span className={last ? activeCls : baseCls}>{c.label}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <p className={`text-[12px] mt-0.5 truncate ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>
              Manage content, products, customers and gallery
            </p>
          </div>

          <div className="hidden lg:flex items-center">
            <div
              className={[
                'flex items-center gap-2 px-3 py-2 rounded-xl border w-[320px]',
                isDark ? 'border-purple-500/20 bg-void-950/40' : 'border-gray-200 bg-white',
              ].join(' ')}
            >
              <span className={isDark ? 'text-purple-200/60' : 'text-gray-400'}>
                <Icon name="search" className="w-4 h-4" />
              </span>
              <input
                placeholder="Quick search (UI only)…"
                className={[
                  'w-full bg-transparent outline-none text-[12px]',
                  isDark ? 'placeholder:text-purple-200/30 text-purple-50' : 'placeholder:text-gray-400 text-gray-800',
                ].join(' ')}
              />
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <Link
              to="/"
              className={`inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-[12px] font-medium border transition ${
                isDark ? 'border-purple-500/20 text-purple-200/80 hover:bg-purple-500/10' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              View Site
            </Link>
          </div>

          <div className={`flex items-center gap-2 pl-3 ml-1 border-l ${border}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center text-white text-xs font-bold">
              {avatarLetter}
            </div>

            <div className="hidden sm:block leading-4">
              <p className={`text-[12px] font-medium ${isDark ? 'text-purple-100' : 'text-gray-800'}`}>{displayName}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-[11px] ${isDark ? 'text-purple-200/60' : 'text-gray-500'}`}>Administrator</span>
                
              </div>
            </div>

            <button
              onClick={logout}
              className={`ml-1 px-3 py-2 rounded-xl text-[12px] font-medium transition inline-flex items-center gap-2 ${
                isDark ? 'text-red-300/90 hover:bg-red-400/10' : 'text-red-600 hover:bg-red-50'
              }`}
              title="Logout"
            >
              <Icon name="logout" className="w-4 h-4" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="hidden md:block">
          <Sidebar variant="desktop" />
        </div>

        {open && (
          <div className="md:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute left-0 top-0 bottom-0 w-[280px]">
              <Sidebar variant="drawer" onNavigate={() => setOpen(false)} />
            </div>
          </div>
        )}

        <main className="flex-1">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}