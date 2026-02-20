import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import { useData } from '../../contexts/DataContext'
import ThemeToggle from '../theme/ThemeToggle'

type SidebarVariant = 'desktop' | 'drawer'

const LINKS = [
  { to: '/admin', l: 'Dashboard', icon: '🏠', exact: true },
  { to: '/admin/products', l: 'Products', icon: '🚲' },
  { to: '/admin/parts', l: 'Parts', icon: '🔧' },
  { to: '/admin/customers', l: 'Customers', icon: '👥' },
  { to: '/admin/categories', l: 'Categories', icon: '📂' },
  { to: '/admin/gallery', l: 'Gallery', icon: '📸' },
  { to: '/admin/admins', l: 'Admins', icon: '🔐' },
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

  const counts: Record<string, number> = {
    '/admin/products': products.length,
    '/admin/parts': parts.length,
    '/admin/customers': customers.length,
    '/admin/categories': categories.length,
    '/admin/gallery': galleryAlbums.length,
  }

  const shellClass =
    variant === 'desktop'
      ? 'w-64 shrink-0 h-screen sticky top-0'
      : 'w-[280px] h-full'

  return (
    <aside
      className={[
        shellClass,
        'flex flex-col border-r',
        isDark ? 'bg-void-900/60 border-purple-500/15' : 'bg-white border-gray-200',
      ].join(' ')}
    >
      {/* Brand */}
      <div className={['p-4 border-b', isDark ? 'border-purple-500/15' : 'border-gray-100'].join(' ')}>
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber flex items-center justify-center shadow-lg shadow-purple-500/20">
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
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2.5 space-y-1 overflow-y-auto">
        {LINKS.map(link => {
          const active = isActive(link.to, link.exact)

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={onNavigate}
              className={[
                'group flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all border relative',
                active
                  ? isDark
                    ? 'bg-prism-violet/15 text-prism-violet border-prism-violet/30 shadow-lg shadow-purple-500/10'
                    : 'bg-violet-50 text-violet-700 border-violet-200'
                  : isDark
                    ? 'text-purple-200/80 hover:text-white hover:bg-purple-500/[0.08] border-transparent'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-transparent',
              ].join(' ')}
            >
              <span className="text-base">{link.icon}</span>
              <span className="flex-1">{link.l}</span>

              {counts[link.to] !== undefined && (
                <span
                  className={[
                    'text-[10px] font-mono px-1.5 py-0.5 rounded-md',
                    isDark ? 'bg-purple-500/15 text-purple-200/80' : 'bg-gray-100 text-gray-500',
                  ].join(' ')}
                >
                  {counts[link.to]}
                </span>
              )}

              {active && <span className="w-1.5 h-1.5 rounded-full bg-prism-violet shadow-[0_0_12px_rgba(168,85,247,0.9)]" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer (Theme فقط) */}
      <div className={['p-3 border-t', isDark ? 'border-purple-500/15' : 'border-gray-100'].join(' ')}>
        <div className="flex items-center justify-between gap-2">
          <span className={['text-[11px] font-mono', isDark ? 'text-purple-200/60' : 'text-gray-500'].join(' ')}>
            Theme
          </span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  )
}