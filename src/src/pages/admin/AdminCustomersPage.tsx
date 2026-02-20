import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

const empty: Customer = { name: '', slug: '', logo: '', category: '' }

export default function AdminCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useData()
  const { isDark } = useTheme()
  const [editing, setEditing] = useState<Customer | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const filtered = customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))

  const openNew = () => { setEditing({ ...empty }); setIsNew(true) }
  const openEdit = (c: Customer) => { setEditing({ ...c }); setIsNew(false) }
  const close = () => { setEditing(null); setIsNew(false) }
  const save = async () => {
    if (!editing || !editing.name) return
    const slug = editing.slug || editing.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const data = { ...editing, slug }
    setSaving(true)
    try {
      if (isNew) await addCustomer(data); else await updateCustomer(data.slug, data)
      close()
    } catch (err: any) { alert('Error: ' + (err.message || 'Failed to save')) }
    finally { setSaving(false) }
  }
  const up = (f: keyof Customer, v: string) => setEditing(e => e ? { ...e, [f]: v } : null)
  const cats = Array.from(new Set(customers.map(c => c.category).filter(Boolean)))

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><div><h1 className={`font-display text-2xl font-bold ${txt}`}>Customers</h1><p className={`text-sm ${sub}`}>{customers.length} partners</p></div><button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">+ Add Customer</button></div>
      <div className="max-w-sm mb-5"><input className="form-field" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(c => (
        <div key={c.slug} className="card-surface rounded-2xl p-5 flex items-start gap-4 group hover:border-prism-violet/40 transition-all">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${isDark ? 'bg-purple-500/[0.08] border border-purple-500/25' : 'bg-gray-50 border border-gray-200'}`}><img src={c.logo} alt="" className="w-[60%] h-[60%] object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>
          <div className="flex-1 min-w-0"><div className={`font-medium text-sm ${txt}`}>{c.name}</div><div className={`text-[11px] font-mono ${sub}`}>{c.category || 'Uncategorized'}</div></div>
          <div className="flex gap-1.5 shrink-0"><button onClick={() => openEdit(c)} className={`text-[11px] px-2.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/10 text-purple-200/90' : 'bg-gray-100 text-gray-500'}`}>Edit</button><button onClick={async () => { if (confirm('Delete ' + c.name + '?')) { try { await deleteCustomer(c.slug) } catch(e: any) { alert('Error: ' + e.message) } } }} className="btn-danger !text-[11px]">Del</button></div>
        </div>
      ))}</div>

      <Modal open={!!editing} onClose={close} title={isNew ? 'Add Customer' : 'Edit Customer'}>
        {editing && <div className="space-y-4">
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Name *</label><input className="form-field" value={editing.name} onChange={e => up('name', e.target.value)} /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Slug</label><input className="form-field" value={editing.slug} onChange={e => up('slug', e.target.value)} disabled={!isNew} /></div>
          <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Category</label><input className="form-field" value={editing.category || ''} onChange={e => up('category', e.target.value)} list="cats" /><datalist id="cats">{cats.map(c => <option key={c} value={c} />)}</datalist></div>
          <ImageUploader
            label="Logo"
            value={editing.logo}
            onChange={(url) => setEditing(e => e ? { ...e, logo: url } : null)}
            removable
            onRemove={() => setEditing(e => e ? { ...e, logo: '' } : null)}
            folder="customers"
          />
          <div className="flex gap-3 justify-end mt-6"><button onClick={close} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">Cancel</button><button onClick={save} disabled={saving} className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50">{saving ? '⏳ Saving...' : isNew ? 'Add' : 'Save'}</button></div>
        </div>}
      </Modal>
    </div>
  )
}
