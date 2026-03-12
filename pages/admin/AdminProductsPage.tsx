import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import VideoUploader from '../../components/ui/VideoUploader'
import { slugify } from '../../utils/format'
import type { Product } from '../../data/products/types'

/* ── 20 Badge Presets ── */
const BADGE_OPTIONS = [
  'Most Popular',
  'New',
  'Best Seller',
  'Limited Edition',
  'Trending',
  'Staff Pick',
  'Exclusive',
  'Premium',
  'Competitive',
  'Immersive',
  'Interactive',
  'LED Show',
  'Racing',
  'Custom',
  'VR Experience',
  'Wellness',
  'Party',
  'Corporate',
  'Outdoor',
  'Featured',
]

const toThumbUrl = (url: string) => (url && url.includes('-hero.webp') ? url.replace('-hero.webp', '-thumb.webp') : url)

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
  videoUrl: '',
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
  const dialog = useDialog()

  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState<Product | null>(null)
  const [form, setForm] = useState<any>({})
  const [confirm, setConfirm] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>('basic')
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const soft = isDark ? 'bg-purple-500/[0.06] border border-purple-500/20' : 'bg-white border border-gray-200 shadow-sm'
  const soft2 = isDark ? 'bg-purple-500/[0.04] border border-purple-500/15' : 'bg-gray-50 border border-gray-100'
  const divider = isDark ? 'border-purple-500/20' : 'border-gray-100'
  const rowHover = isDark ? 'hover:bg-purple-500/[0.06]' : 'hover:bg-violet-50/40'

  /* ── Badge Gradient Helpers ── */
  const DEFAULT_FROM = '#8b5cf6'
  const DEFAULT_TO = '#ec4899'

  const normalizeHex = (hex: string | undefined, fallback: string) => {
    const h = String(hex || fallback).trim()
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      const r = h[1],
        g = h[2],
        b = h[3]
      return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
    }
    if (/^#[0-9a-fA-F]{8}$/.test(h)) return h.slice(0, 7).toLowerCase()
    if (/^#[0-9a-fA-F]{6}$/.test(h)) return h.toLowerCase()
    return fallback.toLowerCase()
  }

  const parseGradient = (badgeColor: string) => {
    const raw = String(badgeColor || '')
    if (raw.includes('linear-gradient')) {
      const hexes = raw.match(/#[0-9a-fA-F]{8}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || []
      return { fromHex: normalizeHex(hexes[0], DEFAULT_FROM), toHex: normalizeHex(hexes[1], DEFAULT_TO) }
    }
    return { fromHex: DEFAULT_FROM, toHex: DEFAULT_TO }
  }

  const setBadgeGradient = (fromHex: string, toHex: string) => {
    const from = normalizeHex(fromHex, DEFAULT_FROM)
    const to = normalizeHex(toHex, DEFAULT_TO)
    setForm((f: any) => ({ ...f, badgeColor: `linear-gradient(90deg, ${from}, ${to})`, badgeFromHex: from, badgeToHex: to }))
  }

  const tabCls = (t: TabKey) =>
    `px-4 py-2 rounded-xl text-[12px] font-semibold transition-all border ${
      tab === t
        ? isDark
          ? 'bg-prism-violet/15 text-prism-violet border-prism-violet/40'
          : 'bg-violet-50 text-violet-700 border-violet-200'
        : isDark
          ? 'bg-transparent text-purple-200/70 border-transparent hover:bg-purple-500/[0.08]'
          : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50'
    }`

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
      videoUrl: '',
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
      videoUrl: p.videoUrl || '',
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
    const tags =
      typeof form.categoryTags === 'string'
        ? form.categoryTags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean)
        : form.categoryTags

    const notes =
      typeof form.notes === 'string'
        ? form.notes
            .split('\n')
            .map((n: string) => n.trim())
            .filter(Boolean)
        : form.notes || []

    const fl =
      typeof form.featuresLeft === 'string'
        ? form.featuresLeft
            .split('\n')
            .map((n: string) => n.trim())
            .filter(Boolean)
        : form.features?.left || []

    const fr =
      typeof form.featuresRight === 'string'
        ? form.featuresRight
            .split('\n')
            .map((n: string) => n.trim())
            .filter(Boolean)
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
      videoUrl: form.videoUrl || '',
      quickOptions: form.quickOptions || [],
      notes,
      features: { left: fl, right: fr },
      rentalPricePerDay: Number(form.rentalPricePerDay) || 0,
      rentalPricePerEvent: Number(form.rentalPricePerEvent) || 0,
      currency: form.currency || 'JOD',
    }

    if (!data.name?.trim()) { await dialog.alert({ title: 'Missing Field', message: 'Product name is required.', variant: 'warning' }); return }
    if (!data.categoryId?.trim()) { await dialog.alert({ title: 'Missing Field', message: 'Category is required.', variant: 'warning' }); return }

    setSaving(true)
    try {
      if (edit) await updateProduct(edit.slug, data)
      else await addProduct(data)
      setModal(false)
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to save', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const del = async (slug: string) => {
    try {
      await deleteProduct(slug)
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to delete', variant: 'danger' })
    }
    setConfirm(null)
  }

  /* Gallery helpers */
  const addGalleryImage = (url: string) => setForm((f: any) => ({ ...f, gallery: [...(f.gallery || []), url] }))
  const removeGalleryImage = (idx: number) => setForm((f: any) => ({ ...f, gallery: (f.gallery || []).filter((_: any, i: number) => i !== idx) }))
  const moveGalleryImage = (idx: number, dir: -1 | 1) =>
    setForm((f: any) => {
      const g = [...(f.gallery || [])]
      const ni = idx + dir
      if (ni < 0 || ni >= g.length) return f
      ;[g[idx], g[ni]] = [g[ni], g[idx]]
      return { ...f, gallery: g }
    })

  /* Quick options */
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

  const BadgePill = ({ p }: { p: Product }) => {
    if (!p.badge) return null
    const isLinear = String(p.badgeColor || '').includes('linear-gradient')
    return (
      <span
        className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white max-w-[180px] truncate"
        style={isLinear ? { backgroundImage: p.badgeColor } : undefined}
      >
        {p.badge}
      </span>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h1 className={`font-display text-2xl font-bold ${txt}`}>Products</h1>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${soft}`}>
            <span className={isDark ? 'text-purple-200/60' : 'text-gray-400'}>⌕</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className={`bg-transparent outline-none text-[12px] w-[210px] sm:w-[320px] ${isDark ? 'placeholder:text-purple-200/40' : 'placeholder:text-gray-400'}`}
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

      {/* ✅ Responsive Cards (بديل الجدول) */}
      <div className={`rounded-2xl overflow-hidden ${soft}`}>
        <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between`}>
          <p className={`text-sm font-semibold ${txt}`}>All Products</p>
          <span className={`text-[11px] ${sub}`}>Tap a card to edit</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <span className="text-2xl">📦</span>
            <p className={`mt-4 font-semibold ${txt}`}>No products found</p>
            <button onClick={openNew} className="btn-primary !mt-5 !px-5 !py-2.5 !text-xs !rounded-xl">
              + Add Product
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            {/* موبايل: عمود واحد — تابلت: عمودين — ديسكتوب: 3 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(p => (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => openEdit(p)}
                  className={`text-left rounded-2xl overflow-hidden border transition ${rowHover} ${
                    isDark ? 'border-purple-500/20 bg-purple-500/[0.04]' : 'border-gray-200 bg-white'
                  }`}
                >
                  {/* Top: image + title */}
                  <div className="flex gap-3 p-3">
                    {p.heroImage ? (
                      <img
                        src={p.heroImage}
                        alt=""
                        className="w-20 h-16 rounded-xl object-cover border border-white/5 flex-none"
                        onError={e => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className={`w-20 h-16 rounded-xl ${soft2} flex-none flex items-center justify-center text-[10px] ${sub}`}>
                        No Img
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-extrabold ${txt} truncate`}>{p.name}</span>
                            {p.featured && (
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold border ${
                                  isDark
                                    ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet'
                                    : 'border-violet-200 bg-violet-50 text-violet-700'
                                }`}
                              >
                                FEATURED
                              </span>
                            )}
                          </div>
                          <p className={`text-[11px] mt-1 line-clamp-2 ${sub}`}>{p.shortDescription || '—'}</p>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <BadgePill p={p} />
                        <span className={`text-[11px] px-2 py-1 rounded-full border ${isDark ? 'border-purple-500/20 bg-purple-500/[0.05] text-purple-200/80' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                          {catName(p.categoryId)}
                        </span>
                        <span className={`text-[11px] px-2 py-1 rounded-full border ${isDark ? 'border-purple-500/20 bg-purple-500/[0.05] text-purple-200/80' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                          {p.gallery.length} 📷
                        </span>
                        {p.videoUrl && (
                          <span className={`text-[11px] px-2 py-1 rounded-full border ${isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200/80' : 'border-blue-200 bg-blue-50 text-blue-600'}`}>
                            🎬 Video
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Middle: price */}
                  <div className={`px-3 pb-3`}>
                    <div className={`rounded-xl p-3 border ${isDark ? 'border-purple-500/20 bg-black/10' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className={`text-[11px] font-semibold ${sub}`}>Price / Day</div>
                        <div className={`text-sm font-mono ${txt}`}>
                          {p.showPrice === false ? <span className={`text-[11px] ${sub}`}>Hidden</span> : <>{p.rentalPricePerDay} {p.currency}</>}
                        </div>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        <div className={`text-[11px] font-semibold ${sub}`}>Slug</div>
                        <div className={`text-[11px] font-mono ${isDark ? 'text-purple-200/80' : 'text-gray-600'} truncate max-w-[65%]`}>
                          {p.slug}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: actions */}
                  <div className={`px-3 pb-3`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold ${sub}`}>Actions:</span>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          openEdit(p)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition ${
                          isDark ? 'border-purple-500/20 bg-purple-500/[0.06] text-purple-200/90' : 'border-gray-200 bg-white text-gray-700'
                        }`}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation()
                          setConfirm(p.slug)
                        }}
                        className={`px-3 py-1.5 rounded-lg text-[11px] font-extrabold border transition ${
                          isDark ? 'border-red-400/20 bg-red-400/10 text-red-200/90' : 'border-red-200 bg-red-50 text-red-700'
                        }`}
                      >
                        Delete
                      </button>

                      <div className="ml-auto">
                        <span className={`text-[10px] font-mono px-2 py-1 rounded-lg border ${isDark ? 'border-purple-500/20 text-purple-200/60' : 'border-gray-200 text-gray-500'}`}>
                          Tap to edit
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ PRODUCT EDITOR MODAL ═══ */}
      <Modal open={modal} onClose={() => setModal(false)} title={edit ? 'Edit Product' : 'Add Product'} persistent>
        <div className="space-y-5">
          {/* Steps */}
          <div className="flex flex-wrap gap-2">
            <Step k="basic" label="Basic" hint="Name / Category / Price" />
            <Step k="content" label="Content" hint="Descriptions / Notes" />
            <Step k="images" label={`Media (${(form.gallery || []).length}${form.videoUrl ? ' +🎬' : ''})`} hint="Images & Video" />
            <Step k="options" label="Options" hint="Quick options / Features" />
          </div>

          <div className={`rounded-2xl p-4 ${soft}`}>
            {/* ═══ TAB: BASIC ═══ */}
            {tab === 'basic' && (
              <div className="space-y-4">
                {/* Name + Slug */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Product Name *</label>
                    <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="form-field" placeholder="Bike Blender" />
                  </div>
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Slug (URL)</label>
                    <input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} className="form-field" placeholder="auto-generated" />
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>Leave empty to auto-generate.</p>
                  </div>
                </div>

                {/* Badge Dropdown + Gradient */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Badge Text</label>
                    <select value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })} className="form-field">
                      <option value="">— No Badge —</option>
                      {BADGE_OPTIONS.map(b => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Badge Gradient</label>
                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${soft2}`}>
                        <span className={`text-[11px] ${sub}`}>From</span>
                        <input
                          type="color"
                          value={form.badgeFromHex || DEFAULT_FROM}
                          onChange={e => setBadgeGradient(e.target.value, form.badgeToHex || DEFAULT_TO)}
                          className="w-8 h-7 p-0 bg-transparent border-0 cursor-pointer rounded"
                        />
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${soft2}`}>
                        <span className={`text-[11px] ${sub}`}>To</span>
                        <input
                          type="color"
                          value={form.badgeToHex || DEFAULT_TO}
                          onChange={e => setBadgeGradient(form.badgeFromHex || DEFAULT_FROM, e.target.value)}
                          className="w-8 h-7 p-0 bg-transparent border-0 cursor-pointer rounded"
                        />
                      </div>
                      {/* Preview */}
                      <div className={`px-3 py-2 rounded-xl border flex-1 min-w-0 ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold text-white truncate ${String(form.badgeColor || '').includes('linear-gradient') ? '' : `bg-gradient-to-r ${form.badgeColor}`}`}
                          style={String(form.badgeColor || '').includes('linear-gradient') ? { backgroundImage: form.badgeColor } : undefined}
                        >
                          {form.badge?.trim() || 'Preview'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Category *</label>
                  <select value={form.categoryId || ''} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="form-field">
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Tags (comma-separated)</label>
                  <input
                    value={typeof form.categoryTags === 'string' ? form.categoryTags : (form.categoryTags || []).join(', ')}
                    onChange={e => setForm({ ...form, categoryTags: e.target.value })}
                    className="form-field"
                    placeholder="Interactive, Wellness"
                  />
                </div>

                {/* Featured + Show Price toggles */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={!!form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded accent-violet-500" />
                    <span className={`text-sm ${isDark ? 'text-purple-100/90' : 'text-gray-700'}`}>Featured on homepage</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={form.showPrice !== false} onChange={e => setForm({ ...form, showPrice: e.target.checked })} className="w-4 h-4 rounded accent-violet-500" />
                    <span className={`text-sm ${isDark ? 'text-purple-100/90' : 'text-gray-700'}`}>Show price on website</span>
                  </label>
                </div>

                {/* Price Fields — only visible when showPrice is ON */}
                {form.showPrice !== false && (
                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl ${soft2}`}>
                    <div>
                      <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price/Day</label>
                      <input type="number" value={form.rentalPricePerDay || 0} onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })} className="form-field" />
                    </div>
                    <div>
                      <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Price/Event</label>
                      <input type="number" value={form.rentalPricePerEvent || 0} onChange={e => setForm({ ...form, rentalPricePerEvent: e.target.value })} className="form-field" />
                    </div>
                    <div>
                      <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Currency</label>
                      <input value={form.currency || 'JOD'} onChange={e => setForm({ ...form, currency: e.target.value })} className="form-field" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═══ TAB: CONTENT ═══ */}
            {tab === 'content' && (
              <div className="space-y-4">
                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Short Description</label>
                  <input value={form.shortDescription || ''} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="form-field" placeholder="One line summary…" />
                </div>
                <div>
                  <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Full Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="form-field resize-none" rows={6} placeholder="Full product description…" />
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

            {/* ═══ TAB: IMAGES (FIXED) ═══ */}
            {tab === 'images' && (
              <div className="space-y-4">
                {/* ── Video Upload ── */}
                <div className={`p-4 rounded-xl border ${isDark ? 'border-purple-500/20 bg-purple-500/[0.03]' : 'border-violet-100 bg-violet-50/30'}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🎬</span>
                    <div>
                      <p className={`text-xs font-semibold ${txt}`}>Product Video (Hover Preview)</p>
                      <p className={`text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>
                        This video plays when visitors hover over the product card. MP4 recommended, max 50MB.
                      </p>
                    </div>
                  </div>
                  <VideoUploader
                    value={form.videoUrl || ''}
                    onChange={(url: string) => setForm((f: any) => ({ ...f, videoUrl: url }))}
                    onRemove={() => setForm((f: any) => ({ ...f, videoUrl: '' }))}
                    folder="products"
                  />
                </div>

                {/* ── Images ── */}
                <div className={`p-3 rounded-xl ${soft2}`}>
                  <p className={`text-xs font-medium ${isDark ? 'text-purple-200/85' : 'text-gray-700'}`}>📷 The first image is the hero. Drag & reorder using arrows.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(form.gallery || []).map((url: string, idx: number) => (
                    <div key={idx} className="relative group">
                      <div className={`aspect-video rounded-xl overflow-hidden border ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
                        <img
                          src={toThumbUrl(url)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                      {idx === 0 && (
                        <span className={`absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${isDark ? 'bg-cyan-400/25 text-cyan-200' : 'bg-violet-100 text-violet-700'}`}>
                          HERO
                        </span>
                      )}
                      <div className={`absolute inset-0 rounded-xl flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-black/60' : 'bg-white/70'}`}>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, -1)}
                            className={`text-[10px] px-2 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}
                          >
                            ◀
                          </button>
                        )}
                        {idx < (form.gallery || []).length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveGalleryImage(idx, 1)}
                            className={`text-[10px] px-2 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}
                          >
                            ▶
                          </button>
                        )}
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/40 text-white">
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  <ImageUploader compact onChange={addGalleryImage} folder="products" />
                </div>

                <p className={`text-[11px] ${sub}`}>Total: {(form.gallery || []).length} image(s). First image = Hero.</p>
              </div>
            )}

            {/* ═══ TAB: OPTIONS ═══ */}
            {tab === 'options' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-[12px] font-medium ${sub}`}>Quick Options</label>
                    <button
                      onClick={addOption}
                      className={`text-[11px] font-semibold px-3 py-1 rounded-lg border ${isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'}`}
                    >
                      + Add Option
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(form.quickOptions || []).map((opt: any, idx: number) => (
                      <div key={idx} className={`flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded-xl ${soft2}`}>
                        <input value={opt.label} onChange={e => updateOption(idx, 'label', e.target.value)} className="form-field !py-2 !text-xs flex-1" placeholder="Label (e.g. Bikes)" />
                        <input value={opt.values?.join(', ') || ''} onChange={e => updateOption(idx, 'values', e.target.value)} className="form-field !py-2 !text-xs flex-[2]" placeholder="Values: 1, 2, 3, 4" />
                        <button
                          onClick={() => removeOption(idx)}
                          className={`px-3 py-2 rounded-lg text-[11px] font-semibold border ${isDark ? 'border-red-400/20 bg-red-400/10 text-red-200/90' : 'border-red-200 bg-red-50 text-red-700'}`}
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

          {/* Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button onClick={save} disabled={saving} className="btn-primary !rounded-xl !px-6 !py-2.5 disabled:opacity-50">
              {saving ? '⏳ Saving…' : edit ? 'Save Changes' : 'Add Product'}
            </button>
            <button onClick={() => setModal(false)} className="btn-outline !rounded-xl !px-6 !py-2.5">
              Cancel
            </button>
            <div className="sm:ml-auto text-[11px] leading-4">
              <p className={sub}>
                Hero image: <span className={txt}>{(form.gallery || [])[0] ? 'Gallery #1' : 'None'}</span>
                {' · '}Video: <span className={txt}>{form.videoUrl ? '✓ Uploaded' : 'None'}</span>
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