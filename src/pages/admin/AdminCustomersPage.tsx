import { useEffect, useMemo, useState } from 'react'
import { Building2, ImageIcon, Pencil, Search, Trash2, UserPlus } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useDialog } from '../../contexts/DialogContext'
import type { Customer } from '../../data/customers'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import AdminEditorWorkspace, { AdminEditorSection } from '../../components/admin/AdminEditorWorkspace'
import AdminKebabMenu from '../../components/admin/AdminKebabMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminField from '../../components/admin/primitives/AdminField'
import AdminPagination from '../../components/admin/primitives/AdminPagination'
import CustomerCard from '../../components/customer/CustomerCard'
import { stripMediaTransform } from '../../utils/media-frame'
import { useAssetSession } from '../../hooks/useAssetSession'
import { deleteAssetsSafely } from '../../services/storage.service'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

type SortKey = 'name' | 'category' | 'slug'

const empty: Customer = { name: '', slug: '', logo: '', category: '' }
const PAGE_SIZE_OPTIONS = [12, 24, 48]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'name', label: 'Name A-Z' },
  { value: 'category', label: 'Category' },
  { value: 'slug', label: 'Slug' },
]

const controlButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3.5 text-[13px] font-bold text-[var(--admin-text)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-accent-soft)] hover:text-[var(--admin-accent)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

const primaryButtonClass =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--admin-radius-sm)] bg-[var(--admin-accent)] px-4 text-[13px] font-bold text-white transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--admin-accent-soft)] disabled:cursor-not-allowed disabled:opacity-50'

function sortCustomers(customers: Customer[], sortBy: SortKey) {
  const list = [...customers]
  switch (sortBy) {
    case 'category':
      return list.sort(
        (a, b) =>
          (a.category || 'Uncategorized').localeCompare(b.category || 'Uncategorized') ||
          a.name.localeCompare(b.name)
      )
    case 'slug':
      return list.sort((a, b) => a.slug.localeCompare(b.slug))
    case 'name':
    default:
      return list.sort((a, b) => a.name.localeCompare(b.name))
  }
}

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function categoryLabel(customer: Customer) {
  return customer.category?.trim() || 'Uncategorized'
}

function CustomerLogoThumb({ customer }: { customer: Customer }) {
  const logo = stripMediaTransform(customer.logo)

  return (
    <div className="flex h-12 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-2">
      {logo ? (
        <FramedImage
          media={logo}
          alt={customer.name}
          className="h-full w-full object-contain mix-blend-multiply"
          fallbackTransform={{ fit: 'contain' }}
        />
      ) : (
        <ImageIcon className="h-5 w-5 text-[var(--admin-text-muted)]" strokeWidth={1.8} aria-hidden="true" />
      )}
    </div>
  )
}

