import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, KeyRound, Mail, Pencil, RefreshCw, Search, Shield, Users } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth, type AdminRole } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { useDialog } from '../../contexts/DialogContext'
import Modal from '../../components/ui/Modal'
import UserAvatar from '../../components/ui/UserAvatar'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminKebabMenu from '../../components/admin/AdminKebabMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminField from '../../components/admin/primitives/AdminField'
import AdminPagination from '../../components/admin/primitives/AdminPagination'
import AdminSkeleton from '../../components/admin/primitives/AdminSkeleton'
import AdminBadge, { type AdminBadgeTone } from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import { emitProfileUpdated } from '../../lib/profile-sync'
import { listAdminRequests } from '../../services/admin-requests.service'
import type { AdminRequestListItem, RequestType } from '../../types/commerce'
import { formatRequestStatusLabel, formatRequestTypeLabel, getCommerceErrorMessage } from '../../utils/commerce'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

interface UserProfile {
  id: string
  email: string
  name: string
  phone: string
  role: string
  created_at: string
}

type SortKey = 'role' | 'name' | 'email' | 'newest' | 'oldest'
type RoleFilter = 'all' | 'superadmin' | 'admin' | 'user'
type RequestSortKey = 'newest' | 'oldest' | 'status' | 'type' | 'total_desc' | 'total_asc'

const ROLE_ORDER: Record<string, number> = { superadmin: 0, admin: 1, user: 2 }
const PAGE_SIZE_OPTIONS = [10, 20, 40]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'role', label: 'Role' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'email', label: 'Email A-Z' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: 'superadmin', label: 'Super admins' },
  { value: 'admin', label: 'Admins' },
  { value: 'user', label: 'Users' },
]

const REQUEST_SORT_OPTIONS: { value: RequestSortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'status', label: 'Status' },
  { value: 'type', label: 'Type' },
  { value: 'total_desc', label: 'Total high to low' },
  { value: 'total_asc', label: 'Total low to high' },
]

function sortUsers(users: UserProfile[], key: SortKey): UserProfile[] {
  const arr = [...users]
  switch (key) {
    case 'role':
      return arr.sort((a, b) => (ROLE_ORDER[a.role] ?? 3) - (ROLE_ORDER[b.role] ?? 3))
    case 'name':
      return arr.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'email':
      return arr.sort((a, b) => a.email.localeCompare(b.email))
    case 'newest':
      return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    case 'oldest':
      return arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    default:
      return arr
  }
}

