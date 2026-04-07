import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { ProductPart } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminEditorWorkspace, { AdminEditorSection } from '../../components/admin/AdminEditorWorkspace'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminStatCard from '../../components/admin/AdminStatCard'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
import { cn } from '../../utils/cn'

const emptyPart: ProductPart = {
  id: '',
  productSlug: '',
  name: '',
  description: '',
  price: 0,
  currency: 'JOD',
  image: '',
  inStock: true,
}


export default function AdminPartsPage() {
  const { parts, products, addPart, updatePart, deletePart } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<ProductPart | null>(null)
  const [details, setDetails] = useState<ProductPart | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterSlug, setFilterSlug] = useState('all')
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('parts')

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

  const getProductName = (slug: string) => products.find(p => p.slug === slug)?.name || slug
  const countFor = (slug: string) => parts.filter(part => part.productSlug === slug).length

  const filtered = useMemo(() => {
    return filterSlug === 'all' ? parts : parts.filter(part => part.productSlug === filterSlug)
  }, [parts, filterSlug])

  const openNew = () => {
    setEditing({ ...emptyPart, id: `part-${Date.now()}` })
    setIsNew(true)
  }

  const openEdit = (part: ProductPart) => {
    setEditing({ ...part })
    setIsNew(false)
  }

  const close = () => {
    setEditing(null)
    setIsNew(false)
  }

  const up = (f: keyof ProductPart, v: any) => setEditing(e => (e ? { ...e, [f]: v } : null))
  const canSave = !!editing?.productSlug && !!editing?.name?.trim()

  const save = async () => {
    if (!editing || !canSave) return
    setSaving(true)
    try {
      if (isNew) await addPart(editing)
      else await updatePart(editing.id, editing)
      close()
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to save', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const removePart = async (part: ProductPart) => {
    const ok = await dialog.confirm({
      title: 'Delete Part?',
      message: 'This will permanently remove this part.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await deletePart(part.id)
      if (details?.id === part.id) setDetails(null)
    } catch (e: any) {
      dialog.alert({ title: 'Error', message: e.message || 'Failed to delete', variant: 'danger' })
    }
  }

  const chipCls = (active: boolean) =>
    active
      ? isDark
        ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.3)]'
        : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.22)]'
      : isDark
        ? 'bg-[#0f1630]/96 text-purple-100/78 ring-1 ring-inset ring-cyan-400/10 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)] hover:bg-[#111a39]'
        : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-gray-50'

  const previewPart: ProductPart = editing || emptyPart

  const renderPartPreview = (overrides?: Partial<ProductPart>) => {
    const preview = { ...previewPart, ...overrides }

    return (
      <div aria-hidden="true" className="mx-auto max-w-[320px] select-none">
        <AdminEntityCard
          variant="grid"
          minHeightClassName="min-h-[228px]"
          bodyClassName="gap-2 p-3"
          media={
            preview.image ? (
              <div className={cn('aspect-[16/10] h-full w-full overflow-hidden rounded-[20px] p-4', isDark ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.10),transparent_60%)]' : 'bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_60%)]')}>
                <FramedImage media={preview.image} alt={preview.name} className="h-full w-full" fallbackTransform={{ fit: 'contain' }} />
              </div>
            ) : (
              <div className={cn('flex h-full w-full items-center justify-center rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <div className={cn('text-[11px] font-mono uppercase tracking-[0.24em]', sub)}>No image</div>
              </div>
            )
          }
          mediaOverlayLeft={
            <span className={cn('rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'border-white/10 bg-black/35 text-purple-100/75' : 'border-white/80 bg-white/90 text-gray-600')}>
              Part
            </span>
          }
          mediaOverlayRight={
            <span className={cn('rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em]', preview.inStock ? (isDark ? 'border-cyan-400/20 bg-cyan-400/12 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700') : (isDark ? 'border-red-400/20 bg-red-400/12 text-red-200' : 'border-red-200 bg-red-50 text-red-700'))}>
              {preview.inStock ? 'In stock' : 'Out'}
            </span>
          }
          title={preview.name || 'Part Name'}
          subtitle={preview.description || undefined}
          badges={
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                {preview.productSlug ? getProductName(preview.productSlug) : 'Linked product'}
              </span>
            </>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Parts & Spares"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            <button onClick={openNew} className="btn-admin-create">
              + Add Part
            </button>
          </>
        }
      />

      <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Total Parts" value={parts.length} />
        <AdminStatCard label="Shown" value={filtered.length} />
        <AdminStatCard label="Products Covered" value={parts.filter(part => !!part.productSlug).length} />
        <AdminStatCard label="In Stock" value={parts.filter(part => part.inStock).length} />
      </div>

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[22px] p-2.5',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterSlug('all')}
            className={cn('inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-[11px] font-semibold transition active:translate-y-[1px]', chipCls(filterSlug === 'all'))}
          >
            All ({parts.length})
          </button>
          {products.map(product => (
            <button
              key={product.slug}
              onClick={() => setFilterSlug(product.slug)}
              className={cn('inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-[11px] font-semibold transition active:translate-y-[1px]', chipCls(filterSlug === product.slug))}
            >
              {product.name} ({countFor(product.slug)})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={cn('flex flex-1 items-center justify-center rounded-[18px] border px-5 py-11 text-center text-[13px]', isDark ? 'border-white/10 text-purple-200/70' : 'border-gray-100 text-gray-500')}>
            No parts match this filter.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
            <div className={cardsLayoutClass}>
              {filtered.map(part => (
                <AdminEntityCard
                key={part.id}
                variant={getAdminEntityVariant(displayCardView)}
                minHeightClassName={displayCardView === 'grid' ? 'min-h-[228px]' : 'min-h-[98px]'}
                bodyClassName={displayCardView === 'grid' ? 'gap-2 p-3' : 'gap-1.5 p-2.5'}
                  listMediaWrapClassName="md:self-center"
                listMediaFrameClassName="!h-[78px] !w-[116px] md:!h-[78px] md:!w-[116px] !rounded-[18px] !bg-transparent !ring-0 !p-0"
                factsWrapClassName={displayCardView === 'list' ? 'xl:w-[156px]' : undefined}
                actionsWrapClassName={displayCardView === 'list' ? 'xl:w-[118px]' : undefined}
                media={
                  part.image ? (
                    <div className={cn('aspect-[16/10] h-full w-full overflow-hidden rounded-[20px] p-4', isDark ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.10),transparent_60%)]' : 'bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_60%)]')}>
                      <FramedImage media={part.image} alt={part.name} className="h-full w-full" fallbackTransform={{ fit: 'contain' }} />
                    </div>
                  ) : (
                    <div className={cn('flex h-full w-full items-center justify-center rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                      <div className={cn('text-[11px] font-mono uppercase tracking-[0.24em]', sub)}>No image</div>
                    </div>
                  )
                }
                mediaOverlayLeft={
                  <span className={cn('rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'border-white/10 bg-black/35 text-purple-100/75' : 'border-white/80 bg-white/90 text-gray-600')}>
                    Part
                  </span>
                }
                mediaOverlayRight={
                  <span className={cn('rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em]', part.inStock ? (isDark ? 'border-cyan-400/20 bg-cyan-400/12 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700') : (isDark ? 'border-red-400/20 bg-red-400/12 text-red-200' : 'border-red-200 bg-red-50 text-red-700'))}>
                    {part.inStock ? 'In stock' : 'Out'}
                  </span>
                }
                title={part.name}
                  subtitle={part.description || undefined}
                badges={
                  <>
                    <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                      {getProductName(part.productSlug)}
                    </span>
                  </>
                }
                facts={[
                  { label: 'Stock', value: part.inStock ? 'Available' : 'Out of stock' },
                  { label: 'Price', value: `${part.price} ${part.currency}` },
                ]}
                actions={
                  <>
                    <AdminActionButton
                      tone="primary"
                      onClick={event => {
                        event.stopPropagation()
                        setDetails(part)
                      }}
                    >
                      Details
                    </AdminActionButton>
                    <AdminActionButton
                      onClick={event => {
                        event.stopPropagation()
                        openEdit(part)
                      }}
                    >
                      Edit
                    </AdminActionButton>
                    <AdminActionButton
                      tone="danger"
                      onClick={event => {
                        event.stopPropagation()
                        void removePart(part)
                      }}
                    >
                      Delete
                    </AdminActionButton>
                  </>
                }
                />
              ))}
            </div>
            </div>
          </div>
        )}
      </div>

      <AdminDetailModal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.name || 'Part Details'}
        subtitle={details ? 'Details now carry the longer context, so the listing card stays clean and easy to scan.' : undefined}
        media={
          details ? (
            details.image ? (
              <div className={cn('aspect-[16/9] p-10', isDark ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_58%)]' : 'bg-[radial-gradient(circle,rgba(139,92,246,0.10),transparent_55%)]')}>
                <FramedImage media={details.image} alt={details.name} className="h-full w-full" fallbackTransform={{ fit: 'contain' }} />
              </div>
            ) : (
              <div className={cn('flex aspect-[16/9] items-center justify-center', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <div className={cn('text-sm', sub)}>No part image uploaded yet.</div>
              </div>
            )
          ) : null
        }
        badges={
          details ? (
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                {getProductName(details.productSlug)}
              </span>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', details.inStock ? (isDark ? 'border-white/10 bg-white/[0.04] text-purple-100/80' : 'border-gray-200 bg-white text-gray-700') : (isDark ? 'border-red-400/20 bg-red-400/12 text-red-200' : 'border-red-200 bg-red-50 text-red-700'))}>
                {details.inStock ? 'In stock' : 'Out of stock'}
              </span>
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Product', value: getProductName(details.productSlug) },
                { label: 'Price', value: `${details.price} ${details.currency}` },
                { label: 'Stock', value: details.inStock ? 'Available' : 'Out of stock' },
                { label: 'Image', value: details.image ? 'Uploaded' : 'Missing' },
              ]
            : []
        }
        sections={
          details
            ? [
                {
                  title: 'Part Info',
                  facts: [
                    { label: 'Name', value: details.name },
                    { label: 'Linked product', value: getProductName(details.productSlug) },
                    { label: 'Price', value: `${details.price} ${details.currency}` },
                  ],
                },
                {
                  title: 'Description',
                  content: (
                    <p className={cn('text-sm leading-6', isDark ? 'text-purple-100/80' : 'text-gray-700')}>
                      {details.description || 'No description has been added for this part yet.'}
                    </p>
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
                Edit Part
              </AdminActionButton>
              <AdminActionButton tone="danger" onClick={() => void removePart(details)}>
                Delete Part
              </AdminActionButton>
            </>
          )
        }
      />

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? 'Add Part' : 'Edit Part'}
        persistent
        size="xl"
        bodyClassName="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-4"
      >
        {editing && (
          <AdminEditorWorkspace
            preview={renderPartPreview()}
            previewTitle="Live Part Card"
            previewHint="See the real part card result while you update the linked product, stock state, and image framing."
            footer={
              <div className="flex flex-wrap justify-end gap-3">
                <button onClick={close} className="btn-outline !rounded-xl !px-5 !py-2.5 !text-sm">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !canSave}
                  className="btn-primary !rounded-xl !px-6 !py-2.5 !text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isNew ? 'Add' : 'Save'}
                </button>
              </div>
            }
          >
            <AdminEditorSection
              title="Part Details"
              hint="Link the part to a product, set the short description and price, and keep the stock state visible in the live preview."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Product *</label>
                  <select className="form-field" value={editing.productSlug} onChange={e => up('productSlug', e.target.value)}>
                    <option value="">Select...</option>
                    {products.map(product => (
                      <option key={product.slug} value={product.slug}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                  {!editing.productSlug && <div className="mt-1 text-[11px] text-red-400">Please select a product.</div>}
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Name *</label>
                  <input className="form-field" value={editing.name} onChange={e => up('name', e.target.value)} />
                  {!editing.name.trim() && <div className="mt-1 text-[11px] text-red-400">Name is required.</div>}
                </div>

                <div className="sm:col-span-2">
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Description</label>
                  <input className="form-field" value={editing.description} onChange={e => up('description', e.target.value)} />
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Price ({editing.currency})</label>
                  <input className="form-field" type="number" value={editing.price} onChange={e => up('price', +e.target.value)} />
                </div>

                <div className="flex items-center pt-7">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editing.inStock}
                      onChange={e => up('inStock', e.target.checked)}
                      className="h-4 w-4 rounded accent-violet-400"
                    />
                    <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>In Stock</span>
                  </label>
                </div>
              </div>
            </AdminEditorSection>

            <AdminEditorSection
              title="Part Image"
              hint="Adjust the square part image while watching the final part card result update on the right."
            >
              <ImageUploader
                label="Part Image"
                value={editing.image}
                onChange={url => setEditing(e => (e ? { ...e, image: url } : null))}
                removable
                onRemove={() => setEditing(e => (e ? { ...e, image: '' } : null))}
                folder="parts"
                frameAspect={1}
                defaultFit="contain"
                frameTitle="Adjust Part Image"
                frameHint="Place the part neatly inside the square product-part frame."
                previewAspectClass="aspect-square"
                renderFrameContextPreview={media => renderPartPreview({ image: media })}
                frameContextTitle="Part Card Result"
                frameContextHint="Inspect the final part card result while you refine the image framing."
              />
            </AdminEditorSection>
          </AdminEditorWorkspace>
        )}
      </Modal>
    </div>
  )
}
