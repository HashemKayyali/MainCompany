import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { ProductPart } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

const emptyPart: ProductPart = { id: '', productSlug: '', name: '', description: '', price: 0, currency: 'JOD', image: '', inStock: true }

export default function AdminPartsPage() {
  const { parts, products, addPart, updatePart, deletePart } = useData()
  const { isDark } = useTheme()
  const [editing, setEditing] = useState<ProductPart | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [filterSlug, setFilterSlug] = useState('all')
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const filtered = filterSlug === 'all' ? parts : parts.filter(p => p.productSlug === filterSlug)

  const openNew = () => { setEditing({ ...emptyPart, id: `part-${Date.now()}` }); setIsNew(true) }
  const openEdit = (p: ProductPart) => { setEditing({ ...p }); setIsNew(false) }
  const close = () => { setEditing(null); setIsNew(false) }
  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      if (isNew) await addPart(editing); else await updatePart(editing.id, editing)
      close()
    } catch (err: any) { alert('Error: ' + (err.message || 'Failed to save')) }
    finally { setSaving(false) }
  }
  const up = (f: keyof ProductPart, v: any) => setEditing(e => e ? { ...e, [f]: v } : null)
  const getPN = (s: string) => products.find(p => p.slug === s)?.name || s

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h1 className={`font-display text-2xl font-bold ${txt}`}>Parts & Spares</h1><p className={`text-sm ${sub}`}>{parts.length} parts</p></div><button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">+ Add Part</button></div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setFilterSlug('all')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSlug === 'all' ? isDark ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40' : 'bg-violet-50 text-violet-700 border border-violet-200' : isDark ? 'bg-purple-500/[0.08] text-purple-200/80 border border-purple-500/20' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>All ({parts.length})</button>
        {products.map(p => <button key={p.slug} onClick={() => setFilterSlug(p.slug)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterSlug === p.slug ? isDark ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40' : 'bg-violet-50 text-violet-700 border border-violet-200' : isDark ? 'bg-purple-500/[0.08] text-purple-200/80 border border-purple-500/20' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>{p.name} ({parts.filter(pt => pt.productSlug === p.slug).length})</button>)}
      </div>
      <div className="card-surface rounded-2xl overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className={isDark ? 'border-b border-purple-500/20' : 'border-b border-gray-100'}>{['Part','Product','Price','Stock','Actions'].map(h => <th key={h} className={`text-left px-5 py-3 text-[11px] font-mono uppercase tracking-wider ${sub}`}>{h}</th>)}</tr></thead><tbody>{filtered.map(p => (
        <tr key={p.id} className={`${isDark ? 'border-b border-purple-500/15 hover:bg-purple-500/[0.07]' : 'border-b border-gray-50 hover:bg-gray-50'}`}>
          <td className="px-5 py-3.5"><div className={`font-medium ${txt}`}>{p.name}</div><div className={`text-[11px] ${sub}`}>{p.description}</div></td>
          <td className={`px-5 py-3.5 text-xs ${sub}`}>{getPN(p.productSlug)}</td>
          <td className={`px-5 py-3.5 font-mono ${txt}`}>{p.price} {p.currency}</td>
          <td className="px-5 py-3.5"><span className={`text-xs ${p.inStock ? 'text-prism-violet' : 'text-red-400'}`}>{p.inStock ? 'In Stock' : 'Out'}</span></td>
          <td className="px-5 py-3.5"><div className="flex gap-2"><button onClick={() => openEdit(p)} className={`text-xs px-3 py-1.5 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-200/90' : 'bg-gray-100 text-gray-600'}`}>Edit</button><button onClick={async () => { if (confirm('Delete?')) { try { await deletePart(p.id) } catch(e: any) { alert('Error: ' + e.message) } } }} className="btn-danger">Del</button></div></td>
        </tr>
      ))}{filtered.length === 0 && <tr><td colSpan={5} className={`text-center py-10 ${sub}`}>No parts.</td></tr>}</tbody></table></div></div>

      <Modal open={!!editing} onClose={close} title={isNew ? 'Add Part' : 'Edit Part'}>
        {editing && <div className="space-y-4">
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Product *</label><select className="form-field" value={editing.productSlug} onChange={e => up('productSlug', e.target.value)}><option value="">Select...</option>{products.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}</select></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Name *</label><input className="form-field" value={editing.name} onChange={e => up('name', e.target.value)} /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Description</label><input className="form-field" value={editing.description} onChange={e => up('description', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4"><div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price ({editing.currency})</label><input className="form-field" type="number" value={editing.price} onChange={e => up('price', +e.target.value)} /></div><ImageUploader label="Part Image" value={editing.image} onChange={(url) => setEditing(e => e ? { ...e, image: url } : null)} removable onRemove={() => setEditing(e => e ? { ...e, image: '' } : null)} folder="parts" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={editing.inStock} onChange={e => up('inStock', e.target.checked)} className="w-4 h-4 rounded accent-violet-400" /><span className={`text-sm ${isDark ? 'text-purple-100/90' : 'text-gray-600'}`}>In Stock</span></label>
          <div className="flex gap-3 justify-end mt-6"><button onClick={close} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">Cancel</button><button onClick={save} disabled={saving} className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50">{saving ? '⏳ Saving...' : isNew ? 'Add' : 'Save'}</button></div>
        </div>}
      </Modal>
    </div>
  )
}
