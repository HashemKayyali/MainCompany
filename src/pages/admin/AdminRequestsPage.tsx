import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Search } from 'lucide-react'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminKebabMenu, { type AdminKebabItem } from '../../components/admin/AdminKebabMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminBadge, { type AdminBadgeTone } from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminSkeleton from '../../components/admin/primitives/AdminSkeleton'
import { useToast } from '../../contexts/ToastContext'
import { approveRentalRequest, listAdminRequests, updateRequestStatus } from '../../services/admin-requests.service'
import type { AdminRequestListItem, RequestType } from '../../types/commerce'
import { formatRequestStatusLabel, formatRequestTypeLabel, getCommerceErrorMessage } from '../../utils/commerce'
import { cn } from '../../utils/cn'

type RequestFilter = 'all' | RequestType
type SortKey = 'newest' | 'oldest' | 'status' | 'total_desc' | 'total_asc'

const STATUS_OPTIONS = [
  'pending_review',
  'confirmed',
  'in_preparation',
  'completed',
  'contacted',
  'quoted',
  'won',
  'rejected',
  'cancelled',
  'lost',
]

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function statusTone(status: string): AdminBadgeTone {
  if (status === 'pending_review') return 'warning'
  if (status === 'confirmed' || status === 'completed' || status === 'won') return 'success'
  if (status === 'contacted' || status === 'quoted' || status === 'in_preparation') return 'accent'
  if (status === 'rejected' || status === 'cancelled' || status === 'lost') return 'danger'
  return 'neutral'
}

