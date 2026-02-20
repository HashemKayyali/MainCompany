import { Link, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useData } from '../../contexts/DataContext'
import ThemeToggle from '../theme/ThemeToggle'

type SidebarVariant = 'desktop' | 'drawer'

const STORAGE_KEY = 'bl_admin_sidebar_collapsed'

type IconName = 'home' | 'bike' | 'wrench' | 'users' | 'folder' | 'image' | 'shield'

function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = `w-5 h-5 ${className || ''}`
  switch (name) {
    case 'home':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M4 10.5L12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 21.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'bike':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5.5 16.5a3.5 3.5 0 1 0 0 .01v-.01ZM18.5 16.5a3.5 3.5 0 1 0 0 .01v-.01Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M9 7h3l1.7 3.3h-3.2L9 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10.5 10.3 7.2 16.5M13.7 10.3l2.9 6.2M12 7l-1.2 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'wrench':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M14.3 6.2a4.6 4.6 0 0 0-5.8 5.9L4.4 16.2a1.6 1.6 0 0 0 2.3 2.3l4.1-4.1a4.6 4.6 0 0 0 5.9-5.8l-2.2 2.2-2.2-2.2 2-2.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'users':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M16 20c0-3-2-5-4-5s-4 2-4 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M12 13a3.2 3.2 0 1 0 0-6.4A3.2 3.2 0 0 0 12 13Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 20c0-2.4-1.3-4.1-3-4.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M17.2 6.9a2.7 2.7 0 0 1 0 5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'folder':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7A2 2 0 0 1 20.5 9.5v9A2 2 0 0 1 18.5 20.5h-13A2 2 0 0 1 3.5 18.5v-11Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )
    case 'image':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M5.5 19.5h13A2 2 0 0 0 20.5 17.5v-11A2 2 0 0 0 18.5 4.5h-13A2 2 0 0 0 3.5 6.5v11A2 2 0 0 0 5.5 19.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M8.2 10.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" fill="currentColor" />
          <path d="M20.5 16.8l-4.2-4.2a1.4 1.4 0 0 0-2 0l-5.8 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.5 19 6.7v6.7c0 4.2-3 7.7-7 8.9-4-1.2-7-4.7-7-8.9V6.7L12 3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9.5 12.2 11.2 14l3.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
  }
}

const LINKS: { to: string; l: string; icon: IconName; exact?: boolean }[] = [
  { to: '/admin', l: 'Dashboard', icon: 'home', exact: true },
  { to: '/admin/products', l: 'Products', icon: 'bike' },
  { to: '/admin/parts', l: 'Parts', icon: 'wrench' },
  { to: '/admin/customers', l: 'Customers', icon: 'users' },
  { to: '/admin/categories', l: 'Categories', icon: 'folder' },
  { to: '/admin/gallery', l: 'Gallery', icon: 'image' },
  { to: '/admin/admins', l: 'Admins', icon: 'shield' },
]

