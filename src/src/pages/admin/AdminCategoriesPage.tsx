import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Category } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

const empty: Category = { id: '', name: '', slug: '', icon: '', description: '', image: '' }

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData()
  const { isDark } = useTheme()
  const [editing, setEditing] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'

  const openNew = () => { setEditing({ ...empty, id: `cat-${Date.now()}` }); setIsNew(true) }
  const openEdit = (c: Category) => { setEditing({ ...c }); setIsNew(false) }
  const close = () => { setEditing(null); setIsNew(false) }
  const save = async () => {
    if (!editing || !editing.name) return
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, '-')
    const data = { ...editing, slug }
    setSaving(true)
    try {
      if (isNew) await addCategory(data); else await updateCategory(data.id, data)
      close()
    } catch (err: any) { alert('Error: ' + (err.message || 'Failed to save')) }
    finally { setSaving(false) }
  }
  const up = (f: keyof Category, v: string) => setEditing(e => e ? { ...e, [f]: v } : null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`font-display text-2xl font-bold ${txt}`}>Categories / Brands</h1>
          <p className={`text-sm ${sub}`}>{categories.length} categories — each represents a brand or service line</p>
        </div>
        <button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">+ Add Category</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{categories.map(c => {
        const count = products.filter(p => p.categoryId === c.id).length
        return (
          <div key={c.id} className="card-surface rounded-2xl overflow-hidden group hover:border-prism-violet/40 transition-all">
            {/* Category image */}
            {c.image && (
              <div className="aspect-[3/1] overflow-hidden">
                <img src={c.image} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </div>
            )}
            <div className="p-5 flex items-center gap-4">
              <span className="text-3xl">{c.icon || '📂'}</span>
              <div className="flex-1">
                <div className={`font-display font-bold ${txt}`}>{c.name}</div>
                {c.description && <p className={`text-[11px] mt-0.5 line-clamp-1 ${sub}`}>{c.description}</p>}
                <div className={`text-[11px] font-mono mt-1 ${isDark ? 'text-cyan-400/70' : 'text-violet-500'}`}>{count} product{count !== 1 ? 's' : ''}</div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(c)} className={`text-[11px] px-2.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-200/90' : 'bg-gray-100 text-gray-500'}`}>Edit</button>
                <button onClick={async () => { if (count > 0) { alert('Remove products from this category first'); return }; if (confirm('Delete?')) { try { await deleteCategory(c.id) } catch(e: any) { alert('Error: ' + e.message) } } }} className="btn-danger !text-[11px]">Del</button>
              </div>
            </div>
          </div>
        )
      })}</div>

      <Modal open={!!editing} onClose={close} title={isNew ? 'Add Category / Brand' : 'Edit Category'}>
        {editing && <div className="space-y-4">
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Name * (e.g. "The Terminal VR", "Bike Land")</label><input className="form-field" value={editing.name} onChange={e => up('name', e.target.value)} placeholder="Brand or category name" /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Slug</label><input className="form-field" value={editing.slug} onChange={e => up('slug', e.target.value)} placeholder="auto-generated-from-name" /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Icon (emoji)</label><input className="form-field" value={editing.icon} onChange={e => up('icon', e.target.value)} placeholder="🎮 🚲 🥽" /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Description</label><textarea className="form-field resize-none" rows={3} value={editing.description || ''} onChange={e => up('description', e.target.value)} placeholder="Brief description of this brand/category..." /></div>
          <ImageUploader
            label="Category / Brand Image"
            value={editing.image}
            onChange={(url) => setEditing(e => e ? { ...e, image: url } : null)}
            removable
            onRemove={() => setEditing(e => e ? { ...e, image: '' } : null)}
            folder="categories"
          />
          <div className="flex gap-3 justify-end mt-6"><button onClick={close} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">Cancel</button><button onClick={save} disabled={saving} className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50">{saving ? '⏳ Saving...' : isNew ? 'Add' : 'Save'}</button></div>
        </div>}
      </Modal>
    </div>
  )
}
