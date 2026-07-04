import { cn } from '../../../utils/cn'

export type AdminSkeletonProps = {
  /** Extra classes controlling size/shape of a single block (e.g. 'h-4 w-24'). */
  className?: string
  /** Render N stacked line blocks instead of a single block. */
  lines?: number
}

export default function AdminSkeleton({ className, lines }: AdminSkeletonProps) {
  if (lines && lines > 1) {
    return (
      <div aria-hidden="true" className="flex w-full flex-col gap-2">
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              'admin-skeleton h-3.5',
              index === lines - 1 ? 'w-2/3' : 'w-full',
              className
            )}
          />
        ))}
      </div>
    )
  }

  return <div aria-hidden="true" className={cn('admin-skeleton h-3.5 w-full', className)} />
}
