import { Link, useLocation } from 'react-router-dom'
import {
  ClipboardList,
  FolderOpen,
  LayoutDashboard,
  Menu,
  Package,
  type LucideIcon,
} from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'

type BottomTab = {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const TABS: BottomTab[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
  { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
]

/**
 * Mobile-only bottom tab bar for the admin shell. The "More" tab opens the
 * full navigation drawer via `onMore`.
 */
export default function AdminBottomBar({ onMore }: { onMore: () => void }) {
  const { pathname } = useLocation()
  const { translateText } = useI18n()

  const isActive = (tab: BottomTab) =>
    tab.exact ? pathname === tab.to : pathname.startsWith(tab.to)

  const itemClass = (active: boolean) =>
    cn(
      'flex min-h-[44px] flex-col items-center justify-center gap-0.5 transition-colors',
      active ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text-muted)]'
    )

  return (
    <nav
      aria-label={translateText('Admin sections')}
      className="admin-bottombar fixed inset-x-0 bottom-0 z-40 md:hidden"
    >
      <div className="grid h-[var(--admin-bottombar-h)] grid-cols-5">
        {TABS.map(tab => {
          const active = isActive(tab)
          const IconComp = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              className={itemClass(active)}
            >
              <IconComp className="h-5 w-5" strokeWidth={active ? 2.4 : 2} aria-hidden="true" />
              <span className={cn('text-[10px] leading-tight', active ? 'font-extrabold' : 'font-semibold')}>
                {translateText(tab.label)}
              </span>
            </Link>
          )
        })}
        <button type="button" onClick={onMore} className={itemClass(false)}>
          <Menu className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
          <span className="text-[10px] font-semibold leading-tight">{translateText('More')}</span>
        </button>
      </div>
    </nav>
  )
}
