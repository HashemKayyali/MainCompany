import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

const empty: Customer = { name: '', slug: '', logo: '', category: '' }

function cn(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(' ')
}

export default function AdminCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData()
  const { isDark } = useTheme()

  const [editing, setEditing] = useState<Customer | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  // ✅ بدل search: فلتر كاتيجوري
  const [filterCat, setFilterCat] = useState<string>('all')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const border = isDark ? 'border-purple-500/15' : 'border-gray-200'
  const rowHover = isDark ? 'hover:border-prism-violet/40' : 'hover:border-violet-200'

  const chipOn = isDark
    ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40'
    : 'bg-violet-50 text-violet-700 border border-violet-200'
  const chipOff = isDark
    ? 'bg-purple-500/[0.08] text-purple-200/80 border border-purple-500/20'
    : 'bg-gray-50 text-gray-600 border border-gray-200'

  const cats = useMemo(() => {
    const list = Array.from(new Set(customers.map(c => (c.category || '').trim()).filter(Boolean)))
    return list.sort((a, b) => a.localeCompare(b))
  }, [customers])

  const countForCat = (cat: string) =>
    customers.filter(c => (c.category || '').trim() === cat).length

  const filtered = useMemo(() => {
    if (filterCat === 'all') return customers
    return customers.filter(c => (c.category || '').trim() === filterCat)
  }, [customers, filterCat])

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
      alert('Error: ' + (err.message || 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className={cn('font-display text-2xl font-bold', txt)}>Customers</h1>
          <p className={cn('text-sm', sub)}>
            {customers.length} partners • {filtered.length} shown
          </p>
        </div>

        <button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">
          + Add Customer
        </button>
      </div>

      {/* Category chips (بديل للبحث) */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterCat('all')}
          className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterCat === 'all' ? chipOn : chipOff)}
        >
          All ({customers.length})
        </button>

        {cats.map(cat => (
          <button
            key={cat}
            onClick={() => setFilterCat(cat)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium transition-all', filterCat === cat ? chipOn : chipOff)}
          >
            {cat} ({countForCat(cat)})
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(c => (
          <div
            key={c.slug}
            className={cn(
              'card-surface rounded-2xl p-5 flex items-start gap-4 group transition-all border',
              border,
              rowHover
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border',
                isDark ? 'bg-purple-500/[0.08] border-purple-500/25' : 'bg-gray-50 border-gray-200'
              )}
            >
              {c.logo ? (
                <img
                  src={c.logo}
                  alt=""
                  className="w-[70%] h-[70%] object-contain"
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className={cn('text-[10px] font-mono', sub)}>NO LOGO</div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className={cn('font-medium text-sm truncate', txt)}>{c.name}</div>
              <div className={cn('text-[11px] font-mono truncate', sub)}>{c.category || 'Uncategorized'}</div>
            </div>

            <div className="flex gap-1.5 shrink-0">
              <button
                onClick={() => openEdit(c)}
                className={cn(
                  'text-[11px] px-2.5 py-1 rounded-lg border transition',
                  isDark
                    ? 'border-purple-500/25 bg-purple-500/10 text-purple-200/90 hover:bg-purple-500/15'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                )}
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  if (confirm('Delete ' + c.name + '?')) {
                    try {
                      await deleteCustomer(c.slug)
                    } catch (e: any) {
                      alert('Error: ' + (e.message || 'Failed to delete'))
                    }
                  }
                }}
                className="btn-danger !text-[11px] !px-3 !py-1 !rounded-lg"
              >
                Del
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className={cn('col-span-full text-center py-12', sub)}>No customers.</div>
        )}
      </div>

      {/* Modal */}
      <Modal open={!!editing} onClose={close} title={isNew ? 'Add Customer' : 'Edit Customer'}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Name *</label>
                <input
                  className="form-field"
                  value={editing.name}
                  onChange={e => up('name', e.target.value)}
                />
                {!editing.name.trim() && <div className="mt-1 text-[11px] text-red-400">Name is required.</div>}
              </div>

              <div>
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Slug</label>
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
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Category</label>
                <input
                  className="form-field"
                  value={editing.category || ''}
                  onChange={e => up('category', e.target.value)}
                  list="cats"
                />
                <datalist id="cats">{cats.map(c => <option key={c} value={c} />)}</datalist>
              </div>
            </div>

            <ImageUploader
              label="Logo"
              value={editing.logo}
              onChange={url => setEditing(e => (e ? { ...e, logo: url } : null))}
              removable
              onRemove={() => setEditing(e => (e ? { ...e, logo: '' } : null))}
              folder="customers"
            />

            <div className="flex gap-3 justify-end mt-6">
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