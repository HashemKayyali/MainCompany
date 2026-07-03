import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

export type AdminFieldProps = {
  label?: ReactNode
  htmlFor?: string
  required?: boolean
  hint?: ReactNode
  error?: ReactNode
  className?: string
  children: ReactNode
}

/**
 * Layout wrapper for admin form fields: label on top, control, then either
 * the error (takes priority) or the hint underneath. Presentation only.
 */
export default function AdminField({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}: AdminFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5 text-start', className)}>
      {label != null && (
        <label htmlFor={htmlFor} className="admin-label">
          {label}
          {required && (
            <span aria-hidden="true" className="ms-0.5 text-[var(--admin-danger)]">
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error != null ? (
        <p role="alert" className="text-[11px] font-semibold text-[var(--admin-danger)]">
          {error}
        </p>
      ) : hint != null ? (
        <p className="text-[11px] text-[var(--admin-text-muted)]">{hint}</p>
      ) : null}
    </div>
  )
}
