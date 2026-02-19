import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import { slugify } from '../../utils/format'
import type { Product } from '../../data/products/types'

const EMPTY: Product = { slug: '', name: '', badge: '', badgeColor: 'from-violet-500 to-pink-500', categoryTags: [], categoryId: '', shortDescription: '', description: '', featured: false, heroImage: '', gallery: [], quickOptions: [], notes: [], features: { left: [], right: [] }, rentalPricePerDay: 0, rentalPricePerEvent: 0, currency: 'JOD' }

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useData()
  const { isDark } = useTheme()
  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState<Product | null>(null)
  const [form, setForm] = useState<any>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [tab, setTab] = useState<'basic' | 'content' | 'images' | 'options'>('basic')
  const [saving, setSaving] = useState(false)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-300/80' : 'text-gray-400'
  const th = isDark ? 'text-purple-300/70' : 'text-gray-400'
  const row = isDark ? 'border-purple-500/15 hover:bg-purple-500/[0.06]' : 'border-gray-100 hover:bg-violet-50/30'
  const tabCls = (t: string) => `px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${tab === t ? isDark ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40' : 'bg-violet-50 text-violet-600 border border-violet-200' : isDark ? 'text-purple-300/80 hover:text-purple-200/90 border border-transparent' : 'text-gray-400 hover:text-gray-600 border border-transparent'}`

  const openNew = () => { setEdit(null); setForm({ ...EMPTY, categoryTags: '', notes: '', featuresLeft: '', featuresRight: '', gallery: [] }); setTab('basic'); setModal(true) }
  const openEdit = (p: Product) => {
    setEdit(p)
    setForm({ ...p, categoryTags: p.categoryTags.join(', '), notes: p.notes.join('\n'), featuresLeft: p.features.left.join('\n'), featuresRight: p.features.right.join('\n'), gallery: [...p.gallery] })
    setTab('basic'); setModal(true)
  }
  const save = async () => {
    const tags = typeof form.categoryTags === 'string' ? form.categoryTags.split(',').map((t: string) => t.trim()).filter(Boolean) : form.categoryTags
    const notes = typeof form.notes === 'string' ? form.notes.split('\n').filter((n: string) => n.trim()) : form.notes || []
    const fl = typeof form.featuresLeft === 'string' ? form.featuresLeft.split('\n').filter((n: string) => n.trim()) : form.features?.left || []
    const fr = typeof form.featuresRight === 'string' ? form.featuresRight.split('\n').filter((n: string) => n.trim()) : form.features?.right || []
    const gallery = form.gallery || []
    const data: Product = {
      slug: form.slug || slugify(form.name),
      name: form.name, badge: form.badge, badgeColor: form.badgeColor || 'from-violet-500 to-pink-500',
      categoryTags: tags, categoryId: form.categoryId || '',
      shortDescription: form.shortDescription || '', description: form.description || '',
      featured: !!form.featured, heroImage: gallery[0] || form.heroImage || '',
      gallery, quickOptions: form.quickOptions || [],
      notes, features: { left: fl, right: fr },
      rentalPricePerDay: Number(form.rentalPricePerDay) || 0,
      rentalPricePerEvent: Number(form.rentalPricePerEvent) || 0,
      currency: form.currency || 'JOD',
    }
    setSaving(true)
    try {
      if (edit) await updateProduct(edit.slug, data); else await addProduct(data)
      setModal(false)
    } catch (err: any) { alert('Error: ' + (err.message || 'Failed to save')) }
    finally { setSaving(false) }
  }
  const del = async (slug: string) => {
    try { await deleteProduct(slug) } catch (err: any) { alert('Error: ' + (err.message || 'Failed to delete')) }
    setConfirm(null)
  }

  // Gallery management
  const addGalleryImage = (url: string) => {
    setForm((f: any) => ({ ...f, gallery: [...(f.gallery || []), url] }))
  }
  const removeGalleryImage = (idx: number) => {
    setForm((f: any) => ({ ...f, gallery: (f.gallery || []).filter((_: any, i: number) => i !== idx) }))
  }
  const replaceGalleryImage = (idx: number, url: string) => {
    setForm((f: any) => {
      const g = [...(f.gallery || [])]
      g[idx] = url
      return { ...f, gallery: g }
    })
  }
  const moveGalleryImage = (idx: number, dir: -1 | 1) => {
    setForm((f: any) => {
      const g = [...(f.gallery || [])]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= g.length) return f
      ;[g[idx], g[newIdx]] = [g[newIdx], g[idx]]
      return { ...f, gallery: g }
    })
  }

  // Quick options helpers
  const addOption = () => { setForm((f: any) => ({ ...f, quickOptions: [...(f.quickOptions || []), { label: '', values: [''] }] })) }
  const updateOption = (idx: number, field: string, val: any) => {
    setForm((f: any) => {
      const opts = [...(f.quickOptions || [])]
      if (field === 'label') opts[idx] = { ...opts[idx], label: val }
      else opts[idx] = { ...opts[idx], values: val.split(',').map((v: string) => v.trim()) }
      return { ...f, quickOptions: opts }
    })
  }
  const removeOption = (idx: number) => { setForm((f: any) => ({ ...f, quickOptions: (f.quickOptions || []).filter((_: any, i: number) => i !== idx) })) }

  return (
    <div>
      <div className="flex items-center justify-between mb-6"><h1 className={`font-display text-xl font-bold ${txt}`}>Products</h1><button onClick={openNew} className="btn-primary !px-4 !py-2 !text-xs !rounded-xl"><span>+ Add Product</span></button></div>
      <div className="card-surface rounded-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead><tr className={`border-b ${isDark ? 'border-purple-500/20' : 'border-gray-100'}`}><th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Product</th><th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell ${th}`}>Badge</th><th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider hidden md:table-cell ${th}`}>Category</th><th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Images</th><th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Price</th><th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Actions</th></tr></thead>
          <tbody>{products.map(p => (
            <tr key={p.slug} className={`border-b transition-colors ${row}`}>
              <td className="px-5 py-3.5"><div className="flex items-center gap-3">{p.heroImage && <img src={p.heroImage} alt="" className="w-10 h-7 rounded-lg object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />}<div><span className={`text-sm font-semibold ${txt}`}>{p.name}</span>{p.featured && <span className={`ml-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isDark ? 'bg-prism-violet/15 text-prism-violet' : 'bg-violet-50 text-violet-600'}`}>FEATURED</span>}<p className={`text-[11px] mt-0.5 line-clamp-1 ${sub}`}>{p.shortDescription}</p></div></div></td>
              <td className="px-5 py-3.5 hidden sm:table-cell"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${p.badgeColor}`}>{p.badge}</span></td>
              <td className={`px-5 py-3.5 text-xs hidden md:table-cell ${sub}`}>{categories.find(c => c.id === p.categoryId)?.name || '-'}</td>
              <td className={`px-5 py-3.5 text-xs font-mono ${sub}`}>{p.gallery.length} 📷</td>
              <td className={`px-5 py-3.5 text-sm font-mono ${txt}`}>{p.rentalPricePerDay} {p.currency}</td>
              <td className="px-5 py-3.5 space-x-2"><button onClick={() => openEdit(p)} className={`text-xs font-medium ${isDark ? 'text-prism-violet hover:text-prism-violet' : 'text-violet-600 hover:text-violet-500'}`}>Edit</button><button onClick={() => setConfirm(p.slug)} className="text-xs font-medium text-red-400/90 hover:text-red-400">Delete</button></td>
            </tr>
          ))}</tbody>
        </table>
        {products.length === 0 && <p className={`p-8 text-center text-sm ${sub}`}>No products yet.</p>}
      </div>

      {/* FULL PRODUCT EDITOR MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? `Edit: ${edit.name}` : 'Add Product'}>
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setTab('basic')} className={tabCls('basic')}>Basic Info</button>
            <button onClick={() => setTab('content')} className={tabCls('content')}>Content</button>
            <button onClick={() => setTab('images')} className={tabCls('images')}>📷 Images ({(form.gallery || []).length})</button>
            <button onClick={() => setTab('options')} className={tabCls('options')}>Options & Features</button>
          </div>

          {/* TAB: BASIC */}
          {tab === 'basic' && <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Product Name *</label><input value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className="form-field" placeholder="Bike Blender" /></div>
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Slug (URL)</label><input value={form.slug || ''} onChange={e => setForm({...form, slug: e.target.value})} className="form-field" placeholder="auto-generated" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Badge Text</label><input value={form.badge || ''} onChange={e => setForm({...form, badge: e.target.value})} className="form-field" placeholder="Most Popular" /></div>
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Badge Gradient</label><input value={form.badgeColor || ''} onChange={e => setForm({...form, badgeColor: e.target.value})} className="form-field" placeholder="from-violet-500 to-pink-500" /></div>
            </div>
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Category *</label><select value={form.categoryId || ''} onChange={e => setForm({...form, categoryId: e.target.value})} className="form-field"><option value="">-- Select Category --</option>{categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Tags (comma-separated)</label><input value={typeof form.categoryTags === 'string' ? form.categoryTags : (form.categoryTags || []).join(', ')} onChange={e => setForm({...form, categoryTags: e.target.value})} className="form-field" placeholder="Interactive, Wellness" /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price/Day *</label><input type="number" value={form.rentalPricePerDay || 0} onChange={e => setForm({...form, rentalPricePerDay: e.target.value})} className="form-field" /></div>
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price/Event *</label><input type="number" value={form.rentalPricePerEvent || 0} onChange={e => setForm({...form, rentalPricePerEvent: e.target.value})} className="form-field" /></div>
              <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Currency</label><input value={form.currency || 'JOD'} onChange={e => setForm({...form, currency: e.target.value})} className="form-field" /></div>
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={!!form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="w-4 h-4 rounded accent-violet-500" /><span className={`text-sm ${isDark ? 'text-purple-100/90' : 'text-gray-600'}`}>Featured on homepage</span></label>
          </div>}

          {/* TAB: CONTENT */}
          {tab === 'content' && <div className="space-y-4">
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Short Description</label><input value={form.shortDescription || ''} onChange={e => setForm({...form, shortDescription: e.target.value})} className="form-field" placeholder="One line summary..." /></div>
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Full Description</label><textarea value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className="form-field resize-none" rows={5} placeholder="Full product description..." /></div>
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Notes (one per line)</label><textarea value={typeof form.notes === 'string' ? form.notes : (form.notes || []).join('\n')} onChange={e => setForm({...form, notes: e.target.value})} className="form-field resize-none" rows={4} placeholder={"Requires fresh ingredients\nNeeds 1x power outlet\nSetup time: ~30 min"} /></div>
          </div>}

          {/* TAB: IMAGES - New upload-based system */}
          {tab === 'images' && <div className="space-y-5">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-violet-50/50 border border-violet-100'}`}>
              <p className={`text-xs font-medium ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>📷 The first image in the gallery is used as the hero image. Drag & drop or click to upload. You can add as many images as you want.</p>
            </div>

            {/* Existing gallery images */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {(form.gallery || []).map((url: string, idx: number) => (
                <div key={idx} className="relative group">
                  <div className="aspect-video rounded-xl overflow-hidden">
                    <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                  {/* Overlay controls */}
                  <div className={`absolute inset-0 rounded-xl flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-black/60' : 'bg-white/70'}`}>
                    {idx === 0 && <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-cyan-400/20 text-cyan-300' : 'bg-violet-100 text-violet-700'}`}>HERO</span>}
                    {idx > 0 && <button type="button" onClick={() => moveGalleryImage(idx, -1)} className={`text-[10px] px-1.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>◀</button>}
                    {idx < (form.gallery || []).length - 1 && <button type="button" onClick={() => moveGalleryImage(idx, 1)} className={`text-[10px] px-1.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>▶</button>}
                    <button type="button" onClick={() => removeGalleryImage(idx)} className="text-[10px] px-1.5 py-1 rounded-lg bg-red-500/40 text-white">✕</button>
                  </div>
                  {/* Replace via hidden uploader */}
                  <ImageUploader value="" compact onChange={(url) => replaceGalleryImage(idx, url)} folder="products" />
                </div>
              ))}

              {/* Add new image slot */}
              <ImageUploader compact onChange={addGalleryImage} folder="products" />
            </div>

            <p className={`text-[11px] ${sub}`}>Total: {(form.gallery || []).length} image{(form.gallery || []).length !== 1 ? 's' : ''}. Click 📎 to add more or ✕ to remove.</p>
          </div>}

          {/* TAB: OPTIONS & FEATURES */}
          {tab === 'options' && <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3"><label className={`text-[12px] font-medium ${sub}`}>Quick Options</label><button onClick={addOption} className={`text-[11px] font-semibold px-3 py-1 rounded-lg ${isDark ? 'bg-prism-violet/15 text-prism-violet' : 'bg-violet-50 text-violet-600'}`}>+ Add Option</button></div>
              <div className="space-y-2">
                {(form.quickOptions || []).map((opt: any, idx: number) => (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl ${isDark ? 'bg-purple-500/[0.07] border border-purple-500/20' : 'bg-violet-50/50 border border-violet-100'}`}>
                    <input value={opt.label} onChange={e => updateOption(idx, 'label', e.target.value)} className="form-field !py-2 !text-xs flex-1" placeholder="Label (e.g. Bikes)" />
                    <input value={opt.values?.join(', ') || ''} onChange={e => updateOption(idx, 'values', e.target.value)} className="form-field !py-2 !text-xs flex-[2]" placeholder="Values: 1, 2, 3, 4" />
                    <button onClick={() => removeOption(idx)} className="text-red-400/90 hover:text-red-400 text-xs shrink-0 px-2">✕</button>
                  </div>
                ))}
              </div>
            </div>
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Features - Left Column (one per line)</label><textarea value={typeof form.featuresLeft === 'string' ? form.featuresLeft : (form.features?.left || []).join('\n')} onChange={e => setForm({...form, featuresLeft: e.target.value})} className="form-field resize-none" rows={4} /></div>
            <div><label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Features - Right Column (one per line)</label><textarea value={typeof form.featuresRight === 'string' ? form.featuresRight : (form.features?.right || []).join('\n')} onChange={e => setForm({...form, featuresRight: e.target.value})} className="form-field resize-none" rows={4} /></div>
          </div>}

          <div className={`flex gap-3 pt-3 border-t ${isDark ? 'border-purple-500/20' : 'border-gray-100'}`}>
            <button onClick={save} disabled={saving} className="btn-primary !rounded-xl !px-6 !py-2.5 disabled:opacity-50"><span>{saving ? '⏳ Saving...' : edit ? 'Save Changes' : 'Add Product'}</span></button>
            <button onClick={() => setModal(false)} className="btn-outline !rounded-xl !px-6 !py-2.5">Cancel</button>
          </div>
        </div>
      </Modal>

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Product?">
        <p className={`text-sm mb-5 ${sub}`}>This will permanently remove the product and all its data.</p>
        <div className="flex gap-3"><button onClick={() => del(confirm!)} className="btn-danger !px-5 !py-2.5">Delete</button><button onClick={() => setConfirm(null)} className="btn-outline !rounded-xl !px-5 !py-2.5">Cancel</button></div>
      </Modal>
    </div>
  )
}
