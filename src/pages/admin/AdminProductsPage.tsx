import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Search } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useDialog } from '../../contexts/DialogContext'
import * as productsApi from '../../services/products.service'
import { deleteAssetsSafely } from '../../services/storage.service'
import { useAssetSession } from '../../hooks/useAssetSession'
import Modal from '../../components/ui/Modal'
import FramedImage from '../../components/ui/FramedImage'
import MediaPlacementModal from '../../components/ui/MediaPlacementModal'
import AdminEditorWorkspace from '../../components/admin/AdminEditorWorkspace'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminBadge from '../../components/admin/primitives/AdminBadge'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminKebabMenu, { type AdminKebabItem } from '../../components/admin/AdminKebabMenu'
import BidiText from '../../components/admin/BidiText'
import useAdminCardView from '../../components/admin/useAdminCardView'
import ProductCard from '../../components/product/ProductCard'
import ProductAdminCard from './productForm/ProductAdminCard'
import { slugify } from '../../utils/format'
import { getErrorMessage } from '../../lib/errors'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import type { Product } from '../../data/products/types'
import { cn } from '../../utils/cn'
import {
  buildReorderedProducts,
  getProductDisplayOrder,
  sanitizeProductDisplayOrder,
} from '../../utils/product-order'
import { EMPTY, type TabKey } from './productForm/constants'
import BasicTab from './productForm/BasicTab'
import ContentTab from './productForm/ContentTab'
import MediaTab from './productForm/MediaTab'
import OptionsTab from './productForm/OptionsTab'
import SettingsTab from './productForm/SettingsTab'
import {
  collectProductMediaRefs,
  enforceHeroInvariant,
} from './productForm/media-invariants'

const TABS_META: Array<{ k: TabKey; label: string }> = [
  { k: 'basic', label: 'Basic' },
  { k: 'content', label: 'Content' },
  { k: 'media', label: 'Media' },
  { k: 'options', label: 'Options' },
  { k: 'settings', label: 'Pricing/Settings' },
]

function DetailFact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5">
      <div className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-accent)]">
        {label}
      </div>
      <div dir="auto" className="mt-1 text-[13px] font-semibold leading-5 text-[var(--admin-text)]">
        {value}
      </div>
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="admin-card p-4">
      <h3 className="admin-section-title">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

