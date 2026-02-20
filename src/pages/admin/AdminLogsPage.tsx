import { useEffect, useState, useMemo } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { getAllLogs, type AdminLog } from '../../services/logs.service'

const ACTION_COLORS: Record<string, { dark: string; light: string; emoji: string }> = {
  create: { dark: 'bg-green-400/15 text-green-300 border-green-400/20', light: 'bg-green-50 text-green-700 border-green-200', emoji: '➕' },
  update: { dark: 'bg-amber-400/15 text-amber-300 border-amber-400/20', light: 'bg-amber-50 text-amber-700 border-amber-200', emoji: '✏️' },
  delete: { dark: 'bg-red-400/15 text-red-300 border-red-400/20', light: 'bg-red-50 text-red-700 border-red-200', emoji: '🗑️' },
}

const ENTITY_EMOJI: Record<string, string> = {
  product: '🚲',
  part: '🔧',
  customer: '👥',
  category: '📂',
  gallery: '📸',
  admin: '🔐',
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
  const [loading, setLoading] = useState(true)
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterEntity, setFilterEntity] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardBg = isDark ? 'bg-purple-500/[0.07] border-purple-500/20' : 'bg-white border-gray-200'

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
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    let result = logs
    if (filterAction !== 'all') result = result.filter(l => l.action === filterAction)
    if (filterEntity !== 'all') result = result.filter(l => l.entity_type === filterEntity)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(l =>
        l.admin_name?.toLowerCase().includes(q) ||
        l.admin_email?.toLowerCase().includes(q) ||
        l.entity_name?.toLowerCase().includes(q) ||
        l.details?.toLowerCase().includes(q)
      )
    }
    return result
  }, [logs, filterAction, filterEntity, searchQuery])

  const entityTypes = useMemo(() => {
    const set = new Set(logs.map(l => l.entity_type))
    return Array.from(set).sort()
  }, [logs])

  const selectCls = [
    'px-3 py-2 rounded-xl text-[12px] font-medium border outline-none transition',
    isDark
      ? 'bg-void-950/40 border-purple-500/20 text-purple-100 focus:border-purple-500/40'
      : 'bg-white border-gray-200 text-gray-700 focus:border-violet-300',
  ].join(' ')

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
        <div>
          <h1 className={`font-display text-2xl font-bold ${txt}`}>📋 Activity Logs</h1>
          <p className={`text-sm ${sub}`}>
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            {logs.length !== filtered.length ? ` (of ${logs.length} total)` : ''}
          </p>
        </div>

        <button
          onClick={async () => {
            setLoading(true)
            const data = await getAllLogs()
            setLogs(data)
            setLoading(false)
          }}
          className={[
            'px-4 py-2 rounded-xl text-[12px] font-medium border transition',
            isDark
              ? 'border-cyan-400/25 bg-cyan-400/10 hover:bg-cyan-400/15 text-cyan-300'
              : 'border-cyan-200 bg-cyan-50 hover:bg-cyan-100 text-cyan-700',
          ].join(' ')}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className={`rounded-2xl p-4 mb-6 border ${cardBg}`}>
        <div className="flex flex-wrap gap-3">
          <input
            placeholder="Search logs…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={[
              'flex-1 min-w-[200px] px-3 py-2 rounded-xl text-[12px] border outline-none transition',
              isDark
                ? 'bg-void-950/40 border-purple-500/20 text-purple-50 placeholder:text-purple-200/30 focus:border-purple-500/40'
                : 'bg-white border-gray-200 text-gray-800 placeholder:text-gray-400 focus:border-violet-300',
            ].join(' ')}
          />

          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className={selectCls}>
            <option value="all">All Actions</option>
            <option value="create">➕ Create</option>
            <option value="update">✏️ Update</option>
            <option value="delete">🗑️ Delete</option>
          </select>

          <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)} className={selectCls}>
            <option value="all">All Types</option>
            {entityTypes.map(t => (
              <option key={t} value={t}>
                {ENTITY_EMOJI[t] || '📦'} {t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Logs List */}
      {loading ? (
        <div className={`text-center py-16 ${sub}`}>
          <div className="text-3xl mb-3 animate-pulse">📋</div>
          <p className="text-sm">Loading logs…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className={`text-center py-16 ${sub}`}>
          <div className="text-3xl mb-3">📭</div>
          <p className="text-sm">No logs found</p>
          <p className="text-xs mt-1">Actions will appear here when admins create, edit, or delete items.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(log => {
            const ac = ACTION_COLORS[log.action] || ACTION_COLORS.create
            const acCls = isDark ? ac.dark : ac.light

            return (
              <div
                key={log.id}
                className={`rounded-2xl p-4 border transition hover:-translate-y-[1px] ${cardBg}`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-display shrink-0 ${
                      isDark
                        ? 'bg-gradient-to-br from-prism-violet to-prism-cyan text-void-950'
                        : 'bg-gradient-to-br from-violet-400 to-cyan-400 text-white'
                    }`}
                  >
                    {(log.admin_name || '?').charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2">
                      <span className={`font-medium text-sm ${txt}`}>{log.admin_name || 'Unknown'}</span>

                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${acCls}`}>
                        {ac.emoji} {log.action}
                      </span>

                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border ${
                        isDark ? 'bg-purple-500/10 text-purple-200/70 border-purple-500/20' : 'bg-gray-50 text-gray-500 border-gray-200'
                      }`}>
                        {ENTITY_EMOJI[log.entity_type] || '📦'} {log.entity_type}
                      </span>
                    </div>

                    <p className={`text-xs mt-1 ${sub}`}>
                      {log.action === 'create' && `Created ${log.entity_type}: `}
                      {log.action === 'update' && `Updated ${log.entity_type}: `}
                      {log.action === 'delete' && `Deleted ${log.entity_type}: `}
                      <span className={txt}>{log.entity_name || log.entity_id}</span>
                    </p>

                    {log.details && (
                      <p className={`text-[11px] mt-1 ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>
                        {log.details}
                      </p>
                    )}

                    <div className={`flex items-center gap-3 mt-2 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>
                      <span>{log.admin_email}</span>
                      <span>•</span>
                      <span title={new Date(log.created_at).toLocaleString()}>{timeAgo(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}