export default function AdminCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData()
  const dialog = useDialog()

  const [editing, setEditing] = useState<Customer | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  // Snapshot of the original logo the customer holds when the editor
  // opens. Never drifts as the user replaces/removes during editing.
  const [sessionOriginals, setSessionOriginals] = useState<string[]>([])
  // Distinct per-open key so consecutive opens of the same customer
  // (or `new`) always start a fresh session.
  const [openId, setOpenId] = useState(0)

  const {
    session,
    snapshot: sessionSnapshot,
    isUploading,
    isPersisting,
    canSave: canCommit,
    runPersistence,
    cancel,
  } = useAssetSession({
    sessionKey: editing ? openId : null,
    originalUrls: sessionOriginals,
  })
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortKey>('name')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(12)

  const cats = useMemo(() => {
    const list = Array.from(new Set(customers.map(c => (c.category || '').trim()).filter(Boolean)))
    return list.sort((a, b) => a.localeCompare(b))
  }, [customers])

  const filtered = useMemo(() => {
    let list = customers
    if (filterCat !== 'all') list = list.filter(customer => (customer.category || '').trim() === filterCat)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        customer =>
          customer.name.toLowerCase().includes(q) ||
          customer.slug.toLowerCase().includes(q) ||
          categoryLabel(customer).toLowerCase().includes(q)
      )
    }
    return sortCustomers(list, sortBy)
  }, [customers, filterCat, search, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pagedCustomers = useMemo(() => {
    const safePage = Math.min(Math.max(page, 1), totalPages)
    const start = (safePage - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize, totalPages])

  useEffect(() => {
    setPage(1)
  }, [search, filterCat, sortBy, pageSize])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const stats = useMemo(
    () => ({
      total: customers.length,
      categories: cats.length,
      withLogos: customers.filter(customer => Boolean(customer.logo)).length,
      missingLogos: customers.filter(customer => !customer.logo).length,
    }),
    [cats.length, customers]
  )

  const openNew = () => {
    setSessionOriginals([])
    setOpenId(id => id + 1)
    setEditing({ ...empty })
    setIsNew(true)
  }

  const openEdit = (customer: Customer) => {
    setSessionOriginals(customer.logo ? [customer.logo] : [])
    setOpenId(id => id + 1)
    setEditing({ ...customer })
    setIsNew(false)
  }

  const close = () => {
    if (saving) return
    // Cancel pending session uploads (never touches original logo).
    if (!sessionSnapshot.committed && !sessionSnapshot.disposed) {
      void cancel()
    }
    setEditing(null)
    setIsNew(false)
    setSessionOriginals([])
  }

  const up = (field: keyof Customer, value: string) => setEditing(current => (current ? { ...current, [field]: value } : null))

  // Prevent Save while uploads/conversions/persistence in flight,
  // session not ready to commit, or a submission is already in
  // progress.
  const canSave =
    !!editing?.name?.trim() && !isUploading && !isPersisting && !saving && canCommit

  const previewCustomer: Customer = {
    name: editing?.name?.trim() || 'Customer Name',
    slug: editing?.slug?.trim() || makeSlug(editing?.name || 'customer-name'),
    logo: editing?.logo || '',
    category: editing?.category || 'Category',
  }

  const renderCustomerPreview = (overrides?: Partial<Customer>) => (
    <div aria-hidden="true" className="mx-auto w-full max-w-[15rem] select-none [&_*]:pointer-events-none">
      <CustomerCard customer={{ ...previewCustomer, ...overrides }} />
    </div>
  )

  const save = async () => {
    if (!editing || !canSave) return

    const slug = editing.slug?.trim() || makeSlug(editing.name)
    const data = { ...editing, slug }

    setSaving(true)
    try {
      const outcome = await runPersistence({
        mutate: async () => {
          if (isNew) await addCustomer(data)
          else await updateCustomer(data.slug, data)
          return data
        },
        finalRefs: result => [result.logo],
      })
      if (outcome.status === 'success') {
        if (outcome.cleanup.failed.length > 0) {
          console.warn('[Customers] storage cleanup partial failure', outcome.cleanup.failed)
        }
        close()
      } else if (!outcome.disposed) {
        dialog.alert({
          title: 'Error',
          message: getErrorMessage(outcome.error, 'Failed to save'),
          variant: 'danger',
        })
      }
    } catch (err: unknown) {
      console.error('[Customers] runPersistence rejected', err)
      dialog.alert({
        title: 'Error',
        message: getErrorMessage(err, 'Save cannot start right now'),
        variant: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (customer: Customer) => {
    const ok = await dialog.confirm({
      title: 'Delete Customer?',
      message: 'This will permanently remove ' + customer.name + '.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    // Snapshot logo refs BEFORE DB delete so we retain the URL after
    // the row is gone.
    const mediaRefs = customer.logo ? [customer.logo] : []
    try {
      await deleteCustomer(customer.slug)
      // DB delete succeeded → clean storage. Cleanup errors are
      // reported separately from the DB result.
      if (mediaRefs.length > 0) {
        const cleanup = await deleteAssetsSafely(mediaRefs)
        if (cleanup.failed.length > 0) {
          console.warn('[Customers] entity-delete cleanup partial failure', cleanup.failed)
        }
      }
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to delete'), variant: 'danger' })
    }
  }

  const renderActions = (customer: Customer) => (
    <AdminKebabMenu
      label={`Actions for ${customer.name}`}
      items={[
        {
          label: 'Edit',
          icon: <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
          onSelect: () => openEdit(customer),
        },
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden="true" />,
          tone: 'danger',
          onSelect: () => void deleteItem(customer),
        },
      ]}
    />
  )

  return (
    <div className="admin-scope flex h-full min-h-0 flex-col gap-4 pt-3 pb-[calc(var(--admin-bottombar-h)+0.75rem)] md:pt-0 md:pb-0">
      <AdminPageHeader
        title="Customers"
        actions={
          <button type="button" onClick={openNew} className={primaryButtonClass}>
            <UserPlus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            Add Customer
          </button>
        }
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Customers" value={stats.total} />
        <AdminStatCard label="Categories" value={stats.categories} />
        <AdminStatCard label="With Logos" value={stats.withLogos} />
        <AdminStatCard label="Missing Logos" value={stats.missingLogos} />
      </div>

      <section className="admin-card flex min-h-0 flex-1 flex-col gap-3 p-3">
        <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_200px_180px]">
          <label className="relative block min-w-0">
            <span className="sr-only">Search customers</span>
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              className="admin-input ps-10"
              placeholder="Search by name, slug, or category"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <label className="sr-only" htmlFor="customers-category-filter">
            Filter customers by category
          </label>
          <select
            id="customers-category-filter"
            className="admin-input"
            value={filterCat}
            onChange={event => setFilterCat(event.target.value)}
          >
            <option value="all">All categories</option>
            {cats.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <label className="sr-only" htmlFor="customers-sort">
            Sort customers
          </label>
          <select
            id="customers-sort"
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

        {filtered.length === 0 ? (
          <AdminEmptyState
            icon={<Building2 className="h-5 w-5" strokeWidth={2} aria-hidden="true" />}
            title={customers.length === 0 ? 'No customers yet' : 'No customers match the current filters'}
            description="Customer logos and groupings can be managed without changing the storefront data flow."
            action={<button type="button" className={primaryButtonClass} onClick={openNew}>Add Customer</button>}
          />
        ) : (
          <>
            <div className="hidden min-h-0 flex-1 md:block">
              <div className="admin-table-wrap h-full">
                <table className="w-full min-w-[760px] text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-3 text-start">Customer</th>
                      <th className="px-3 py-3 text-start">Slug</th>
                      <th className="px-3 py-3 text-start">Category</th>
                      <th className="px-3 py-3 text-start">Logo</th>
                      <th className="px-3 py-3 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedCustomers.map(customer => (
                      <tr key={customer.slug} className="border-t border-[var(--admin-border)] align-middle hover:bg-[var(--admin-surface-2)]">
                        <td className="px-3 py-2.5">
                          <div className="flex min-w-0 items-center gap-2.5">
                            <CustomerLogoThumb customer={customer} />
                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{customer.name}</div>
                              <div className="mt-0.5 text-[11px] font-semibold text-[var(--admin-text-muted)]">
                                Public logo card source
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[12px] font-semibold text-[var(--admin-text-muted)]">
                          {customer.slug || '-'}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="admin-chip admin-chip--accent">{categoryLabel(customer)}</span>
                        </td>
                        <td className="px-3 py-2.5">
                          {customer.logo ? <span className="admin-chip admin-chip--success">Ready</span> : <span className="admin-chip admin-chip--warning">Missing</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex justify-end">{renderActions(customer)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-3 md:hidden">
              {pagedCustomers.map(customer => (
                <article key={customer.slug} className="admin-card p-3">
                  <div className="flex items-start gap-3">
                    <CustomerLogoThumb customer={customer} />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-[14px] font-black text-[var(--admin-text)]">{customer.name}</h2>
                      <p className="mt-0.5 truncate font-mono text-[11px] font-semibold text-[var(--admin-text-muted)]">
                        {customer.slug || '-'}
                      </p>
                    </div>
                    {renderActions(customer)}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="admin-chip admin-chip--accent">{categoryLabel(customer)}</span>
                    {customer.logo ? <span className="admin-chip admin-chip--success">Logo ready</span> : <span className="admin-chip admin-chip--warning">Logo missing</span>}
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

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? 'Add Customer' : 'Edit Customer'}
        dismissable={!saving}
        size="xl"
        bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={close} className={controlButtonClass} disabled={saving}>
              Cancel
            </button>
            <button type="button" onClick={save} disabled={saving || !canSave} className={primaryButtonClass}>
              {saving ? 'Saving...' : isNew ? 'Add Customer' : 'Save Changes'}
            </button>
          </div>
        }
      >
        {editing && (
          <AdminEditorWorkspace
            preview={renderCustomerPreview()}
            previewTitle="Live Customer Card"
            previewHint="Matches the customer card shown on the public customers page."
            previewPaneClassName="xl:max-w-[19rem] xl:justify-self-end"
          >
            <AdminEditorSection title="Identity" hint="Name, slug, and category define how this customer is grouped in admin.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <AdminField
                  label="Name"
                  htmlFor="customer-name"
                  required
                  error={!editing.name.trim() ? 'Name is required.' : undefined}
                  className="sm:col-span-2"
                >
                  <input
                    id="customer-name"
                    className={cn('admin-input', !editing.name.trim() && 'admin-input--error')}
                    value={editing.name}
                    onChange={event => up('name', event.target.value)}
                  />
                </AdminField>

                <AdminField
                  label="Slug"
                  htmlFor="customer-slug"
                  hint={isNew ? 'Leave blank to generate from the customer name.' : 'Slug is locked after creation.'}
                >
                  <input
                    id="customer-slug"
                    className="admin-input"
                    value={editing.slug}
                    onChange={event => up('slug', event.target.value)}
                    disabled={!isNew}
                    placeholder={editing.name ? makeSlug(editing.name) : 'auto-generated'}
                  />
                </AdminField>

                <AdminField label="Category" htmlFor="customer-category">
                  <input
                    id="customer-category"
                    className="admin-input"
                    value={editing.category || ''}
                    onChange={event => up('category', event.target.value)}
                    list="customer-categories"
                  />
                  <datalist id="customer-categories">
                    {cats.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </AdminField>
              </div>
            </AdminEditorSection>

            <AdminEditorSection title="Logo" hint="Upload, replace, remove, or frame the customer logo before saving.">
              <ImageUploader
                variant="logo"
                label="Logo"
                value={editing.logo}
                onChange={url => setEditing(current => (current ? { ...current, logo: url } : null))}
                removable
                // Form-state only — the persisted logo is retained
                // until Save commits or the session cancels.
                onRemove={() => setEditing(current => (current ? { ...current, logo: '' } : null))}
                folder="customers"
                session={session}
                frameAspect={1}
                defaultFit="contain"
                frameTitle="Adjust Customer Logo"
                frameHint="Keep the full logo visible with clean breathing room inside the customer card."
                renderFrameContextPreview={media => renderCustomerPreview({ logo: media })}
                frameContextTitle="Customer Card Result"
                frameContextHint="Matches the card on the public customers page while you refine the logo."
                ignoreTransformPreview
                resetFrameOnOpen
              />
            </AdminEditorSection>
          </AdminEditorWorkspace>
        )}
      </Modal>
    </div>
  )
}
