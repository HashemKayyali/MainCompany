import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Edit, Eye, Plus, Search } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useDialog } from '../../contexts/DialogContext'
import type { ProductPart } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminKebabMenu, { type AdminKebabItem } from '../../components/admin/AdminKebabMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminBadge from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

const emptyPart: ProductPart = {
  id: '',
  productSlug: '',
  name: '',
  description: '',
  price: 0,
  currency: 'JOD',
  image: '',
  inStock: true,
  showPrice: true,
}

const PAGE_SIZE_OPTIONS = [12, 24, 48]

type PartStatusFilter = 'all' | 'in_stock' | 'out_of_stock' | 'price_visible' | 'price_hidden'
type PartSort = 'name' | 'product' | 'price_desc' | 'price_asc' | 'stock'

function FieldSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="admin-card p-4">
      <div className="flex flex-col gap-1.5 border-b border-[var(--admin-border)] pb-3">
        <h3 className="admin-section-title">{title}</h3>
        {description && <p className="text-[12px] leading-5 text-[var(--admin-text-muted)]">{description}</p>}
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2.5">
      <div className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">{label}</div>
      <div className="mt-1 truncate text-[13px] font-bold leading-5 text-[var(--admin-text)]">{value}</div>
    </div>
  )
}

function PartThumb({ part, compact = false }: { part: ProductPart; compact?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]',
        compact ? 'h-12 w-16' : 'aspect-[16/10] w-full p-4'
      )}
    >
      {part.image ? (
        <FramedImage
          media={part.image}
          alt={part.name}
          className="h-full w-full"
          fallbackTransform={{ fit: 'contain' }}
          onError={event => {
            ;(event.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-text-muted)]">No image</span>
      )}
    </div>
  )
}

