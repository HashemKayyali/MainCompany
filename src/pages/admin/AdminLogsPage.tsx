import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { getAllLogs, type AdminLog } from '../../services/logs.service'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import UserAvatar from '../../components/ui/UserAvatar'
import { cn } from '../../utils/cn'

const ACTION_COLORS: Record<string, { dark: string; light: string; emoji: string }> = {
  create: { dark: 'bg-emerald-400/10 text-emerald-200 ring-emerald-400/18', light: 'bg-emerald-50 text-emerald-700 ring-emerald-200', emoji: '+' },
  update: { dark: 'bg-amber-400/10 text-amber-200 ring-amber-400/18', light: 'bg-amber-50 text-amber-700 ring-amber-200', emoji: '↺' },
  delete: { dark: 'bg-red-400/10 text-red-200 ring-red-400/18', light: 'bg-red-50 text-red-700 ring-red-200', emoji: '×' },
}

const ENTITY_EMOJI: Record<string, string> = {
  product: '🚲',
  part: '🛠️',
  customer: '🤝',
  category: '🧩',
  gallery: '📸',
  admin: '🛡️',
}

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

export default function AdminLogsPage() {
  const { isDark } = useTheme()
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [details, setDetails] = useState<AdminLog | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardsLayoutClass = 'flex flex-col gap-3'

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
          log.details?.toLowerCase().includes(q)
      )
    }
    return result
  }, [logs, filterAction, filterEntity, searchQuery])

  const entityTypes = useMemo(() => {
    const set = new Set(logs.map(log => log.entity_type))
    return Array.from(set).sort()
  }, [logs])

  const selectCls = cn(
    'min-h-[44px] rounded-[16px] px-4 py-2.5 text-[13px] font-medium outline-none transition sm:text-[13.5px]',
    isDark
      ? 'bg-[#0d1430]/90 text-purple-100 ring-1 ring-inset ring-cyan-400/10 focus:ring-cyan-300/20'
      : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200 focus:ring-violet-300'
  )

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <AdminPageHeader
        title="Activity Logs"
        actions={
          <button
            onClick={async () => {
              setLoading(true)
              const data = await getAllLogs()
              setLogs(data)
              setLoading(false)
            }}
            className={cn(
              'inline-flex min-h-[44px] items-center rounded-[14px] px-4.5 py-2.5 text-[13px] font-semibold transition active:translate-y-[1px] sm:text-[13.5px]',
              isDark
                ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.3)] hover:brightness-110'
                : 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200 shadow-[0_10px_24px_-18px_rgba(34,211,238,0.2)] hover:bg-cyan-100'
            )}
          >
            Refresh
          </button>
        }
      />

      <div className="grid shrink-0 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Visible Logs" value={filtered.length} />
        <AdminStatCard label="All Logs" value={logs.length} />
        <AdminStatCard label="Updates" value={logs.filter(log => log.action === 'update').length} />
        <AdminStatCard label="Deletes" value={logs.filter(log => log.action === 'delete').length} />
      </div>

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[26px] p-3.5 sm:p-4',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            placeholder="Search logs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={cn(
              'form-field !mb-0 !min-w-0 !w-full',
              isDark ? 'placeholder:!text-purple-200/30' : ''
            )}
          />

          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className={selectCls}>
            <option value="all">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>

          <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className={selectCls}>
            <option value="all">All Types</option>
            {entityTypes.map(type => (
              <option key={type} value={type}>
                {ENTITY_EMOJI[type] || '•'} {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={`flex flex-1 flex-col items-center justify-center py-16 text-center ${sub}`}>
            <div className="mb-3 text-3xl">📋</div>
            <p className="text-[0.96rem]">Loading logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={`flex flex-1 flex-col items-center justify-center py-16 text-center ${sub}`}>
            <div className="mb-3 text-3xl">📭</div>
            <p className="text-[0.96rem]">No logs found</p>
            <p className="mt-1 text-[13px] leading-6">Actions will appear here when admins create, edit, or delete items.</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cardsLayoutClass}>
              {filtered.map(log => {
              const tone = ACTION_COLORS[log.action] || ACTION_COLORS.create
              const badgeTone = isDark ? tone.dark : tone.light
              return (
                <AdminEntityCard
                  key={log.id}
                  variant="list"
                  className="!rounded-[20px]"
                  bodyClassName="!gap-2 !p-3"
                  minHeightClassName="min-h-[102px]"
                  listMediaWrapClassName="md:self-center"
                  listMediaFrameClassName="!h-[70px] !w-[84px] md:!h-[70px] md:!w-[84px] !rounded-[16px] !p-1.5"
                  factsWrapClassName="xl:w-[164px]"
                  actionsWrapClassName="xl:w-[104px]"
                  media={
                    <div className={cn('flex aspect-[4/3] items-center justify-center', isDark ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.10),transparent_58%)]' : 'bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_55%)]')}>
                      <UserAvatar
                        name={log.admin_name}
                        email={log.admin_email}
                        className="h-full w-full rounded-[18px]"
                        fallbackClassName={cn(
                          'text-[1.75rem] font-display font-bold',
                          isDark
                            ? 'bg-gradient-to-br from-prism-violet to-prism-cyan text-void-950'
                            : 'bg-gradient-to-br from-violet-400 to-cyan-400 text-white'
                        )}
                      />
                    </div>
                  }
                  mediaOverlayLeft={
                    <span className={cn('rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] ring-1 ring-inset', badgeTone)}>
                      {tone.emoji} {log.action}
                    </span>
                  }
                  mediaOverlayRight={
                    <span className={cn('rounded-full px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] ring-1 ring-inset', isDark ? 'bg-black/35 text-cyan-100/70 ring-cyan-400/10' : 'bg-white/90 text-gray-600 ring-gray-200')}>
                      {ENTITY_EMOJI[log.entity_type] || '•'} {log.entity_type}
                    </span>
                  }
                  title={log.entity_name || log.entity_id}
                  subtitle={log.details || `${log.action} recorded for ${log.entity_type}.`}
                  badges={
                    <>
                      <span className={cn('rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset', isDark ? 'bg-[#0f1630]/92 text-purple-100/78 ring-cyan-400/10' : 'border-gray-200 bg-white text-gray-700')}>
                        {log.admin_name || 'Unknown admin'}
                      </span>
                      <span className={cn('rounded-full px-3 py-1 text-[11px] font-medium ring-1 ring-inset', isDark ? 'bg-cyan-400/10 text-cyan-200 ring-cyan-400/18' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                        {timeAgo(log.created_at)}
                      </span>
                    </>
                  }
                  facts={[
                    { label: 'Actor', value: log.admin_email || 'Unknown' },
                    { label: 'When', value: timeAgo(log.created_at) },
                  ]}
                  actions={
                    <AdminActionButton
                      tone="primary"
                      onClick={event => {
                        event.stopPropagation()
                        setDetails(log)
                      }}
                    >
                      Details
                    </AdminActionButton>
                  }
                />
              )
            })}
            </div>
          </div>
        )}
      </div>

      <AdminDetailModal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.entity_name || details?.entity_id || 'Log Details'}
        subtitle={details ? 'This panel surfaces the full metadata for the selected admin activity event.' : undefined}
        badges={
          details ? (
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', isDark ? (ACTION_COLORS[details.action] || ACTION_COLORS.create).dark : (ACTION_COLORS[details.action] || ACTION_COLORS.create).light)}>
                {details.action}
              </span>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', isDark ? 'border-white/10 bg-white/[0.04] text-purple-100/80' : 'border-gray-200 bg-white text-gray-700')}>
                {details.entity_type}
              </span>
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Entity', value: details.entity_name || details.entity_id },
                { label: 'Actor', value: details.admin_name || 'Unknown' },
                { label: 'Email', value: details.admin_email || 'Unknown' },
                { label: 'When', value: new Date(details.created_at).toLocaleString() },
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
                    { label: 'Entity type', value: details.entity_type },
                    { label: 'Entity id', value: details.entity_id },
                  ],
                },
                {
                  title: 'Details',
                  content: (
                    <p className={cn('text-sm leading-6', isDark ? 'text-purple-100/80' : 'text-gray-700')}>
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
