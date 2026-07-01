import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import type { AdminRequestListItem, CustomerRequestListItem } from '../../types/commerce'
import { formatRequestTypeLabel } from '../../utils/commerce'
import RequestStatusBadge from './RequestStatusBadge'
import { cn } from '../../utils/cn'

export default function RequestListCard({
  request,
  to,
  showCustomerEmail = false,
  actions,
}: {
  request: CustomerRequestListItem | AdminRequestListItem
  to: string
  showCustomerEmail?: boolean
  actions?: ReactNode
}) {
  const { isDark } = useTheme()

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[22px] border p-3.5 sm:p-4',
        isDark
          ? 'border-white/10 bg-[linear-gradient(145deg,rgba(10,13,28,0.92),rgba(7,10,21,0.96))] shadow-[0_24px_80px_-58px_rgba(8,16,38,0.92)]'
          : 'border-gray-200 bg-white shadow-[0_22px_48px_-36px_rgba(15,23,42,0.18)] hover:shadow-[0_26px_56px_-36px_rgba(15,23,42,0.22)]'
      )}
    >
      {isDark && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.10),transparent_34%)]" />
      )}

      <div className="relative flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={cn(
                'inline-flex min-h-[34px] items-center rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.15em] ring-1 ring-inset',
                  isDark
                    ? 'bg-white/[0.04] text-cyan-100/72 ring-cyan-400/10'
                    : 'bg-violet-50 text-violet-700 ring-violet-200'
                )}
              >
                {formatRequestTypeLabel(request.type)}
              </span>
              <span className={cn('text-[10px] font-mono uppercase tracking-[0.15em]', isDark ? 'text-purple-100/48' : 'text-gray-400')}>
                {request.requestNumber}
              </span>
            </div>

            <div className={cn('text-[1.08rem] font-semibold tracking-[-0.02em]', isDark ? 'text-white' : 'text-gray-900')}>
              {request.customerName}
            </div>

            {showCustomerEmail && 'email' in request ? (
              <div className={cn('text-sm', isDark ? 'text-purple-100/62' : 'text-gray-500')}>
                {request.email}
              </div>
            ) : null}
          </div>

          <RequestStatusBadge status={request.status} />
        </div>

        <div className={cn('grid gap-2.5 sm:grid-cols-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]', isDark ? 'text-purple-100/74' : 'text-gray-600')}>
          <div className={cn('rounded-[16px] px-3.5 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.14em]', isDark ? 'text-cyan-100/40' : 'text-gray-400')}>
              Created
            </div>
            <div className="mt-2 text-[0.95rem] font-medium">{new Date(request.createdAt).toLocaleDateString()}</div>
          </div>

          <div className={cn('rounded-[16px] px-3.5 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.14em]', isDark ? 'text-cyan-100/40' : 'text-gray-400')}>
              Services
            </div>
            <div className="mt-2 text-[0.95rem] font-medium">{request.itemCount}</div>
          </div>

          <div className={cn('rounded-[16px] px-3.5 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.14em]', isDark ? 'text-cyan-100/40' : 'text-gray-400')}>
              Total
            </div>
            <div className="mt-2 text-[0.95rem] font-medium">
              {request.total == null ? 'Review Pending' : `${request.total.toFixed(2)} JOD`}
            </div>
          </div>

          <div className="flex flex-col items-stretch gap-2 self-end min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:justify-end xl:justify-start">
            {actions}
            <Link to={to} className="btn-outline !w-full !rounded-[14px] !px-4 !py-2 !text-[11.5px] min-[420px]:!w-auto">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
