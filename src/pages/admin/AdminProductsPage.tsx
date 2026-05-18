import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import * as productsApi from '../../services/products.service'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import VideoUploader from '../../components/ui/VideoUploader'
import FramedImage from '../../components/ui/FramedImage'
import MediaPlacementModal from '../../components/ui/MediaPlacementModal'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminEditorWorkspace, { AdminEditorSection } from '../../components/admin/AdminEditorWorkspace'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
import ProductCard from '../../components/product/ProductCard'
import { slugify } from '../../utils/format'
import { getErrorMessage } from '../../lib/errors'
import type { Product } from '../../data/products/types'
import { cn } from '../../utils/cn'
import {
  buildReorderedProducts,
  getProductDisplayOrder,
  sanitizeProductDisplayOrder,
} from '../../utils/product-order'

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

const EMPTY: Product = {
  slug: '',
  name: '',
  displayOrder: 1,
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
  currency: 'JOD',
  showPrice: true,
  rentalEnabled: true,
  saleEnabled: true,
  stockTotal: 0,
  stockActive: 0,
  minimumRentalDays: 1,
  bufferBeforeDays: 0,
  bufferAfterDays: 0,
}

type TabKey = 'basic' | 'content' | 'media' | 'options' | 'settings'


export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, refreshAll } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [modal, setModal] = useState(false)
  const [edit, setEdit] = useState<Product | null>(null)
  const [details, setDetails] = useState<Product | null>(null)
  const [form, setForm] = useState<any>({})
  const [tab, setTab] = useState<TabKey>('basic')
  const [saving, setSaving] = useState(false)
  const [q, setQ] = useState('')
  const [filterCat, setFilterCat] = useState<string>('all')
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(null)
  const [optimisticProducts, setOptimisticProducts] = useState<Product[] | null>(null)
  const [reorderingSlug, setReorderingSlug] = useState<string | null>(null)
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('products')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const soft = isDark ? 'bg-[#101732]/92 ring-1 ring-inset ring-cyan-400/12' : 'bg-white border border-gray-200 shadow-sm'
  const soft2 = isDark ? 'bg-[#0f1430]/88 ring-1 ring-inset ring-cyan-400/10' : 'bg-gray-50 border border-gray-100'
  const chipOn = isDark
    ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.3)]'
    : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.22)]'
  const chipOff = isDark
    ? 'bg-[#0f1630]/96 text-purple-100/78 ring-1 ring-inset ring-cyan-400/10 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)] hover:bg-[#111a39]'
    : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-gray-50'
  const orderedProducts = optimisticProducts ?? products
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

  const DEFAULT_FROM = '#8b5cf6'
  const DEFAULT_TO = '#ec4899'

  const normalizeHex = (hex: string | undefined, fallback: string) => {
    const h = String(hex || fallback).trim()
    if (/^#[0-9a-fA-F]{3}$/.test(h)) {
      const r = h[1]
      const g = h[2]
      const b = h[3]
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

  const fallbackDisplayOrderForSlug = (slug?: string) => {
    const index = orderedProducts.findIndex(product => product.slug === slug)
    return index >= 0 ? index + 1 : orderedProducts.length + 1
  }

  const TAB_ORDER: TabKey[] = ['basic', 'content', 'media', 'options', 'settings']

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
      displayOrder: orderedProducts.length + 1,
      badgeFromHex: g.fromHex,
      badgeToHex: g.toHex,
      showPrice: true,
      rentalEnabled: true,
      saleEnabled: true,
      stockTotal: 0,
      stockActive: 0,
      minimumRentalDays: 1,
      bufferBeforeDays: 0,
      bufferAfterDays: 0,
    })
    setTab('basic')
    setModal(true)
  }

  const openEdit = (product: Product) => {
    setEdit(product)
    const g = parseGradient(product.badgeColor || EMPTY.badgeColor)
    setForm({
      ...product,
      categoryTags: product.categoryTags.join(', '),
      notes: product.notes.join('\n'),
      featuresLeft: product.features.left.join('\n'),
      featuresRight: product.features.right.join('\n'),
      gallery: [...product.gallery],
      videoUrl: product.videoUrl || '',
      displayOrder: getProductDisplayOrder(product, fallbackDisplayOrderForSlug(product.slug)),
      badgeFromHex: g.fromHex,
      badgeToHex: g.toHex,
      showPrice: product.showPrice !== false,
      rentalEnabled: product.rentalEnabled !== false,
      saleEnabled: product.saleEnabled !== false,
      stockTotal: product.stockTotal ?? 0,
      stockActive: product.stockActive ?? 0,
      minimumRentalDays: product.minimumRentalDays ?? 1,
      bufferBeforeDays: product.bufferBeforeDays ?? 0,
      bufferAfterDays: product.bufferAfterDays ?? 0,
    })
    setTab('basic')
    setModal(true)
  }

  const closeModal = () => {
    setModal(false)
    setActiveGalleryIndex(null)
  }

  const moveProductCard = async (slug: string, direction: -1 | 1) => {
    if (reorderingSlug) return
    const currentIndex = orderedProducts.findIndex(product => product.slug === slug)
    if (currentIndex === -1) return
    const nextIndex = currentIndex + direction
    if (nextIndex < 0 || nextIndex >= orderedProducts.length) return

    const reorderedProducts = buildReorderedProducts(orderedProducts, slug, nextIndex + 1)
    const changedProducts = reorderedProducts.filter(product => {
      const existing = orderedProducts.find(item => item.slug === product.slug)
      if (!existing) return false
      return getProductDisplayOrder(existing, fallbackDisplayOrderForSlug(existing.slug)) !== product.displayOrder
    })

    setOptimisticProducts(reorderedProducts)
    setReorderingSlug(slug)

    try {
      await Promise.all(changedProducts.map(product => productsApi.update(product.slug, { displayOrder: product.displayOrder })))
      await refreshAll()
    } catch (err: unknown) {
      setOptimisticProducts(null)
      dialog.alert({
        title: 'Reorder Failed',
        message: getErrorMessage(err, 'Failed to update product order.'),
        variant: 'danger',
      })
    } finally {
      setReorderingSlug(null)
      setOptimisticProducts(null)
    }
  }

  const productCategoryName = (product: Product) =>
    categories.find(category => category.id === product.categoryId)?.name || 'Uncategorized'

  const productCats = useMemo(() => {
    const list = Array.from(new Set(orderedProducts.map(product => productCategoryName(product)).filter(Boolean)))
    return list.sort((a, b) => a.localeCompare(b))
  }, [orderedProducts, categories])

  const countForCat = (cat: string) =>
    orderedProducts.filter(product => productCategoryName(product) === cat).length

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return orderedProducts.filter(product => {
      const categoryName = productCategoryName(product)
      const matchesCategory = filterCat === 'all' || categoryName === filterCat
      if (!matchesCategory) return false
      if (!needle) return true
      return (
        product.name.toLowerCase().includes(needle) ||
        product.slug.toLowerCase().includes(needle) ||
        (product.badge || '').toLowerCase().includes(needle) ||
        categoryName.toLowerCase().includes(needle)
      )
    })
  }, [orderedProducts, q, filterCat, categories])

  const save = async () => {
    const tags =
      typeof form.categoryTags === 'string'
        ? form.categoryTags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : form.categoryTags

    const notes =
      typeof form.notes === 'string'
        ? form.notes.split('\n').map((note: string) => note.trim()).filter(Boolean)
        : form.notes || []

    const featuresLeft =
      typeof form.featuresLeft === 'string'
        ? form.featuresLeft.split('\n').map((feature: string) => feature.trim()).filter(Boolean)
        : form.features?.left || []

    const featuresRight =
      typeof form.featuresRight === 'string'
        ? form.featuresRight.split('\n').map((feature: string) => feature.trim()).filter(Boolean)
        : form.features?.right || []

    const gallery = form.gallery || []
    const desiredOrder = sanitizeProductDisplayOrder(form.displayOrder) ?? (edit ? fallbackDisplayOrderForSlug(edit.slug) : products.length + 1)
    const stockTotal = Math.max(0, Number(form.stockTotal) || 0)
    const stockActive = Math.max(0, Number(form.stockActive) || 0)
    const minimumRentalDays = Math.max(1, Number(form.minimumRentalDays) || 1)
    const bufferBeforeDays = Math.max(0, Number(form.bufferBeforeDays) || 0)
    const bufferAfterDays = Math.max(0, Number(form.bufferAfterDays) || 0)

    const data: Product = {
      slug: form.slug || slugify(form.name),
      name: form.name,
      displayOrder: desiredOrder,
      badge: form.badge,
      badgeColor: form.badgeColor || EMPTY.badgeColor,
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
      features: { left: featuresLeft, right: featuresRight },
      rentalPricePerDay: Number(form.rentalPricePerDay) || 0,
      currency: form.currency || 'JOD',
      rentalEnabled: form.rentalEnabled !== false,
      saleEnabled: form.saleEnabled !== false,
      stockTotal,
      stockActive,
      minimumRentalDays,
      bufferBeforeDays,
      bufferAfterDays,
    }

    if (!data.name?.trim()) {
      await dialog.alert({ title: 'Missing Field', message: 'Product name is required.', variant: 'warning' })
      return
    }
    if (!data.categoryId?.trim()) {
      await dialog.alert({ title: 'Missing Field', message: 'Category is required.', variant: 'warning' })
      return
    }
    if (stockActive > stockTotal) {
      await dialog.alert({
        title: 'Invalid Stock',
        message: 'Active stock cannot be greater than total stock.',
        variant: 'warning',
      })
      return
    }

    const currentProducts = edit ? products.map(product => (product.slug === edit.slug ? data : product)) : [...products, data]
    const reorderedProducts = buildReorderedProducts(currentProducts, data.slug, desiredOrder)
    const finalProduct = reorderedProducts.find(product => product.slug === data.slug) || data
    const reorderUpdates = reorderedProducts.filter(product => {
      if (product.slug === finalProduct.slug) return false
      const existing = products.find(item => item.slug === product.slug)
      if (!existing) return false
      return getProductDisplayOrder(existing, fallbackDisplayOrderForSlug(existing.slug)) !== product.displayOrder
    })

    setSaving(true)
    try {
      if (edit) await updateProduct(edit.slug, finalProduct)
      else await addProduct(finalProduct)

      if (reorderUpdates.length > 0) {
        await Promise.all(reorderUpdates.map(product => productsApi.update(product.slug, { displayOrder: product.displayOrder })))
      }

      await refreshAll()
      setOptimisticProducts(null)
      closeModal()
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to save'), variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const removeProduct = async (slug: string) => {
    const target = products.find(product => product.slug === slug)
    const ok = await dialog.confirm({
      title: 'Delete Product?',
      message: `This will permanently remove ${target?.name || 'this product'}.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    const remainingProducts = products
      .filter(product => product.slug !== slug)
      .map((product, index) => ({ ...product, displayOrder: index + 1 }))
    const reorderUpdates = remainingProducts.filter(product => {
      const existing = products.find(item => item.slug === product.slug)
      if (!existing) return false
      return getProductDisplayOrder(existing, fallbackDisplayOrderForSlug(existing.slug)) !== product.displayOrder
    })

    try {
      await deleteProduct(slug)
      if (reorderUpdates.length > 0) {
        await Promise.all(reorderUpdates.map(product => productsApi.update(product.slug, { displayOrder: product.displayOrder })))
      }
      await refreshAll()
      setOptimisticProducts(null)
      if (details?.slug === slug) setDetails(null)
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to delete'), variant: 'danger' })
    }
  }

  const addGalleryImage = (url: string) => setForm((f: any) => ({ ...f, gallery: [...(f.gallery || []), url] }))
  const removeGalleryImage = (idx: number) => setForm((f: any) => ({ ...f, gallery: (f.gallery || []).filter((_: any, i: number) => i !== idx) }))
  const moveGalleryImage = (idx: number, dir: -1 | 1) =>
    setForm((f: any) => {
      const gallery = [...(f.gallery || [])]
      const nextIndex = idx + dir
      if (nextIndex < 0 || nextIndex >= gallery.length) return f
      ;[gallery[idx], gallery[nextIndex]] = [gallery[nextIndex], gallery[idx]]
      return { ...f, gallery }
    })
  const updateGalleryFrame = (idx: number, media: string) =>
    setForm((f: any) => {
      const gallery = [...(f.gallery || [])]
      gallery[idx] = media
      return { ...f, gallery, heroImage: gallery[0] || f.heroImage || '' }
    })

  const addOption = () => setForm((f: any) => ({ ...f, quickOptions: [...(f.quickOptions || []), { label: '', values: [''] }] }))
  const updateOption = (idx: number, field: 'label' | 'values', value: string) =>
    setForm((f: any) => {
      const options = [...(f.quickOptions || [])]
      if (field === 'label') options[idx] = { ...options[idx], label: value }
      else options[idx] = { ...options[idx], values: value.split(',').map(item => item.trim()).filter(Boolean) }
      return { ...f, quickOptions: options }
    })
  const removeOption = (idx: number) => setForm((f: any) => ({ ...f, quickOptions: (f.quickOptions || []).filter((_: any, i: number) => i !== idx) }))

  const catName = (id: string) => categories.find(category => category.id === id)?.name || '-'

  const renderCardPrice = (product: Product) => (
    <div
      className={cn(
        'flex min-w-0 items-end justify-between gap-3 rounded-[16px] px-1 py-0.5',
        isDark ? 'border-b border-cyan-400/10' : 'border-b border-violet-100'
      )}
    >
      <div className="min-w-0">
        <div className={`text-[9px] font-mono font-semibold uppercase tracking-[0.18em] ${sub}`}>Day Price</div>
        {product.showPrice === false ? (
          <div className="mt-1 flex items-end gap-2">
            <div className="flex items-end gap-1.5 opacity-45">
              <span className={cn('font-display text-[1.15rem] font-semibold leading-none', txt)}>
                {product.rentalPricePerDay}
              </span>
              <span className={`pb-[1px] text-[9px] font-mono uppercase tracking-[0.16em] ${sub}`}>
                {product.currency}/day
              </span>
            </div>
            <span className={cn(
              'mb-[1px] rounded-full px-2 py-[2px] text-[8.5px] font-mono font-bold uppercase tracking-[0.16em]',
              isDark ? 'bg-purple-400/15 text-purple-200/80' : 'bg-violet-100 text-violet-600'
            )}>
              Hidden
            </span>
          </div>
        ) : (
          <div className="mt-1 flex items-end gap-1.5">
            <span className={cn('font-display text-[1.15rem] font-semibold leading-none', txt)}>
              {product.rentalPricePerDay}
            </span>
            <span className={`pb-[1px] text-[9px] font-mono uppercase tracking-[0.16em] ${sub}`}>
              {product.currency}/day
            </span>
          </div>
        )}
      </div>
    </div>
  )

  const Step = ({ k, label, hint }: { k: TabKey; label: string; hint: string }) => {
    const active = tab === k
    const stepIndex = TAB_ORDER.indexOf(k) + 1
    return (
      <button
        onClick={() => setTab(k)}
        type="button"
        aria-current={active ? 'step' : undefined}
        className={cn(
          'group flex min-w-[150px] flex-1 items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left transition-all active:translate-y-[1px]',
          active
            ? 'bg-white shadow-[0_12px_26px_-16px_rgba(89,23,196,0.5)] ring-1 ring-inset ring-violet-300'
            : 'bg-transparent hover:bg-white/70'
        )}
      >
        <span
          className={cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-black tabular-nums transition-all',
            active
              ? 'bg-[linear-gradient(135deg,#7c3aed,#9d6bff)] text-white shadow-[0_6px_14px_-6px_rgba(124,58,237,0.65)]'
              : 'bg-violet-100 text-[#7126e3] group-hover:bg-violet-200'
          )}
        >
          {stepIndex}
        </span>
        <span className="min-w-0 leading-tight">
          <span className={cn('block truncate text-[13px] font-extrabold', active ? 'text-[#1a0b3d]' : 'text-[#4b3a63]')}>
            {label}
          </span>
          <span className="mt-0.5 block truncate text-[10.5px] font-semibold text-[#6b5a82]">{hint}</span>
        </span>
      </button>
    )
  }

  const BadgePill = ({ p }: { p: Product }) => {
    if (!p.badge) return null
    return (
      <span className="inline-flex max-w-[180px] truncate rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white" style={{ backgroundImage: p.badgeColor }}>
        {p.badge}
      </span>
    )
  }

  const previewProduct: Product = {
    slug: form.slug || slugify(form.name || 'preview-product'),
    name: form.name || 'Product Name',
    displayOrder: sanitizeProductDisplayOrder(form.displayOrder) ?? 1,
    badge: form.badge || '',
    badgeColor: form.badgeColor || EMPTY.badgeColor,
    categoryTags:
      typeof form.categoryTags === 'string'
        ? form.categoryTags.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : form.categoryTags || [],
    categoryId: form.categoryId || '',
    shortDescription: form.shortDescription || 'Short description appears here as the live product card summary.',
    description: form.description || '',
    featured: !!form.featured,
    showPrice: form.showPrice !== false,
    heroImage: (form.gallery || [])[0] || form.heroImage || '',
    gallery: form.gallery || [],
    videoUrl: form.videoUrl || '',
    quickOptions: form.quickOptions || [],
    notes:
      typeof form.notes === 'string'
        ? form.notes.split('\n').map((note: string) => note.trim()).filter(Boolean)
        : form.notes || [],
    features: {
      left:
        typeof form.featuresLeft === 'string'
          ? form.featuresLeft.split('\n').map((feature: string) => feature.trim()).filter(Boolean)
          : form.features?.left || [],
      right:
        typeof form.featuresRight === 'string'
          ? form.featuresRight.split('\n').map((feature: string) => feature.trim()).filter(Boolean)
          : form.features?.right || [],
    },
    rentalPricePerDay: Number(form.rentalPricePerDay) || 0,
    currency: form.currency || 'JOD',
    rentalEnabled: form.rentalEnabled !== false,
    saleEnabled: form.saleEnabled !== false,
    stockTotal: Math.max(0, Number(form.stockTotal) || 0),
    stockActive: Math.max(0, Number(form.stockActive) || 0),
    minimumRentalDays: Math.max(1, Number(form.minimumRentalDays) || 1),
    bufferBeforeDays: Math.max(0, Number(form.bufferBeforeDays) || 0),
    bufferAfterDays: Math.max(0, Number(form.bufferAfterDays) || 0),
  }

  const renderProductPreview = (overrides?: Partial<Product>) => {
    const preview = { ...previewProduct, ...overrides }
    return (
      <div
        aria-hidden="true"
        className="mx-auto max-w-[320px] select-none [&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
      >
        <ProductCard product={preview} />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4.5">
      <AdminPageHeader
        title="Products"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            <button onClick={openNew} className="btn-admin-create">
              + Add Product
            </button>
          </>
        }
      />

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[22px] p-3 sm:p-4',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="-mx-0.5 mb-3 flex gap-2 overflow-x-auto px-0.5 pb-1 sm:flex-wrap">
          <button
            onClick={() => setFilterCat('all')}
            className={cn('inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-[16px] px-4 py-2.5 text-[13px] font-semibold transition active:translate-y-[1px] sm:text-[13.5px]', filterCat === 'all' ? chipOn : chipOff)}
          >
            All ({orderedProducts.length})
          </button>

          {productCats.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={cn('inline-flex min-h-[42px] shrink-0 items-center justify-center rounded-[16px] px-4 py-2.5 text-[13px] font-semibold transition active:translate-y-[1px] sm:text-[13.5px]', filterCat === cat ? chipOn : chipOff)}
            >
              {cat} ({countForCat(cat)})
            </button>
          ))}
        </div>

        <div className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className={`flex min-h-[46px] w-full items-center gap-2.5 rounded-[18px] px-3.5 py-2.5 ${soft}`}>
            <span className={isDark ? 'text-purple-200/60' : 'text-gray-400'}>⌕</span>
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className={`min-w-0 flex-1 bg-transparent text-[13px] outline-none sm:text-[13.5px] ${isDark ? 'placeholder:text-purple-200/40' : 'placeholder:text-gray-400'}`}
              placeholder="Search by name, badge, category..."
            />
            <span className={`shrink-0 rounded-xl px-2.5 py-1 text-[11px] font-mono ${isDark ? 'text-purple-200/60 ring-1 ring-inset ring-cyan-400/10' : 'border-gray-200 text-gray-500'}`}>
              {filtered.length}/{products.length}
            </span>
          </div>
          <span className={`text-[12.5px] leading-5 ${sub}`}>Products are organized by category</span>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <span className="text-2xl">📦</span>
            <p className={`mt-4 text-[1rem] font-semibold ${txt}`}>No products match this filter.</p>
            <button onClick={openNew} className="btn-admin-create !mt-5">
              + Add Product
            </button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top p-1 transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter] sm:p-2', viewTransitionClassName)}>
            <div className={cardsLayoutClass}>
              {filtered.map((product) => {
                return (
                  <div key={product.slug} className="relative">
                    <AdminEntityCard
                      variant={getAdminEntityVariant(displayCardView)}
                      className={displayCardView === 'grid' ? '!h-auto' : undefined}
                      minHeightClassName={displayCardView === 'grid' ? 'min-h-[304px]' : 'min-h-[96px]'}
                      bodyClassName={displayCardView === 'grid' ? 'gap-1.75 p-2.75' : 'gap-1.5 p-2.5'}
                      titleBlockClassName={displayCardView === 'grid' ? 'min-h-[4.1rem]' : undefined}
                      childrenWrapClassName={displayCardView === 'grid' ? 'pt-0.5' : 'pt-0'}
                      actionsWrapClassName={displayCardView === 'grid' ? 'pt-1' : 'xl:w-[118px] xl:self-center'}
                      gridActionsPlacement={displayCardView === 'grid' ? 'flow' : 'bottom'}
                      listMediaWrapClassName="md:self-center"
                      listMediaFrameClassName="!h-[72px] !w-[120px] md:!h-[76px] md:!w-[124px] !rounded-[16px] !bg-transparent !ring-0 !p-0"
                      media={
                        product.heroImage ? (
                          <div
                            className={cn(
                              'aspect-[16/10] overflow-hidden rounded-[18px] p-[2px]',
                              isDark
                                ? 'bg-[linear-gradient(145deg,rgba(14,24,48,0.98),rgba(11,19,39,0.96))] ring-1 ring-inset ring-cyan-400/16 shadow-[0_20px_40px_-30px_rgba(34,211,238,0.32)]'
                                : 'bg-white ring-1 ring-inset ring-violet-200 shadow-[0_18px_36px_-28px_rgba(124,58,237,0.22)]'
                            )}
                          >
                            <div className={cn('h-full w-full overflow-hidden rounded-[16px]', isDark ? 'bg-[#07101f]' : 'bg-gray-50')}>
                              <FramedImage
                                media={product.heroImage}
                                alt={product.name}
                                className="h-full w-full transition-transform duration-700 group-hover:scale-[1.035]"
                                fallbackTransform={{ fit: 'cover' }}
                              />
                            </div>
                          </div>
                        ) : (
                          <div
                            className={cn(
                              'flex aspect-[16/10] items-center justify-center rounded-[18px] p-[2px]',
                              isDark
                                ? 'bg-[linear-gradient(145deg,rgba(14,24,48,0.98),rgba(11,19,39,0.96))] ring-1 ring-inset ring-cyan-400/16'
                                : 'bg-white ring-1 ring-inset ring-violet-200'
                            )}
                          >
                            <div className={cn('flex h-full w-full items-center justify-center rounded-[16px]', soft2)}>
                              <div className={`text-[10px] font-mono uppercase tracking-[0.24em] ${sub}`}>No image</div>
                            </div>
                          </div>
                        )
                      }
                      mediaOverlayLeft={
                        product.featured ? <span className={`rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em] ${isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'}`}>Featured</span> : undefined
                      }
                      title={product.name}
                      subtitle={product.shortDescription || undefined}
                      children={
                        displayCardView === 'grid' ? (
                          <div className="space-y-2">
                            {renderCardPrice(product)}
                          </div>
                        ) : (
                            <div className="flex flex-wrap items-center gap-2.5">
                              <div className="min-w-[162px] flex-1">{renderCardPrice(product)}</div>
                            </div>
                          )
                        }
                      actions={
                        <>
                          <AdminActionButton tone="primary" onClick={event => { event.stopPropagation(); setDetails(product) }}>Details</AdminActionButton>
                          <AdminActionButton onClick={event => { event.stopPropagation(); openEdit(product) }}>Edit</AdminActionButton>
                          <AdminActionButton tone="danger" onClick={event => { event.stopPropagation(); void removeProduct(product.slug) }}>Delete</AdminActionButton>
                        </>
                      }
                    />
                  </div>
                )
              })}
            </div>
            </div>
          </div>
        )}
      </div>

      <AdminDetailModal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.name || 'Product Details'}
        subtitle={details ? 'This panel moves the deeper product information out of the grid, so the product card can stay focused and easier to scan.' : undefined}
        media={details ? (details.heroImage ? <div className="aspect-[16/9] overflow-hidden"><FramedImage media={details.heroImage} alt={details.name} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} /></div> : <div className={`flex aspect-[16/9] items-center justify-center ${soft2}`}><div className={`text-sm ${sub}`}>No hero image uploaded yet.</div></div>) : null}
        badges={details ? (<><BadgePill p={details} /><span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? 'border-white/10 bg-white/[0.04] text-purple-100/80' : 'border-gray-200 bg-white text-gray-700'}`}>{catName(details.categoryId)}</span>{details.featured && <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'}`}>Featured</span>}</>) : null}
        summaryFacts={details ? [
          { label: 'Slug', value: <span className="font-mono text-xs">{details.slug}</span> },
          { label: 'Category', value: catName(details.categoryId) },
          { label: 'Day Price', value: details.showPrice === false ? 'Hidden' : `${details.rentalPricePerDay} ${details.currency}` },
          { label: 'Rental', value: details.rentalEnabled !== false ? 'Enabled' : 'Disabled' },
          { label: 'Sales', value: details.saleEnabled !== false ? 'Enabled' : 'Disabled' },
          { label: 'Stock', value: `${details.stockActive ?? 0} active / ${details.stockTotal ?? 0} total` },
        ] : []}
        sections={details ? [{ title: 'Descriptions', content: <div className="space-y-3"><p className={`text-sm font-semibold ${txt}`}>Short Description</p><p className={`text-sm leading-6 ${isDark ? 'text-purple-100/80' : 'text-gray-700'}`}>{details.shortDescription || 'No short description yet.'}</p><p className={`pt-2 text-sm font-semibold ${txt}`}>Long Description</p><p className={`text-sm leading-6 ${isDark ? 'text-purple-100/80' : 'text-gray-700'}`}>{details.description || 'No long description yet.'}</p></div> }, { title: 'Configuration', facts: [{ label: 'Gallery items', value: String(details.gallery.length) }, { label: 'Video', value: details.videoUrl ? 'Uploaded' : 'Not uploaded' }, { label: 'Quick options', value: String(details.quickOptions.length) }], content: <div className="space-y-3">{details.notes.length > 0 ? <div><p className={`mb-2 text-[11px] font-mono uppercase tracking-[0.22em] ${sub}`}>Notes</p><div className="flex flex-wrap gap-2">{details.notes.slice(0, 6).map(note => <span key={note} className={`rounded-full border px-3 py-1 text-[11px] ${isDark ? 'border-white/10 bg-white/[0.04] text-purple-100/80' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>{note}</span>)}</div></div> : null}{details.quickOptions.length > 0 ? <div><p className={`mb-2 text-[11px] font-mono uppercase tracking-[0.22em] ${sub}`}>Quick Options</p><div className="space-y-2">{details.quickOptions.map(option => <div key={option.label} className={`rounded-xl border px-3 py-2 ${isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-100 bg-gray-50'}`}><div className={`text-sm font-semibold ${txt}`}>{option.label}</div><div className={`mt-1 text-xs ${sub}`}>{option.values.join(', ') || 'No values'}</div></div>)}</div></div> : null}</div> }] : []}
        actions={details ? (<><AdminActionButton onClick={() => { setDetails(null); openEdit(details) }}>Edit Product</AdminActionButton><AdminActionButton tone="danger" onClick={() => { setDetails(null); void removeProduct(details.slug) }}>Delete Product</AdminActionButton></>) : null}
      />

      <Modal
        open={modal}
        onClose={closeModal}
        title={edit ? 'Edit Product' : 'Add Product'}
        persistent
        size="2xl"
        bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
      >
        <AdminEditorWorkspace
          preview={renderProductPreview()}
          previewTitle="Live Product Card"
          
          footer={
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className={cn('text-[11px] leading-5', sub)}>
                Hero image: <span className={txt}>{(form.gallery || [])[0] ? 'Ready' : 'None'}</span>
                {' | '}Video: <span className={txt}>{form.videoUrl ? 'Uploaded' : 'None'}</span>
              </div>
              <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
                <button onClick={closeModal} className="btn-outline !w-full !rounded-xl !px-4 !py-2 !text-sm sm:!w-auto">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving}
                  className="btn-primary !w-full !rounded-xl !px-5 !py-2 !text-sm disabled:opacity-50 sm:!w-auto"
                >
                  {saving ? 'Saving...' : edit ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </div>
          }
        >
          <div className="flex flex-wrap gap-1.5 rounded-[18px] border border-violet-200/70 bg-[linear-gradient(180deg,#faf6ff,#f1e9ff)] p-1.5">
            <Step k="basic" label="Basic" hint="Name / Category / Badge" />
            <Step k="content" label="Content" hint="Descriptions / Notes" />
            <Step k="media" label={`Media (${(form.gallery || []).length}${form.videoUrl ? ' + video' : ''})`} hint="Images / Video" />
            <Step k="options" label="Options" hint="Quick options / Features" />
            <Step k="settings" label="Settings" hint="Pricing / Rental / Inventory" />
          </div>

          {tab === 'basic' && (
            <>
              <AdminEditorSection
                title="Identity"
                hint="The storefront card pulls from these core fields first, so keep the name, slug, and badge setup together."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Product Name *</label>
                    <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="form-field" placeholder="Bike Blender" />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Slug (URL)</label>
                    <input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} className="form-field" placeholder="auto-generated" />
                    <p className={`mt-1 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>Leave empty to auto-generate.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Badge Text</label>
                    <select value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })} className="form-field">
                      <option value="">No badge</option>
                      {BADGE_OPTIONS.map(badge => (
                        <option key={badge} value={badge}>
                          {badge}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Badge Gradient</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${soft2}`}>
                        <span className={`text-[11px] ${sub}`}>From</span>
                        <input type="color" value={form.badgeFromHex || DEFAULT_FROM} onChange={e => setBadgeGradient(e.target.value, form.badgeToHex || DEFAULT_TO)} className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
                      </div>
                      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${soft2}`}>
                        <span className={`text-[11px] ${sub}`}>To</span>
                        <input type="color" value={form.badgeToHex || DEFAULT_TO} onChange={e => setBadgeGradient(form.badgeFromHex || DEFAULT_FROM, e.target.value)} className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
                      </div>
                    </div>
                  </div>
                </div>
              </AdminEditorSection>

              <AdminEditorSection
                title="Listing Setup"
                
              >
                <div>
                  <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Category *</label>
                  <select value={form.categoryId || ''} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="form-field">
                    <option value="">Select Category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

             

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Category Tags</label>
                    <input value={form.categoryTags || ''} onChange={e => setForm({ ...form, categoryTags: e.target.value })} className="form-field" placeholder="LED, VR, Party" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={!!form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 rounded accent-violet-400" />
                    <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Featured product</span>
                  </label>
                </div>
              </AdminEditorSection>

            </>
          )}

          {tab === 'content' && (
            <>
              <AdminEditorSection title="Descriptions" hint="Short copy drives the product card; long copy supports the detail page.">
                <div>
                  <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Short Description</label>
                  <textarea value={form.shortDescription || ''} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="form-field resize-none" rows={3} />
                </div>
                <div>
                  <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Full Description</label>
                  <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="form-field resize-none" rows={6} />
                </div>
              </AdminEditorSection>

              <AdminEditorSection title="Internal Notes" hint="One note per line. These stay out of the storefront card but help with setup and sales context.">
                <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Notes (one per line)</label>
                <textarea value={typeof form.notes === 'string' ? form.notes : (form.notes || []).join('\n')} onChange={e => setForm({ ...form, notes: e.target.value })} className="form-field resize-none" rows={7} />
              </AdminEditorSection>
            </>
          )}

          {tab === 'media' && (
            <>
              <AdminEditorSection title="Gallery" hint="The first image becomes the hero automatically. Keep the strongest framed image in slot one.">
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
                  {(form.gallery || []).map((url: string, idx: number) => (
                    <div key={idx} className="group relative">
                      <div className={`aspect-video overflow-hidden rounded-[14px] border ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
                        <FramedImage media={url} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                      </div>
                      {idx === 0 ? <span className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${isDark ? 'bg-cyan-400/25 text-cyan-200' : 'bg-violet-100 text-violet-700'}`}>HERO</span> : null}
                      <div className={`absolute inset-0 flex flex-wrap content-start items-start justify-start gap-1.5 rounded-[14px] p-1.5 opacity-0 transition-opacity group-hover:opacity-100 ${isDark ? 'bg-black/60' : 'bg-white/70'}`}>
                        <button type="button" onClick={() => setActiveGalleryIndex(idx)} className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'}`}>Frame</button>
                        {idx > 0 ? <button type="button" onClick={() => moveGalleryImage(idx, -1)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>{'<'}</button> : null}
                        {idx < (form.gallery || []).length - 1 ? <button type="button" onClick={() => moveGalleryImage(idx, 1)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>{'>'}</button> : null}
                        <button type="button" onClick={() => removeGalleryImage(idx)} className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/75 text-[11px] font-bold text-white">x</button>
                      </div>
                    </div>
                  ))}

                  <ImageUploader
                    compact
                    onChange={addGalleryImage}
                    folder="products"
                    frameAspect={16 / 10}
                    defaultFit="cover"
                    frameTitle="Adjust Product Image"
                    frameHint="Choose what stays visible inside product cards and previews."
                    previewAspectClass="aspect-video"
                    renderFrameContextPreview={media =>
                      renderProductPreview({
                        heroImage: media,
                        gallery: media ? [media, ...(previewProduct.gallery || []).filter(item => item !== media)] : previewProduct.gallery,
                      })
                    }
                    frameContextTitle="Product Card Result"
                    frameContextHint="Inspect the real storefront card result while you adjust the frame."
                  />
                </div>
              </AdminEditorSection>

              <AdminEditorSection title="Video" hint="Upload the optional hover-preview video and frame it against the actual product card output.">
                <VideoUploader
                  label="Product Video"
                  value={form.videoUrl || ''}
                  onChange={url => setForm((f: any) => ({ ...f, videoUrl: url }))}
                  onRemove={() => setForm((f: any) => ({ ...f, videoUrl: '' }))}
                  folder="products"
                  frameAspect={16 / 10}
                  defaultFit="cover"
                  frameTitle="Adjust Product Video"
                  frameHint="Choose what stays visible inside product previews."
                  renderFrameContextPreview={media => renderProductPreview({ videoUrl: media })}
                  frameContextTitle="Product Card Result"
                  frameContextHint="Inspect the real storefront card result while you adjust the frame."
                />
              </AdminEditorSection>
            </>
          )}

          {tab === 'options' && (
            <>
              <AdminEditorSection title="Quick Options" hint="Keep short labels and comma-separated values so the setup remains compact and scannable.">
                <div className="mb-1 flex items-center justify-between">
                  <label className={`text-[12px] font-medium ${sub}`}>Quick Options</label>
                  <button
                    onClick={addOption}
                    className={`rounded-lg border px-3 py-1 text-[11px] font-semibold ${isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'}`}
                  >
                    + Add Option
                  </button>
                </div>
                <div className="space-y-2">
                  {(form.quickOptions || []).map((option: any, idx: number) => (
                    <div key={idx} className={`flex flex-col gap-2 rounded-[16px] p-2.5 sm:flex-row sm:items-center ${soft2}`}>
                      <input value={option.label} onChange={e => updateOption(idx, 'label', e.target.value)} className="form-field !py-2 !text-xs flex-1" placeholder="Label (e.g. Bikes)" />
                      <input value={option.values?.join(', ') || ''} onChange={e => updateOption(idx, 'values', e.target.value)} className="form-field !py-2 !text-xs flex-[2]" placeholder="Values: 1, 2, 3, 4" />
                      <button onClick={() => removeOption(idx)} className={`rounded-lg border px-3 py-2 text-[11px] font-semibold ${isDark ? 'border-red-400/20 bg-red-400/10 text-red-200/90' : 'border-red-200 bg-red-50 text-red-700'}`}>
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </AdminEditorSection>

              <AdminEditorSection title="Feature Columns" hint="These feed the detailed product view. Keep each line focused so both columns scan well.">
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Features - Left Column (one per line)</label>
                    <textarea value={typeof form.featuresLeft === 'string' ? form.featuresLeft : (form.features?.left || []).join('\n')} onChange={e => setForm({ ...form, featuresLeft: e.target.value })} className="form-field resize-none" rows={6} />
                  </div>

                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Features - Right Column (one per line)</label>
                    <textarea value={typeof form.featuresRight === 'string' ? form.featuresRight : (form.features?.right || []).join('\n')} onChange={e => setForm({ ...form, featuresRight: e.target.value })} className="form-field resize-none" rows={6} />
                  </div>
                </div>
              </AdminEditorSection>
            </>
          )}

          {tab === 'settings' && (
            <>
              <AdminEditorSection
                title="Pricing & Commerce"
                >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Day Price</label>
                    <input
                      type="number"
                      value={form.rentalPricePerDay || 0}
                      onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Currency</label>
                    <input
                      value={form.currency || 'JOD'}
                      onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })}
                      className="form-field"
                      placeholder="JOD"
                      maxLength={6}
                    />
                  <p className={`mt-1 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}></p>
                  </div>

                  <div className={`rounded-[18px] p-4 sm:col-span-2 xl:col-span-1 ${soft2}`}>
                    <p className={`text-[11px] font-mono uppercase tracking-[0.2em] ${sub}`}>Pricing Behavior</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.showPrice !== false}
                          onChange={e => setForm({ ...form, showPrice: e.target.checked })}
                          className="h-4 w-4 rounded accent-violet-400"
                        />
                        <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Show pricing publicly</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.rentalEnabled !== false}
                          onChange={e => setForm({ ...form, rentalEnabled: e.target.checked })}
                          className="h-4 w-4 rounded accent-violet-400"
                        />
                        <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Available for rental</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={form.saleEnabled !== false}
                          onChange={e => setForm({ ...form, saleEnabled: e.target.checked })}
                          className="h-4 w-4 rounded accent-violet-400"
                        />
                        <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Available for purchase quote</span>
                      </label>
                    </div>
                  </div>
                </div>
              </AdminEditorSection>

              <AdminEditorSection
                title="Rental & Inventory"
                hint="Stock and buffer windows live here so availability checks and request approval stay aligned."
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Total Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={form.stockTotal ?? 0}
                      onChange={e => setForm({ ...form, stockTotal: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Active Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={form.stockActive ?? 0}
                      onChange={e => setForm({ ...form, stockActive: e.target.value })}
                      className="form-field"
                    />
                    <p className={`mt-1 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>Must stay less than or equal to total stock.</p>
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Minimum Rental Days</label>
                    <input
                      type="number"
                      min={1}
                      value={form.minimumRentalDays ?? 1}
                      onChange={e => setForm({ ...form, minimumRentalDays: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Buffer Before (days)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.bufferBeforeDays ?? 0}
                      onChange={e => setForm({ ...form, bufferBeforeDays: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div>
                    <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Buffer After (days)</label>
                    <input
                      type="number"
                      min={0}
                      value={form.bufferAfterDays ?? 0}
                      onChange={e => setForm({ ...form, bufferAfterDays: e.target.value })}
                      className="form-field"
                    />
                  </div>
                  <div className={`rounded-[18px] p-4 ${soft2}`}>
                    <p className={`text-[11px] font-mono uppercase tracking-[0.2em] ${sub}`}>Availability Summary</p>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className={sub}>Storefront rental status</span>
                        <span className={cn('font-semibold', form.rentalEnabled !== false ? txt : isDark ? 'text-red-200' : 'text-red-600')}>
                          {form.rentalEnabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className={sub}>Quote request status</span>
                        <span className={cn('font-semibold', form.saleEnabled !== false ? txt : isDark ? 'text-red-200' : 'text-red-600')}>
                          {form.saleEnabled !== false ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className={sub}>Available units today</span>
                        <span className={txt}>{Math.max(0, Number(form.stockActive) || 0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </AdminEditorSection>
            </>
          )}
        </AdminEditorWorkspace>
      </Modal>

      <MediaPlacementModal
        open={activeGalleryIndex !== null}
        media={activeGalleryIndex !== null ? (form.gallery || [])[activeGalleryIndex] : ''}
        title="Adjust Product Image"
        type="image"
        aspectRatio={16 / 10}
        defaultFit="cover"
        hint="Choose what stays visible inside product cards and previews."
        contextPreview={media =>
          renderProductPreview({
            heroImage: media,
            gallery:
              activeGalleryIndex === null
                ? previewProduct.gallery
                : (previewProduct.gallery || []).map((item, index) => (index === activeGalleryIndex ? media : item)),
          })
        }
        contextPreviewTitle="Product Card Result"
        contextPreviewHint="Refine the image while seeing the real storefront card result on the right."
        onApply={media => {
          if (activeGalleryIndex === null) return
          updateGalleryFrame(activeGalleryIndex, media)
        }}
        onClose={() => setActiveGalleryIndex(null)}
      />
    </div>
  )
}
