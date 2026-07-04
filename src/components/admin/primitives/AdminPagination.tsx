import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../../utils/cn'

export type AdminPaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  pageSizeOptions?: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  className?: string
}

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 40]

export default function AdminPagination({
  page,
  pageSize,
  totalItems,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  className,
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const start = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const end = Math.min(totalItems, safePage * pageSize)

  return (
    <div
      className={cn(
        'flex flex-col gap-2.5 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)] sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="text-start">
        Showing <span className="font-bold text-[var(--admin-text)]">{start}</span>
        {' - '}
        <span className="font-bold text-[var(--admin-text)]">{end}</span>
        {' of '}
        <span className="font-bold text-[var(--admin-text)]">{totalItems}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-h-[44px] items-center gap-2">
          <span>Rows</span>
          <select
            className="admin-input !min-h-[44px] !w-auto !py-2 !text-[12px]"
            value={pageSize}
            onChange={event => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Previous page"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} aria-hidden="true" />
          </button>
          <span className="min-w-[4.5rem] text-center tabular-nums text-[var(--admin-text)]">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            className="admin-icon-btn"
            aria-label="Next page"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
          >
            <ChevronRight className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}
