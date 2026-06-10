import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useData } from '../../contexts/DataContext'
import { useUser } from '../../contexts/UserContext'
import UserAvatar from '../ui/UserAvatar'
import { cn } from '../../utils/cn'

type SidebarVariant = 'desktop' | 'drawer'
type IconName =
  | 'home'
  | 'bike'
  | 'wrench'
  | 'users'
  | 'folder'
  | 'image'
  | 'shield'
  | 'log'
  | 'person'
  | 'clipboard'

type SidebarLink = {
  to: string
  label: string
  icon: IconName
  exact?: boolean
}

function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = `h-[18px] w-[18px] ${className || ''}`
  switch (name) {
    case 'home':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 10.5L12 4l8 6.5V20a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 20v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9.5 21.5V14a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7.5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'bike':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5.5 16.5a3.5 3.5 0 1 0 0 .01v-.01ZM18.5 16.5a3.5 3.5 0 1 0 0 .01v-.01Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M9 7h3l1.7 3.3h-3.2L9 7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M10.5 10.3 7.2 16.5M13.7 10.3l2.9 6.2M12 7l-1.2 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'wrench':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14.3 6.2a4.6 4.6 0 0 0-5.8 5.9L4.4 16.2a1.6 1.6 0 0 0 2.3 2.3l4.1-4.1a4.6 4.6 0 0 0 5.9-5.8l-2.2 2.2-2.2-2.2 2-2.4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
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
          <path d="M3.5 7.5A2 2 0 0 1 5.5 5.5h4l2 2h7A2 2 0 0 1 20.5 9.5v9A2 2 0 0 1 18.5 20.5h-13A2 2 0 0 1 3.5 18.5v-11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      )
    case 'image':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5.5 19.5h13A2 2 0 0 0 20.5 17.5v-11A2 2 0 0 0 18.5 4.5h-13A2 2 0 0 0 3.5 6.5v11A2 2 0 0 0 5.5 19.5Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.2 10.2a1.3 1.3 0 1 0 0-2.6 1.3 1.3 0 0 0 0 2.6Z" fill="currentColor" />
          <path d="M20.5 16.8l-4.2-4.2a1.4 1.4 0 0 0-2 0l-5.8 5.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'shield':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3.5 19 6.7v6.7c0 4.2-3 7.7-7 8.9-4-1.2-7-4.7-7-8.9V6.7L12 3.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9.5 12.2 11.2 14l3.5-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'person':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M20 21c0-3.9-3.6-7-8-7s-8 3.1-8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'clipboard':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 4.5h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M9.5 3.5h5A1.5 1.5 0 0 1 16 5v1H8V5a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M7 6h10a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8.5 11.5h7M8.5 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
    case 'log':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-6-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 3v6h6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )
  }
}

const CONTENT_LINKS: SidebarLink[] = [
  { to: '/admin', label: 'Dashboard', icon: 'home', exact: true },
  { to: '/admin/products', label: 'Products', icon: 'bike' },
  { to: '/admin/requests', label: 'Requests', icon: 'clipboard' },
  { to: '/admin/parts', label: 'Parts', icon: 'wrench' },
  { to: '/admin/customers', label: 'Customers', icon: 'users' },
  { to: '/admin/categories', label: 'Categories', icon: 'folder' },
  { to: '/admin/gallery', label: 'Gallery', icon: 'image' },
]

const ACCESS_LINKS: SidebarLink[] = [
  { to: '/admin/users', label: 'Users', icon: 'person' },
  { to: '/admin/admins', label: 'Admins', icon: 'shield' },
  { to: '/admin/logs', label: 'Logs', icon: 'log' },
]

function roleLabel(role?: string | null) {
  if (role === 'superadmin') return 'Super Admin'
  if (role === 'admin') return 'Administrator'
  return 'Workspace User'
}

