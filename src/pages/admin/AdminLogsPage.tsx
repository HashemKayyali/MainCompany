import { useEffect, useMemo, useState } from 'react'
import { Activity, Clock, Eye, RefreshCw, Search } from 'lucide-react'
import { getAllLogs, type AdminLog } from '../../services/logs.service'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminPagination from '../../components/admin/primitives/AdminPagination'
import AdminSkeleton from '../../components/admin/primitives/AdminSkeleton'
import UserAvatar from '../../components/ui/UserAvatar'
import { cn } from '../../utils/cn'

type SortKey = 'newest' | 'oldest' | 'action' | 'entity' | 'actor'

const PAGE_SIZE_OPTIONS = [10, 20, 40]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'action', label: 'Action' },
  { value: 'entity', label: 'Entity' },
  { value: 'actor', label: 'Actor' },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatDateTime(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatEntity(type: string) {
  if (!type) return 'Unknown'
  return type.charAt(0).toUpperCase() + type.slice(1)
}

function actionChipClass(action: AdminLog['action']) {
  if (action === 'create') return 'admin-chip admin-chip--success'
  if (action === 'update') return 'admin-chip admin-chip--warning'
  return 'admin-chip admin-chip--danger'
}

function sortLogs(logs: AdminLog[], sortBy: SortKey) {
  const list = [...logs]
  switch (sortBy) {
    case 'oldest':
      return list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    case 'action':
      return list.sort((a, b) => a.action.localeCompare(b.action) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'entity':
      return list.sort((a, b) => a.entity_type.localeCompare(b.entity_type) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'actor':
      return list.sort((a, b) => (a.admin_name || a.admin_email || '').localeCompare(b.admin_name || b.admin_email || ''))
    case 'newest':
    default:
      return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

const controlButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3.5 text-[13px] font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [details, setDetails] = useState<AdminLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const loadLogs = async () => {
    setLoading(true)
    const data = await getAllLogs()
    setLogs(data)
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const data = await getAllLogs()
      if (mounted) {
        setLogs(data)
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filtered = useMemo(() => {
    let result = logs
    if (filterAction !== 'all') result = result.filter(log => log.action === filterAction)
    if (filterEntity !== 'all') result = result.filter(log => log.entity_type === filterEntity)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        log =>
          log.admin_name?.toLowerCase().includes(q) ||
          log.admin_email?.toLowerCase().includes(q) ||
          log.entity_name?.toLowerCase().includes(q) ||
          log.entity_id?.toLowerCase().includes(q) ||
          log.details?.toLowerCase().includes(q)
      )
    }
    return sortLogs(result, sortBy)
  }, [logs, filterAction, filterEntity, searchQuery, sortBy])

  const entityTypes = useMemo(() => {
    const set = new Set(logs.map(log => log.entity_type).filter(Boolean))
    return Array.from(set).sort()
  }, [logs])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedLogs = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize, totalPages])

  useEffect(() => {
    setPage(1)
  }, [filterAction, filterEntity, searchQuery, sortBy, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const stats = useMemo(
    () => ({
      visible: filtered.length,
      all: logs.length,
      updates: logs.filter(log => log.action === 'update').length,
      deletes: logs.filter(log => log.action === 'delete').length,
    }),
    [filtered.length, logs]
  )

  const renderActions = (log: AdminLog) => (
    <button
      type="button"
      onClick={() => setDetails(log)}
      aria-label={`View details for log ${log.id}`}
      className="inline-flex items-center gap-1.5 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent-soft)]"
    >
      <Eye className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden="true" />
      Details
    </button>
  )

  return (
    <div className="admin-scope flex h-full min-h-0 flex-col gap-4 pb-[calc(var(--admin-bottombar-h)+0.75rem)] md:pb-0">
      <AdminPageHeader
        title="Activity Logs"
        actions={
          <button type="button" onClick={() => void loadLogs()} className={controlButtonClass} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} strokeWidth={2.1} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Visible Logs" value={stats.visible} />
        <AdminStatCard label="All Logs" value={stats.all} />
        <AdminStatCard label="Updates" value={stats.updates} />
        <AdminStatCard label="Deletes" value={stats.deletes} />
      </div>

      <section className="admin-card flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_160px_180px_160px]">
          <label className="relative block min-w-0">
            <span className="sr-only">Search logs</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              placeholder="Search actor, entity, ID, or details"
              value={searchQuery}
              onChange={event => setSearchQuery(event.target.value)}
              className="admin-input ps-10"
            />
          </label>

          <label className="sr-only" htmlFor="logs-action-filter">
            Filter by action
          </label>
          <select
            id="logs-action-filter"
            value={filterAction}
            onChange={event => setFilterAction(event.target.value)}
            className="admin-input"
          >
            <option value="all">All actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>

          <label className="sr-only" htmlFor="logs-entity-filter">
            Filter by entity
          </label>
          <select
            id="logs-entity-filter"
            value={filterEntity}
            onChange={event => setFilterEntity(event.target.value)}
            className="admin-input"
          >
            <option value="all">All entities</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {formatEntity(type)}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="logs-sort">
            Sort logs
          </label>
          <select
            id="logs-sort"
            value={sortBy}
            onChange={event => setSortBy(event.target.value as SortKey)}
            className="admin-input"
          >
            {SORT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="hidden md:block">
              <div className="admin-table-wrap">
                <div className="grid min-w-[920px] grid-cols-[1fr_1fr_1.1fr_1.25fr_0.8fr_64px] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-3">
                  {Array.from({ length: 6 }, (_, index) => (
                    <AdminSkeleton key={index} className="h-4" />
                  ))}
                </div>
                {Array.from({ length: 6 }, (_, rowIndex) => (
                  <div key={rowIndex} className="grid min-w-[920px] grid-cols-[1fr_1fr_1.1fr_1.25fr_0.8fr_64px] gap-3 border-b border-[var(--admin-border)] px-3 py-3 last:border-b-0">
                    {Array.from({ length: 6 }, (_, cellIndex) => (
                      <AdminSkeleton key={cellIndex} className="h-4" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-3 md:hidden">
              {Array.from({ length: 4 }, (_, index) => (
                <div key={index} className="admin-card p-3">
                  <AdminSkeleton lines={4} />
                </div>
              ))}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <AdminEmptyState
            icon={<Activity className="h-5 w-5" strokeWidth={2} aria-hidden="true" />}
            title={logs.length === 0 ? 'No logs found' : 'No logs match the current filters'}
            description="Admin activity appears here when create, update, or delete events are recorded."
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 md:block">
              <div className="admin-table-wrap h-full">
                <table className="w-full min-w-[920px] text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3 text-start">Event</th>
                      <th className="px-3 py-3 text-start">Entity</th>
                      <th className="px-3 py-3 text-start">Actor</th>
                      <th className="px-3 py-3 text-start">Details</th>
                      <th className="px-3 py-3 text-start">When</th>
                      <th className="px-3 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLogs.map(log => (
                      <tr key={log.id} className="border-t border-[var(--admin-border)] align-middle hover:bg-[var(--admin-surface-2)]">
                        <td className="px-3 py-2.5">
                          <span className={actionChipClass(log.action)}>{log.action}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">
                              {log.entity_name || log.entity_id}
                            </div>
                            <div className="mt-0.5">
                              <span className="admin-chip !py-0.5 !text-[10px]">{formatEntity(log.entity_type)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <UserAvatar
                              name={log.admin_name}
                              email={log.admin_email}
                              className="h-9 w-9 rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent)] text-[12px] font-bold text-white"
                            />
                            <div className="min-w-0">
                              <div className="truncate text-[12px] font-bold text-[var(--admin-text)]">
                                {log.admin_name || 'Unknown admin'}
                              </div>
                              <div className="truncate text-[11px] text-[var(--admin-text-muted)]">{log.admin_email || 'Unknown email'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <p className="line-clamp-2 max-w-[280px] text-[12px] font-semibold leading-5 text-[var(--admin-text-muted)]">
                            {log.details || 'No additional details.'}
                          </p>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)]">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
                            {timeAgo(log.created_at)}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end">{renderActions(log)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              {pagedLogs.map(log => (
                <article key={log.id} className="admin-card p-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      name={log.admin_name}
                      email={log.admin_email}
                      className="h-11 w-11 rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent)] text-[14px] font-bold text-white"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2">
                        <span className={actionChipClass(log.action)}>{log.action}</span>
                        <span className="admin-chip">{formatEntity(log.entity_type)}</span>
                      </div>
                      <h2 className="mt-2 truncate text-[14px] font-black text-[var(--admin-text)]">
                        {log.entity_name || log.entity_id}
                      </h2>
                      <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--admin-text-muted)]">
                        {log.admin_name || log.admin_email || 'Unknown admin'}
                      </p>
                    </div>
                    {renderActions(log)}
                  </div>
                  <p className="mt-3 line-clamp-2 text-[12px] leading-5 text-[var(--admin-text-muted)]">
                    {log.details || 'No additional details.'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="admin-chip">{timeAgo(log.created_at)}</span>
                  </div>
                </article>
              ))}
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              totalItems={filtered.length}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </section>

      <AdminDetailModal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.entity_name || details?.entity_id || 'Log Details'}
        subtitle={details ? 'Full metadata for the selected admin activity event.' : undefined}
        badges={
          details ? (
            <>
              <span className={actionChipClass(details.action)}>{details.action}</span>
              <span className="admin-chip admin-chip--accent">{formatEntity(details.entity_type)}</span>
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Entity', value: details.entity_name || details.entity_id },
                { label: 'Actor', value: details.admin_name || 'Unknown' },
                { label: 'Email', value: details.admin_email || 'Unknown' },
                { label: 'When', value: formatDateTime(details.created_at) },
              ]
            : []
        }
        sections={
          details
            ? [
                {
                  title: 'Event',
                  facts: [
                    { label: 'Action', value: details.action },
                    { label: 'Entity type', value: formatEntity(details.entity_type) },
                    { label: 'Entity id', value: details.entity_id },
                  ],
                },
                {
                  title: 'Details',
                  content: (
                    <p className="text-[13px] leading-6 text-[var(--admin-text-muted)]">
                      {details.details || 'No additional log details were stored for this entry.'}
                    </p>
                  ),
                },
              ]
            : []
        }
      />
    </div>
  )
}
