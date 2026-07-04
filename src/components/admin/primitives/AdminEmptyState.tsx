import type { ReactNode } from 'react'
import { cn } from '../../../utils/cn'

export type AdminEmptyStateProps = {
  icon?: ReactNode
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  className?: string
}

export default function AdminEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'admin-card flex flex-col items-center justify-center gap-3 px-5 py-10 text-center',
        className
      )}
    >
      {icon != null && (
        <div
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]"
        >
          {icon}
        </div>
      )}
      <div className="admin-section-title">{title}</div>
      {description != null && (
        <p className="max-w-[38ch] text-[13px] leading-6 text-[var(--admin-text-muted)]">
          {description}
        </p>
      )}
      {action != null && <div className="mt-1">{action}</div>}
    </div>
  )
}