export default function Sidebar({
  variant = 'desktop',
  onNavigate,
}: {
  variant?: SidebarVariant
  onNavigate?: () => void
}) {
  const { pathname } = useLocation()
  const { products, parts, customers, categories, galleryAlbums } = useData()
  const { currentUser } = useUser()

  const displayName = currentUser?.name?.trim() || 'Admin User'
  const displayRole = roleLabel(currentUser?.role)

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

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to)

  const shellClass =
    variant === 'desktop'
      ? 'hidden h-full w-full shrink-0 md:block'
      : 'block h-full w-[270px] max-w-[84vw] shrink-0'

  const renderLink = (link: SidebarLink) => {
    const active = isActive(link.to, link.exact)
    const count = counts[link.to]

    return (
      <Link
        key={link.to}
        to={link.to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'group relative flex items-center gap-3 rounded-[14px] py-2.5 pl-3 pr-2.5 transition-all duration-200',
          active
            ? 'bg-[linear-gradient(135deg,#7c3aed,#9d6bff)] text-white shadow-[0_14px_30px_-14px_rgba(157,107,255,0.8)]'
            : 'text-violet-100/65 hover:bg-white/[0.07] hover:text-white'
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute -left-2.5 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-full bg-white/90"
          />
        )}
        <span
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] transition',
            active
              ? 'bg-white/20 text-white'
              : 'bg-white/[0.05] text-violet-100/70 group-hover:bg-white/[0.1] group-hover:text-white'
          )}
        >
          <Icon name={link.icon} />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12.5px] font-bold tracking-[-0.01em]">
          {link.label}
        </span>
        {count !== undefined && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums',
              active
                ? 'bg-white/25 text-white'
                : 'bg-white/[0.07] text-violet-100/55 group-hover:bg-white/[0.12] group-hover:text-white'
            )}
          >
            {count}
          </span>
        )}
      </Link>
    )
  }

  return (
    <aside className={cn('admin-scope relative min-h-0', shellClass)}>
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(185deg,#1d0a40_0%,#170733_52%,#120527_100%)]">
        {/* Ambient accents */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-10 h-44 w-44 rounded-full bg-violet-500/20 blur-[70px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 bottom-0 h-52 w-52 rounded-full bg-fuchsia-500/15 blur-[80px]"
        />

        {/* Brand / profile */}
        <div className="relative shrink-0 px-4 pb-4 pt-5">
          <div className="flex items-center gap-3 rounded-[16px] border border-white/[0.08] bg-white/[0.04] p-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[13px] bg-[linear-gradient(135deg,#7c3aed,#c026d3)] text-[11px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(192,38,211,0.6)]">
              <UserAvatar
                name={currentUser?.name || displayName}
                email={currentUser?.email || null}
                className="h-full w-full rounded-[13px]"
                fallbackClassName="bg-[linear-gradient(135deg,#7c3aed,#c026d3)] text-white"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-violet-300">
                {displayRole}
              </div>
              <div className="mt-1 truncate font-display text-[14px] font-bold text-white">
                {displayName}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-6 [scrollbar-width:thin]">
          <div className="space-y-6">
            <section className="space-y-1.5">
              <div className="px-3 pb-1 text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-violet-300/55">
                Main
              </div>
              <div className="space-y-1">{CONTENT_LINKS.map(renderLink)}</div>
            </section>

            <section className="space-y-1.5">
              <div className="px-3 pb-1 text-[9.5px] font-extrabold uppercase tracking-[0.22em] text-violet-300/55">
                Access
              </div>
              <div className="space-y-1">{ACCESS_LINKS.map(renderLink)}</div>
            </section>
          </div>
        </div>

        {/* Footer brand mark */}
        <div className="relative shrink-0 border-t border-white/[0.07] px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-[linear-gradient(135deg,#7c3aed,#9d6bff)] text-[10px] font-black text-white">
              Ev
            </span>
            <span className="text-[11px] font-bold tracking-[0.04em] text-violet-100/55">
              Eventies Admin
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
