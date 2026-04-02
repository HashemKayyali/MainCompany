import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { Customer } from '../../data/customers'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminEditorWorkspace, { AdminEditorSection } from '../../components/admin/AdminEditorWorkspace'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
import CustomerCard from '../../components/customer/CustomerCard'

const empty: Customer = { name: '', slug: '', logo: '', category: '' }

function cn(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(' ')
}

export default function AdminCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<Customer | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterCat, setFilterCat] = useState<string>('all')
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('customers')

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const chipOn = isDark
    ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.3)]'
    : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.22)]'
  const chipOff = isDark
    ? 'bg-[#0f1630]/96 text-purple-100/78 ring-1 ring-inset ring-cyan-400/10 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)] hover:bg-[#111a39]'
    : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-gray-50'

  const cats = useMemo(() => {
    const list = Array.from(new Set(customers.map(c => (c.category || '').trim()).filter(Boolean)))
    return list.sort((a, b) => a.localeCompare(b))
  }, [customers])

  const countForCat = (cat: string) => customers.filter(c => (c.category || '').trim() === cat).length

  const filtered = useMemo(() => {
    if (filterCat === 'all') return customers
    return customers.filter(c => (c.category || '').trim() === filterCat)
  }, [customers, filterCat])
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

  const openNew = () => {
    setEditing({ ...empty })
    setIsNew(true)
  }

  const openEdit = (c: Customer) => {
    setEditing({ ...c })
    setIsNew(false)
  }

  const close = () => {
    setEditing(null)
    setIsNew(false)
  }

  const up = (f: keyof Customer, v: string) => setEditing(e => (e ? { ...e, [f]: v } : null))

  const makeSlug = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

  const canSave = !!editing?.name?.trim()

  const previewCustomer: Customer = {
    name: editing?.name?.trim() || 'Customer Name',
    slug: editing?.slug?.trim() || makeSlug(editing?.name || 'customer-name'),
    logo: editing?.logo || '',
    category: editing?.category || 'Category',
  }

  const renderCustomerPreview = (overrides?: Partial<Customer>) => (
    <div
      aria-hidden="true"
      className="mx-auto max-w-[236px] select-none [&_a]:pointer-events-none [&_button]:pointer-events-none"
    >
      <CustomerCard customer={{ ...previewCustomer, ...overrides }} />
    </div>
  )

  const save = async () => {
    if (!editing || !editing.name?.trim()) return

    const slug = editing.slug?.trim() || makeSlug(editing.name)
    const data = { ...editing, slug }

    setSaving(true)
    try {
      if (isNew) await addCustomer(data)
      else await updateCustomer(data.slug, data)
      close()
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to save', variant: 'danger' })
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

    try {
      await deleteCustomer(customer.slug)
    } catch (e: any) {
      dialog.alert({ title: 'Error', message: e.message || 'Failed to delete', variant: 'danger' })
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Customers"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            <button onClick={openNew} className="btn-admin-create">
              + Add Customer
            </button>
          </>
        }
      />

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[22px] p-2.5',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="mb-2.5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCat('all')}
            className={cn('inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-[11px] font-semibold transition active:translate-y-[1px]', filterCat === 'all' ? chipOn : chipOff)}
          >
            All ({customers.length})
          </button>

          {cats.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn('inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-[11px] font-semibold transition active:translate-y-[1px]', filterCat === cat ? chipOn : chipOff)}
            >
              {cat} ({countForCat(cat)})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={cn('flex flex-1 items-center justify-center rounded-[18px] border px-5 py-11 text-center text-[13px]', isDark ? 'border-white/10 text-purple-200/70' : 'border-gray-100 text-gray-500')}>
            No customers match this filter.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
            <div className={cardsLayoutClass}>
              {filtered.map(customer => (
                <AdminEntityCard
                  key={customer.slug}
                  variant={getAdminEntityVariant(displayCardView)}
                  minHeightClassName={displayCardView === 'grid' ? 'min-h-[198px]' : 'min-h-[88px]'}
                  bodyClassName={displayCardView === 'grid' ? 'gap-1.75 p-2.75' : 'gap-1.5 p-2.5'}
                  listMediaWrapClassName="md:self-center"
                  listMediaFrameClassName="!h-[72px] !w-[72px] md:!h-[72px] md:!w-[72px] p-1"
                  actionsWrapClassName={displayCardView === 'list' ? 'xl:w-[108px] xl:self-center' : undefined}
                  media={
                    <div
                      className={cn(
                        'aspect-[4/3] h-full w-full rounded-[16px] p-1.5',
                        isDark
                          ? 'bg-[radial-gradient(circle,rgba(34,211,238,0.10),transparent_65%)]'
                          : 'bg-[radial-gradient(circle,rgba(139,92,246,0.08),transparent_62%)]'
                      )}
                    >
                      {customer.logo ? (
                        <FramedImage
                          media={customer.logo}
                          alt={customer.name}
                          className="h-full w-full"
                          extraScale={1.16}
                          fallbackTransform={{ fit: 'contain' }}
                          onError={e => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className={cn('text-[11px] font-mono uppercase tracking-[0.24em]', sub)}>No Logo</div>
                      )}
                    </div>
                  }
                  mediaOverlayLeft={
                    <span className={cn('rounded-full px-2.5 py-1 text-[9px] font-mono uppercase tracking-[0.18em] ring-1 ring-inset', isDark ? 'bg-black/35 text-cyan-100/70 ring-cyan-400/10' : 'bg-white/90 text-gray-500 ring-gray-200')}>
                      Customer
                    </span>
                  }
                  title={customer.name}
                  subtitle={undefined}
                  badges={
                    <span className={cn('rounded-full px-3 py-1 text-[10px] font-medium ring-1 ring-inset', isDark ? 'bg-cyan-400/10 text-cyan-200 ring-cyan-400/18' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                      {customer.category || 'Uncategorized'}
                    </span>
                  }
                  actions={
                    <>
                      <AdminActionButton
                        onClick={event => {
                          event.stopPropagation()
                          openEdit(customer)
                        }}
                      >
                        Edit
                      </AdminActionButton>
                      <AdminActionButton
                        tone="danger"
                        onClick={event => {
                          event.stopPropagation()
                          void deleteItem(customer)
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

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? 'Add Customer' : 'Edit Customer'}
        persistent
        size="xl"
        bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
      >
        {editing && (
          <AdminEditorWorkspace
            preview={renderCustomerPreview()}
            previewTitle="Live Customer Card"
            previewHint="The preview stays visible while you update the logo, name, and customer grouping."
            previewPaneClassName="xl:max-w-[17.5rem] xl:justify-self-end"
            footer={
              <div className="flex flex-wrap justify-end gap-2.5">
                <button onClick={close} className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !canSave}
                  className="btn-primary !rounded-xl !px-5 !py-2 !text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isNew ? 'Add' : 'Save'}
                </button>
              </div>
            }
          >
            <AdminEditorSection title="Identity" hint="Name, slug, and category stay compact on the left while the logo result remains visible on the right.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Name *</label>
                  <input className="form-field" value={editing.name} onChange={e => up('name', e.target.value)} />
                  {!editing.name.trim() && <div className="mt-1 text-[11px] text-red-400">Name is required.</div>}
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Slug</label>
                  <input
                    className="form-field"
                    value={editing.slug}
                    onChange={e => up('slug', e.target.value)}
                    disabled={!isNew}
                    placeholder={editing.name ? makeSlug(editing.name) : 'auto-generated'}
                  />
                  {!isNew && <div className={cn('mt-1 text-[11px]', sub)}>Slug is locked after creation.</div>}
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Category</label>
                  <input
                    className="form-field"
                    value={editing.category || ''}
                    onChange={e => up('category', e.target.value)}
                    list="cats"
                  />
                  <datalist id="cats">{cats.map(c => <option key={c} value={c} />)}</datalist>
                </div>
              </div>
            </AdminEditorSection>

            <AdminEditorSection title="Logo" hint="Adjust the logo and inspect the actual rendered customer card result side by side.">
              <div className="max-w-[15.5rem]">
                <ImageUploader
                  label="Logo"
                  value={editing.logo}
                  onChange={url => setEditing(e => (e ? { ...e, logo: url } : null))}
                  removable
                  onRemove={() => setEditing(e => (e ? { ...e, logo: '' } : null))}
                  folder="customers"
                  frameAspect={1}
                  defaultFit="contain"
                  frameTitle="Adjust Customer Logo"
                  frameHint="Fit or crop the logo inside the square logo frame."
                  previewAspectClass="aspect-square"
                  renderFrameContextPreview={media => renderCustomerPreview({ logo: media })}
                  frameContextTitle="Customer Card Result"
                  frameContextHint="Check the actual customer card result while you refine the logo framing."
                  maxWidthClassName="max-w-[15.5rem]"
                />
              </div>
            </AdminEditorSection>
          </AdminEditorWorkspace>
        )}
      </Modal>
    </div>
  )
}
