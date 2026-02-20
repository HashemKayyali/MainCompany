import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import { slugify } from '../../utils/format'
import type { Product } from '../../data/products/types'

const EMPTY: Product = {
  slug: '',
  name: '',
  badge: '',
  badgeColor: 'linear-gradient(90deg, #8b5cf6, #ec4899)',
  categoryTags: [],
  categoryId: '',
  shortDescription: '',
  description: '',
  featured: false,
  heroImage: '',
  gallery: [],
  quickOptions: [],
  notes: [],
  features: { left: [], right: [] },
  rentalPricePerDay: 0,
  rentalPricePerEvent: 0,
  currency: 'JOD',
  showPrice: true,
}

type TabKey = 'basic' | 'content' | 'images' | 'options'

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct } = useData()
  const { isDark } = useTheme()

  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState<Product | null>(null)
  const [form, setForm] = useState<any>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('basic')
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')

  // theme tokens
  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const soft = isDark ? 'bg-purple-500/[0.06] border border-purple-500/20' : 'bg-white border border-gray-200 shadow-sm'
  const soft2 = isDark ? 'bg-purple-500/[0.04] border border-purple-500/15' : 'bg-gray-50 border border-gray-100'
  const th = isDark ? 'text-purple-200/60' : 'text-gray-500'
  const rowHover = isDark ? 'hover:bg-purple-500/[0.06]' : 'hover:bg-violet-50/40'
  const divider = isDark ? 'border-purple-500/20' : 'border-gray-100'

    // ===== Badge Gradient (Color pickers -> CSS linear-gradient) =====
  const DEFAULT_FROM = '#8b5cf6'
  const DEFAULT_TO = '#ec4899'

  const normalizeHexForColorInput = (hex: string | undefined, fallback: string) => {
    const h = String(hex || fallback).trim()

    // #RGB -> #RRGGBB
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      const r = h[1], g = h[2], b = h[3]
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
    }

    // #RRGGBBAA -> #RRGGBB (drop alpha)
    if (/^#[0-9a-fA-F]{8}$/.test(h)) return h.slice(0, 7).toLowerCase()

    // #RRGGBB
    if (/^#[0-9a-fA-F]{6}$/.test(h)) return h.toLowerCase()

    return fallback.toLowerCase()
  }

  const parseGradient = (badgeColor: string) => {
    const raw = String(badgeColor || '')

    // New format: CSS linear-gradient(...)
    if (raw.includes('linear-gradient')) {
      // grab up to 2 hex colors from the gradient
      const hexes = raw.match(/#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || []
      return {
        fromHex: normalizeHexForColorInput(hexes[0], DEFAULT_FROM),
        toHex: normalizeHexForColorInput(hexes[1], DEFAULT_TO),
      }
    }

    // Backward-compat: Tailwind gradient classes like "from-violet-500 to-pink-500"
    // We can't reliably map every tailwind color to exact hex here, so we keep safe defaults.
    return { fromHex: DEFAULT_FROM, toHex: DEFAULT_TO }
  }

  const setBadgeGradientFromPickers = (fromHex: string, toHex: string) => {
    const from = normalizeHexForColorInput(fromHex, DEFAULT_FROM)
    const to = normalizeHexForColorInput(toHex, DEFAULT_TO)
    const css = `linear-gradient(90deg, ${from}, ${to})`
    setForm((f: any) => ({
      ...f,
      badgeColor: css,
      badgeFromHex: from,
      badgeToHex: to,
    }))
  }

  const tabCls = (t: TabKey) =>
    [
      'px-4 py-2 rounded-xl text-[12px] font-semibold transition-all border',
      tab === t
        ? isDark
          ? 'bg-prism-violet/15 text-prism-violet border-prism-violet/40 shadow-[0_0_0_1px_rgba(168,85,247,0.25)]'
          : 'bg-violet-50 text-violet-700 border-violet-200'
        : isDark
          ? 'bg-transparent text-purple-200/70 border-transparent hover:bg-purple-500/[0.08] hover:border-purple-500/20'
          : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50 hover:border-gray-200',
    ].join(' ')

  const openNew = () => {
    setEdit(null)
    const g = parseGradient(EMPTY.badgeColor)
    setForm({
      ...EMPTY,
      categoryTags: '',
      notes: '',
      featuresLeft: '',
      featuresRight: '',
      gallery: [],
      badgeFromHex: g.fromHex,
      badgeToHex: g.toHex,
      showPrice: true,
    })
    setTab('basic')
    setModal(true)
  }

  const openEdit = (p: Product) => {
    setEdit(p)
    const g = parseGradient(p.badgeColor || 'linear-gradient(90deg, #8b5cf6, #ec4899)')
    setForm({
      ...p,
      categoryTags: p.categoryTags.join(', '),
      notes: p.notes.join('\n'),
      featuresLeft: p.features.left.join('\n'),
      featuresRight: p.features.right.join('\n'),
      gallery: [...p.gallery],
      badgeFromHex: g.fromHex,
      badgeToHex: g.toHex,
      showPrice: p.showPrice !== false,
    })
    setTab('basic')
    setModal(true)
  }

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return products
    return products.filter(p => {
      const catName = categories.find(c => c.id === p.categoryId)?.name || ''
      return (
        p.name.toLowerCase().includes(needle) ||
        p.slug.toLowerCase().includes(needle) ||
        (p.badge || '').toLowerCase().includes(needle) ||
        catName.toLowerCase().includes(needle)
      )
    })
  }, [products, q, categories])

  const save = async () => {
    // normalize
    const tags =
      typeof form.categoryTags === 'string'
        ? form.categoryTags.split(',').map((t: string) => t.trim()).filter(Boolean)
        : form.categoryTags

    const notes =
      typeof form.notes === 'string' ? form.notes.split('\n').map((n: string) => n.trim()).filter(Boolean) : form.notes || []

    const fl =
      typeof form.featuresLeft === 'string'
        ? form.featuresLeft.split('\n').map((n: string) => n.trim()).filter(Boolean)
        : form.features?.left || []

    const fr =
      typeof form.featuresRight === 'string'
        ? form.featuresRight.split('\n').map((n: string) => n.trim()).filter(Boolean)
        : form.features?.right || []

    const gallery = form.gallery || []

    const data: Product = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      badge: form.badge,
      badgeColor: form.badgeColor || 'linear-gradient(90deg, #8b5cf6, #ec4899)',
      categoryTags: tags,
      categoryId: form.categoryId || '',
      shortDescription: form.shortDescription || '',
      description: form.description || '',
      featured: !!form.featured,
      showPrice: form.showPrice !== false,
      heroImage: gallery[0] || form.heroImage || '',
      gallery,
      quickOptions: form.quickOptions || [],
      notes,
      features: { left: fl, right: fr },
      rentalPricePerDay: Number(form.rentalPricePerDay) || 0,
      rentalPricePerEvent: Number(form.rentalPricePerEvent) || 0,
      currency: form.currency || 'JOD',
    }

    // minimal guard (UI only)
    if (!data.name?.trim()) return alert('Product name is required')
    if (!data.categoryId?.trim()) return alert('Category is required')

    setSaving(true)
    try {
      if (edit) await updateProduct(edit.slug, data)
      else await addProduct(data)
      setModal(false)
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to save'))
    } finally {
      setSaving(false)
    }
  }

  const del = async (slug: string) => {
    try {
      await deleteProduct(slug)
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to delete'))
    }
    setConfirm(null)
  }

  // gallery management
  const addGalleryImage = (url: string) => setForm((f: any) => ({ ...f, gallery: [...(f.gallery || []), url] }))
  const removeGalleryImage = (idx: number) => setForm((f: any) => ({ ...f, gallery: (f.gallery || []).filter((_: any, i: number) => i !== idx) }))
  const replaceGalleryImage = (idx: number, url: string) =>
    setForm((f: any) => {
      const g = [...(f.gallery || [])]
      g[idx] = url
      return { ...f, gallery: g }
    })
  const moveGalleryImage = (idx: number, dir: -1 | 1) =>
    setForm((f: any) => {
      const g = [...(f.gallery || [])]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= g.length) return f
      ;[g[idx], g[newIdx]] = [g[newIdx], g[idx]]
      return { ...f, gallery: g }
    })

  // quick options
  const addOption = () => setForm((f: any) => ({ ...f, quickOptions: [...(f.quickOptions || []), { label: '', values: [''] }] }))
  const updateOption = (idx: number, field: string, val: any) =>
    setForm((f: any) => {
      const opts = [...(f.quickOptions || [])]
      if (field === 'label') opts[idx] = { ...opts[idx], label: val }
      else opts[idx] = { ...opts[idx], values: String(val).split(',').map((v: string) => v.trim()).filter(Boolean) }
      return { ...f, quickOptions: opts }
    })
  const removeOption = (idx: number) => setForm((f: any) => ({ ...f, quickOptions: (f.quickOptions || []).filter((_: any, i: number) => i !== idx) }))

  const catName = (id: string) => categories.find(c => c.id === id)?.name || '-'

  const Step = ({ k, label, hint }: { k: TabKey; label: string; hint: string }) => (
    <button onClick={() => setTab(k)} className={tabCls(k)} type="button">
      <div className="flex flex-col items-start leading-4">
        <span>{label}</span>
        <span className={isDark ? 'text-[10px] text-purple-200/50' : 'text-[10px] text-gray-400'}>{hint}</span>
      </div>
    </button>
  )

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div className="min-w-0">
          <h1 className={`font-display text-2xl font-bold ${txt}`}>Products</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          {/* Search */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${soft}`}>
            <span className={isDark ? 'text-purple-200/60' : 'text-gray-400'}>⌕</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className={`bg-transparent outline-none text-[12px] w-[240px] sm:w-[320px] ${isDark ? 'placeholder:text-purple-200/40' : 'placeholder:text-gray-400'}`}
              placeholder="Search by name, badge, category…"
            />
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border ${isDark ? 'border-purple-500/20 text-purple-200/60' : 'border-gray-200 text-gray-500'}`}>
              {filtered.length}/{products.length}
            </span>
          </div>

          <button onClick={openNew} className="btn-primary !px-4 !py-2 !text-xs !rounded-xl">
            + Add Product
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`rounded-2xl overflow-hidden ${soft}`}>
        <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
          <div>
            <p className={`text-sm font-semibold ${txt}`}>All Products</p>
          </div>

          <div className={`hidden sm:flex items-center gap-2 text-[11px] ${sub}`}>
            <span className={`px-2 py-1 rounded-full border ${isDark ? 'border-purple-500/20 bg-purple-500/[0.05]' : 'border-gray-200 bg-gray-50'}`}>
              Tip: use Featured to highlight on homepage
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${divider}`}>
                <th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Product</th>
                <th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider hidden sm:table-cell ${th}`}>Badge</th>
                <th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider hidden md:table-cell ${th}`}>Category</th>
                <th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Gallery</th>
                <th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Price/Day</th>
                <th className={`px-5 py-3 text-[10px] font-mono uppercase tracking-wider ${th}`}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(p => (
                <tr key={p.slug} className={`border-b ${divider} transition-colors ${rowHover}`}>
                  <td className="px-5 py-3.5">
                    <button type="button" onClick={() => openEdit(p)} className="w-full text-left">
                      <div className="flex items-center gap-3">
                        {p.heroImage ? (
                          <img
                            src={p.heroImage}
                            alt=""
                            className="w-12 h-9 rounded-xl object-cover border border-white/5"
                            onError={e => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className={`w-12 h-9 rounded-xl ${soft2} flex items-center justify-center text-[10px] ${sub}`}>
                            No Img
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-semibold ${txt} truncate`}>{p.name}</span>
                            {p.featured && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                                  isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'
                                }`}
                              >
                                FEATURED
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-0.5 line-clamp-1 ${sub}`}>{p.shortDescription || '—'}</p>
                          <p className={`text-[10px] mt-1 font-mono ${isDark ? 'text-purple-200/45' : 'text-gray-400'}`}>/{p.slug}</p>
                        </div>
                      </div>
                    </button>
                  </td>

                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {p.badge ? (
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold text-white max-w-[140px] truncate ${String(p.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${p.badgeColor}`}`}
                        style={String(p.badgeColor || '').includes('linear-gradient') ? { backgroundImage: p.badgeColor } : undefined}
                      >
                        {p.badge}
                      </span>
                    ) : (
                      <span className={`text-[11px] ${sub}`}>—</span>
                    )}
                  </td>

                  <td className={`px-5 py-3.5 text-xs hidden md:table-cell ${sub}`}>{catName(p.categoryId)}</td>

                  <td className={`px-5 py-3.5 text-xs font-mono ${sub}`}>
                    <span className={`px-2 py-1 rounded-full border ${isDark ? 'border-purple-500/20 bg-purple-500/[0.05]' : 'border-gray-200 bg-gray-50'}`}>
                      {p.gallery.length} 📷
                    </span>
                  </td>

                  {/* ✅ hide price if showPrice=false */}
                  <td className={`px-5 py-3.5 text-sm font-mono ${txt}`}>
                    {p.showPrice === false ? <span className={`text-[11px] ${sub}`}>Hidden</span> : <>{p.rentalPricePerDay} {p.currency}</>}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition',
                          isDark
                            ? 'border-purple-500/20 bg-purple-500/[0.06] text-purple-200/90 hover:bg-purple-500/10'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
                        ].join(' ')}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirm(p.slug)}
                        className={[
                          'px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition',
                          isDark
                            ? 'border-red-400/20 bg-red-400/10 text-red-200/90 hover:bg-red-400/15'
                            : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
                        ].join(' ')}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-10 text-center">
            <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${soft2}`}>
              <span className="text-2xl">📦</span>
            </div>
            <p className={`mt-4 font-semibold ${txt}`}>No products found</p>
            <p className={`mt-1 text-sm ${sub}`}>Try a different search, or add your first product.</p>
            <button onClick={openNew} className="btn-primary !mt-5 !px-5 !py-2.5 !text-xs !rounded-xl">
              + Add Product
            </button>
          </div>
        )}
      </div>

      {/* FULL PRODUCT EDITOR MODAL */}
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? `Edit Product` : 'Add Product'}>
        <div className="space-y-5">
          {/* Steps */}
          <div className="flex flex-wrap gap-2">
            <Step k="basic" label="Basic" hint="Name / Category / Price" />
            <Step k="content" label="Content" hint="Descriptions / Notes" />
            <Step k="images" label={`Images (${(form.gallery || []).length})`} hint="Upload & order" />
            <Step k="options" label="Options" hint="Quick options / Features" />
          </div>

          {/* Panel */}
          <div className={`rounded-2xl p-4 ${soft}`}>
            {/* TAB: BASIC */}
            {tab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Product Name *</label>
                    <input
                      value={form.name || ''}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="form-field"
                      placeholder="Bike Blender"
                    />
                  </div>
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Slug (URL)</label>
                    <input
                      value={form.slug || ''}
                      onChange={e => setForm({ ...form, slug: e.target.value })}
                      className="form-field"
                      placeholder="auto-generated"
                    />
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>
                      Leave empty to auto-generate from name.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Badge Text</label>
                    <input
                      value={form.badge || ''}
                      onChange={e => setForm({ ...form, badge: e.target.value })}
                      className="form-field"
                      placeholder="Most Popular"
                    />
                  </div>

                  {/* ✅ Badge Gradient pickers */}
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Badge Gradient</label>

                    <div className="flex items-start gap-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${soft2}`}>
                        <span className={`text-[11px] ${sub}`}>From</span>
                        <input
                          type="color"
                          value={form.badgeFromHex || DEFAULT_FROM}
                          onChange={e => setBadgeGradientFromPickers(e.target.value, form.badgeToHex || DEFAULT_TO)}
                          className="w-10 h-8 p-0 bg-transparent border-0 cursor-pointer"
                        />
                      </div>

                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${soft2}`}>
                        <span className={`text-[11px] ${sub}`}>To</span>
                        <input
                          type="color"
                          value={form.badgeToHex || DEFAULT_TO}
                          onChange={e => setBadgeGradientFromPickers(form.badgeFromHex || DEFAULT_FROM, e.target.value)}
                          className="w-10 h-8 p-0 bg-transparent border-0 cursor-pointer"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className={`px-3 py-2 rounded-xl border ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
                          <div
                            className={`inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-bold text-white max-w-full overflow-hidden ${String(form.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${form.badgeColor || ''}`}`}
                            style={String(form.badgeColor || '').includes('linear-gradient') ? { backgroundImage: form.badgeColor } : undefined}
                            title={form.badge?.trim() ? form.badge : 'Badge Preview'}
                          >
                            <span className="min-w-0 truncate">{form.badge?.trim() ? form.badge : 'Badge Preview'}</span>
                          </div>
                          <p className={`text-[10px] mt-2 font-mono ${isDark ? 'text-purple-200/45' : 'text-gray-400'} truncate`}>
                            {form.badgeColor || 'linear-gradient(90deg, #8b5cf6, #ec4899)'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Category *</label>
                  <select
                    value={form.categoryId || ''}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="form-field"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Tags (comma-separated)</label>
                  <input
                    value={typeof form.categoryTags === 'string' ? form.categoryTags : (form.categoryTags || []).join(', ')}
                    onChange={e => setForm({ ...form, categoryTags: e.target.value })}
                    className="form-field"
                    placeholder="Interactive, Wellness"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price/Day *</label>
                    <input
                      type="number"
                      value={form.rentalPricePerDay || 0}
                      onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price/Event *</label>
                    <input
                      type="number"
                      value={form.rentalPricePerEvent || 0}
                      onChange={e => setForm({ ...form, rentalPricePerEvent: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Currency</label>
                    <input
                      value={form.currency || 'JOD'}
                      onChange={e => setForm({ ...form, currency: e.target.value })}
                      className="form-field"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!form.featured}
                      onChange={e => setForm({ ...form, featured: e.target.checked })}
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-purple-100/90' : 'text-gray-700'}`}>Featured on homepage</span>
                  </label>

                  {/* ✅ Show price checkbox */}
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.showPrice !== false}
                      onChange={e => setForm({ ...form, showPrice: e.target.checked })}
                      className="w-4 h-4 rounded accent-violet-500"
                    />
                    <span className={`text-sm ${isDark ? 'text-purple-100/90' : 'text-gray-700'}`}>Show price on website</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB: CONTENT */}
            {tab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Short Description</label>
                  <input
                    value={form.shortDescription || ''}
                    onChange={e => setForm({ ...form, shortDescription: e.target.value })}
                    className="form-field"
                    placeholder="One line summary…"
                  />
                </div>

                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Full Description</label>
                  <textarea
                    value={form.description || ''}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    className="form-field resize-none"
                    rows={6}
                    placeholder="Full product description…"
                  />
                </div>

                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Notes (one per line)</label>
                  <textarea
                    value={typeof form.notes === 'string' ? form.notes : (form.notes || []).join('\n')}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="form-field resize-none"
                    rows={5}
                    placeholder={'Requires fresh ingredients\nNeeds 1x power outlet\nSetup time: ~30 min'}
                  />
                </div>
              </div>
            )}

            {/* TAB: IMAGES */}
            {tab === 'images' && (
              <div className="space-y-5">
                <div className={`p-4 rounded-xl ${soft2}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-purple-200/85' : 'text-gray-700'}`}>
                    📷 The first image is the hero image. Upload images, then reorder them using arrows.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(form.gallery || []).map((url: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-video rounded-xl overflow-hidden border border-white/5">
                        <img
                          src={url}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>

                      <div
                        className={`absolute inset-0 rounded-xl flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDark ? 'bg-black/60' : 'bg-white/70'
                        }`}
                      >
                        {idx === 0 && (
                          <span className={`absolute top-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-cyan-400/20 text-cyan-200' : 'bg-violet-100 text-violet-700'}`}>
                            HERO
                          </span>
                        )}

                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, -1)}
                            className={`text-[10px] px-2 py-1 rounded-lg border ${isDark ? 'border-purple-500/20 bg-purple-500/25 text-white' : 'border-gray-200 bg-white text-gray-700'}`}
                          >
                            ◀
                          </button>
                        )}

                        {idx < (form.gallery || []).length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, 1)}
                            className={`text-[10px] px-2 py-1 rounded-lg border ${isDark ? 'border-purple-500/20 bg-purple-500/25 text-white' : 'border-gray-200 bg-white text-gray-700'}`}
                          >
                            ▶
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className={`text-[10px] px-2 py-1 rounded-lg border ${isDark ? 'border-red-400/20 bg-red-400/25 text-white' : 'border-red-200 bg-red-50 text-red-700'}`}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="mt-2">
                        <ImageUploader value="" compact onChange={u => replaceGalleryImage(idx, u)} folder="products" />
                      </div>
                    </div>
                  ))}

                  <div className={`rounded-xl ${soft2} p-2`}>
                    <ImageUploader compact onChange={addGalleryImage} folder="products" />
                  </div>
                </div>

                <p className={`text-[11px] ${sub}`}>Total: {(form.gallery || []).length} image(s).</p>
              </div>
            )}

            {/* TAB: OPTIONS */}
            {tab === 'options' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-[12px] font-medium ${sub}`}>Quick Options</label>
                    <button
                      onClick={addOption}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-lg border ${
                        isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'
                      }`}
                    >
                      + Add Option
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(form.quickOptions || []).map((opt: any, idx: number) => (
                      <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl ${soft2}`}>
                        <input
                          value={opt.label}
                          onChange={e => updateOption(idx, 'label', e.target.value)}
                          className="form-field !py-2 !text-xs flex-1"
                          placeholder="Label (e.g. Bikes)"
                        />
                        <input
                          value={opt.values?.join(', ') || ''}
                          onChange={e => updateOption(idx, 'values', e.target.value)}
                          className="form-field !py-2 !text-xs flex-[2]"
                          placeholder="Values: 1, 2, 3, 4"
                        />
                        <button
                          onClick={() => removeOption(idx)}
                          className={`px-3 py-2 rounded-lg text-[11px] font-semibold border ${
                            isDark ? 'border-red-400/20 bg-red-400/10 text-red-200/90 hover:bg-red-400/15' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                          }`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Features - Left Column (one per line)</label>
                  <textarea
                    value={typeof form.featuresLeft === 'string' ? form.featuresLeft : (form.features?.left || []).join('\n')}
                    onChange={e => setForm({ ...form, featuresLeft: e.target.value })}
                    className="form-field resize-none"
                    rows={5}
                  />
                </div>

                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Features - Right Column (one per line)</label>
                  <textarea
                    value={typeof form.featuresRight === 'string' ? form.featuresRight : (form.features?.right || []).join('\n')}
                    onChange={e => setForm({ ...form, featuresRight: e.target.value })}
                    className="form-field resize-none"
                    rows={5}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className={`flex flex-col sm:flex-row gap-3 pt-2`}>
            <button onClick={save} disabled={saving} className="btn-primary !rounded-xl !px-6 !py-2.5 disabled:opacity-50">
              {saving ? '⏳ Saving…' : edit ? 'Save Changes' : 'Add Product'}
            </button>
            <button onClick={() => setModal(false)} className="btn-outline !rounded-xl !px-6 !py-2.5">
              Cancel
            </button>

            <div className="sm:ml-auto text-[11px] leading-4">
              <p className={sub}>
                Hero image: <span className={txt}>{(form.gallery || [])[0] ? 'Gallery #1' : 'None'}</span>
              </p>
              <p className={isDark ? 'text-purple-200/45' : 'text-gray-400'}>Save will auto-generate slug if empty.</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Product?">
        <p className={`text-sm mb-5 ${sub}`}>This will permanently remove the product and all its data.</p>
        <div className="flex gap-3">
          <button onClick={() => del(confirm!)} className="btn-danger !px-5 !py-2.5">
            Delete
          </button>
          <button onClick={() => setConfirm(null)} className="btn-outline !rounded-xl !px-5 !py-2.5">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}