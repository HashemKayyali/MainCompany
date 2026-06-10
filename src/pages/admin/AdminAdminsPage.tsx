import { useState } from 'react'
import { useAuth, type AdminRole } from '../../contexts/AuthContext'
import { useDialog } from '../../contexts/DialogContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import Modal from '../../components/ui/Modal'
import UserAvatar from '../../components/ui/UserAvatar'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

type AdminMember = { id: string; name: string; email: string; role: AdminRole }

export default function AdminAdminsPage() {
  const { admins, addAdmin, removeAdmin, changeAdminRole, user, isSuperAdmin } = useAuth()
  const dialog = useDialog()
  const { isDark } = useTheme()
  const { toast } = useToast()

  const [showAdd, setShowAdd] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState<AdminRole>('admin')
  const [addError, setAddError] = useState('')
  const [addSaving, setAddSaving] = useState(false)

  const [editAdmin, setEditAdmin] = useState<AdminMember | null>(null)
  const [details, setDetails] = useState<AdminMember | null>(null)
  const [editRole, setEditRole] = useState<AdminRole>('admin')
  const [editSaving, setEditSaving] = useState(false)
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('admins')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

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
    } catch (err: unknown) {
      setAddError(getErrorMessage(err, 'Failed to add admin'))
    } finally {
      setAddSaving(false)
    }
  }

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

  const handleRemove = async (target = editAdmin) => {
    if (!target) return
    const ok = await dialog.confirm({
      title: 'Remove Admin?',
      message: `This will remove ${target.name} from the admin team and change their role to "user".`,
      confirmLabel: 'Remove',
      variant: 'danger',
    })
    if (!ok) return

    setEditSaving(true)
    const removed = await removeAdmin(target.id)
    setEditSaving(false)
    if (removed) {
      toast(`${target.name} removed`, 'success')
      if (editAdmin?.id === target.id) setEditAdmin(null)
      if (details?.id === target.id) setDetails(null)
    } else {
      toast('Failed to remove admin', 'error')
    }
  }

  const openEdit = (admin: AdminMember) => {
    setEditAdmin({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    })
    setEditRole(admin.role)
  }

  const cardRoleTone = (role: AdminRole) =>
    role === 'superadmin'
      ? isDark
        ? 'bg-amber-400/10 text-amber-200 ring-amber-400/18'
        : 'bg-amber-50 text-amber-700 ring-amber-200'
      : isDark
        ? 'bg-cyan-400/10 text-cyan-200 ring-cyan-400/18'
        : 'bg-violet-50 text-violet-700 ring-violet-200'

  const avatarClass = (role: AdminRole) =>
    role === 'superadmin'
      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
      : 'bg-gradient-to-br from-prism-violet to-prism-cyan text-void-950'

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Admin Users"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            {isSuperAdmin ? (
              <button
                onClick={() => {
                  setShowAdd(true)
                  setAddError('')
                  setAddEmail('')
                }}
                className="btn-admin-create"
              >
                + Add Admin
              </button>
            ) : null}
          </>
        }
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Admins" value={admins.length} />
        <AdminStatCard label="Super Admins" value={admins.filter(admin => admin.role === 'superadmin').length} />
        <AdminStatCard label="Standard Admins" value={admins.filter(admin => admin.role === 'admin').length} />
        <AdminStatCard label="You" value={admins.some(admin => admin.id === user?.id) ? 'Included' : 'No'} />
      </div>

      {!isSuperAdmin && (
        <div className={cn('rounded-[18px] border px-3.5 py-2.75 text-[13px]', isDark ? 'border-amber-400/20 bg-amber-400/10 text-amber-300' : 'border-amber-200 bg-amber-50 text-amber-700')}>
          Only super admins can manage admins.
        </div>
      )}

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[22px] p-2.5',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        {admins.length === 0 ? (
          <div className={cn('flex flex-1 items-center justify-center rounded-[18px] border px-5 py-11 text-center text-[13px]', isDark ? 'border-white/10 text-purple-200/70' : 'border-gray-100 text-gray-500')}>
            No admins loaded.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
              {admins.map(admin => {
                const safeRole = admin.role === 'superadmin' ? 'superadmin' : 'admin'
                const isYou = admin.id === user?.id
                const member: AdminMember = {
                  id: admin.id,
                  name: admin.name,
                  email: admin.email,
                  role: safeRole,
                }
                const canManage = isSuperAdmin && !isYou && safeRole !== 'superadmin'

                return (
                  <div
                    key={admin.id}
                    className="flex flex-col rounded-[16px] border border-violet-200/70 bg-white p-3.5 shadow-[0_8px_24px_-18px_rgba(89,23,196,0.20)] transition-shadow duration-200 hover:shadow-[0_14px_32px_-16px_rgba(89,23,196,0.30)]"
                  >
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        name={admin.name}
                        email={admin.email}
                        className={cn(
                          'h-11 w-11 shrink-0 rounded-[12px] text-[0.95rem] font-display font-bold',
                          avatarClass(safeRole)
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-display text-[14px] font-extrabold text-[#1a0b3d]">
                            {admin.name}
                          </span>
                          {isYou && (
                            <span className="shrink-0 rounded-full border border-violet-300 bg-violet-100/80 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[#2e0a72]">
                              You
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5 truncate text-[12px] font-medium text-[#6b5a82]">
                          {admin.email}
                        </div>
                      </div>
                      <span
                        className={cn(
                          'shrink-0 rounded-full border px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-[0.14em] ring-1 ring-inset',
                          cardRoleTone(safeRole)
                        )}
                      >
                        {safeRole}
                      </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <AdminActionButton
                        tone="primary"
                        className="!min-h-[34px] flex-1"
                        onClick={() => setDetails(member)}
                      >
                        Details
                      </AdminActionButton>
                      {canManage && (
                        <>
                          <AdminActionButton
                            className="!min-h-[34px] flex-1"
                            onClick={() => openEdit(member)}
                          >
                            Edit
                          </AdminActionButton>
                          <AdminActionButton
                            tone="danger"
                            className="!min-h-[34px] flex-1"
                            onClick={() => void handleRemove(member)}
                          >
                            Remove
                          </AdminActionButton>
                        </>
                      )}
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
        title={details?.name || 'Admin Details'}
        subtitle={details ? 'A simplified account view with the core identity and role information only.' : undefined}
        media={
          details ? (
            <div className={cn('flex aspect-[16/9] items-center justify-center', isDark ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.15),transparent_58%)]' : 'bg-[radial-gradient(circle,rgba(139,92,246,0.10),transparent_55%)]')}>
              <UserAvatar
                name={details.name}
                email={details.email}
                className="h-28 w-28 rounded-[32px]"
                fallbackClassName={cn(
                  'text-5xl font-display font-bold shadow-lg',
                  avatarClass(details.role)
                )}
              />
            </div>
          ) : null
        }
        badges={
          details ? (
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', cardRoleTone(details.role))}>
                {details.role}
              </span>
              {details.id === user?.id && (
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
              ]
            : []
        }
        sections={
          details
            ? [
                {
                  title: 'Identity',
                  facts: [
                    { label: 'Name', value: details.name },
                    { label: 'Email', value: details.email },
                    { label: 'Role', value: details.role },
                  ],
                },
              ]
            : []
        }
        actions={
          details && isSuperAdmin && details.role !== 'superadmin' && details.id !== user?.id ? (
            <>
              <AdminActionButton
                onClick={() => {
                  setDetails(null)
                  openEdit(details)
                }}
              >
                Edit Role
              </AdminActionButton>
              <AdminActionButton tone="danger" onClick={() => void handleRemove(details)}>
                Remove Admin
              </AdminActionButton>
            </>
          ) : null
        }
      />

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Admin" persistent size="lg">
        <div className="space-y-4">
          <p className={`text-sm ${sub}`}>Enter the email of a registered user to make them an admin.</p>

          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Email *</label>
            <input
              className={`form-field ${addError ? '!border-red-400/40' : ''}`}
              type="email"
              placeholder="user@example.com"
              value={addEmail}
              onChange={e => {
                setAddEmail(e.target.value)
                setAddError('')
              }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>

          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Role</label>
            <select className="form-field" value={addRole} onChange={e => setAddRole(e.target.value as AdminRole)}>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          {addError && (
            <div className={`rounded-xl px-3 py-2.5 text-sm ${isDark ? 'bg-red-400/15 text-red-400' : 'bg-red-50 text-red-600'}`}>
              {addError}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => setShowAdd(false)} className="btn-outline !rounded-xl !px-5 !py-2.5 !text-sm">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={addSaving} className="btn-primary !rounded-xl !px-6 !py-2.5 !text-xs disabled:opacity-50">
              {addSaving ? 'Searching...' : 'Add Admin'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editAdmin} onClose={() => setEditAdmin(null)} title={`Edit - ${editAdmin?.name || ''}`} persistent size="lg">
        {editAdmin && (
          <div className="space-y-5">
            <div className={`rounded-xl px-4 py-3 ${isDark ? 'border border-white/10 bg-white/[0.03]' : 'border border-gray-200 bg-gray-50'}`}>
              <div className={`text-sm font-medium ${txt}`}>{editAdmin.name}</div>
              <div className={`text-xs ${sub}`}>{editAdmin.email}</div>
            </div>

            <div>
              <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Role</label>
              <select className="form-field" value={editRole} onChange={e => setEditRole(e.target.value as AdminRole)}>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            <div className="mt-6 flex justify-between gap-3">
              <button onClick={() => void handleRemove()} disabled={editSaving} className="btn-danger !text-xs disabled:opacity-50">
                Remove Admin
              </button>

              <div className="flex gap-3">
                <button onClick={() => setEditAdmin(null)} className="btn-outline !rounded-xl !px-5 !py-2.5 !text-sm">
                  Cancel
                </button>
                <button
                  onClick={handleChangeRole}
                  disabled={editSaving || editRole === editAdmin.role}
                  className="btn-primary !rounded-xl !px-6 !py-2.5 !text-xs disabled:opacity-50"
                >
                  {editSaving ? 'Saving...' : 'Save Role'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

