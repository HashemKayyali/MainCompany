import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, LogOut, UserRound, type LucideIcon } from 'lucide-react'
import UserAvatar from '../ui/UserAvatar'
import { useI18n } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'
import { APP_ROUTE_CHANGE_EVENT } from '../../utils/route-lifecycle'

type AdminUserMenuProps = {
  name: string
  email?: string | null
  subtitle?: string
  onLogout: () => void
}

const ITEM_CLASS =
  'flex min-h-[44px] w-full items-center gap-2.5 rounded-[var(--admin-radius-sm)] px-3 text-[12.5px] font-semibold transition'

function MenuItemIcon({ icon: IconComp }: { icon: LucideIcon }) {
  return <IconComp className="h-4 w-4 shrink-0" strokeWidth={2.1} aria-hidden="true" />
}

/**
 * Header avatar button with a small account dropdown:
 * Profile / Back to site / Logout. Presentation only — logout handler
 * is passed in from the layout.
 */
export default function AdminUserMenu({ name, email, subtitle, onLogout }: AdminUserMenuProps) {
  const { translateText } = useI18n()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  useEffect(() => {
    const close = () => setOpen(false)
    window.addEventListener(APP_ROUTE_CHANGE_EVENT, close)
    return () => window.removeEventListener(APP_ROUTE_CHANGE_EVENT, close)
  }, [])

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(value => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={translateText('Account menu')}
        className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] transition hover:border-[var(--admin-accent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)]"
      >
        <UserAvatar name={name} email={email || null} className="h-full w-full" />
      </button>

      {open && (
        <div
          role="menu"
          className="admin-card absolute end-0 top-[calc(100%+8px)] z-50 w-60 p-1.5 shadow-[0_24px_60px_-24px_rgba(46,10,114,0.35)]"
        >
          <div className="border-b border-[var(--admin-border)] px-3 pb-2.5 pt-2">
            <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{name}</div>
            {subtitle && (
              <div className="mt-0.5 truncate text-[11px] text-[var(--admin-text-muted)]">{subtitle}</div>
            )}
          </div>
          <div className="space-y-0.5 pt-1.5">
            <Link
              to="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                ITEM_CLASS,
                'text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]'
              )}
            >
              <MenuItemIcon icon={UserRound} />
              {translateText('Profile')}
            </Link>
            <Link
              to="/"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                ITEM_CLASS,
                'text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]'
              )}
            >
              <MenuItemIcon icon={ExternalLink} />
              {translateText('Back to site')}
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className={cn(
                ITEM_CLASS,
                'text-[var(--admin-danger)] hover:bg-[color-mix(in_srgb,var(--admin-danger)_8%,transparent)]'
              )}
            >
              <MenuItemIcon icon={LogOut} />
              {translateText('Logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
