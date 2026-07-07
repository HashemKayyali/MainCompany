import { Link, useLocation } from 'react-router-dom'
import { useMemo } from 'react'
import {
  ChevronsLeft,
  ChevronsRight,
  Bell,
  ClipboardList,
  FileText,
  Mail,
  FolderOpen,
  Image,
  LayoutDashboard,
  MessageCircle,
  Package,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useUser } from '../../contexts/UserContext'
import { BRAND_ICON } from '../../config/brand'
import UserAvatar from '../ui/UserAvatar'
import LanguageSwitcher from '../layout/LanguageSwitcher'
import { useI18n } from '../../contexts/LanguageContext'
import { useChat } from '../../contexts/ChatContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { cn } from '../../utils/cn'

type SidebarVariant = 'desktop' | 'drawer'

type SidebarLink = {
  to: string
  label: string
  icon: LucideIcon
  exact?: boolean
  superadminOnly?: boolean
}

type SidebarGroup = {
  label: string
  links: SidebarLink[]
}

const NAV_GROUPS: SidebarGroup[] = [
  {
    label: 'Overview',
    links: [{ to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true }],
  },
  {
    label: 'Catalog',
    links: [
      { to: '/admin/products', label: 'Products', icon: Package },
      { to: '/admin/parts', label: 'Parts', icon: Wrench },
      { to: '/admin/categories', label: 'Categories', icon: FolderOpen },
      { to: '/admin/custom-builds', label: 'Custom Builds', icon: Sparkles },
      { to: '/admin/gallery', label: 'Gallery', icon: Image },
    ],
  },
  {
    label: 'Operations',
    links: [
      { to: '/admin/requests', label: 'Requests', icon: ClipboardList },
      { to: '/admin/chats', label: 'Chats', icon: MessageCircle, superadminOnly: true },
      { to: '/admin/contacts', label: 'Contact Inquiries', icon: Mail },
      { to: '/admin/notifications', label: 'Notifications', icon: Bell, exact: true },
      { to: '/admin/notifications/send', label: 'Send Notification', icon: Send, superadminOnly: true },
      { to: '/admin/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Access',
    links: [
      { to: '/admin/users', label: 'Users', icon: UserRound },
      { to: '/admin/admins', label: 'Admins', icon: ShieldCheck },
      { to: '/admin/logs', label: 'Logs', icon: FileText },
    ],
  },
]

function roleLabel(role?: string | null) {
  if (role === 'superadmin') return 'Super Admin'
  if (role === 'admin') return 'Administrator'
  return 'Workspace User'
}

export default function Sidebar({
  variant = 'desktop',
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: {
  variant?: SidebarVariant
  onNavigate?: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const { pathname } = useLocation()
  const { products, parts, customers, categories, galleryAlbums, customBuilds } = useData()
  const { currentUser } = useUser()
  const { translateText } = useI18n()
  const { unreadCount: chatUnreadCount } = useChat()
  const { unreadCount: notificationUnreadCount } = useNotifications()

  // The drawer always renders expanded; only the desktop rail collapses.
  const isCollapsed = variant === 'desktop' && collapsed

  const displayName = currentUser?.name?.trim() || translateText('Admin')
  const displayRole = translateText(roleLabel(currentUser?.role))

  const counts: Record<string, number> = useMemo(
    () => ({
      '/admin/products': products?.length ?? 0,
      '/admin/parts': parts?.length ?? 0,
      '/admin/customers': customers?.length ?? 0,
      '/admin/categories': categories?.length ?? 0,
      '/admin/custom-builds': customBuilds?.length ?? 0,
      '/admin/gallery': galleryAlbums?.length ?? 0,
      ...(chatUnreadCount > 0 ? { '/admin/chats': chatUnreadCount } : {}),
      ...(notificationUnreadCount > 0 ? { '/admin/notifications': notificationUnreadCount } : {}),
    }),
    [products, parts, customers, categories, customBuilds, galleryAlbums, chatUnreadCount, notificationUnreadCount]
  )

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to)

  const renderLink = (link: SidebarLink) => {
    const active = isActive(link.to, link.exact)
    const count = counts[link.to]
    const label = translateText(link.label)
    const IconComp = link.icon

    return (
      <Link
        key={link.to}
        to={link.to}
        onClick={onNavigate}
        aria-current={active ? 'page' : undefined}
        aria-label={isCollapsed ? label : undefined}
        title={isCollapsed ? label : undefined}
        className={cn(
          'group relative flex min-h-[44px] items-center rounded-[var(--admin-radius-sm)] border-s-2 transition-colors duration-200',
          isCollapsed ? 'justify-center px-0' : 'gap-3 ps-3 pe-2.5',
          active
            ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
            : 'border-transparent text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-text)]'
        )}
      >
        <IconComp className="h-[18px] w-[18px] shrink-0" strokeWidth={2.1} aria-hidden="true" />
        {!isCollapsed && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] font-bold tracking-[-0.01em]">
              {label}
            </span>
            {count !== undefined && (
              <span
                className={cn(
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold tabular-nums',
                  active
                    ? 'bg-[var(--admin-accent)] text-white'
                    : 'border border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]'
                )}
              >
                {count}
              </span>
            )}
          </>
        )}
      </Link>
    )
  }

  const CollapseIcon = (collapsed ? ChevronsRight : ChevronsLeft)
  const collapseLabel = collapsed
    ? translateText('Expand sidebar')
    : translateText('Collapse sidebar')

  return (
    <aside
      className={cn(
        'admin-scope relative min-h-0',
        variant === 'desktop' ? 'hidden h-full w-full lg:block' : 'block h-full w-[288px] max-w-[85vw]'
      )}
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden border-e border-[var(--admin-border)] bg-[var(--admin-surface)]">
        {/* Profile */}
        <div className={cn('shrink-0', isCollapsed ? 'px-2 pb-3 pt-4' : 'px-3.5 pb-4 pt-4')}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div
                className="h-11 w-11 overflow-hidden rounded-[var(--admin-radius-sm)]"
                title={displayName}
              >
                <UserAvatar name={currentUser?.name || displayName} email={currentUser?.email || null} className="h-full w-full" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-[var(--admin-radius-sm)]">
                <UserAvatar name={currentUser?.name || displayName} email={currentUser?.email || null} className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[9.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--admin-accent)]">
                  {displayRole}
                </div>
                <div className="mt-0.5 truncate text-[13.5px] font-bold text-[var(--admin-text)]">
                  {displayName}
                </div>
              </div>
            </div>
          )}
          {variant === 'drawer' && (
            <LanguageSwitcher
              compact
              className="mt-3 w-full border-[var(--admin-border)] bg-[var(--admin-surface-2)] text-[var(--admin-text)] hover:border-[var(--admin-accent)]"
            />
          )}
        </div>

        {/* Nav */}
        <nav
          aria-label={translateText('Admin navigation')}
          className={cn(
            'min-h-0 flex-1 overflow-y-auto overflow-x-hidden pb-4 [scrollbar-width:thin]',
            isCollapsed ? 'px-2' : 'px-3'
          )}
        >
          {NAV_GROUPS.map((group, index) => (
            <section
              key={group.label}
              className={cn(
                index > 0 && (isCollapsed ? 'mt-2 border-t border-[var(--admin-border)] pt-2' : 'mt-5')
              )}
            >
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--admin-text-muted)]">
                  {translateText(group.label)}
                </div>
              )}
              <div className="space-y-1">
                {group.links
                  .filter(link => !link.superadminOnly || currentUser?.role === 'superadmin')
                  .map(renderLink)}
              </div>
            </section>
          ))}
        </nav>

        {/* Collapse toggle + brand footer */}
        <div className={cn('shrink-0 border-t border-[var(--admin-border)]', isCollapsed ? 'px-2 py-3' : 'px-3.5 py-3')}>
          {variant === 'desktop' && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              aria-label={collapseLabel}
              title={collapseLabel}
              className={cn(
                'mb-2 flex min-h-[44px] w-full items-center rounded-[var(--admin-radius-sm)] text-[var(--admin-text-muted)] transition hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-accent)]',
                isCollapsed ? 'justify-center' : 'gap-3 ps-3 pe-2.5'
              )}
            >
              <CollapseIcon className="h-[18px] w-[18px] shrink-0 rtl:rotate-180" strokeWidth={2.1} aria-hidden="true" />
              {!isCollapsed && <span className="text-[12px] font-bold">{collapseLabel}</span>}
            </button>
          )}
          <div className={cn('flex items-center gap-2', isCollapsed && 'justify-center')}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
              <img
                src={BRAND_ICON}
                alt="Eventies"
                width={28}
                height={28}
                className="block h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </span>
            {!isCollapsed && (
              <span className="truncate text-[11px] font-bold tracking-[0.04em] text-[var(--admin-text-muted)]">
                {translateText('Eventies Admin')}
              </span>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
