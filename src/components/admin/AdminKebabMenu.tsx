import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical } from 'lucide-react'
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
  /** Accessible label for the trigger. */
  label?: string
  className?: string
  /** Alignment of the popover relative to the trigger. */
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

/**
 * Viewport-positioned overflow menu. The same anchored popover is used on
 * desktop and mobile so action menus stay attached to their trigger instead
 * of opening as a half-screen bottom sheet.
 */
export default function AdminKebabMenu({ items, label, className, align = 'end' }: AdminKebabMenuProps) {
  const { translateText, dir } = useI18n()
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
    if (!open) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const triggerRect = trigger.getBoundingClientRect()
      const measuredMenu = menuRef.current?.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      const menuWidth = Math.min(
        Math.max(measuredMenu?.width || MENU_WIDTH, MENU_WIDTH),
        viewportWidth - VIEWPORT_MARGIN * 2
      )
      const menuHeight = measuredMenu?.height || Math.min(items.length * 46 + 12, 320)
      const spaceBelow = Math.max(0, viewportHeight - triggerRect.bottom - MENU_GAP - VIEWPORT_MARGIN)
      const spaceAbove = Math.max(0, triggerRect.top - MENU_GAP - VIEWPORT_MARGIN)
      const placement: MenuPosition['placement'] =
        spaceBelow < menuHeight && spaceAbove > spaceBelow ? 'top' : 'bottom'
      const availableHeight = placement === 'top' ? spaceAbove : spaceBelow
      const maxHeight = Math.max(88, Math.min(menuHeight, availableHeight || menuHeight))
      const top =
        placement === 'top'
          ? Math.max(VIEWPORT_MARGIN, triggerRect.top - MENU_GAP - maxHeight)
          : Math.min(triggerRect.bottom + MENU_GAP, viewportHeight - VIEWPORT_MARGIN - maxHeight)
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
        viewportWidth - VIEWPORT_MARGIN - menuWidth
      )

      setPosition({ top, left, width: menuWidth, maxHeight, placement })
    }

    updatePosition()
    const frame = window.requestAnimationFrame(updatePosition)
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [align, dir, items.length, open])

  useEffect(() => {
    if (!open) return

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
  }, [open])

  const handleSelect = (item: AdminKebabItem) => {
    if (item.disabled) return
    setOpen(false)
    item.onSelect()
  }

  const firstDangerIndex = items.findIndex(item => item.tone === 'danger')

  const renderItems = () =>
    items.map((item, index) => (
      <button
        key={`${item.label}-${index}`}
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

  const menuPortal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div className="admin-scope pointer-events-none fixed inset-0 z-[160]" dir={dir}>
            <div
              ref={menuRef}
              role="menu"
              aria-label={menuLabel}
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

      {menuPortal}
    </div>
  )
}