function CompactPartPreview({ part, productName }: { part: ProductPart; productName: string }) {
  return (
    <div className="mx-auto w-full max-w-[18rem] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <PartThumb part={part} />
      <div className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-[14px] font-black text-[var(--admin-text)]">{part.name || 'Part name'}</div>
            <div className="truncate text-[11px] font-semibold text-[var(--admin-text-muted)]">{productName || 'Linked product'}</div>
          </div>
          <AdminBadge tone={part.inStock ? 'success' : 'danger'}>{part.inStock ? 'In stock' : 'Out'}</AdminBadge>
        </div>
        <p className="line-clamp-2 text-[12px] font-semibold leading-5 text-[var(--admin-text-muted)]">
          {part.description || 'Short part description appears here.'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <AdminBadge tone={part.showPrice === false ? 'warning' : 'accent'}>
            {part.showPrice === false ? 'Price hidden' : `${Number(part.price || 0).toFixed(2)} ${part.currency || 'JOD'}`}
          </AdminBadge>
        </div>
      </div>
    </div>
  )
}

export default function AdminPartsPage() {
  const { parts, products, addPart, updatePart, deletePart } = useData()
  const dialog = useDialog()

  const [editing, setEditing] = useState<ProductPart | null>(null)
  const [details, setDetails] = useState<ProductPart | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ProductPart | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [productFilter, setProductFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<PartStatusFilter>('all')
  const [sortKey, setSortKey] = useState<PartSort>('name')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)

  const getProductName = (slug: string) => products.find(product => product.slug === slug)?.name || slug || 'Unlinked'
  const countForProduct = (slug: string) => parts.filter(part => part.productSlug === slug).length

  const rows = useMemo(
    () =>
      parts.map(part => ({
        part,
        productName: getProductName(part.productSlug),
      })),
    [parts, products]
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return rows
      .filter(({ part, productName }) => {
        if (productFilter !== 'all' && part.productSlug !== productFilter) return false
        if (statusFilter === 'in_stock' && !part.inStock) return false
        if (statusFilter === 'out_of_stock' && part.inStock) return false
        if (statusFilter === 'price_visible' && part.showPrice === false) return false
        if (statusFilter === 'price_hidden' && part.showPrice !== false) return false
        if (!needle) return true
        return (
          part.name.toLowerCase().includes(needle) ||
          part.description.toLowerCase().includes(needle) ||
          part.productSlug.toLowerCase().includes(needle) ||
          productName.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        if (sortKey === 'product') return a.productName.localeCompare(b.productName) || a.part.name.localeCompare(b.part.name)
        if (sortKey === 'price_desc') return b.part.price - a.part.price || a.part.name.localeCompare(b.part.name)
        if (sortKey === 'price_asc') return a.part.price - b.part.price || a.part.name.localeCompare(b.part.name)
        if (sortKey === 'stock') return Number(b.part.inStock) - Number(a.part.inStock) || a.part.name.localeCompare(b.part.name)
        return a.part.name.localeCompare(b.part.name)
      })
  }, [productFilter, rows, search, sortKey, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const showingStart = filtered.length ? (currentPage - 1) * pageSize + 1 : 0
  const showingEnd = Math.min(currentPage * pageSize, filtered.length)

  useEffect(() => {
    setPage(1)
  }, [pageSize, productFilter, search, sortKey, statusFilter])

  const openNew = () => {
    setEditing({ ...emptyPart, id: `part-${Date.now()}` })
    setIsNew(true)
  }

  const openEdit = (part: ProductPart) => {
    setEditing({ ...part, showPrice: part.showPrice !== false })
    setIsNew(false)
  }

  const closeEditor = () => {
    setEditing(null)
    setIsNew(false)
  }

  const updateEditing = <K extends keyof ProductPart>(key: K, value: ProductPart[K]) => {
    setEditing(current => (current ? { ...current, [key]: value } : null))
  }

  const canSave = Boolean(editing?.productSlug && editing?.name?.trim())

  const save = async () => {
    if (!editing || !canSave) return
    const payload: ProductPart = {
      ...editing,
      name: editing.name.trim(),
      description: editing.description.trim(),
      price: Number(editing.price || 0),
      currency: editing.currency || 'JOD',
      inStock: Boolean(editing.inStock),
      showPrice: editing.showPrice !== false,
    }

    setSaving(true)
    try {
      if (isNew) await addPart(payload)
      else await updatePart(payload.id, payload)
      closeEditor()
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to save'), variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePart(deleteTarget.id)
      if (details?.id === deleteTarget.id) setDetails(null)
      setDeleteTarget(null)
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to delete'), variant: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const actionItems = (part: ProductPart): AdminKebabItem[] => [
    { label: 'Delete part', tone: 'danger', onSelect: () => setDeleteTarget(part) },
  ]

  const statusChips: Array<[PartStatusFilter, string]> = [
    ['all', `All (${parts.length})`],
    ['in_stock', `In stock (${parts.filter(part => part.inStock).length})`],
    ['out_of_stock', `Out (${parts.filter(part => !part.inStock).length})`],
    ['price_visible', `Price shown (${parts.filter(part => part.showPrice !== false).length})`],
    ['price_hidden', `Price hidden (${parts.filter(part => part.showPrice === false).length})`],
  ]

  const previewPart = editing || emptyPart
  const previewProductName = getProductName(previewPart.productSlug)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Parts & Spares"
        actions={
          <AdminButton size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add Part
          </AdminButton>
        }
      />

      <div className="admin-card flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_180px_170px_160px]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" strokeWidth={2} aria-hidden="true" />
            <input
              className="admin-input ps-9 pe-16"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search part, product, description..."
              aria-label="Search parts"
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--admin-text-muted)]">
              {filtered.length}/{parts.length}
            </span>
          </div>

          <select className="admin-input" value={productFilter} onChange={event => setProductFilter(event.target.value)} aria-label="Filter by linked product">
            <option value="all">All products</option>
            {products.map(product => (
              <option key={product.slug} value={product.slug}>
                {product.name} ({countForProduct(product.slug)})
              </option>
            ))}
          </select>

          <select className="admin-input" value={sortKey} onChange={event => setSortKey(event.target.value as PartSort)} aria-label="Sort parts">
            <option value="name">Name</option>
            <option value="product">Linked product</option>
            <option value="price_desc">Price high to low</option>
            <option value="price_asc">Price low to high</option>
            <option value="stock">Stock status</option>
          </select>

          <select className="admin-input" value={pageSize} onChange={event => setPageSize(Number(event.target.value))} aria-label="Page size">
            {PAGE_SIZE_OPTIONS.map(value => (
              <option key={value} value={value}>
                {value} per page
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2.5 flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {statusChips.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={cn(
                'inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center rounded-full border px-3.5 text-[12px] font-bold transition',
                statusFilter === value
                  ? 'border-transparent bg-[var(--admin-accent)] text-white'
                  : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <AdminEmptyState
              title={parts.length ? 'No parts match this view' : 'No parts yet'}
              description={parts.length ? 'Try another product, status, sort, or search.' : 'Add the first spare part and link it to a product.'}
              action={
                <AdminButton size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Add Part
                </AdminButton>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-3 hidden min-h-0 flex-1 overflow-y-auto md:block">
              <div className="admin-table-wrap">
                <table className="min-w-[920px] w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-2.5 text-start">Part</th>
                      <th className="px-3 py-2.5 text-start">Product</th>
                      <th className="px-3 py-2.5 text-start">Stock</th>
                      <th className="px-3 py-2.5 text-start">Price</th>
                      <th className="px-3 py-2.5 text-start">Flags</th>
                      <th className="px-3 py-2.5 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(({ part, productName }) => (
                      <tr key={part.id} className="border-t border-[var(--admin-border)] align-middle">
                        <td className="px-3 py-2.5">
                          <div className="flex max-w-[320px] items-center gap-2.5">
                            <PartThumb part={part} compact />
                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{part.name}</div>
                              <div className="line-clamp-1 text-[11px] text-[var(--admin-text-muted)]">{part.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone="accent">{productName}</AdminBadge>
                        </td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone={part.inStock ? 'success' : 'danger'}>{part.inStock ? 'In stock' : 'Out of stock'}</AdminBadge>
                        </td>
                        <td className="px-3 py-2.5 text-[13px] font-bold tabular-nums text-[var(--admin-text)]">
                          {Number(part.price || 0).toFixed(2)} {part.currency || 'JOD'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {part.showPrice === false ? <AdminBadge tone="warning">Price hidden</AdminBadge> : <AdminBadge tone="accent">Price shown</AdminBadge>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminButton size="sm" variant="outline" onClick={() => setDetails(part)}>
                              <Eye className="h-4 w-4" aria-hidden="true" />
                              Details
                            </AdminButton>
                            <AdminButton size="sm" onClick={() => openEdit(part)}>
                              <Edit className="h-4 w-4" aria-hidden="true" />
                              Edit
                            </AdminButton>
                            <AdminKebabMenu label={`More actions for ${part.name}`} items={actionItems(part)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pe-0.5 md:hidden">
              <div className="grid grid-cols-1 gap-2.5">
                {pageItems.map(({ part, productName }) => (
                  <article key={part.id} className="admin-card p-3">
                    <div className="flex items-start gap-3">
                      <PartThumb part={part} compact />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="truncate text-[14px] font-black text-[var(--admin-text)]">{part.name}</h2>
                            <p className="truncate text-[11px] font-semibold text-[var(--admin-text-muted)]">{productName}</p>
                          </div>
                          <AdminBadge tone={part.inStock ? 'success' : 'danger'}>{part.inStock ? 'In stock' : 'Out'}</AdminBadge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[var(--admin-text-muted)]">{part.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Fact label="Price" value={`${Number(part.price || 0).toFixed(2)} ${part.currency || 'JOD'}`} />
                      <Fact label="Price shown" value={part.showPrice === false ? 'No' : 'Yes'} />
                      <Fact label="Image" value={part.image ? 'Ready' : 'Missing'} />
                    </div>
                    <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                      <AdminButton size="sm" variant="outline" onClick={() => setDetails(part)}>Details</AdminButton>
                      <AdminButton size="sm" onClick={() => openEdit(part)}>Edit</AdminButton>
                      <AdminKebabMenu label={`More actions for ${part.name}`} items={actionItems(part)} />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                Showing {showingStart}-{showingEnd} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <AdminButton size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>
                  Previous
                </AdminButton>
                <span className="min-w-[72px] text-center tabular-nums">
                  {currentPage} / {pageCount}
                </span>
                <AdminButton size="sm" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>
                  Next
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.name || 'Part Details'}
        size="2xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          details ? (
            <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
              <AdminButton variant="ghost" onClick={() => setDetails(null)} className="sm:min-w-[96px]">Close</AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  const part = details
                  setDetails(null)
                  openEdit(part)
                }}
                className="sm:min-w-[120px]"
              >
                Edit Part
              </AdminButton>
              <AdminKebabMenu label={`More actions for ${details.name}`} items={actionItems(details)} />
            </div>
          ) : undefined
        }
      >
        {details && (
          <div className="admin-scope space-y-4">
            <section className="admin-card overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]">
                <div className="bg-[var(--admin-surface-2)] p-3">
                  <PartThumb part={details} />
                </div>
                <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone="accent">{getProductName(details.productSlug)}</AdminBadge>
                      <AdminBadge tone={details.inStock ? 'success' : 'danger'}>{details.inStock ? 'In stock' : 'Out of stock'}</AdminBadge>
                      {details.showPrice === false && <AdminBadge tone="warning">Price hidden</AdminBadge>}
                    </div>
                    <h3 className="mt-3 text-[1.2rem] font-black text-[var(--admin-text)]">{details.name}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--admin-text-muted)]">{details.description || 'No description has been added.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Fact label="Price" value={`${Number(details.price || 0).toFixed(2)} ${details.currency || 'JOD'}`} />
                    <Fact label="Image" value={details.image ? 'Uploaded' : 'Missing'} />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Fact label="Name" value={details.name} />
              <Fact label="Product" value={getProductName(details.productSlug)} />
              <Fact label="Stock" value={details.inStock ? 'Available' : 'Out of stock'} />
              <Fact label="Price visible" value={details.showPrice === false ? 'No' : 'Yes'} />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={closeEditor}
        title={isNew ? 'Add Part' : 'Edit Part'}
        persistent
        size="3xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] leading-5 text-[var(--admin-text-muted)]">
              Stock: <span className="font-bold text-[var(--admin-text)]">{editing?.inStock ? 'In stock' : 'Out'}</span>
              {' | '}Price: <span className="font-bold text-[var(--admin-text)]">{editing?.showPrice === false ? 'Hidden' : 'Shown'}</span>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <AdminButton variant="ghost" onClick={closeEditor} disabled={saving} className="sm:min-w-[110px]">Cancel</AdminButton>
              <AdminButton onClick={save} loading={saving} disabled={!canSave} className="sm:min-w-[130px]">
                {isNew ? 'Add Part' : 'Save Changes'}
              </AdminButton>
            </div>
          </div>
        }
      >
        {editing && (
          <div className="admin-scope grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
              <FieldSection title="Part Content" description="Keep identity, product relation, price, and stock scannable in one compact form.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="part-product">Linked product *</label>
                    <select
                      id="part-product"
                      className={cn('admin-input', !editing.productSlug && 'admin-input--error')}
                      value={editing.productSlug}
                      onChange={event => updateEditing('productSlug', event.target.value)}
                    >
                      <option value="">Select product...</option>
                      {products.map(product => (
                        <option key={product.slug} value={product.slug}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                    {!editing.productSlug && <p className="mt-1 text-[11px] font-semibold text-[var(--admin-danger)]">Product is required.</p>}
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="part-name">Name *</label>
                    <input
                      id="part-name"
                      className={cn('admin-input', !editing.name.trim() && 'admin-input--error')}
                      value={editing.name}
                      onChange={event => updateEditing('name', event.target.value)}
                      placeholder="Part name"
                    />
                    {!editing.name.trim() && <p className="mt-1 text-[11px] font-semibold text-[var(--admin-danger)]">Name is required.</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label className="admin-label mb-1.5" htmlFor="part-description">Description</label>
                    <input
                      id="part-description"
                      className="admin-input"
                      value={editing.description}
                      onChange={event => updateEditing('description', event.target.value)}
                      placeholder="Short description"
                    />
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="part-price">Price</label>
                    <input
                      id="part-price"
                      className="admin-input"
                      type="number"
                      min={0}
                      step="0.01"
                      value={editing.price}
                      onChange={event => updateEditing('price', Number(event.target.value))}
                    />
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="part-currency">Currency</label>
                    <input
                      id="part-currency"
                      className="admin-input"
                      value={editing.currency}
                      onChange={event => updateEditing('currency', event.target.value)}
                      placeholder="JOD"
                    />
                  </div>
                </div>
              </FieldSection>

              <FieldSection title="Stock / Flags" description="Status toggles are large enough for mobile and easy to scan on desktop.">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3">
                    <input
                      type="checkbox"
                      checked={editing.inStock}
                      onChange={event => updateEditing('inStock', event.target.checked)}
                      className="h-5 w-5 accent-violet-600"
                    />
                    <span className="text-[13px] font-bold text-[var(--admin-text)]">In stock</span>
                  </label>
                  <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3">
                    <input
                      type="checkbox"
                      checked={editing.showPrice !== false}
                      onChange={event => updateEditing('showPrice', event.target.checked)}
                      className="h-5 w-5 accent-violet-600"
                    />
                    <span className="text-[13px] font-bold text-[var(--admin-text)]">Show price</span>
                  </label>
                </div>
              </FieldSection>

              <FieldSection title="Part Image" description="Frame the part image without letting the preview dominate the editor.">
                <ImageUploader
                  label="Part image"
                  value={editing.image}
                  onChange={url => updateEditing('image', url)}
                  removable
                  onRemove={() => updateEditing('image', '')}
                  folder="parts"
                  frameAspect={1}
                  defaultFit="contain"
                  frameTitle="Adjust Part Image"
                  frameHint="Place the part neatly inside the square product-part frame."
                  previewAspectClass="aspect-square"
                  renderFrameContextPreview={media => (
                    <CompactPartPreview part={{ ...previewPart, image: media }} productName={previewProductName} />
                  )}
                  frameContextTitle="Part Card"
                  frameContextHint="Check the compact part card while framing."
                />
              </FieldSection>
            </div>

            <aside className="min-w-0 xl:sticky xl:top-0 xl:self-start">
              <FieldSection title="Compact Preview" description="A small admin preview of the part listing card.">
                <CompactPartPreview part={previewPart} productName={previewProductName} />
              </FieldSection>
            </aside>
          </div>
        )}
      </Modal>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete Part?"
        description={deleteTarget ? `This will permanently remove ${deleteTarget.name}.` : undefined}
        tone="danger"
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
