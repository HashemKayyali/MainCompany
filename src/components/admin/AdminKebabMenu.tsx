import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'
import Modal from '../ui/Modal'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useI18n } from '../../contexts/LanguageContext'
import { cn } from '../../utils/cn'

export type AdminKebabItem = {
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
  icon?: ReactNode
  disabled?: boolean
}

type AdminKebabMenuProps = {
  items: AdminKebabItem[]
  /** Accessible label for the trigger + title for the mobile sheet. */
  label?: string
  className?: string
  /** Alignment of the desktop popover relative to the trigger. */
  align?: 'start' | 'end'
}

type MenuPosition = {
  top: number
  left: number
  width: number
  maxHeight: number
  placement: 'top' | 'bottom'
}

const MENU_WIDTH = 184
const MENU_GAP = 8
const VIEWPORT_MARGIN = 8

const itemClass = (tone: 'default' | 'danger' | undefined) =>
  cn(
    'flex min-h-[44px] w-full items-center gap-2.5 rounded-[var(--admin-radius-sm)] px-3 text-[13px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
    tone === 'danger'
      ? 'text-[var(--admin-danger)] hover:bg-[color-mix(in_srgb,var(--admin-danger)_10%,transparent)]'
      : 'text-[var(--admin-text)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]'
  )

// Overflow action menu. Desktop uses a fixed portal so cards, tables, and
// modal scroll panes cannot clip it; mobile uses the shared bottom sheet.
export default function AdminKebabMenu({ items, label, className, align = 'end' }: AdminKebabMenuProps) {
  const { translateText, dir } = useI18n()
  const isDesktop = useMediaQuery('(min-width: 768px)', true)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuLabel = label ?? translateText('More actions')

  useEffect(() => {
    if (!open) setPosition(null)
  }, [open])

  useLayoutEffect(() => {
    if (!open || !isDesktop) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const triggerRect = trigger.getBoundingClientRect()
      const measuredMenu = menuRef.current?.getBoundingClientRect()
      const menuWidth = Math.min(
        Math.max(measuredMenu?.width || MENU_WIDTH, MENU_WIDTH),
        window.innerWidth - VIEWPORT_MARGIN * 2
      )
      const menuHeight = measuredMenu?.height || Math.min(items.length * 46 + 12, 320)
      const spaceBelow = window.innerHeight - triggerRect.bottom - MENU_GAP - VIEWPORT_MARGIN
      const spaceAbove = triggerRect.top - MENU_GAP - VIEWPORT_MARGIN
      const placement: MenuPosition['placement'] =
        spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
      const availableHeight = placement === 'top' ? spaceAbove : spaceBelow
      const maxHeight = Math.max(132, Math.min(menuHeight, availableHeight))
      const top =
        placement === 'top'
          ? Math.max(VIEWPORT_MARGIN, triggerRect.top - MENU_GAP - maxHeight)
          : Math.min(triggerRect.bottom + MENU_GAP, window.innerHeight - VIEWPORT_MARGIN - maxHeight)
      const rawLeft =
        dir === 'rtl'
          ? align === 'end'
            ? triggerRect.left
            : triggerRect.right - menuWidth
          : align === 'end'
            ? triggerRect.right - menuWidth
            : triggerRect.left
      const left = Math.min(
        Math.max(VIEWPORT_MARGIN, rawLeft),
        window.innerWidth - VIEWPORT_MARGIN - menuWidth
      )

      setPosition({ top, left, width: menuWidth, maxHeight, placement })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [align, dir, isDesktop, items.length, open])

  useEffect(() => {
    if (!open || !isDesktop) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (wrapRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
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
  }, [open, isDesktop])

  const handleSelect = (item: AdminKebabItem) => {
    if (item.disabled) return
    setOpen(false)
    item.onSelect()
  }

  const renderItems = () => {
    const firstDangerIndex = items.findIndex(item => item.tone === 'danger')

    return items.map((item, index) => (
      <button
        key={index}
        type="button"
        role="menuitem"
        disabled={item.disabled}
        onClick={event => {
          event.stopPropagation()
          handleSelect(item)
        }}
        className={cn(
          itemClass(item.tone),
          index === firstDangerIndex && index > 0 && 'mt-1 border-t border-[var(--admin-border)] pt-2'
        )}
      >
        {item.icon}
        {item.label}
      </button>
    ))
  }

  const desktopMenu =
    open && isDesktop && typeof document !== 'undefined'
      ? createPortal(
          <div className="admin-scope pointer-events-none fixed inset-0 z-[160]" dir={dir}>
            <div
              ref={menuRef}
              role="menu"
              data-placement={position?.placement}
              className="surface-floating pointer-events-auto fixed rounded-[var(--admin-radius)] p-1.5"
              style={{
                top: position?.top ?? 0,
                left: position?.left ?? 0,
                width: position?.width ?? MENU_WIDTH,
                maxHeight: position?.maxHeight ?? 320,
                overflowY: 'auto',
                visibility: position ? 'visible' : 'hidden',
              }}
            >
              {renderItems()}
            </div>
          </div>,
          document.body
        )
      : null

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={event => {
          event.stopPropagation()
          setPosition(null)
          setOpen(value => !value)
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={menuLabel}
        className="admin-icon-btn"
      >
        <MoreVertical className="h-[18px] w-[18px]" strokeWidth={2.1} aria-hidden="true" />
      </button>

      {desktopMenu}

      {open && !isDesktop && (
        <Modal open={open} onClose={() => setOpen(false)} title={menuLabel} size="sm">
          <div className="admin-scope space-y-0.5" role="menu">
            {renderItems()}
          </div>
        </Modal>
      )}
    </div>
  )
}
