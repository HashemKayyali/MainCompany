import { useEffect, useMemo, useState } from 'react'
import { Eye, Pencil, Search, Shield, Trash2, UserCog, UserPlus } from 'lucide-react'
import { useAuth, type AdminRole } from '../../contexts/AuthContext'
import { useDialog } from '../../contexts/DialogContext'
import { useToast } from '../../contexts/ToastContext'
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
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

type AdminMember = { id: string; name: string; email: string; role: AdminRole }
type RoleFilter = 'all' | 'superadmin' | 'admin'
type SortKey = 'role' | 'name' | 'email'

const ROLE_ORDER: Record<AdminRole, number> = { superadmin: 0, admin: 1 }
const PAGE_SIZE_OPTIONS = [10, 20, 40]

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All admins' },
  { value: 'superadmin', label: 'Super admins' },
  { value: 'admin', label: 'Admins' },
]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'role', label: 'Role' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'email', label: 'Email A-Z' },
]

function roleLabel(role: AdminRole) {
  return role === 'superadmin' ? 'Super Admin' : 'Admin'
}

function roleChipClass(role: AdminRole) {
  return role === 'superadmin' ? 'admin-chip admin-chip--warning' : 'admin-chip admin-chip--accent'
}

function avatarClass(role: AdminRole) {
  return role === 'superadmin' ? 'bg-[var(--admin-warning)] text-white' : 'bg-[var(--admin-accent)] text-white'
}

function sortAdmins(admins: AdminMember[], sortBy: SortKey) {
  const list = [...admins]
  switch (sortBy) {
    case 'role':
      return list.sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.email.localeCompare(b.email))
    case 'name':
      return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'email':
      return list.sort((a, b) => a.email.localeCompare(b.email))
    default:
      return list
  }
}

const controlButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3.5 text-[13px] font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

const primaryButtonClass =
  'inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent)] px-4 text-[13px] font-bold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

const dangerButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] border border-[color-mix(in_srgb,var(--admin-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-danger)_10%,transparent)] px-4 text-[13px] font-bold text-[var(--admin-danger)] transition hover:bg-[color-mix(in_srgb,var(--admin-danger)_16%,transparent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[color-mix(in_srgb,var(--admin-danger)_14%,transparent)] disabled:cursor-not-allowed disabled:opacity-50'

export default function AdminAdminsPage() {
  const { admins, addAdmin, removeAdmin, changeAdminRole, user, isSuperAdmin } = useAuth()
  const dialog = useDialog()
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

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('role')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const adminMembers = useMemo<AdminMember[]>(
    () =>
      admins.map(admin => ({
        id: admin.id,
        name: admin.name || admin.email,
        email: admin.email,
        role: admin.role === 'superadmin' ? 'superadmin' : 'admin',
      })),
    [admins]
  )

  const filteredAdmins = useMemo(() => {
    let list = adminMembers
    if (roleFilter !== 'all') list = list.filter(admin => admin.role === roleFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        admin => admin.name.toLowerCase().includes(q) || admin.email.toLowerCase().includes(q)
      )
    }
    return sortAdmins(list, sortBy)
  }, [adminMembers, roleFilter, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredAdmins.length / pageSize))
  const pagedAdmins = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    return filteredAdmins.slice(start, start + pageSize)
  }, [filteredAdmins, page, pageSize, totalPages])

  useEffect(() => {
    setPage(1)
  }, [search, roleFilter, sortBy, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

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
    setEditAdmin(admin)
    setEditRole(admin.role)
  }

  const openAdd = () => {
    setShowAdd(true)
    setAddError('')
    setAddEmail('')
    setAddRole('admin')
  }

  const canManage = (admin: AdminMember) => isSuperAdmin && admin.id !== user?.id && admin.role !== 'superadmin'

  const renderActions = (admin: AdminMember) => {
    const manage = canManage(admin)
    return (
      <AdminKebabMenu
        label={`Actions for ${admin.name || admin.email}`}
        items={[
          {
            label: 'Details',
            icon: <Eye className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
            onSelect: () => setDetails(admin),
          },
          {
            label: 'Edit role',
            icon: <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
            disabled: !manage,
            onSelect: () => openEdit(admin),
          },
          {
            label: 'Remove admin',
            icon: <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
            tone: 'danger',
            disabled: !manage,
            onSelect: () => void handleRemove(admin),
          },
        ]}
      />
    )
  }

  return (
    <div className="admin-scope flex h-full min-h-0 flex-col gap-4 pb-[calc(var(--admin-bottombar-h)+0.75rem)] md:pb-0">
      <AdminPageHeader
        title="Admin Users"
        actions={
          isSuperAdmin ? (
            <button type="button" onClick={openAdd} className={primaryButtonClass}>
              <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Add Admin
            </button>
          ) : null
        }
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Admins" value={adminMembers.length} />
        <AdminStatCard label="Super Admins" value={adminMembers.filter(admin => admin.role === 'superadmin').length} />
        <AdminStatCard label="Standard Admins" value={adminMembers.filter(admin => admin.role === 'admin').length} />
        <AdminStatCard label="You" value={adminMembers.some(admin => admin.id === user?.id) ? 'Included' : 'No'} />
      </div>

      {!isSuperAdmin && (
        <div className="flex gap-2 rounded-[var(--admin-radius)] border border-[color-mix(in_srgb,var(--admin-warning)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-warning)_10%,transparent)] px-3.5 py-3 text-[13px] font-semibold text-[var(--admin-warning)]">
          <Shield className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          <span>Only super admins can manage admin access.</span>
        </div>
      )}

      <section className="admin-card flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative block min-w-0">
            <span className="sr-only">Search admins</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              className="admin-input ps-10"
              placeholder="Search by name or email"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <label className="sr-only" htmlFor="admins-role-filter">
            Filter admin role
          </label>
          <select
            id="admins-role-filter"
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

          <label className="sr-only" htmlFor="admins-sort">
            Sort admins
          </label>
          <select
            id="admins-sort"
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

        {filteredAdmins.length === 0 ? (
          <AdminEmptyState
            icon={<UserCog className="h-5 w-5" strokeWidth={2} aria-hidden="true" />}
            title={adminMembers.length === 0 ? 'No admins loaded' : 'No admins match the current filters'}
            description="Admin team members appear here after they are available from the existing auth context."
            action={isSuperAdmin ? <button type="button" className={primaryButtonClass} onClick={openAdd}>Add Admin</button> : null}
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 md:block">
              <div className="admin-table-wrap h-full">
                <table className="w-full min-w-[760px] text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3 text-start">Admin</th>
                      <th className="px-3 py-3 text-start">Email</th>
                      <th className="px-3 py-3 text-start">Role</th>
                      <th className="px-3 py-3 text-start">Session</th>
                      <th className="px-3 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedAdmins.map(admin => {
                      const isYou = admin.id === user?.id
                      return (
                        <tr key={admin.id} className="border-t border-[var(--admin-border)] align-middle hover:bg-[var(--admin-surface-2)]">
                          <td className="px-3 py-2.5">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <UserAvatar
                                name={admin.name}
                                email={admin.email}
                                className={cn('h-10 w-10 rounded-[var(--admin-radius-sm)] text-[13px] font-bold', avatarClass(admin.role))}
                              />
                              <div className="min-w-0">
                                <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{admin.name}</div>
                                <div className="mt-0.5 truncate font-mono text-[11px] text-[var(--admin-text-muted)]">{admin.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <a className="block max-w-[260px] truncate text-[12px] font-semibold text-[var(--admin-accent)] hover:underline" href={`mailto:${admin.email}`}>
                              {admin.email}
                            </a>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={roleChipClass(admin.role)}>{roleLabel(admin.role)}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            {isYou ? <span className="admin-chip admin-chip--accent">Current session</span> : <span className="admin-chip">Team member</span>}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex justify-end">{renderActions(admin)}</div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              {pagedAdmins.map(admin => {
                const isYou = admin.id === user?.id
                return (
                  <article key={admin.id} className="admin-card p-3">
                    <div className="flex items-start gap-3">
                      <UserAvatar
                        name={admin.name}
                        email={admin.email}
                        className={cn('h-11 w-11 rounded-[var(--admin-radius-sm)] text-[14px] font-bold', avatarClass(admin.role))}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <h2 className="truncate text-[14px] font-black text-[var(--admin-text)]">{admin.name}</h2>
                          {isYou && <span className="admin-chip admin-chip--accent !py-0.5 !text-[10px]">You</span>}
                        </div>
                        <p className="mt-0.5 truncate text-[12px] font-semibold text-[var(--admin-text-muted)]">{admin.email}</p>
                      </div>
                      {renderActions(admin)}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={roleChipClass(admin.role)}>{roleLabel(admin.role)}</span>
                      {isYou ? <span className="admin-chip admin-chip--accent">Current session</span> : <span className="admin-chip">Team member</span>}
                    </div>
                  </article>
                )
              })}
            </div>

            <AdminPagination
              page={page}
              pageSize={pageSize}
              totalItems={filteredAdmins.length}
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
        title={details?.name || 'Admin Details'}
        subtitle={details ? 'Core identity and access information for this admin account.' : undefined}
        media={
          details ? (
            <div className="flex aspect-[16/9] items-center justify-center bg-[var(--admin-surface-2)]">
              <UserAvatar
                name={details.name}
                email={details.email}
                className="h-24 w-24 rounded-[24px]"
                fallbackClassName={cn('text-5xl font-bold', avatarClass(details.role))}
              />
            </div>
          ) : null
        }
        badges={
          details ? (
            <>
              <span className={roleChipClass(details.role)}>{roleLabel(details.role)}</span>
              {details.id === user?.id && <span className="admin-chip admin-chip--accent">Current session</span>}
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Email', value: details.email },
                { label: 'Role', value: roleLabel(details.role) },
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
                    { label: 'Role', value: roleLabel(details.role) },
                  ],
                },
              ]
            : []
        }
        actions={
          details && canManage(details) ? (
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

      <Modal
        open={showAdd}
        onClose={() => {
          if (!addSaving) setShowAdd(false)
        }}
        title="Add Admin"
        size="lg"
        dismissable={!addSaving}
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={() => setShowAdd(false)} className={controlButtonClass} disabled={addSaving}>
              Cancel
            </button>
            <button type="button" onClick={handleAdd} disabled={addSaving} className={primaryButtonClass}>
              {addSaving ? 'Searching...' : 'Add Admin'}
            </button>
          </div>
        }
      >
        <div className="admin-scope space-y-4">
          <p className="text-[13px] leading-6 text-[var(--admin-text-muted)]">
            Enter the email of a registered user to make them an admin.
          </p>

          <AdminField label="Email" htmlFor="add-admin-email" required error={addError || undefined}>
            <input
              id="add-admin-email"
              className={cn('admin-input', addError && 'admin-input--error')}
              type="email"
              placeholder="user@example.com"
              value={addEmail}
              onChange={event => {
                setAddEmail(event.target.value)
                setAddError('')
              }}
              onKeyDown={event => {
                if (event.key === 'Enter') void handleAdd()
              }}
            />
          </AdminField>

          <AdminField label="Role" htmlFor="add-admin-role">
            <select
              id="add-admin-role"
              className="admin-input"
              value={addRole}
              onChange={event => setAddRole(event.target.value as AdminRole)}
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </AdminField>
        </div>
      </Modal>

      <Modal
        open={!!editAdmin}
        onClose={() => {
          if (!editSaving) setEditAdmin(null)
        }}
        title={`Edit Role - ${editAdmin?.name || ''}`}
        size="lg"
        dismissable={!editSaving}
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <button type="button" onClick={() => void handleRemove()} disabled={editSaving} className={dangerButtonClass}>
              <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              Remove Admin
            </button>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <button type="button" onClick={() => setEditAdmin(null)} className={controlButtonClass} disabled={editSaving}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeRole}
                disabled={editSaving || !editAdmin || editRole === editAdmin.role}
                className={primaryButtonClass}
              >
                {editSaving ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        }
      >
        {editAdmin && (
          <div className="admin-scope space-y-4">
            <div className="flex items-center gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
              <UserAvatar
                name={editAdmin.name}
                email={editAdmin.email}
                className="h-11 w-11 rounded-[var(--admin-radius-sm)]"
                fallbackClassName={cn('text-sm font-bold', avatarClass(editAdmin.role))}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{editAdmin.name}</div>
                <div className="mt-0.5 truncate text-[12px] font-semibold text-[var(--admin-text-muted)]">{editAdmin.email}</div>
              </div>
              <span className={roleChipClass(editAdmin.role)}>{roleLabel(editAdmin.role)}</span>
            </div>

            <AdminField label="Role" htmlFor="edit-admin-role">
              <select
                id="edit-admin-role"
                className="admin-input"
                value={editRole}
                onChange={event => setEditRole(event.target.value as AdminRole)}
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </AdminField>
          </div>
        )}
      </Modal>
    </div>
  )
}
