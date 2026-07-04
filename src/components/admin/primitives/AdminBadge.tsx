import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../../utils/cn'

export type AdminBadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger'

export type AdminBadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: AdminBadgeTone
  children?: ReactNode
}

const TONE_CLASSES: Record<AdminBadgeTone, string | null> = {
  neutral: null,
  accent: 'admin-chip--accent',
  success: 'admin-chip--success',
  warning: 'admin-chip--warning',
  danger: 'admin-chip--danger',
}

export default function AdminBadge({ tone = 'neutral', className, children, ...props }: AdminBadgeProps) {
  return (
    <span dir="auto" className={cn('admin-chip', TONE_CLASSES[tone], className)} {...props}>
      {children}
    </span>
  )
}
