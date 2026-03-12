import { useState } from 'react'
import { useAuth, type AdminRole } from '../../contexts/AuthContext'
import { useDialog } from '../../contexts/DialogContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import Modal from '../../components/ui/Modal'

export default function AdminAdminsPage() {
  const { admins, addAdmin, removeAdmin, changeAdminRole, user, isSuperAdmin } = useAuth()
  const dialog = useDialog()
  const { isDark } = useTheme()
  const { toast } = useToast()

  // Add modal state
  const [showAdd, setShowAdd] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState<AdminRole>('admin')
  const [addError, setAddError] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  // Edit modal state
  const [editAdmin, setEditAdmin] = useState<{ id: string; name: string; email: string; role: AdminRole } | null>(null)
  const [editRole, setEditRole] = useState<AdminRole>('admin')
  const [editSaving, setEditSaving] = useState(false)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'

  // ── Add: email only, must be registered ──
  const handleAdd = async () => {
    setAddError('')
    if (!addEmail.trim()) {
      setAddError('Email is required')
      return
    }
    setAddSaving(true)
    try {
      const ok = await addAdmin(addEmail, '', addRole)
      if (!ok) {
        setAddError('User not found or already an admin. The user must be registered first.')
        return
      }
      toast(`${addEmail} is now ${addRole}`, 'success')
      setShowAdd(false)
      setAddEmail('')
      setAddRole('admin')
    } catch (err: any) {
      setAddError(err?.message || 'Failed to add admin')
    } finally {
      setAddSaving(false)
    }
  }

  // ── Edit: change role ──
  const handleChangeRole = async () => {
    if (!editAdmin) return
    setEditSaving(true)
    try {
      const ok = await changeAdminRole(editAdmin.id, editRole)
      if (ok) {
        toast(`${editAdmin.name} is now ${editRole}`, 'success')
        setEditAdmin(null)
      } else {
        toast('Failed to change role', 'error')
      }
    } catch {
      toast('Failed to change role', 'error')
    } finally {
      setEditSaving(false)
    }
  }

  // ── Remove ──
  const handleRemove = async () => {
    if (!editAdmin) return
    const ok = await dialog.confirm({
      title: 'Remove Admin?',
      message: `This will remove ${editAdmin.name} from the admin team and change their role to "user".`,
      confirmLabel: 'Remove',
      variant: 'danger',
    })
    if (ok) {
      setEditSaving(true)
      const removed = await removeAdmin(editAdmin.id)
      setEditSaving(false)
      if (removed) {
        toast(`${editAdmin.name} removed`, 'success')
        setEditAdmin(null)
      } else {
        toast('Failed to remove admin', 'error')
      }
    }
  }

  const openEdit = (a: typeof admins[0]) => {
    setEditAdmin({ id: a.id, name: a.name, email: a.email, role: a.role })
    setEditRole(a.role)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`font-display text-2xl font-bold ${txt}`}>Admin Users</h1>
          <p className={`text-sm ${sub}`}>{admins.length} administrator{admins.length !== 1 ? 's' : ''}</p>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => { setShowAdd(true); setAddError(''); setAddEmail('') }}
            className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl"
          >
            + Add Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm ${
            isDark
              ? 'bg-amber-400/10 border border-amber-400/20 text-amber-300'
              : 'bg-amber-50 border border-amber-200 text-amber-700'
          }`}
        >
          Only super admins can manage admins.
        </div>
      )}

      {admins.length === 0 && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-sm ${
            isDark
              ? 'bg-purple-500/10 border border-purple-500/20 text-purple-200/90'
              : 'bg-violet-50 border border-violet-200 text-violet-700'
          }`}
        >
          No admins loaded.
        </div>
      )}

      {/* ── Admin List ── */}
      <div className="space-y-3">
        {admins.map(a => {
          const safeRole = a.role === 'superadmin' ? 'superadmin' : 'admin'
          const isYou = a.id === user?.id

          return (
            <div key={a.id} className="card-surface rounded-2xl p-5 flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold font-display ${
                  safeRole === 'superadmin'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                    : 'bg-gradient-to-br from-prism-violet to-prism-cyan text-void-950'
                }`}
              >
                {(a.name || '?').charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${txt}`}>{a.name}</span>
                  {isYou && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                        isDark ? 'bg-prism-violet/15 text-prism-violet' : 'bg-violet-50 text-violet-600'
                      }`}
                    >
                      You
                    </span>
                  )}
                </div>
                <div className={`text-xs ${sub}`}>{a.email}</div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase tracking-wider ${
                  safeRole === 'superadmin'
                    ? isDark
                      ? 'bg-amber-400/10 text-amber-300 border border-amber-400/20'
                      : 'bg-amber-50 text-amber-600 border border-amber-200'
                    : isDark
                    ? 'bg-purple-500/10 text-purple-200/90 border border-purple-500/25'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}
              >
                {safeRole}
              </span>

              {/* Edit button — only for superadmin caller, can't edit yourself or other superadmins */}
              {isSuperAdmin && !isYou && safeRole !== 'superadmin' && (
                <button
                  onClick={() => openEdit(a)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    isDark
                      ? 'border-purple-500/25 text-purple-200/80 hover:bg-purple-500/10'
                      : 'border-violet-200 text-gray-600 hover:bg-violet-50'
                  }`}
                >
                  Edit
                </button>
              )}

              {/* Superadmins are protected — show lock */}
              {isSuperAdmin && !isYou && safeRole === 'superadmin' && (
                <span
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-mono ${
                    isDark ? 'text-amber-300/50' : 'text-amber-600/50'
                  }`}
                  title="Superadmins can only be changed from Supabase dashboard"
                >
                  🔒 Protected
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* ── Add Admin Modal ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Admin" persistent>
        <div className="space-y-4">
          <p className={`text-sm ${sub}`}>
            Enter the email of a registered user to make them an admin.
          </p>

          <div>
            <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Email *</label>
            <input
              className={`form-field ${addError ? '!border-red-400/40' : ''}`}
              type="email"
              placeholder="user@example.com"
              value={addEmail}
              onChange={e => { setAddEmail(e.target.value); setAddError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>

          <div>
            <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Role</label>
            <select className="form-field" value={addRole} onChange={e => setAddRole(e.target.value as AdminRole)}>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {addError && (
            <div className={`px-3 py-2.5 rounded-xl text-sm ${isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {addError}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <button onClick={() => setShowAdd(false)} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={addSaving} className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50">
              {addSaving ? '⏳ Searching...' : 'Add Admin'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Edit Admin Modal ── */}
      <Modal open={!!editAdmin} onClose={() => setEditAdmin(null)} title={`Edit — ${editAdmin?.name || ''}`} persistent>
        {editAdmin && (
          <div className="space-y-5">
            {/* Info */}
            <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className={`text-sm font-medium ${txt}`}>{editAdmin.name}</div>
              <div className={`text-xs ${sub}`}>{editAdmin.email}</div>
            </div>

            {/* Change Role */}
            <div>
              <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Role</label>
              <select className="form-field" value={editRole} onChange={e => setEditRole(e.target.value as AdminRole)}>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-between mt-6">
              <button
                onClick={handleRemove}
                disabled={editSaving}
                className="btn-danger !text-xs disabled:opacity-50"
              >
                Remove Admin
              </button>

              <div className="flex gap-3">
                <button onClick={() => setEditAdmin(null)} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleChangeRole}
                  disabled={editSaving || editRole === editAdmin.role}
                  className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50"
                >
                  {editSaving ? '⏳ Saving...' : 'Save Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
