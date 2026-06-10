import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth, type AdminRole } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useDialog } from '../../contexts/DialogContext'
import Modal from '../../components/ui/Modal'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
import UserAvatar from '../../components/ui/UserAvatar'
import { emitProfileUpdated } from '../../lib/profile-sync'
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

const ROLE_ORDER: Record<string, number> = { superadmin: 0, admin: 1, user: 2 }

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

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'role', label: 'Role (default)' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'email', label: 'Email A-Z' },
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
]

export default function AdminUsersPage() {
  const { user: currentUser, isSuperAdmin, changeAdminRole } = useAuth()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const dialog = useDialog()

  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('role')
  const [details, setDetails] = useState<UserProfile | null>(null)

  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('users')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const muted = isDark ? 'text-purple-300/40' : 'text-gray-400'
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

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

  const displayed = useMemo(() => {
    let list = users
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
  }, [users, search, sortBy])

  const stats = useMemo(
    () => ({
      total: users.length,
      superadmins: users.filter(user => user.role === 'superadmin').length,
      admins: users.filter(user => user.role === 'admin').length,
      regular: users.filter(user => user.role === 'user').length,
    }),
    [users]
  )

  const openEdit = (user: UserProfile) => {
    setEditUser(user)
    setEditName(user.name)
    setEditPhone(user.phone)
    setEditRole(user.role)
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
      const { error } = await supabase.auth.resetPasswordForEmail(target.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) throw error
      toast(`Reset email sent to ${target.email}`, 'success')
    } catch (err: unknown) {
      toast(getErrorMessage(err, 'Failed to send'), 'error')
    }
  }

  const roleBadge = (role: string) => {
    if (role === 'superadmin')
      return isDark
        ? 'bg-amber-400/10 text-amber-200 ring-1 ring-inset ring-amber-400/18'
        : 'border-amber-200 bg-amber-50 text-amber-700'
    if (role === 'admin')
      return isDark
        ? 'bg-cyan-400/10 text-cyan-200 ring-1 ring-inset ring-cyan-400/18'
        : 'border-violet-200 bg-violet-50 text-violet-700'
    return isDark
      ? 'bg-[#0f1630]/92 text-purple-100/76 ring-1 ring-inset ring-cyan-400/10'
      : 'border-gray-200 bg-gray-50 text-gray-600'
  }

  const avatarBg = (role: string) => {
    if (role === 'superadmin') return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
    if (role === 'admin') return 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20'
    return isDark ? 'bg-white/[0.08] text-white/60' : 'bg-gray-100 text-gray-500'
  }

  const formatDate = (value: string) => {
    if (!value) return '-'
    return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const hasChanges = useMemo(() => {
    if (!editUser) return false
    return editName !== editUser.name || editPhone !== editUser.phone
  }, [editName, editPhone, editUser])

  return (
    <div className="flex h-full min-h-0 flex-col gap-3.5">
      <AdminPageHeader
        title="Users"
        actions={<AdminViewToggle value={cardView} onChange={setCardView} />}
      />

      <div className="grid shrink-0 gap-1.5 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total" value={stats.total} />
        <AdminStatCard label="Superadmins" value={stats.superadmins} />
        <AdminStatCard label="Admins" value={stats.admins} />
        <AdminStatCard label="Users" value={stats.regular} />
      </div>

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[18px] p-2.5',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="mb-2.5 flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <svg className={`absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${muted}`} fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3 3" strokeLinecap="round" />
            </svg>
            <input
              className="form-field !mb-0 !pl-10"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-[11px] font-mono uppercase tracking-[0.22em] ${muted}`}>Sort</span>
            <select className="form-field !mb-0 !w-auto !min-w-[170px]" value={sortBy} onChange={e => setSortBy(e.target.value as SortKey)}>
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
            <div className={`mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent ${isDark ? 'border-purple-400' : 'border-violet-500'}`} />
            <p className={`text-sm ${sub}`}>Loading users...</p>
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-[18px] border', isDark ? 'border-cyan-400/16 bg-cyan-400/8 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 12a4 4 0 100-8 4 4 0 000 8z" />
                <path d="M5 20a7 7 0 0114 0" strokeLinecap="round" />
              </svg>
            </div>
            <p className={`text-sm ${sub}`}>{search ? `No users match "${search}"` : 'No users found.'}</p>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {displayed.map(user => {
                const isYou = user.id === currentUser?.id
                return (
                  <div
                    key={user.id}
                    className="flex flex-col rounded-[16px] border border-violet-200/70 bg-white p-3.5 shadow-[0_8px_24px_-18px_rgba(89,23,196,0.20)] transition-shadow duration-200 hover:shadow-[0_14px_32px_-16px_rgba(89,23,196,0.30)]"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        name={user.name}
                        email={user.email}
                        className={cn(
                          'h-11 w-11 shrink-0 rounded-[12px] text-[0.95rem] font-display font-bold',
                          avatarBg(user.role)
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-display text-[14px] font-extrabold text-[#1a0b3d]">
                            {user.name || 'No name'}
                          </span>
                          {isYou && (
                            <span className="shrink-0 rounded-full border border-violet-300 bg-violet-100/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#2e0a72]">
                              You
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-[12px] font-medium text-[#6b5a82]">
                          {user.email}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em]',
                          roleBadge(user.role)
                        )}
                      >
                        {user.role}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <div className="min-w-0 rounded-[10px] border border-violet-100 bg-violet-50/50 px-2.5 py-1.5">
                        <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7126e3]">
                          Phone
                        </div>
                        <div className="mt-0.5 truncate text-[12px] font-bold text-[#1a0b3d]">
                          {user.phone || 'Not set'}
                        </div>
                      </div>
                      <div className="min-w-0 rounded-[10px] border border-violet-100 bg-violet-50/50 px-2.5 py-1.5">
                        <div className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#7126e3]">
                          Joined
                        </div>
                        <div className="mt-0.5 truncate text-[12px] font-bold text-[#1a0b3d]">
                          {formatDate(user.created_at)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <AdminActionButton tone="primary" onClick={() => setDetails(user)}>
                        Details
                      </AdminActionButton>
                      <AdminActionButton onClick={() => openEdit(user)}>Edit</AdminActionButton>
                    </div>
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        )}
      </div>

      <AdminDetailModal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.name || details?.email || 'User Details'}
        subtitle={details ? 'The details panel carries the full account context so the main list can stay compact and easier to scan.' : undefined}
        media={
          details ? (
            <div className={cn('flex aspect-[16/9] items-center justify-center', isDark ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.15),transparent_58%)]' : 'bg-[radial-gradient(circle,rgba(139,92,246,0.10),transparent_55%)]')}>
              <UserAvatar
                name={details.name}
                email={details.email}
                className="h-24 w-24 rounded-[26px]"
                fallbackClassName={cn('text-5xl font-display font-bold', avatarBg(details.role))}
              />
            </div>
          ) : null
        }
        badges={
          details ? (
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', roleBadge(details.role))}>
                {details.role}
              </span>
              {details.id === currentUser?.id && (
                <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                  Current session
                </span>
              )}
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Email', value: details.email },
                { label: 'Role', value: details.role },
                { label: 'Phone', value: details.phone || 'Not set' },
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
                    { label: 'Role', value: details.role },
                    { label: 'Joined', value: formatDate(details.created_at) },
                    { label: 'Editable here', value: details.role === 'superadmin' ? 'No' : 'Yes' },
                  ],
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

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" persistent size="lg">
        {editUser && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 rounded-[16px] p-3.5 ${isDark ? 'border border-white/[0.08] bg-white/[0.03]' : 'border border-gray-100 bg-gray-50'}`}>
              <UserAvatar
                name={editName || editUser.name}
                email={editUser.email}
                className="h-10 w-10 rounded-[14px]"
                fallbackClassName={cn('text-sm font-bold font-display', avatarBg(editUser.role))}
              />
              <div className="min-w-0 flex-1">
                <div className={`truncate text-sm font-medium ${txt}`}>{editUser.email}</div>
                <div className={`mt-0.5 text-[11px] font-mono ${muted}`}>Joined {formatDate(editUser.created_at)}</div>
              </div>
              <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider ${roleBadge(editUser.role)}`}>
                {editUser.role}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              <div>
                <label className={`mb-1.5 block text-[11px] font-mono uppercase tracking-wider ${muted}`}>Name</label>
                <input className="form-field !mb-0" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className={`mb-1.5 block text-[11px] font-mono uppercase tracking-wider ${muted}`}>Phone</label>
                <input className="form-field !mb-0" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+962..." />
              </div>
            </div>

            <button
              onClick={() => void handleResetPassword()}
              className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${isDark ? 'border-cyan-500/15 text-cyan-300/80 hover:bg-cyan-500/10 hover:text-cyan-200' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
                <rect x="2" y="5" width="12" height="9" rx="1.5" />
                <path d="M2 5l6 4.5L14 5" />
              </svg>
              <span>Send Password Reset Email</span>
              <span className={`ml-auto text-[10px] font-mono ${muted}`}>via Supabase</span>
            </button>

            {isSuperAdmin && editUser.role !== 'superadmin' && (
              <div className={`rounded-xl border p-4 ${isDark ? 'border-amber-500/15 bg-amber-500/[0.04]' : 'border-amber-200 bg-amber-50/50'}`}>
                <label className={`mb-2 block text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-amber-400/70' : 'text-amber-700'}`}>
                  Change Role
                </label>
                <div className="flex items-center gap-2">
                  <select className="form-field !mb-0 flex-1" value={editRole} onChange={e => setEditRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  <button
                    onClick={handleRoleChange}
                    disabled={editSaving || editRole === editUser.role}
                    className="btn-primary !rounded-xl !px-5 !py-2.5 !text-xs disabled:opacity-40"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {editUser.role === 'superadmin' && (
              <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-xs ${isDark ? 'border border-amber-500/15 bg-amber-500/[0.06] text-amber-300/70' : 'border border-amber-200 bg-amber-50 text-amber-700'}`}>
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 3l7 4v5c0 4.1-2.3 7.2-7 9-4.7-1.8-7-4.9-7-9V7l7-4z" />
                  <path d="M9.5 12.5l1.6 1.6 3.4-3.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Superadmin role can only be changed from Supabase dashboard</span>
              </div>
            )}

            <div className={`flex justify-end gap-3 border-t pt-2 ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <button onClick={() => setEditUser(null)} className="btn-outline !rounded-xl !px-5 !py-2.5 !text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={editSaving || !hasChanges}
                className="btn-primary !rounded-xl !px-6 !py-2.5 !text-xs disabled:opacity-40"
              >
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}