function formatDate(value: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
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

function roleLabel(role: string) {
  if (role === 'superadmin') return 'Super Admin'
  if (role === 'admin') return 'Admin'
  return 'User'
}

function roleChipClass(role: string) {
  if (role === 'superadmin') return 'admin-chip admin-chip--warning'
  if (role === 'admin') return 'admin-chip admin-chip--accent'
  return 'admin-chip'
}

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

function formatTotal(value: number | null) {
  return value == null ? 'Review pending' : `${value.toFixed(2)} JOD`
}

function requestPath(request: AdminRequestListItem) {
  return `/admin/requests/${request.type}/${request.id}`
}

function avatarClass(role: string) {
  if (role === 'superadmin') return 'bg-[var(--admin-warning)] text-white'
  if (role === 'admin') return 'bg-[var(--admin-accent)] text-white'
  return 'bg-[var(--admin-surface-2)] text-[var(--admin-text-muted)]'
}

const controlButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3.5 text-[13px] font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

const primaryButtonClass =
  'inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent)] px-4 text-[13px] font-bold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

type UserRequestsSectionProps = {
  requests: AdminRequestListItem[]
  loading: boolean
  error: string
  onRetry: () => void
  onOpen: (request: AdminRequestListItem) => void
}

function UserRequestsSection({ requests, loading, error, onRetry, onOpen }: UserRequestsSectionProps) {
  const [requestSearch, setRequestSearch] = useState('')
  const [requestSort, setRequestSort] = useState<RequestSortKey>('newest')

  const filteredRequests = useMemo(() => {
    const query = requestSearch.trim().toLowerCase()
    const next = requests.filter(request => {
      if (!query) return true
      return (
        request.requestNumber.toLowerCase().includes(query) ||
        request.customerName.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query) ||
        formatRequestStatusLabel(request.status).toLowerCase().includes(query) ||
        formatRequestTypeLabel(request.type).toLowerCase().includes(query)
      )
    })

    return [...next].sort((a, b) => {
      if (requestSort === 'oldest') return a.createdAt.localeCompare(b.createdAt)
      if (requestSort === 'status') return formatRequestStatusLabel(a.status).localeCompare(formatRequestStatusLabel(b.status))
      if (requestSort === 'type') return formatRequestTypeLabel(a.type).localeCompare(formatRequestTypeLabel(b.type))
      if (requestSort === 'total_desc') return (b.total ?? -1) - (a.total ?? -1)
      if (requestSort === 'total_asc') return (a.total ?? Number.MAX_SAFE_INTEGER) - (b.total ?? Number.MAX_SAFE_INTEGER)
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [requestSearch, requestSort, requests])

  const controls = (
    <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_210px]">
      <label className="relative block min-w-0">
        <span className="sr-only">Search user requests</span>
        <Search
          className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
          strokeWidth={2}
          aria-hidden="true"
        />
        <input
          className="admin-input ps-10"
          placeholder="Search request number, status, or type"
          value={requestSearch}
          onChange={event => setRequestSearch(event.target.value)}
          disabled={loading}
        />
      </label>

      <label className="sr-only" htmlFor="user-request-sort">
        Sort user requests
      </label>
      <select
        id="user-request-sort"
        className="admin-input"
        value={requestSort}
        onChange={event => setRequestSort(event.target.value as RequestSortKey)}
        disabled={loading}
      >
        {REQUEST_SORT_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-3">
        {controls}
        <div className="admin-table-wrap">
          <div className="grid min-w-[780px] grid-cols-[1.1fr_1fr_0.9fr_0.7fr_0.9fr_150px] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-3">
            {Array.from({ length: 6 }, (_, index) => (
              <AdminSkeleton key={index} className="h-4" />
            ))}
          </div>
          {Array.from({ length: 3 }, (_, rowIndex) => (
            <div key={rowIndex} className="grid min-w-[780px] grid-cols-[1.1fr_1fr_0.9fr_0.7fr_0.9fr_150px] gap-3 border-b border-[var(--admin-border)] px-3 py-3 last:border-b-0">
              {Array.from({ length: 6 }, (_, cellIndex) => (
                <AdminSkeleton key={cellIndex} className="h-4" />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[var(--admin-radius-sm)] border border-[color-mix(in_srgb,var(--admin-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-danger)_8%,transparent)] p-3">
        <p className="text-[12px] font-semibold leading-5 text-[var(--admin-danger)]">{error}</p>
        <AdminButton size="sm" variant="outline" onClick={onRetry} className="mt-3">
          Try again
        </AdminButton>
      </div>
    )
  }

  if (requests.length === 0) {
    return (
      <div className="space-y-3">
        {controls}
        <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3 text-[12px] font-semibold leading-5 text-[var(--admin-text-muted)]">
          No requests are linked to this user email yet.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {controls}

      {filteredRequests.length === 0 ? (
        <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3 text-[12px] font-semibold leading-5 text-[var(--admin-text-muted)]">
          No requests match the current search.
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="w-full min-w-[780px] text-start">
            <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                <th className="px-3 py-3 text-start">Request</th>
                <th className="px-3 py-3 text-start">Type</th>
                <th className="px-3 py-3 text-start">Status</th>
                <th className="px-3 py-3 text-start">Items</th>
                <th className="px-3 py-3 text-start">Total</th>
                <th className="px-3 py-3 text-start">Created</th>
                <th className="px-3 py-3 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(request => (
                <tr key={`${request.type}-${request.id}`} className="border-t border-[var(--admin-border)] align-middle hover:bg-[var(--admin-surface-2)]">
                  <td className="px-3 py-2.5">
                    <div className="max-w-[220px] truncate text-[13px] font-black text-[var(--admin-text)]">{request.requestNumber}</div>
                    <div className="mt-0.5 truncate text-[11px] font-semibold text-[var(--admin-text-muted)]">{request.customerName || 'No customer name'}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <AdminBadge tone={typeTone(request.type)}>{formatRequestTypeLabel(request.type)}</AdminBadge>
                  </td>
                  <td className="px-3 py-2.5">
                    <AdminBadge tone={statusTone(request.status)}>{formatRequestStatusLabel(request.status)}</AdminBadge>
                  </td>
                  <td className="px-3 py-2.5 text-[12px] font-bold text-[var(--admin-text)]">{request.itemCount}</td>
                  <td className="px-3 py-2.5 text-[12px] font-bold text-[var(--admin-text)]">{formatTotal(request.total)}</td>
                  <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)]">{formatDate(request.createdAt)}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex justify-end">
                      <AdminButton size="sm" variant="outline" onClick={() => onOpen(request)}>
                        <Eye className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                        Request details
                      </AdminButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="text-[11px] font-bold text-[var(--admin-text-muted)]">
        Showing {filteredRequests.length} of {requests.length} requests
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const { user: currentUser, isSuperAdmin, changeAdminRole } = useAuth()
  const { toast } = useToast()
  const dialog = useDialog()
  const navigate = useNavigate()

  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<AdminRequestListItem[]>([])
  const [requestsLoading, setRequestsLoading] = useState(false)
  const [requestsLoaded, setRequestsLoaded] = useState(false)
  const [requestsError, setRequestsError] = useState('')
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('role')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [details, setDetails] = useState<UserProfile | null>(null)

  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_users')
      if (error) throw error
      const baseUsers: UserProfile[] = (data ?? []).map(u => ({
        id: u.id,
        email: u.email || '',
        name: u.name || '',
        phone: u.phone || '',
        role: u.role || 'user',
        created_at: u.created_at || '',
      }))
      setUsers(baseUsers)
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const loadRequests = useCallback(async () => {
    setRequestsLoading(true)
    try {
      setRequestsError('')
      setRequests(await listAdminRequests())
      setRequestsLoaded(true)
    } catch (error) {
      const message = getCommerceErrorMessage(error, 'Could not load request activity.')
      setRequestsError(message)
      setRequests([])
      setRequestsLoaded(true)
    } finally {
      setRequestsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRequests()
  }, [loadRequests])

  useEffect(() => {
    if (!details || requestsLoaded || requestsLoading) return
    void loadRequests()
  }, [details, loadRequests, requestsLoaded, requestsLoading])

  const displayed = useMemo(() => {
    let list = users
    if (roleFilter !== 'all') list = list.filter(user => user.role === roleFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        user =>
          user.name.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          user.phone.includes(q)
      )
    }
    return sortUsers(list, sortBy)
  }, [users, search, roleFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(displayed.length / pageSize))
  const pagedUsers = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    return displayed.slice(start, start + pageSize)
  }, [displayed, page, pageSize, totalPages])

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, sortBy, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const stats = useMemo(
    () => ({
      total: users.length,
      superadmins: users.filter(user => user.role === 'superadmin').length,
      admins: users.filter(user => user.role === 'admin').length,
      regular: users.filter(user => user.role === 'user').length,
    }),
    [users]
  )

  const detailRequests = useMemo(() => {
    if (!details?.email) return []
    const email = details.email.trim().toLowerCase()
    return requests.filter(request => request.email.trim().toLowerCase() === email)
  }, [details, requests])

  const requestCountByEmail = useMemo(() => {
    const counts = new Map<string, number>()
    requests.forEach(request => {
      const email = request.email.trim().toLowerCase()
      if (!email) return
      counts.set(email, (counts.get(email) || 0) + 1)
    })
    return counts
  }, [requests])

  const requestCountFor = (target: UserProfile) => {
    if (requestsLoading && !requestsLoaded) return '...'
    if (requestsError) return '-'
    return requestCountByEmail.get(target.email.trim().toLowerCase()) || 0
  }

  const openEdit = (target: UserProfile) => {
    setEditUser(target)
    setEditName(target.name)
    setEditPhone(target.phone)
    setEditRole(target.role)
  }

  const closeEdit = () => {
    if (editSaving) return
    setEditUser(null)
  }

  const handleSave = async () => {
    if (!editUser) return
    setEditSaving(true)
    try {
      const { data, error } = await supabase.rpc('admin_update_user', {
        target_id: editUser.id,
        new_name: editName,
        new_phone: editPhone,
      })
      if (error) throw error
      if (data && !data.ok) {
        toast(data.error || 'Failed', 'error')
        return
      }
      emitProfileUpdated({
        userId: editUser.id,
        name: editName.trim() || null,
        phone: editPhone.trim() || null,
      })
      toast(`${editName || editUser.email} updated`, 'success')
      await fetchUsers()
      setEditUser(null)
    } catch (err: unknown) {
      toast(getErrorMessage(err, 'Failed to update'), 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const handleRoleChange = async () => {
    if (!editUser || !isSuperAdmin) return
    if (editRole === editUser.role) return
    if (editUser.role === 'superadmin') {
      toast('Cannot change superadmin role from here', 'error')
      return
    }

    setEditSaving(true)
    try {
      if (editRole === 'user') {
        const { data, error } = await supabase.rpc('remove_admin', { target_id: editUser.id })
        if (error) throw error
        if (data && !data.ok) {
          toast(data.error || 'Failed to remove admin', 'error')
          return
        }
      } else {
        const ok = await changeAdminRole(editUser.id, editRole as AdminRole)
        if (!ok) {
          toast('Failed to change role', 'error')
          return
        }
      }
      toast(`${editUser.name || editUser.email} -> ${editRole}`, 'success')
      await fetchUsers()
      setEditUser(null)
    } catch (err: unknown) {
      toast(getErrorMessage(err, 'Failed'), 'error')
    } finally {
      setEditSaving(false)
    }
  }

  const handleResetPassword = async (target = editUser) => {
    if (!target) return
    const ok = await dialog.confirm({
      title: 'Send Password Reset?',
      message: `A password reset email will be sent to:\n${target.email}`,
      confirmLabel: 'Send Reset Email',
    })
    if (!ok) return
    try {
      const redirectTo = `${window.location.origin}/update-password`
      const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
        redirectTo,
      })
      if (error) throw error
      toast(`Reset email sent to ${target.email}`, 'success')
    } catch (err: unknown) {
      toast(getErrorMessage(err, 'Failed to send'), 'error')
    }
  }

  const hasChanges = useMemo(() => {
    if (!editUser) return false
    return editName !== editUser.name || editPhone !== editUser.phone
  }, [editName, editPhone, editUser])

  const renderActions = (target: UserProfile) => (
    <AdminKebabMenu
      label={`Actions for ${target.name || target.email}`}
      items={[
        {
          label: 'Details',
          icon: <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
          onSelect: () => setDetails(target),
        },
        {
          label: 'Edit',
          icon: <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
          onSelect: () => openEdit(target),
        },
        {
          label: 'Send reset email',
          icon: <Mail className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
          onSelect: () => void handleResetPassword(target),
        },
      ]}
    />
  )

  return (
    <div className="admin-scope flex h-full min-h-0 flex-col gap-3 pt-1 pb-[calc(var(--admin-bottombar-h)+0.75rem)] md:gap-4 md:pt-0 md:pb-0">
      <AdminPageHeader
        title="Users"
        actions={
          <button
            type="button"
            className={controlButtonClass}
            onClick={async () => {
              setLoading(true)
              await Promise.all([fetchUsers(), loadRequests()])
            }}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} strokeWidth={2.1} aria-hidden="true" />
            Refresh
          </button>
        }
      />

      <div className="grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4">
        <AdminStatCard label="Total" value={stats.total} className="min-h-[74px] rounded-[14px] px-3 py-3 sm:min-h-[92px] sm:rounded-[18px] sm:px-4 sm:py-3.5" />
        <AdminStatCard label="Super Admins" value={stats.superadmins} className="min-h-[74px] rounded-[14px] px-3 py-3 sm:min-h-[92px] sm:rounded-[18px] sm:px-4 sm:py-3.5" />
        <AdminStatCard label="Admins" value={stats.admins} className="min-h-[74px] rounded-[14px] px-3 py-3 sm:min-h-[92px] sm:rounded-[18px] sm:px-4 sm:py-3.5" />
        <AdminStatCard label="Users" value={stats.regular} className="min-h-[74px] rounded-[14px] px-3 py-3 sm:min-h-[92px] sm:rounded-[18px] sm:px-4 sm:py-3.5" />
      </div>

      <section className="admin-card flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative block min-w-0">
            <span className="sr-only">Search users</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              className="admin-input ps-10"
              placeholder="Search by name, email, or phone"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <label className="sr-only" htmlFor="users-role-filter">
            Filter users by role
          </label>
          <select
            id="users-role-filter"
            className="admin-input"
            value={roleFilter}
            onChange={event => setRoleFilter(event.target.value as RoleFilter)}
          >
            {ROLE_FILTERS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="users-sort">
            Sort users
          </label>
          <select
            id="users-sort"
            className="admin-input"
            value={sortBy}
            onChange={event => setSortBy(event.target.value as SortKey)}
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
                <div className="grid min-w-[920px] grid-cols-[1.3fr_1.35fr_0.8fr_0.85fr_0.65fr_0.9fr_64px] gap-3 border-b border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-3">
                  {Array.from({ length: 7 }, (_, index) => (
                    <AdminSkeleton key={index} className="h-4" />
                  ))}
                </div>
                {Array.from({ length: 6 }, (_, rowIndex) => (
                  <div key={rowIndex} className="grid min-w-[920px] grid-cols-[1.3fr_1.35fr_0.8fr_0.85fr_0.65fr_0.9fr_64px] gap-3 border-b border-[var(--admin-border)] px-3 py-3 last:border-b-0">
                    {Array.from({ length: 7 }, (_, cellIndex) => (
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
        ) : displayed.length === 0 ? (
          <AdminEmptyState
            icon={<Users className="h-5 w-5" strokeWidth={2} aria-hidden="true" />}
            title={search || roleFilter !== 'all' ? 'No users match the current filters' : 'No users found'}
            description="User accounts will appear here after they are available from Supabase."
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 md:block">
              <div className="admin-table-wrap h-full">
                <table className="w-full min-w-[920px] text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3 text-start">User</th>
                      <th className="px-3 py-3 text-start">Email</th>
                      <th className="px-3 py-3 text-start">Phone</th>
                      <th className="px-3 py-3 text-start">Role</th>
                      <th className="px-3 py-3 text-start">Requests</th>
                      <th className="px-3 py-3 text-start">Joined</th>
                      <th className="px-3 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedUsers.map(target => {
                      const isYou = target.id === currentUser?.id
                      return (
                        <tr key={target.id} className="border-t border-[var(--admin-border)] align-middle hover:bg-[var(--admin-surface-2)]">
                          <td className="px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <UserAvatar
                                name={target.name}
                                email={target.email}
                                className={cn('h-10 w-10 rounded-[var(--admin-radius-sm)] text-[13px] font-bold', avatarClass(target.role))}
                              />
                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-2">
                                  <span className="truncate text-[13px] font-bold text-[var(--admin-text)]">
                                    {target.name || 'No name'}
                                  </span>
                                  {isYou && <span className="admin-chip admin-chip--accent !py-0.5 !text-[10px]">You</span>}
                                </div>
                                <div className="mt-0.5 truncate text-[11px] font-semibold text-[var(--admin-text-muted)]">
                                  {roleLabel(target.role)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <a className="block max-w-[240px] truncate text-[12px] font-semibold text-[var(--admin-accent)] hover:underline" href={`mailto:${target.email}`}>
                              {target.email}
                            </a>
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)]">
                            {target.phone || 'Not set'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={roleChipClass(target.role)}>{roleLabel(target.role)}</span>
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-bold text-[var(--admin-text)]">
                            {requestCountFor(target)}
                          </td>
                          <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)]">
                            {formatDate(target.created_at)}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-end">{renderActions(target)}</div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-2.5 md:hidden">
              {pagedUsers.map(target => {
                const isYou = target.id === currentUser?.id
                return (
                  <article key={target.id} className="admin-card p-3">
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        name={target.name}
                        email={target.email}
                        className={cn('h-11 w-11 rounded-[var(--admin-radius-sm)] text-[14px] font-bold', avatarClass(target.role))}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h2 className="truncate text-[14px] font-black text-[var(--admin-text)]">
                            {target.name || 'No name'}
                          </h2>
                          {isYou && <span className="admin-chip admin-chip--accent !py-0.5 !text-[10px]">You</span>}
                        </div>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--admin-text-muted)]">
                          {target.email}
                        </p>
                      </div>
                      {renderActions(target)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={roleChipClass(target.role)}>{roleLabel(target.role)}</span>
                      <span className="admin-chip">{formatDate(target.created_at)}</span>
                      <span className="admin-chip">{requestCountFor(target)} requests</span>
                    </div>
                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
                        <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Phone</div>
                        <div className="mt-1 truncate text-[12px] font-bold text-[var(--admin-text)]">{target.phone || 'Not set'}</div>
                      </div>
                      <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2">
                        <div className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Role</div>
                        <div className="mt-1 truncate text-[12px] font-bold text-[var(--admin-text)]">{roleLabel(target.role)}</div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              totalItems={displayed.length}
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
        title={details?.name || details?.email || 'User Details'}
        size="3xl"
        summaryFacts={
          details
            ? [
                { label: 'Email', value: details.email },
                { label: 'Role', value: roleLabel(details.role) },
                { label: 'Phone', value: details.phone || 'Not set' },
                { label: 'Requests', value: requestCountFor(details) },
                { label: 'Joined', value: formatDate(details.created_at) },
              ]
            : []
        }
        sections={
          details
            ? [
                {
                  title: 'Identity',
                  facts: [
                    { label: 'Display name', value: details.name || 'No name' },
                    { label: 'Email', value: details.email },
                    { label: 'Phone', value: details.phone || 'Not set' },
                  ],
                },
                {
                  title: 'Access',
                  facts: [
                    { label: 'Role', value: roleLabel(details.role) },
                    { label: 'Joined', value: formatDateTime(details.created_at) },
                    { label: 'Editable here', value: details.role === 'superadmin' ? 'No' : 'Yes' },
                  ],
                },
                {
                  title: 'Requests',
                  description: 'Requests linked by this user email.',
                  wide: true,
                  content: (
                    <UserRequestsSection
                      requests={detailRequests}
                      loading={requestsLoading}
                      error={requestsError}
                      onRetry={() => {
                        setRequestsLoaded(false)
                        void loadRequests()
                      }}
                      onOpen={request => {
                        setDetails(null)
                        navigate(requestPath(request))
                      }}
                    />
                  ),
                },
              ]
            : []
        }
        actions={
          details && (
            <>
              <AdminActionButton
                onClick={() => {
                  setDetails(null)
                  openEdit(details)
                }}
              >
                Edit User
              </AdminActionButton>
              <AdminActionButton onClick={() => void handleResetPassword(details)}>
                Reset Password
              </AdminActionButton>
            </>
          )
        }
      />

      <Modal
        open={!!editUser}
        onClose={closeEdit}
        title="Edit User"
        size="lg"
        dismissable={!editSaving}
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={closeEdit} className={controlButtonClass} disabled={editSaving}>
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={editSaving || !hasChanges} className={primaryButtonClass}>
              {editSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        {editUser && (
          <div className="admin-scope space-y-4">
            <div className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
              <UserAvatar
                name={editName || editUser.name}
                email={editUser.email}
                className="h-11 w-11 rounded-[var(--admin-radius-sm)]"
                fallbackClassName={cn('text-sm font-bold', avatarClass(editUser.role))}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{editUser.email}</div>
                <div className="mt-0.5 text-[11px] font-semibold text-[var(--admin-text-muted)]">
                  Joined {formatDate(editUser.created_at)}
                </div>
              </div>
              <span className={roleChipClass(editUser.role)}>{roleLabel(editUser.role)}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <AdminField label="Name" htmlFor="edit-user-name">
                <input
                  id="edit-user-name"
                  className="admin-input"
                  value={editName}
                  onChange={event => setEditName(event.target.value)}
                  placeholder="Full name"
                />
              </AdminField>
              <AdminField label="Phone" htmlFor="edit-user-phone">
                <input
                  id="edit-user-phone"
                  className="admin-input"
                  type="tel"
                  value={editPhone}
                  onChange={event => setEditPhone(event.target.value)}
                  placeholder="+962..."
                />
              </AdminField>
            </div>

            <button type="button" onClick={() => void handleResetPassword()} className={controlButtonClass + ' w-full justify-start'}>
              <KeyRound className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Send Password Reset Email
              <span className="ms-auto text-[11px] text-[var(--admin-text-muted)]">Supabase</span>
            </button>

            {isSuperAdmin && editUser.role !== 'superadmin' && (
              <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
                <AdminField label="Change role" htmlFor="edit-user-role" hint="Role changes use the existing admin RPC flow.">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <select
                      id="edit-user-role"
                      className="admin-input"
                      value={editRole}
                      onChange={event => setEditRole(event.target.value)}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleRoleChange}
                      disabled={editSaving || editRole === editUser.role}
                      className={primaryButtonClass + ' shrink-0'}
                    >
                      Apply Role
                    </button>
                  </div>
                </AdminField>
              </div>
            )}

            {editUser.role === 'superadmin' && (
              <div className="flex gap-2 rounded-[var(--admin-radius-sm)] border border-[color-mix(in_srgb,var(--admin-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-warning)_10%,transparent)] px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-warning)]">
                <Shield className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                <span>Super admin role can only be changed from Supabase dashboard.</span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
