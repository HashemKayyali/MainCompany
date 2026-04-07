import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useData } from '../../contexts/DataContext'
import { useUser } from '../../contexts/UserContext'
import UserAvatar from '../ui/UserAvatar'
import { cn } from '../../utils/cn'

type SidebarVariant = 'desktop' | 'drawer'
type IconName = 'home' | 'bike' | 'wrench' | 'users' | 'folder' | 'image' | 'shield' | 'log' | 'person' | 'clipboard'

type SidebarLink = {
  to: string
  label: string
  icon: IconName
  exact?: boolean
}


function Icon({ name, className }: { name: IconName; className?: string }) {
  const common = `h-5 w-5 ${className || ''}`

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
  const { isDark } = useTheme()
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

  const isActive = (to: string, exact?: boolean) => (exact ? pathname === to : pathname.startsWith(to))

  const shellClass =
    variant === 'desktop'
      ? 'hidden h-full w-full shrink-0 md:block'
      : 'block h-full w-[248px] max-w-[82vw] shrink-0'

  const panelClass = isDark
    ? 'border-r border-cyan-400/10 bg-[linear-gradient(180deg,rgba(12,15,31,0.98),rgba(10,13,28,0.99)_38%,rgba(9,12,24,1)_100%)]'
    : 'border-r border-gray-200 bg-white/94'

  const sectionLabelClass = isDark ? 'text-cyan-100/34' : 'text-violet-600/42'

  return (
    <aside className={cn('relative min-h-0', shellClass)}>
      <div className={cn('relative flex h-full min-h-0 flex-col overflow-hidden', panelClass)}>
        {isDark && (
          <>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:42px_42px]" />
            <div className="pointer-events-none absolute left-[-3rem] top-20 h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute bottom-10 left-4 h-32 w-32 rounded-full bg-fuchsia-500/10 blur-3xl" />
          </>
        )}

        <div
          className={cn(
            'relative shrink-0 border-b px-4 py-4',
            isDark ? 'border-cyan-400/10' : 'border-gray-200'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber text-[11px] font-bold text-white shadow-[0_18px_40px_-26px_rgba(236,72,153,0.42)] ring-1 ring-inset ring-white/14">
              <UserAvatar
                name={currentUser?.name || displayName}
                email={currentUser?.email || null}
                avatarUrl={currentUser?.avatarUrl}
                avatarStyle={currentUser?.avatarStyle}
                avatarSeed={currentUser?.avatarSeed}
                avatarOptions={currentUser?.avatarOptions}
                className="h-full w-full rounded-[18px]"
                fallbackClassName="bg-gradient-to-br from-prism-violet via-prism-pink to-prism-amber text-white"
              />
              <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_48%)]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className={cn('truncate text-[10px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-cyan-100/38' : 'text-violet-600/56')}>
                {displayRole}
              </div>
              <div className={cn('mt-1 truncate font-display text-[14px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
                {displayName}
              </div>
            </div>
          </div>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden pl-2.5 pr-3 pt-3.5 [direction:rtl]">
            <div className="space-y-5 pb-5 [direction:ltr]">
              <section className="space-y-2">
                <div className={cn('px-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em]', sectionLabelClass)}>
                  Main
                </div>

                <div className="space-y-1">
                  {CONTENT_LINKS.map(link => {
                    const active = isActive(link.to, link.exact)
                    const count = counts[link.to]

                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={onNavigate}
                        className={cn(
                          'group relative flex items-center gap-2.5 rounded-[16px] px-2.5 py-2 transition duration-200',
                          active
                            ? isDark
                              ? 'bg-[linear-gradient(135deg,rgba(17,39,72,0.96),rgba(14,28,54,0.98))] text-white ring-1 ring-inset ring-cyan-300/18 shadow-[0_18px_34px_-24px_rgba(34,211,238,0.24)]'
                              : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
                            : isDark
                              ? 'text-purple-100/74 ring-1 ring-inset ring-white/[0.03] hover:bg-white/[0.04] hover:text-white hover:ring-cyan-400/10'
                              : 'text-gray-600 ring-1 ring-inset ring-transparent hover:bg-gray-50 hover:text-gray-900 hover:ring-gray-200'
                        )}
                      >
                        {active && isDark ? (
                          <span className="absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
                        ) : null}

                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] transition',
                            active
                              ? isDark
                                ? 'bg-white/[0.08] text-cyan-100 ring-1 ring-inset ring-cyan-300/10'
                                : 'bg-white text-violet-700'
                              : isDark
                                ? 'bg-white/[0.03] text-purple-100/68 ring-1 ring-inset ring-white/[0.04] group-hover:bg-white/[0.05]'
                                : 'bg-gray-50 text-gray-500'
                          )}
                        >
                          <Icon name={link.icon} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11.5px] font-medium">{link.label}</div>
                          </div>

                        {count !== undefined ? (
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[8px] font-mono font-semibold',
                              active
                                ? isDark
                                  ? 'bg-cyan-400/12 text-cyan-200 ring-1 ring-inset ring-cyan-300/14'
                                  : 'bg-violet-100 text-violet-700'
                                : isDark
                                  ? 'bg-white/[0.05] text-purple-100/60 ring-1 ring-inset ring-white/[0.04]'
                                  : 'bg-gray-100 text-gray-500'
                            )}
                          >
                            {count}
                          </span>
                        ) : null}
                      </Link>
                    )
                  })}
                </div>
              </section>

              <section className="space-y-2">
                <div className={cn('px-2 text-[10px] font-mono font-semibold uppercase tracking-[0.18em]', sectionLabelClass)}>
                  Access
                </div>

                <div className="space-y-1">
                  {ACCESS_LINKS.map(link => {
                    const active = isActive(link.to, link.exact)

                    return (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={onNavigate}
                        className={cn(
                          'group relative flex items-center gap-2.5 rounded-[16px] px-2.5 py-2 transition duration-200',
                          active
                            ? isDark
                              ? 'bg-[linear-gradient(135deg,rgba(17,39,72,0.96),rgba(14,28,54,0.98))] text-white ring-1 ring-inset ring-cyan-300/18 shadow-[0_18px_34px_-24px_rgba(34,211,238,0.24)]'
                              : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200'
                            : isDark
                              ? 'text-purple-100/74 ring-1 ring-inset ring-white/[0.03] hover:bg-white/[0.04] hover:text-white hover:ring-cyan-400/10'
                              : 'text-gray-600 ring-1 ring-inset ring-transparent hover:bg-gray-50 hover:text-gray-900 hover:ring-gray-200'
                        )}
                      >
                        {active && isDark ? (
                          <span className="absolute left-0 top-1/2 h-10 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-300 via-violet-400 to-fuchsia-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]" />
                        ) : null}

                        <span
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-[13px] transition',
                            active
                              ? isDark
                                ? 'bg-white/[0.08] text-cyan-100 ring-1 ring-inset ring-cyan-300/10'
                                : 'bg-white text-violet-700'
                              : isDark
                                ? 'bg-white/[0.03] text-purple-100/68 ring-1 ring-inset ring-white/[0.04] group-hover:bg-white/[0.05]'
                                : 'bg-gray-50 text-gray-500'
                          )}
                        >
                          <Icon name={link.icon} />
                        </span>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[11.5px] font-medium">{link.label}</div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}
