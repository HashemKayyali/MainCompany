import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth, type AdminRole } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useDialog } from '../../contexts/DialogContext'
import Modal from '../../components/ui/Modal'

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
  { value: 'name', label: 'Name A–Z' },
  { value: 'email', label: 'Email A–Z' },
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

  // Edit modal
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const muted = isDark ? 'text-purple-300/40' : 'text-gray-400'

  // ── Fetch ──
  const fetchUsers = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_users') as any
      if (error) throw error
      setUsers((data || []).map((u: any) => ({
        id: u.id,
        email: u.email || '',
        name: u.name || '',
        phone: u.phone || '',
        role: u.role || 'user',
        created_at: u.created_at || '',
      })))
    } catch (err) {
      console.error('Failed to fetch users:', err)
      toast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  // ── Filter + Sort ──
  const displayed = useMemo(() => {
    let list = users
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.phone.includes(q)
      )
    }
    return sortUsers(list, sortBy)
  }, [users, search, sortBy])

  // ── Stats ──
  const stats = useMemo(() => ({
    total: users.length,
    superadmins: users.filter(u => u.role === 'superadmin').length,
    admins: users.filter(u => u.role === 'admin').length,
    regular: users.filter(u => u.role === 'user').length,
  }), [users])

  // ── Open edit ──
  const openEdit = (u: UserProfile) => {
    setEditUser(u)
    setEditName(u.name)
    setEditPhone(u.phone)
    setEditRole(u.role)
  }

  // ── Save name/phone ──
  const handleSave = async () => {
    if (!editUser) return
    setEditSaving(true)
    try {
      const { data, error } = await supabase.rpc('admin_update_user', {
        target_id: editUser.id,
        new_name: editName.trim() || null,
        new_phone: editPhone.trim() || null,
      }) as any
      if (error) throw error
      if (data && !data.ok) { toast(data.error || 'Failed', 'error'); return }
      toast(`${editName || editUser.email} updated`, 'success')
      await fetchUsers()
      setEditUser(null)
    } catch (err: any) {
      toast(err?.message || 'Failed to update', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  // ── Change role ──
  const handleRoleChange = async () => {
    if (!editUser || !isSuperAdmin) return
    if (editRole === editUser.role) return
    if (editUser.role === 'superadmin') { toast('Cannot change superadmin role from here', 'error'); return }

    setEditSaving(true)
    try {
      if (editRole === 'user') {
        const { data, error } = await supabase.rpc('remove_admin', { target_id: editUser.id }) as any
        if (error) throw error
        if (data && !data.ok) { toast(data.error, 'error'); return }
      } else {
        const ok = await changeAdminRole(editUser.id, editRole as AdminRole)
        if (!ok) { toast('Failed to change role', 'error'); return }
      }
      toast(`${editUser.name || editUser.email} → ${editRole}`, 'success')
      await fetchUsers()
      setEditUser(null)
    } catch (err: any) {
      toast(err?.message || 'Failed', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  // ── Reset password ──
  const handleResetPassword = async () => {
    if (!editUser) return
    const ok = await dialog.confirm({
      title: 'Send Password Reset?',
      message: `A password reset email will be sent to:\n${editUser.email}`,
      confirmLabel: 'Send Reset Email',
    })
    if (!ok) return
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(editUser.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })
      if (error) throw error
      toast(`Reset email sent to ${editUser.email}`, 'success')
    } catch (err: any) {
      toast(err?.message || 'Failed to send', 'error')
    }
  }

  // ── Styling helpers ──
  const roleBadge = (role: string) => {
    if (role === 'superadmin') return isDark
      ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30'
      : 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border-amber-300'
    if (role === 'admin') return isDark
      ? 'bg-gradient-to-r from-violet-500/15 to-fuchsia-500/15 text-purple-300 border-purple-500/30'
      : 'bg-gradient-to-r from-violet-50 to-fuchsia-50 text-violet-700 border-violet-300'
    return isDark
      ? 'bg-white/[0.04] text-white/40 border-white/10'
      : 'bg-gray-50 text-gray-400 border-gray-200'
  }

  const avatarBg = (role: string) => {
    if (role === 'superadmin') return 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20'
    if (role === 'admin') return 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/20'
    return isDark ? 'bg-white/[0.08] text-white/60' : 'bg-gray-100 text-gray-500'
  }

  const formatDate = (d: string) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const hasChanges = editUser && (editName !== editUser.name || editPhone !== editUser.phone)

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-7">
        <h1 className={`font-display text-2xl font-bold ${txt}`}>Users</h1>
        <p className={`text-sm mt-1 ${sub}`}>Manage registered accounts</p>
      </div>

      {/* ── Stats Row ── */}
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6`}>
        {[
          { label: 'Total', value: stats.total, color: isDark ? 'text-white' : 'text-gray-900' },
          { label: 'Superadmins', value: stats.superadmins, color: isDark ? 'text-amber-300' : 'text-amber-600' },
          { label: 'Admins', value: stats.admins, color: isDark ? 'text-purple-300' : 'text-violet-600' },
          { label: 'Users', value: stats.regular, color: isDark ? 'text-white/60' : 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl p-4 border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
            <div className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</div>
            <div className={`text-[11px] font-mono uppercase tracking-wider mt-0.5 ${muted}`}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search + Sort Bar ── */}
      <div className={`flex flex-col sm:flex-row gap-3 mb-5 p-3 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-white border-gray-100'}`}>
        <div className="relative flex-1">
          <svg className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} fill="none" stroke="currentColor" strokeWidth="2"><circle cx="7" cy="7" r="5" /><path d="M11 11l3 3" strokeLinecap="round" /></svg>
          <input
            className="form-field !pl-10 !mb-0"
            placeholder="Search by name, email, or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-mono uppercase tracking-wider ${muted}`}>Sort by</span>
          <select
            className="form-field !mb-0 !w-auto !min-w-[160px]"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortKey)}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="py-20 text-center">
          <div className={`animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-3 ${isDark ? 'border-purple-400' : 'border-violet-500'}`} />
          <p className={`text-sm ${sub}`}>Loading users...</p>
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && displayed.length === 0 && (
        <div className="py-16 text-center">
          <div className="text-3xl mb-3">👤</div>
          <p className={`text-sm ${sub}`}>
            {search ? `No users match "${search}"` : 'No users found.'}
          </p>
        </div>
      )}

      {/* ── Table ── */}
      {!loading && displayed.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
          {/* Header row */}
          <div className={`hidden sm:grid grid-cols-[1fr,1fr,auto,auto,auto] gap-4 px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${isDark ? 'bg-white/[0.02] text-purple-300/40 border-b border-white/[0.06]' : 'bg-gray-50 text-gray-400 border-b border-gray-100'}`}>
            <span>User</span>
            <span>Contact</span>
            <span className="w-20 text-center">Role</span>
            <span className="w-24 text-center">Joined</span>
            <span className="w-14 text-center">Edit</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-transparent">
            {displayed.map((u, i) => {
              const isYou = u.id === currentUser?.id
              return (
                <div
                  key={u.id}
                  className={`group grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto,auto,auto] gap-3 sm:gap-4 items-center px-5 py-4 transition-colors ${
                    isDark
                      ? i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.015]'
                      : i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                  } ${isDark ? 'hover:bg-white/[0.04]' : 'hover:bg-violet-50/50'}`}
                >
                  {/* User */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold font-display shrink-0 ${avatarBg(u.role)}`}>
                      {(u.name || u.email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-medium truncate ${txt}`}>
                          {u.name || <span className={muted}>No name</span>}
                        </span>
                        {isYou && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono shrink-0 ${isDark ? 'bg-prism-violet/15 text-prism-violet' : 'bg-violet-50 text-violet-600'}`}>You</span>
                        )}
                      </div>
                      <div className={`text-xs truncate ${sub}`}>{u.email}</div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="min-w-0 hidden sm:block">
                    {u.phone ? (
                      <span className={`text-xs font-mono ${sub}`}>{u.phone}</span>
                    ) : (
                      <span className={`text-xs ${muted}`}>—</span>
                    )}
                  </div>

                  {/* Role */}
                  <span className={`w-20 text-center px-2 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${roleBadge(u.role)}`}>
                    {u.role}
                  </span>

                  {/* Joined */}
                  <span className={`w-24 text-center text-[11px] font-mono hidden sm:block ${muted}`}>
                    {formatDate(u.created_at)}
                  </span>

                  {/* Edit */}
                  <div className="w-14 flex justify-center">
                    <button
                      onClick={() => openEdit(u)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all opacity-70 group-hover:opacity-100 ${
                        isDark
                          ? 'text-purple-200/80 hover:bg-purple-500/15'
                          : 'text-gray-600 hover:bg-violet-100'
                      }`}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer count */}
          <div className={`px-5 py-3 text-[11px] font-mono ${isDark ? 'bg-white/[0.02] border-t border-white/[0.06]' : 'bg-gray-50 border-t border-gray-100'} ${muted}`}>
            Showing {displayed.length} of {users.length} users
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User" persistent>
        {editUser && (
          <div className="space-y-5">
            {/* Header card */}
            <div className={`flex items-center gap-3 p-4 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/[0.08]' : 'bg-gray-50 border border-gray-100'}`}>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold font-display ${avatarBg(editUser.role)}`}>
                {(editUser.name || editUser.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${txt}`}>{editUser.email}</div>
                <div className={`text-[11px] font-mono mt-0.5 ${muted}`}>
                  Joined {formatDate(editUser.created_at)}
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono uppercase tracking-wider border ${roleBadge(editUser.role)}`}>
                {editUser.role}
              </span>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${muted}`}>Name</label>
                <input className="form-field !mb-0" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${muted}`}>Phone</label>
                <input className="form-field !mb-0" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="+962..." />
              </div>
            </div>

            {/* Reset Password */}
            <button
              onClick={handleResetPassword}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border transition-all text-left ${
                isDark
                  ? 'border-cyan-500/15 text-cyan-300/80 hover:bg-cyan-500/10 hover:text-cyan-200'
                  : 'border-blue-200 text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0"><rect x="2" y="5" width="12" height="9" rx="1.5" /><path d="M2 5l6 4.5L14 5" /></svg>
              <span>Send Password Reset Email</span>
              <span className={`ml-auto text-[10px] font-mono ${muted}`}>via Supabase</span>
            </button>

            {/* Role change — superadmin only, protect superadmins */}
            {isSuperAdmin && editUser.role !== 'superadmin' && (
              <div className={`p-4 rounded-xl border ${isDark ? 'border-amber-500/15 bg-amber-500/[0.04]' : 'border-amber-200 bg-amber-50/50'}`}>
                <label className={`block text-[11px] font-mono uppercase tracking-wider mb-2 ${isDark ? 'text-amber-400/70' : 'text-amber-700'}`}>
                  Change Role
                </label>
                <div className="flex gap-2 items-center">
                  <select className="form-field !mb-0 flex-1" value={editRole} onChange={e => setEditRole(e.target.value)}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                  <button
                    onClick={handleRoleChange}
                    disabled={editSaving || editRole === editUser.role}
                    className="btn-primary !px-5 !py-2.5 !rounded-xl !text-xs disabled:opacity-40 shrink-0"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}

            {editUser.role === 'superadmin' && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs ${isDark ? 'bg-amber-500/[0.06] border border-amber-500/15 text-amber-300/70' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
                <span>🔒</span>
                <span>Superadmin role can only be changed from Supabase dashboard</span>
              </div>
            )}

            {/* Actions */}
            <div className={`flex gap-3 justify-end pt-2 border-t ${isDark ? 'border-white/[0.06]' : 'border-gray-100'}`}>
              <button onClick={() => setEditUser(null)} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={editSaving || !hasChanges}
                className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-40"
              >
                {editSaving ? '⏳ Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
