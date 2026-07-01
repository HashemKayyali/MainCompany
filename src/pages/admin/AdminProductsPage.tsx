import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import * as productsApi from '../../services/products.service'
import Modal from '../../components/ui/Modal'
import FramedImage from '../../components/ui/FramedImage'
import MediaPlacementModal from '../../components/ui/MediaPlacementModal'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminEditorWorkspace from '../../components/admin/AdminEditorWorkspace'
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
import { DEFAULT_FROM, DEFAULT_TO, EMPTY, TAB_ORDER, type TabKey } from './productForm/constants'
import { normalizeHex, parseGradient } from './productForm/helpers'
import BasicTab from './productForm/BasicTab'
import ContentTab from './productForm/ContentTab'
import MediaTab from './productForm/MediaTab'
import OptionsTab from './productForm/OptionsTab'
import SettingsTab from './productForm/SettingsTab'


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

  const setBadgeGradient = (fromHex: string, toHex: string) => {
    const from = normalizeHex(fromHex, DEFAULT_FROM)
    const to = normalizeHex(toHex, DEFAULT_TO)
    setForm((f: any) => ({ ...f, badgeColor: `linear-gradient(90deg, ${from}, ${to})`, badgeFromHex: from, badgeToHex: to }))
  }

  const fallbackDisplayOrderForSlug = (slug?: string) => {
    const index = orderedProducts.findIndex(product => product.slug === slug)
    return index >= 0 ? index + 1 : orderedProducts.length + 1
  }


  const openNew = () => {
    setEdit(null)
    const g = parseGradient(EMPTY.badgeColor)
    setForm({
      ...EMPTY,
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
      categoryTags: [],
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
              <span className={cn('font-sans text-[1.15rem] font-semibold leading-none', txt)}>
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
            <span className={cn('font-sans text-[1.15rem] font-semibold leading-none', txt)}>
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
    categoryTags: [],
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
            <BasicTab
              form={form}
              setForm={setForm}
              categories={categories}
              setBadgeGradient={setBadgeGradient}
              isDark={isDark}
              sub={sub}
              soft2={soft2}
            />
          )}

          {tab === 'content' && <ContentTab form={form} setForm={setForm} sub={sub} />}

          {tab === 'media' && (
            <MediaTab
              form={form}
              setForm={setForm}
              setActiveGalleryIndex={setActiveGalleryIndex}
              moveGalleryImage={moveGalleryImage}
              removeGalleryImage={removeGalleryImage}
              addGalleryImage={addGalleryImage}
              renderProductPreview={renderProductPreview}
              previewProduct={previewProduct}
              isDark={isDark}
              sub={sub}
            />
          )}

          {tab === 'options' && (
            <OptionsTab
              form={form}
              setForm={setForm}
              addOption={addOption}
              updateOption={updateOption}
              removeOption={removeOption}
              isDark={isDark}
              sub={sub}
              soft2={soft2}
            />
          )}

          {tab === 'settings' && (
            <SettingsTab form={form} setForm={setForm} isDark={isDark} sub={sub} soft2={soft2} txt={txt} />
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