export default function Sidebar({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: SidebarVariant
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()
  const { isDark } = useTheme()
  const { products, parts, customers, categories, galleryAlbums } = useData()

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to))

  const counts: Record<string, number> = useMemo(
    () => ({
      '/admin/products': products?.length ?? 0,
      '/admin/parts': parts?.length ?? 0,
      '/admin/customers': customers?.length ?? 0,
      '/admin/categories': categories?.length ?? 0,
      '/admin/gallery': galleryAlbums?.length ?? 0,
    }),
    [products, parts, customers, categories, galleryAlbums]
  )

  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (variant !== 'desktop') return
    const saved = localStorage.getItem(STORAGE_KEY)
    setCollapsed(saved === '1')
  }, [variant])

  const toggleCollapsed = () => {
    if (variant !== 'desktop') return
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
  }

  // ✅ IMPORTANT: sidebar starts under topbar (h-16)
  const shellClass =
    variant === 'desktop'
      ? collapsed
        ? 'w-[84px] shrink-0 h-[calc(100vh-4rem)] sticky top-16'
        : 'w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16'
      : 'w-[280px] h-full'

  const border = isDark ? 'border-purple-500/15' : 'border-gray-200'
  const bg = isDark ? 'bg-void-900/60' : 'bg-white'

  return (
    <aside className={[shellClass, 'flex flex-col border-r', bg, border].join(' ')}>
      {/* Brand */}
      <div className={[(collapsed ? 'p-3' : 'p-4'), 'border-b', isDark ? 'border-purple-500/15' : 'border-gray-100'].join(' ')}>
        <div className={['flex items-center', collapsed ? 'justify-center' : 'gap-2.5'].join(' ')}>
          {/* Desktop: logo is the collapse/expand button */}
          {variant === 'desktop' ? (
            <button
              type="button"
              onClick={toggleCollapsed}
              className={[
                'group flex items-center rounded-xl transition',
                collapsed ? 'justify-center' : 'gap-2.5',
              ].join(' ')}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <span className="text-white font-black text-[10px] font-display">BL</span>
              </div>

              {!collapsed && (
                <div className="min-w-0 text-left">
                  <span
                    className={[
                      'text-xs font-bold tracking-wider uppercase font-display block truncate',
                      isDark ? 'text-white' : 'text-gray-900',
                    ].join(' ')}
                  >
                    Bike Land
                  </span>
                  <span className={['text-[10px] font-mono', isDark ? 'text-purple-200/70' : 'text-gray-500'].join(' ')}>
                    Admin Panel
                  </span>
                </div>
              )}
            </button>
          ) : (
            // Drawer (mobile): keep it as a Link
            <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                <span className="text-white font-black text-[10px] font-display">BL</span>
              </div>

              <div className="min-w-0">
                <span className={['text-xs font-bold tracking-wider uppercase font-display block truncate', isDark ? 'text-white' : 'text-gray-900'].join(' ')}>
                  Bike Land
                </span>
                <span className={['text-[10px] font-mono', isDark ? 'text-purple-200/70' : 'text-gray-500'].join(' ')}>
                  Admin Panel
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {LINKS.map(link => {
          const active = isActive(link.to, link.exact)

          const base = 'group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all border relative'
          const activeCls = active
            ? isDark
              ? 'bg-prism-violet/15 text-prism-violet border-prism-violet/30 shadow-lg shadow-purple-500/10'
              : 'bg-violet-50 text-violet-700 border-violet-200'
            : isDark
              ? 'text-purple-200/80 hover:text-white hover:bg-purple-500/[0.08] border-transparent'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent'

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={[base, activeCls, collapsed ? 'justify-center px-0' : ''].join(' ')}
              title={collapsed ? link.l : undefined}
            >
              <span
                className={[
                  'shrink-0',
                  active ? '' : isDark ? 'text-purple-200/80 group-hover:text-white' : 'text-gray-500 group-hover:text-gray-900',
                ].join(' ')}
              >
                <Icon name={link.icon} />
              </span>

              {!collapsed && <span className="flex-1">{link.l}</span>}

              {!collapsed && counts[link.to] !== undefined && link.to !== '/admin' && (
                <span
                  className={[
                    'text-[10px] font-mono px-1.5 py-0.5 rounded-md',
                    isDark ? 'bg-purple-500/15 text-purple-200/80' : 'bg-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {counts[link.to]}
                </span>
              )}

              {active && !collapsed && <span className="w-1.5 h-1.5 rounded-full bg-prism-violet shadow-[0_0_12px_rgba(168,85,247,0.9)]" />}
              {active && collapsed && <span className="absolute right-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-prism-violet shadow-[0_0_16px_rgba(168,85,247,0.9)]" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className={['p-3 border-t', isDark ? 'border-purple-500/15' : 'border-gray-100'].join(' ')}>
        <div className={['flex items-center justify-between gap-2', collapsed ? 'justify-center' : ''].join(' ')}>
          {!collapsed && <span className={['text-[11px] font-mono', isDark ? 'text-purple-200/60' : 'text-gray-500'].join(' ')}>Theme</span>}
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}