export default function AdminProductsPage() {
  const { products, categories, addProduct, updateProduct, deleteProduct, refreshAll } = useData()
  const dialog = useDialog()
  const isMdUp = useMediaQuery('(min-width: 768px)', true)

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
  const { cardView, setCardView } = useAdminCardView('products')

  // Snapshot of the media references the product holds at editor-open
  // time — includes heroImage, every gallery entry, and videoUrl so
  // both images and video participate in one session lifecycle. The
  // legacy heroImage (if it differs from gallery[0]) is included so
  // it can be reconciled by the commit diff without being silently
  // lost.
  const [sessionOriginals, setSessionOriginals] = useState<string[]>([])
  const [openId, setOpenId] = useState(0)

  const {
    session,
    snapshot: sessionSnapshot,
    isUploading,
    isPersisting,
    canSave: canCommit,
    runPersistence,
    cancel,
  } = useAssetSession({
    sessionKey: modal ? openId : null,
    originalUrls: sessionOriginals,
  })

  const orderedProducts = optimisticProducts ?? products

  const fallbackDisplayOrderForSlug = (slug?: string) => {
    const index = orderedProducts.findIndex(product => product.slug === slug)
    return index >= 0 ? index + 1 : orderedProducts.length + 1
  }

  const openNew = () => {
    setSessionOriginals([])
    setOpenId(id => id + 1)
    setEdit(null)
    setForm({
      ...EMPTY,
      notes: '',
      featuresLeft: '',
      featuresRight: '',
      gallery: [],
      videoUrl: '',
      displayOrder: orderedProducts.length + 1,
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
    setSessionOriginals(collectProductMediaRefs(product))
    setOpenId(id => id + 1)
    setEdit(product)
    setForm({
      ...product,
      notes: product.notes.join('\n'),
      featuresLeft: product.features.left.join('\n'),
      featuresRight: product.features.right.join('\n'),
      gallery: [...product.gallery],
      videoUrl: product.videoUrl || '',
      displayOrder: getProductDisplayOrder(product, fallbackDisplayOrderForSlug(product.slug)),
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
    // Cancel/close: any session-temporary uploads that were made
    // during this editor session are cleaned up by the session's
    // cancel path. Original persisted media (heroImage, gallery,
    // videoUrl on disk) is NEVER touched here — that only happens
    // after a successful save via the commit diff.
    if (!sessionSnapshot.committed && !sessionSnapshot.disposed) {
      void cancel()
    }
    setModal(false)
    setActiveGalleryIndex(null)
    setSessionOriginals([])
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
      // Invariant: heroImage strictly derives from gallery[0]. This
      // eliminates the stale-hero bug where an empty gallery could
      // still carry an old heroImage that then gets deleted while
      // the DB still references it.
      heroImage: enforceHeroInvariant(gallery),
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
      const outcome = await runPersistence({
        mutate: async () => {
          if (edit) await updateProduct(edit.slug, finalProduct)
          else await addProduct(finalProduct)

          if (reorderUpdates.length > 0) {
            await Promise.all(
              reorderUpdates.map(product =>
                productsApi.update(product.slug, { displayOrder: product.displayOrder }),
              ),
            )
          }

          await refreshAll()
          return data
        },
        // Final refs = heroImage + gallery + videoUrl. The
        // canonical dedup in the session collapses
        // heroImage===gallery[0] into one identity, and reports
        // the legacy hero for cleanup only if it was not
        // referenced by the final payload.
        finalRefs: result => collectProductMediaRefs(result),
      })
      if (outcome.status === 'success') {
        if (outcome.cleanup.failed.length > 0) {
          console.warn('[Products] storage cleanup partial failure', outcome.cleanup.failed)
        }
        setOptimisticProducts(null)
        closeModal()
      } else if (!outcome.disposed) {
        dialog.alert({
          title: 'Error',
          message: getErrorMessage(outcome.error, 'Failed to save'),
          variant: 'danger',
        })
      }
    } catch (err: unknown) {
      console.error('[Products] runPersistence rejected', err)
      dialog.alert({
        title: 'Error',
        message: getErrorMessage(err, 'Save cannot start right now'),
        variant: 'danger',
      })
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

    // Snapshot all media refs BEFORE the DB delete so we retain the
    // URLs after the row is gone. Storage cleanup runs ONLY after DB
    // delete succeeds; failure here is reported separately and does
    // not falsify the DB result.
    const mediaRefs = target ? collectProductMediaRefs(target) : []
    try {
      await deleteProduct(slug)
      if (reorderUpdates.length > 0) {
        await Promise.all(reorderUpdates.map(product => productsApi.update(product.slug, { displayOrder: product.displayOrder })))
      }
      await refreshAll()
      setOptimisticProducts(null)
      if (details?.slug === slug) setDetails(null)
      if (mediaRefs.length > 0) {
        const cleanup = await deleteAssetsSafely(mediaRefs)
        if (cleanup.failed.length > 0) {
          console.warn('[Products] entity-delete cleanup partial failure', cleanup.failed)
        }
      }
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to delete'), variant: 'danger' })
    }
  }

  // Adding an image: form-state only. The `ImageUploader` has
  // already registered the upload with the session (via its
  // `session` prop), so cleanup on Cancel or unreferenced-on-Save is
  // handled centrally.
  const addGalleryImage = (url: string) => {
    setForm((f: any) => ({ ...f, gallery: [...(f.gallery || []), url] }))
  }
  // Removing an image: form-state only. The persisted asset — if
  // any — is NOT deleted here; the session's Save-commit diff or
  // Cancel path is the single point of truth for storage cleanup.
  const removeGalleryImage = (idx: number) =>
    setForm((f: any) => {
      const gallery = [...(f.gallery || [])]
      gallery.splice(idx, 1)
      return { ...f, gallery }
    })
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
        className="mx-auto max-w-[300px] select-none [&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
      >
        <ProductCard product={preview} revealOnScroll={false} />
      </div>
    )
  }

  const chipClass = (active: boolean) =>
    cn(
      'inline-flex min-h-[38px] shrink-0 snap-start items-center justify-center whitespace-nowrap rounded-full border px-3.5 text-[12.5px] font-bold transition',
      active
        ? 'border-transparent bg-[var(--admin-accent)] text-white'
        : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
    )

  const useTableView = cardView === 'list' && isMdUp

  return (
    <div className="flex min-h-full flex-col gap-4 md:h-full md:min-h-0">
      <AdminPageHeader
        title="Products"
        actions={
          <>
            <div className="hidden md:block">
              <AdminViewToggle value={cardView} onChange={setCardView} />
            </div>
            <AdminButton size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              Add Product
            </AdminButton>
          </>
        }
      />

      <div className="admin-card flex flex-col p-3 sm:p-4 md:min-h-0 md:flex-1">
        {/* Toolbar */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
              strokeWidth={2}
              aria-hidden="true"
            />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="admin-input ps-9 pe-16"
              placeholder="Search by name, badge, category..."
              aria-label="Search products"
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--admin-text-muted)]">
              {filtered.length}/{products.length}
            </span>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-2.5 flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          <button type="button" onClick={() => setFilterCat('all')} className={chipClass(filterCat === 'all')}>
            All ({orderedProducts.length})
          </button>
          {productCats.map(cat => (
            <button key={cat} type="button" onClick={() => setFilterCat(cat)} className={chipClass(filterCat === cat)}>
              {cat} ({countForCat(cat)})
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center py-8 md:flex-1">
            <AdminEmptyState
              title="No products match this filter"
              description="Try a different search or category, or add a new product."
              action={
                <AdminButton size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Add Product
                </AdminButton>
              }
            />
          </div>
        ) : useTableView ? (
          <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
            <div className="admin-table-wrap">
              <table className="w-full border-collapse text-start">
                <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                  <tr className="text-start text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                    <th className="px-3 py-2.5 text-start font-bold">Product</th>
                    <th className="px-3 py-2.5 text-start font-bold">Category</th>
                    <th className="px-3 py-2.5 text-start font-bold">Price</th>
                    <th className="px-3 py-2.5 text-start font-bold">Status</th>
                    <th className="px-3 py-2.5 text-end font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(product => {
                    const showRentalPrice = product.rentalEnabled !== false && product.showPrice !== false
                    return (
                      <tr key={product.slug} className="border-t border-[var(--admin-border)] align-middle">
                        <td className="px-3 py-2.5">
                          <div className="flex max-w-[300px] items-center gap-2.5">
                            <div className="h-11 w-14 shrink-0 overflow-hidden rounded-[10px] bg-[var(--admin-surface-2)]">
                              {product.heroImage ? (
                                <FramedImage media={product.heroImage} alt={product.name} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                              ) : null}
                            </div>
                            <div className="min-w-0 text-start">
                              <div className="truncate text-[13px] font-bold text-[var(--admin-text)]"><BidiText>{product.name}</BidiText></div>
                              <div className="truncate text-[11px] text-[var(--admin-text-muted)]">{product.shortDescription ? <BidiText>{product.shortDescription}</BidiText> : '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone="accent"><BidiText>{productCategoryName(product)}</BidiText></AdminBadge>
                        </td>
                        <td className="px-3 py-2.5 text-[13px] font-semibold tabular-nums text-[var(--admin-text)]">
                          {showRentalPrice ? `${product.rentalPricePerDay} ${product.currency}` : 'On request'}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1.5">
                            {product.featured && <AdminBadge tone="accent">Featured</AdminBadge>}
                            {product.showPrice === false && <AdminBadge tone="warning">Price hidden</AdminBadge>}
                            {product.rentalEnabled === false && product.saleEnabled === false && <AdminBadge tone="danger">Off storefront</AdminBadge>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminButton size="sm" variant="outline" onClick={() => setDetails(product)}>Details</AdminButton>
                            <AdminButton size="sm" onClick={() => openEdit(product)}>Edit</AdminButton>
                            <AdminKebabMenu
                              label="More product actions"
                              items={[{ label: 'Delete', onSelect: () => void removeProduct(product.slug), tone: 'danger' } as AdminKebabItem]}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="mt-3 pe-0.5 md:min-h-0 md:flex-1 md:overflow-y-auto">
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {filtered.map(product => (
                <ProductAdminCard
                  key={product.slug}
                  product={product}
                  categoryName={productCategoryName(product)}
                  onDetails={() => setDetails(product)}
                  onEdit={() => openEdit(product)}
                  onDelete={() => void removeProduct(product.slug)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.name || 'Product Details'}
        size="2xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          details ? (
            <div className="admin-scope grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-center sm:justify-end">
              <AdminButton variant="ghost" onClick={() => setDetails(null)} className="hidden sm:inline-flex sm:min-w-[96px]">
                Close
              </AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  const product = details
                  setDetails(null)
                  openEdit(product)
                }}
                className="w-full sm:w-auto sm:min-w-[124px]"
              >
                Edit Product
              </AdminButton>
              <AdminButton
                variant="danger"
                size="sm"
                onClick={() => {
                  const slug = details.slug
                  setDetails(null)
                  void removeProduct(slug)
                }}
                className="w-full sm:w-auto sm:min-w-[124px]"
              >
                Delete Product
              </AdminButton>
            </div>
          ) : undefined
        }
      >
        {details && (
          <div className="admin-scope space-y-4">
            <section className="admin-card overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <div className="bg-[var(--admin-surface-2)] p-3">
                  <div className="aspect-[4/3] overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
                    {details.heroImage ? (
                      <FramedImage media={details.heroImage} alt={details.name} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[12px] font-semibold text-[var(--admin-text-muted)]">
                        No hero image uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone="accent"><BidiText>{catName(details.categoryId)}</BidiText></AdminBadge>
                      <BadgePill p={details} />
                      {details.featured && <AdminBadge tone="accent">Featured</AdminBadge>}
                      {details.showPrice === false && <AdminBadge tone="warning">Price hidden</AdminBadge>}
                      {details.rentalEnabled === false && details.saleEnabled === false && <AdminBadge tone="danger">Off storefront</AdminBadge>}
                    </div>
                    <h3 className="mt-3 text-start font-sans text-[1.25rem] font-black leading-tight tracking-[-0.03em] text-[var(--admin-text)]">
                      <BidiText>{details.name}</BidiText>
                    </h3>
                    <p className="mt-2 text-start text-[13px] leading-6 text-[var(--admin-text-muted)]">
                      {details.shortDescription ? <BidiText>{details.shortDescription}</BidiText> : 'No short description added.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <DetailFact label="Price" value={details.showPrice === false ? 'Hidden' : `${details.rentalPricePerDay} ${details.currency}`} />
                    <DetailFact label="Stock" value={`${details.stockActive ?? 0} active / ${details.stockTotal ?? 0} total`} />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <DetailFact label="Category" value={<BidiText>{catName(details.categoryId)}</BidiText>} />
              <DetailFact label="Badge" value={details.badge || 'None'} />
              <DetailFact label="Rental" value={details.rentalEnabled !== false ? 'Enabled' : 'Disabled'} />
              <DetailFact label="Sale" value={details.saleEnabled !== false ? 'Enabled' : 'Disabled'} />
              <DetailFact label="Gallery" value={`${details.gallery.length} image${details.gallery.length === 1 ? '' : 's'}`} />
              <DetailFact label="Video" value={details.videoUrl ? 'Uploaded' : 'Not uploaded'} />
              <DetailFact label="Options" value={`${details.quickOptions.length} quick option${details.quickOptions.length === 1 ? '' : 's'}`} />
              <DetailFact label="Slug" value={<span dir="ltr" data-i18n-skip className="break-all font-mono text-[11px]">{details.slug}</span>} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <DetailSection title="Short Description">
                <p className="text-start text-[13px] leading-6 text-[var(--admin-text-muted)]">
                  {details.shortDescription ? <BidiText>{details.shortDescription}</BidiText> : 'No short description added.'}
                </p>
              </DetailSection>

              {details.description && (
                <DetailSection title="Long Description">
                  <p className="text-start text-[13px] leading-6 text-[var(--admin-text-muted)]">
                    <BidiText>{details.description}</BidiText>
                  </p>
                </DetailSection>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modal}
        onClose={closeModal}
        title={edit ? 'Edit Product' : 'Add Product'}
        persistent
        size="3xl"
        mobilePresentation="fullscreen"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          <div className="admin-scope flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] leading-5 text-[var(--admin-text-muted)]">
              Hero image: <span className="font-semibold text-[var(--admin-text)]">{(form.gallery || [])[0] ? 'Ready' : 'None'}</span>
              {' | '}Video: <span className="font-semibold text-[var(--admin-text)]">{form.videoUrl ? 'Uploaded' : 'None'}</span>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <AdminButton variant="ghost" onClick={closeModal} disabled={saving} className="sm:min-w-[110px]">
                Cancel
              </AdminButton>
              <AdminButton
                onClick={save}
                loading={saving}
                disabled={saving || isUploading || isPersisting || !canCommit}
                className="sm:min-w-[140px]"
              >
                {edit ? 'Save Changes' : 'Add Product'}
              </AdminButton>
            </div>
          </div>
        }
      >
        <AdminEditorWorkspace
          preview={renderProductPreview()}
          previewTitle="Live Product Card"
          previewHint="This is the exact public storefront card customers will see."
        >
          {/* Compact tab bar: scrollable pills on mobile, inline on desktop */}
          <div className="flex snap-x gap-1.5 overflow-x-auto rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-1.5 [scrollbar-width:thin] md:grid md:grid-cols-5 md:overflow-visible">
            {TABS_META.map(meta => {
              const active = tab === meta.k
              const count = meta.k === 'media' ? (form.gallery || []).length : 0
              return (
                <button
                  key={meta.k}
                  type="button"
                  onClick={() => setTab(meta.k)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center gap-1.5 rounded-[var(--admin-radius-sm)] px-3.5 text-center text-[12.5px] font-bold transition md:min-h-[40px] md:w-full md:px-2',
                    active
                      ? 'bg-[var(--admin-accent)] text-white shadow-[0_8px_18px_-10px_rgba(89,23,196,0.5)]'
                      : 'text-[var(--admin-text-muted)] hover:bg-[var(--admin-surface)] hover:text-[var(--admin-text)]'
                  )}
                >
                  {meta.label}
                  {meta.k === 'media' && count > 0 && (
                    <span className={cn('rounded-full px-1.5 text-[10px] font-extrabold tabular-nums', active ? 'bg-white/25' : 'bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]')}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="mt-3.5">
            {tab === 'basic' && <BasicTab form={form} setForm={setForm} categories={categories} />}
            {tab === 'content' && <ContentTab form={form} setForm={setForm} />}
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
                session={session}
              />
            )}
            {tab === 'options' && (
              <OptionsTab form={form} setForm={setForm} addOption={addOption} updateOption={updateOption} removeOption={removeOption} />
            )}
            {tab === 'settings' && <SettingsTab form={form} setForm={setForm} />}
          </div>
        </AdminEditorWorkspace>
      </Modal>

      <MediaPlacementModal
        open={activeGalleryIndex !== null}
        media={activeGalleryIndex !== null ? (form.gallery || [])[activeGalleryIndex] : ''}
        title="Adjust Product Image"
        type="image"
        aspectRatio={4 / 3}
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
        contextPreviewHint="Refine the image while seeing the real storefront card result."
        onApply={media => {
          if (activeGalleryIndex === null) return
          updateGalleryFrame(activeGalleryIndex, media)
        }}
        onClose={() => setActiveGalleryIndex(null)}
      />
    </div>
  )
}
