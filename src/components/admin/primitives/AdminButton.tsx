import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../../utils/cn'

export type AdminButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger'
export type AdminButtonSize = 'sm' | 'md'

export type AdminButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: AdminButtonVariant
  size?: AdminButtonSize
  loading?: boolean
  children?: ReactNode
}

const VARIANT_CLASSES: Record<AdminButtonVariant, string> = {
  primary:
    'bg-[var(--admin-accent)] text-white border border-transparent hover:brightness-110 focus-visible:ring-[var(--admin-accent-soft)] shadow-[0_10px_24px_-14px_rgba(113,38,227,0.55)]',
  outline:
    'bg-[var(--admin-surface)] text-[var(--admin-accent)] border border-[var(--admin-border)] hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] focus-visible:ring-[var(--admin-accent-soft)]',
  ghost:
    'bg-transparent text-[var(--admin-text-muted)] border border-transparent hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] focus-visible:ring-[var(--admin-accent-soft)]',
  danger:
    'bg-[var(--admin-danger)] text-white border border-transparent hover:brightness-110 focus-visible:ring-[rgba(220,38,38,0.2)] shadow-[0_10px_24px_-14px_rgba(220,38,38,0.5)]',
}

const SIZE_CLASSES: Record<AdminButtonSize, string> = {
  // Mobile-first: 44px touch target everywhere, compact on md+ for `sm`.
  sm: 'min-h-[44px] px-3 text-[12px] md:min-h-[36px]',
  md: 'min-h-[44px] px-4 text-[13px]',
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(function AdminButton(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, type = 'button', ...props },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] font-bold transition',
        'focus-visible:outline-none focus-visible:ring-[3px]',
        'active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-55 disabled:active:translate-y-0',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
})

export default AdminButton