function typeTone(type: RequestType): AdminBadgeTone {
  return type === 'rental' ? 'accent' : 'neutral'
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function formatTotal(value: number | null) {
  return value == null ? 'Review pending' : `${value.toFixed(2)} JOD`
}

function requestPath(request: AdminRequestListItem) {
  return `/admin/requests/${request.type}/${request.id}`
}

function isQuickActionRequest(request: AdminRequestListItem) {
  return request.type === 'rental' && request.status === 'pending_review'
}

export default function AdminRequestsPage() {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [requests, setRequests] = useState<AdminRequestListItem[]>([])
  const [typeFilter, setTypeFilter] = useState<RequestFilter>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)
  const [workingRequestId, setWorkingRequestId] = useState<string | null>(null)
  const [rejectRequest, setRejectRequest] = useState<AdminRequestListItem | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setLoadError('')
      setRequests(await listAdminRequests())
    } catch (error) {
      const message = getCommerceErrorMessage(error, 'Could not load admin requests.')
      setLoadError(message)
      setRequests([])
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  useEffect(() => {
    setPage(1)
  }, [pageSize, search, sortKey, statusFilter, typeFilter])

  const statusOptions = useMemo(() => {
    const seen = new Set<string>(requests.map(request => request.status))
    return STATUS_OPTIONS.filter(status => seen.has(status) || ['pending_review', 'completed', 'rejected'].includes(status))
  }, [requests])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const next = requests.filter(request => {
      const matchesType = typeFilter === 'all' || request.type === typeFilter
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      const matchesQuery =
        !query ||
        request.requestNumber.toLowerCase().includes(query) ||
        request.customerName.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query)

      return matchesType && matchesStatus && matchesQuery
    })

    return [...next].sort((a, b) => {
      if (sortKey === 'oldest') return a.createdAt.localeCompare(b.createdAt)
      if (sortKey === 'status') return formatRequestStatusLabel(a.status).localeCompare(formatRequestStatusLabel(b.status))
      if (sortKey === 'total_desc') return (b.total ?? -1) - (a.total ?? -1)
      if (sortKey === 'total_asc') return (a.total ?? Number.MAX_SAFE_INTEGER) - (b.total ?? Number.MAX_SAFE_INTEGER)
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [requests, search, sortKey, statusFilter, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageStart = (currentPage - 1) * pageSize
  const pageItems = filtered.slice(pageStart, pageStart + pageSize)
  const showingStart = filtered.length ? pageStart + 1 : 0
  const showingEnd = Math.min(pageStart + pageSize, filtered.length)

  useEffect(() => {
    if (page > pageCount) setPage(pageCount)
  }, [page, pageCount])

  const quickApprove = async (request: AdminRequestListItem) => {
    setWorkingRequestId(request.id)
    try {
      await approveRentalRequest(request.id, 'Approved from requests list')
      toast(`Approved ${request.requestNumber}.`, 'success')
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not approve request.'), 'error')
    } finally {
      setWorkingRequestId(null)
    }
  }

  const confirmReject = async () => {
    if (!rejectRequest) return

    setWorkingRequestId(rejectRequest.id)
    try {
      await updateRequestStatus(rejectRequest.type, rejectRequest.id, 'rejected', 'Rejected from requests list')
      toast(`Rejected ${rejectRequest.requestNumber}.`, 'success')
      setRejectRequest(null)
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not reject request.'), 'error')
    } finally {
      setWorkingRequestId(null)
    }
  }

  const actionItems = (request: AdminRequestListItem): AdminKebabItem[] => [
    { label: 'View details', onSelect: () => navigate(requestPath(request)) },
    ...(isQuickActionRequest(request)
      ? [
          { label: 'Approve request', onSelect: () => void quickApprove(request) },
          { label: 'Reject request', tone: 'danger' as const, onSelect: () => setRejectRequest(request) },
        ]
      : []),
  ]

  const typeButtonClass = (active: boolean) =>
    cn(
      'inline-flex min-h-[44px] flex-1 items-center justify-center rounded-[var(--admin-radius-sm)] px-3 text-center text-[12px] font-bold transition sm:flex-none',
      active
        ? 'bg-[var(--admin-accent)] text-white shadow-[0_10px_24px_-16px_rgba(113,38,227,0.55)]'
        : 'bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)]'
    )

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Requests"
        actions={
          <AdminButton size="sm" variant="outline" onClick={() => void load()} loading={loading}>
            <RefreshCw className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Refresh
          </AdminButton>
        }
      />

      <div className="admin-card p-3 sm:p-4">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative min-w-0">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              className="admin-input ps-9"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search request, customer, or email..."
              aria-label="Search requests"
            />
          </div>

          <select className="admin-input" value={sortKey} onChange={event => setSortKey(event.target.value as SortKey)} aria-label="Sort requests">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="status">Status</option>
            <option value="total_desc">Total high to low</option>
            <option value="total_asc">Total low to high</option>
          </select>

          <select className="admin-input" value={pageSize} onChange={event => setPageSize(Number(event.target.value))} aria-label="Page size">
            {PAGE_SIZE_OPTIONS.map(value => (
              <option key={value} value={value}>
                {value} per page
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-1.5 sm:flex sm:flex-wrap">
          {(['all', 'rental', 'purchase_quote'] as RequestFilter[]).map(value => (
            <button key={value} type="button" onClick={() => setTypeFilter(value)} className={typeButtonClass(typeFilter === value)}>
              {value === 'all' ? 'All' : value === 'rental' ? 'Rental Requests' : 'Purchase Quotes'}
            </button>
          ))}
        </div>

        <div className="mt-3 flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={cn('admin-chip min-h-[44px] shrink-0 snap-start', statusFilter === 'all' && 'admin-chip--accent')}
          >
            All
          </button>
          {statusOptions.map(status => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={cn(
                'admin-chip min-h-[44px] shrink-0 snap-start',
                statusFilter === status && `admin-chip--${statusTone(status)}`
              )}
            >
              {formatRequestStatusLabel(status)}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="space-y-3">
            <div className="admin-card hidden p-3 md:block">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="grid grid-cols-[1.1fr_0.9fr_1.1fr_1.2fr_0.8fr_0.9fr_0.9fr_0.7fr] gap-3 border-b border-[var(--admin-border)] py-3 last:border-b-0">
                  {Array.from({ length: 8 }).map((__, cellIndex) => (
                    <AdminSkeleton key={cellIndex} className="h-4" />
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-2.5 md:hidden">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="admin-card p-3">
                  <AdminSkeleton lines={4} />
                </div>
              ))}
            </div>
          </div>
        ) : loadError ? (
          <AdminEmptyState
            title="Requests are not ready"
            description={loadError}
            action={
              <AdminButton size="sm" variant="outline" onClick={() => void load()}>
                Retry
              </AdminButton>
            }
          />
        ) : !filtered.length ? (
          <AdminEmptyState
            title="No requests found"
            description="Try a different search, type, status, or sort option."
          />
        ) : (
          <>
            <div className="hidden md:block">
              <div className="admin-table-wrap">
                <table className="min-w-[1040px] w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-2.5 text-start">Request</th>
                      <th className="px-3 py-2.5 text-start">Type</th>
                      <th className="px-3 py-2.5 text-start">Customer</th>
                      <th className="px-3 py-2.5 text-start">Contact</th>
                      <th className="px-3 py-2.5 text-start">Created</th>
                      <th className="px-3 py-2.5 text-start">Items</th>
                      <th className="px-3 py-2.5 text-start">Total</th>
                      <th className="px-3 py-2.5 text-start">Status</th>
                      <th className="px-3 py-2.5 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(request => (
                      <tr key={request.id} className="border-t border-[var(--admin-border)] align-middle">
                        <td className="px-3 py-2.5">
                          <div className="font-mono text-[12px] font-bold text-[var(--admin-text)]">{request.requestNumber}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone={typeTone(request.type)}>{formatRequestTypeLabel(request.type)}</AdminBadge>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="max-w-[180px] truncate text-[13px] font-bold text-[var(--admin-text)]">{request.customerName}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <a className="block max-w-[220px] truncate text-[12px] font-semibold text-[var(--admin-accent)] hover:underline" href={`mailto:${request.email}`}>
                            {request.email}
                          </a>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)]">{formatDate(request.createdAt)}</td>
                        <td className="px-3 py-2.5 text-[13px] font-semibold tabular-nums text-[var(--admin-text)]">{request.itemCount}</td>
                        <td className="px-3 py-2.5 text-[13px] font-semibold tabular-nums text-[var(--admin-text)]">{formatTotal(request.total)}</td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone={statusTone(request.status)}>{formatRequestStatusLabel(request.status)}</AdminBadge>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminButton size="sm" variant="outline" onClick={() => navigate(requestPath(request))}>
                              Details
                            </AdminButton>
                            {isQuickActionRequest(request) && (
                              <AdminKebabMenu items={actionItems(request)} label={`More actions for ${request.requestNumber}`} />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2.5 md:hidden">
              {pageItems.map(request => (
                <article key={request.id} className="admin-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-mono text-[12px] font-extrabold text-[var(--admin-accent)]">{request.requestNumber}</div>
                      <h2 className="mt-1 truncate text-[14px] font-bold text-[var(--admin-text)]">{request.customerName}</h2>
                      <p className="mt-0.5 truncate text-[11px] font-semibold text-[var(--admin-text-muted)]">{request.email}</p>
                    </div>
                    <AdminBadge tone={statusTone(request.status)}>{formatRequestStatusLabel(request.status)}</AdminBadge>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Type</div>
                      <div className="mt-1 text-[12px] font-bold text-[var(--admin-text)]">{formatRequestTypeLabel(request.type)}</div>
                    </div>
                    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Date</div>
                      <div className="mt-1 text-[12px] font-bold text-[var(--admin-text)]">{formatDate(request.createdAt)}</div>
                    </div>
                    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Items</div>
                      <div className="mt-1 text-[12px] font-bold text-[var(--admin-text)]">{request.itemCount}</div>
                    </div>
                    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
                      <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Total</div>
                      <div className="mt-1 text-[12px] font-bold text-[var(--admin-text)]">{formatTotal(request.total)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <AdminButton size="sm" variant="outline" onClick={() => navigate(requestPath(request))} className="flex-1">
                      Details
                    </AdminButton>
                    {isQuickActionRequest(request) && (
                      <AdminKebabMenu items={actionItems(request)} label={`More actions for ${request.requestNumber}`} />
                    )}
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-3 flex flex-col gap-2.5 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                Showing {showingStart}-{showingEnd} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <AdminButton size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>
                  Previous
                </AdminButton>
                <span className="min-w-[72px] text-center tabular-nums">
                  {currentPage} / {pageCount}
                </span>
                <AdminButton size="sm" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>
                  Next
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </div>

      <AdminConfirmDialog
        open={!!rejectRequest}
        title="Reject Request?"
        description={rejectRequest ? `This will permanently reject ${rejectRequest.requestNumber}.` : undefined}
        tone="danger"
        confirmLabel="Reject"
        loading={workingRequestId === rejectRequest?.id}
        onCancel={() => setRejectRequest(null)}
        onConfirm={() => void confirmReject()}
      />
    </div>
  )
}
