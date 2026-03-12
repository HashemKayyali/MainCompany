import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { ProductPart } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

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

function cn(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(' ')
}

export default function AdminPartsPage() {
  const { parts, products, addPart, updatePart, deletePart } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<ProductPart | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  const [filterSlug, setFilterSlug] = useState('all')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const border = isDark ? 'border-purple-500/15' : 'border-gray-200'
  const soft = isDark ? 'bg-purple-500/[0.06]' : 'bg-gray-50'
  const rowHover = isDark ? 'hover:bg-purple-500/[0.07]' : 'hover:bg-gray-50'
  const chipOn = isDark
    ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40'
    : 'bg-violet-50 text-violet-700 border border-violet-200'
  const chipOff = isDark
    ? 'bg-purple-500/[0.08] text-purple-200/80 border border-purple-500/20'
    : 'bg-gray-50 text-gray-600 border border-gray-200'

  const getPN = (slug: string) => products.find(p => p.slug === slug)?.name || slug
  const countFor = (slug: string) => parts.filter(pt => pt.productSlug === slug).length

  const filtered = useMemo(() => {
    return filterSlug === 'all' ? parts : parts.filter(p => p.productSlug === filterSlug)
  }, [parts, filterSlug])

  const openNew = () => {
    setEditing({ ...emptyPart, id: `part-${Date.now()}` })
    setIsNew(true)
  }
  const openEdit = (p: ProductPart) => {
    setEditing({ ...p })
    setIsNew(false)
  }
  const close = () => {
    setEditing(null)
    setIsNew(false)
  }

  const up = (f: keyof ProductPart, v: any) => setEditing(e => (e ? { ...e, [f]: v } : null))

  const canSave = !!editing?.productSlug && !!editing?.name?.trim()

  const save = async () => {
    if (!editing) return
    if (!canSave) return
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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className={cn('font-display text-2xl font-bold', txt)}>Parts & Spares</h1>
          <p className={cn('text-sm', sub)}>
            {parts.length} total • {filtered.length} shown
          </p>
        </div>

        {/* رجّعنا زر Add Part لنفس ستايلك */}
        <button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">
          + Add Part
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterSlug('all')}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterSlug === 'all' ? chipOn : chipOff)}
        >
          All ({parts.length})
        </button>
        {products.map(p => (
          <button
            key={p.slug}
            onClick={() => setFilterSlug(p.slug)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterSlug === p.slug ? chipOn : chipOff)}
          >
            {p.name} ({countFor(p.slug)})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card-surface rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={cn('border-b', isDark ? 'border-purple-500/20' : 'border-gray-100')}>
                {['Part', 'Product', 'Price', 'Stock', 'Actions'].map(h => (
                  <th key={h} className={cn('text-left px-5 py-3 text-[11px] font-mono uppercase tracking-wider', sub)}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className={cn('border-b', border, rowHover)}>
                  {/* Part */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl overflow-hidden border shrink-0',
                          isDark ? 'border-purple-500/20 bg-purple-500/10' : 'border-gray-200 bg-gray-50'
                        )}
                      >
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={cn('w-full h-full flex items-center justify-center text-[10px] font-mono', sub)}>
                            NO IMG
                          </div>
                        )}
                      </div>

                      <div className="min-w-[220px]">
                        <div className={cn('font-medium leading-5', txt)}>{p.name}</div>
                        <div className={cn('text-[11px] leading-4 line-clamp-2', sub)}>{p.description || '—'}</div>

                        {/* ✅ حذفنا الرقم الغريب (كان p.id) */}
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className={cn('px-5 py-3.5 text-xs', sub)}>
                    <div className={cn('inline-flex items-center gap-2 rounded-lg border px-2 py-1', chipOff)}>
                      <span className="font-mono text-[10px]">SLUG</span>
                      <span className={cn('text-xs', txt)}>{getPN(p.productSlug)}</span>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs',
                        isDark ? 'border-purple-500/25 bg-purple-500/10 text-purple-100' : 'border-gray-200 bg-white text-gray-800'
                      )}
                    >
                      {Number.isFinite(p.price) ? p.price : 0} {p.currency}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-5 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-xl border px-3 py-1.5 text-xs font-medium',
                        p.inStock
                          ? isDark
                            ? 'border-prism-violet/30 bg-prism-violet/10 text-prism-violet'
                            : 'border-violet-200 bg-violet-50 text-violet-700'
                          : isDark
                          ? 'border-red-500/25 bg-red-500/10 text-red-300'
                          : 'border-red-200 bg-red-50 text-red-700'
                      )}
                    >
                      {p.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className={cn(
                          'text-xs px-3 py-1.5 rounded-lg border transition',
                          isDark
                            ? 'border-purple-500/25 bg-purple-500/10 text-purple-100 hover:bg-purple-500/15'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        )}
                      >
                        Edit
                      </button>

                      <button
                        onClick={async () => {
                          const ok = await dialog.confirm({ title: 'Delete Part?', message: 'This will permanently remove this part.', confirmLabel: 'Delete', variant: 'danger' })
                          if (!ok) return
                          try {
                            await deletePart(p.id)
                          } catch (e: any) {
                            dialog.alert({ title: 'Error', message: e.message || 'Failed to delete', variant: 'danger' })
                          }
                        }}
                        className={cn('btn-danger !text-xs !px-3 !py-1.5 !rounded-lg')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className={cn('text-center py-12', sub)}>
                    No parts.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={!!editing} onClose={close} title={isNew ? 'Add Part' : 'Edit Part'} persistent>
        {editing && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Product *</label>
                <select className="form-field" value={editing.productSlug} onChange={e => up('productSlug', e.target.value)}>
                  <option value="">Select...</option>
                  {products.map(p => (
                    <option key={p.slug} value={p.slug}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {!editing.productSlug && <div className="mt-1 text-[11px] text-red-400">Please select a product.</div>}
              </div>

              <div>
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Name *</label>
                <input className="form-field" value={editing.name} onChange={e => up('name', e.target.value)} />
                {!editing.name.trim() && <div className="mt-1 text-[11px] text-red-400">Name is required.</div>}
              </div>

              <div className="sm:col-span-2">
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Description</label>
                <input className="form-field" value={editing.description} onChange={e => up('description', e.target.value)} />
              </div>

              <div>
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Price ({editing.currency})</label>
                <input className="form-field" type="number" value={editing.price} onChange={e => up('price', +e.target.value)} />
              </div>

              <div>
                <ImageUploader
                  label="Part Image"
                  value={editing.image}
                  onChange={url => setEditing(e => (e ? { ...e, image: url } : null))}
                  removable
                  onRemove={() => setEditing(e => (e ? { ...e, image: '' } : null))}
                  folder="parts"
                />
                {/* ✅ حذفنا preview الثاني لأنه كان سبب تكرار الصورة */}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editing.inStock}
                onChange={e => up('inStock', e.target.checked)}
                className="w-4 h-4 rounded accent-violet-400"
              />
              <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>In Stock</span>
            </label>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={close} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">
                Cancel
              </button>

              <button
                onClick={save}
                disabled={saving || !canSave}
                className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : isNew ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}