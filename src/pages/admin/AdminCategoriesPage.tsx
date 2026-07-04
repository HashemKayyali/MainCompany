import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Edit, Eye, Plus, Search } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useDialog } from '../../contexts/DialogContext'
import { useI18n } from '../../contexts/LanguageContext'
import type { Category } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import CategoryTileView from '../../components/home/CategoryTileView'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminKebabMenu, { type AdminKebabItem } from '../../components/admin/AdminKebabMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminBadge from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

const empty: Category = { id: '', name: '', slug: '', icon: '', description: '', image: '' }
const PAGE_SIZE_OPTIONS = [12, 24, 48]
const ICON_OPTIONS = Array.from(new Set([
  '🎪', '🎡', '🎢', '🎠', '🎟️', '🎫', '🎭', '🎤', '🎧', '🎼', '🎹', '🥁',
  '🎷', '🎺', '🎸', '🪩', '🎬', '🎥', '📽️', '📸', '📷', '🎞️', '🎨', '🖌️',
  '🖍️', '🖼️', '🧵', '🪡', '🧶', '✂️', '📐', '📏', '🖊️', '🖋️', '📝',
  '🎮', '🕹️', '👾', '🤖', '🧩', '🎲', '♟️', '🧠', '🎯', '🏆', '🥇', '🥈',
  '🥉', '🏅', '🎳', '🏓', '🏸', '🥅', '⚽', '🏀', '🏈', '⚾', '🎾', '🏐',
  '🏉', '🎱', '🥏', '🥊', '🥋', '🏁', '🏎️', '🚲', '🛴', '🛵', '🚗', '🚕',
  '🚙', '🚌', '🚐', '🚚', '🚓', '🚑', '🚒', '🚜', '✈️', '🚁', '🚤', '⛵',
  '💡', '🔦', '⚡', '🔌', '🔋', '🖥️', '💻', '⌨️', '🖱️', '🖨️', '📱', '📲',
  '📟', '📡', '📺', '📻', '🎙️', '🎚️', '🎛️', '📹', '📼', '💾', '💿', '📀',
  '🕶️', '🥽', '🛸', '🚀', '🛰️', '🌌', '🌠', '✨', '💫', '🌟', '⭐', '🔮',
  '🪄', '🎆', '🎇', '🕯️', '🪔', '💎', '🧿', '🎉', '🎊', '🎈', '🎂', '🧁',
  '🍰', '🍭', '🍬', '🍿', '🥤', '🧃', '🍩', '🍪', '🍫', '🍕', '🍔', '🌭',
  '🍟', '🍗', '🌮', '🌯', '🥙', '🥗', '🍝', '🍣', '🍱', '🍦', '🍧', '🍨',
  '☕', '🍵', '🧋', '🎁', '🧸', '🪁', '🪀', '🛝', '🎀', '🛍️', '🛒', '🏷️',
  '💄', '💅', '💇‍♀️', '💇‍♂️', '🧴', '🪞', '👑', '🎩', '🧢', '👗', '👕',
  '👟', '🕺', '💃', '🧘', '🏋️', '🤹', '🎯', '🎪', '🎭', '🏟️', '🏢', '🏛️',
  '🏪', '🏬', '🏫', '🏗️', '🗓️', '📅', '📋', '📌', '📍', '🧾', '💳', '💰',
  '🧮', '📦', '📫', '📞', '📣', '📢', '🔔', '🔍', '🔎', '🔖', '🗂️', '📁',
  '🛠️', '🔧', '🔨', '🪛', '🧰', '⚙️', '🪜', '🧲', '🔩', '🛡️', '🚨', '🧯',
  '⛑️', '🔒', '🔐', '🩺', '🌊', '🏖️', '🏝️', '🌴', '🌵', '🌲', '🌳', '🌺',
  '🌸', '🌼', '🌻', '🌹', '🍀', '🍁', '❄️', '☃️', '🔥', '💧', '☀️', '🌙',
  '☁️', '🌈', '📣', '🎇', '🎵', '🎶', '✅', '☑️', '➕', '💜', '🟣', '🟢',
]))

type CategoryFilter = 'all' | 'in_use' | 'unused'
type CategorySort = 'name' | 'slug' | 'products_desc' | 'products_asc'

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function FieldSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="admin-card p-4">
      <div className="flex flex-col gap-1.5 border-b border-[var(--admin-border)] pb-3">
        <h3 className="admin-section-title">{title}</h3>
        {description && <p className="text-[12px] leading-5 text-[var(--admin-text-muted)]">{description}</p>}
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  )
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-0 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2.5">
      <div className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">{label}</div>
      <div className="mt-1 truncate text-[13px] font-bold leading-5 text-[var(--admin-text)]">{value}</div>
    </div>
  )
}

function CategoryThumb({ category, compact = false }: { category: Category; compact?: boolean }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]',
        compact ? 'flex h-14 w-20 shrink-0 items-center justify-center p-1.5' : 'aspect-[16/10] w-full'
      )}
    >
      {category.image ? (
        <FramedImage
          media={category.image}
          alt={category.name}
          className={cn('h-full w-full', compact && 'rounded-[8px]')}
          fallbackTransform={{ fit: compact ? 'contain' : 'cover' }}
          style={
            compact
              ? {
                  objectFit: 'contain',
                  objectPosition: 'center',
                  transform: 'none',
                }
              : undefined
          }
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-text-muted)]">
          {category.icon || 'No image'}
        </div>
      )}
    </div>
  )
}

function CompactCategoryPreview({ category, productCount }: { category: Category; productCount: number }) {
  return (
    <div className="mx-auto w-full max-w-[18rem]">
      <CategoryTileView
        name={category.name || 'Category name'}
        description={category.description || 'Short category description appears here.'}
        image={category.image}
        count={productCount}
        reducedVisualEffects
        imageLoading="eager"
      />
    </div>
  )
}

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData()
  const dialog = useDialog()
  const { dir } = useI18n()
  const isDesktop = useMediaQuery('(min-width: 768px)', true)

  const [editing, setEditing] = useState<Category | null>(null)
  const [details, setDetails] = useState<Category | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [sortKey, setSortKey] = useState<CategorySort>('name')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)
  const [iconQuery, setIconQuery] = useState('')
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [iconPosition, setIconPosition] = useState<{ blockStart: number; inlineStart: number; width: number; maxHeight: number } | null>(null)

  const iconButtonRef = useRef<HTMLButtonElement | null>(null)
  const iconPopoverRef = useRef<HTMLDivElement | null>(null)

  const countForCategory = (id: string) => products.filter(product => product.categoryId === id).length

  const rows = useMemo(
    () =>
      categories.map(category => ({
        category,
        productCount: products.filter(product => product.categoryId === category.id).length,
      })),
    [categories, products]
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return rows
      .filter(row => {
        if (filter === 'in_use' && row.productCount === 0) return false
        if (filter === 'unused' && row.productCount > 0) return false
        if (!needle) return true
        return (
          row.category.name.toLowerCase().includes(needle) ||
          row.category.slug.toLowerCase().includes(needle) ||
          (row.category.description || '').toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        if (sortKey === 'products_desc') return b.productCount - a.productCount || a.category.name.localeCompare(b.category.name)
        if (sortKey === 'products_asc') return a.productCount - b.productCount || a.category.name.localeCompare(b.category.name)
        if (sortKey === 'slug') return a.category.slug.localeCompare(b.category.slug)
        return a.category.name.localeCompare(b.category.name)
      })
  }, [filter, rows, search, sortKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const showingStart = filtered.length ? (currentPage - 1) * pageSize + 1 : 0
  const showingEnd = Math.min(currentPage * pageSize, filtered.length)

  const filteredIcons = useMemo(() => {
    const needle = iconQuery.trim()
    if (!needle) return ICON_OPTIONS
    return ICON_OPTIONS.filter(icon => icon.includes(needle))
  }, [iconQuery])

  useEffect(() => {
    setPage(1)
  }, [filter, pageSize, search, sortKey])

  useLayoutEffect(() => {
    if (!iconPickerOpen || !isDesktop) {
      setIconPosition(null)
      return
    }

    const updatePosition = () => {
      const trigger = iconButtonRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const margin = 12
      const width = Math.min(340, window.innerWidth - margin * 2)
      const maxHeight = Math.min(360, window.innerHeight - margin * 2)
      const spaceBelow = window.innerHeight - rect.bottom - margin
      const placeAbove = spaceBelow < 280 && rect.top > spaceBelow
      const blockStart = placeAbove ? Math.max(margin, rect.top - maxHeight - 8) : Math.min(rect.bottom + 8, window.innerHeight - margin - maxHeight)
      const rawInlineStart = dir === 'rtl' ? window.innerWidth - rect.left - width : rect.right - width
      setIconPosition({
        blockStart,
        inlineStart: clamp(rawInlineStart, margin, window.innerWidth - margin - width),
        width,
        maxHeight,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [dir, iconPickerOpen, isDesktop])

  useEffect(() => {
    if (!iconPickerOpen || !isDesktop) return

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (iconButtonRef.current?.contains(target) || iconPopoverRef.current?.contains(target)) return
      setIconPickerOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIconPickerOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [iconPickerOpen, isDesktop])

  const openNew = () => {
    setEditing({ ...empty, id: `cat-${Date.now()}` })
    setIsNew(true)
    setIconQuery('')
    setIconPickerOpen(false)
  }

  const openEdit = (category: Category) => {
    setEditing({ ...category })
    setIsNew(false)
    setIconQuery('')
    setIconPickerOpen(false)
  }

  const closeEditor = () => {
    setEditing(null)
    setIsNew(false)
    setIconQuery('')
    setIconPickerOpen(false)
  }

  const updateEditing = <K extends keyof Category>(key: K, value: Category[K]) => {
    setEditing(current => (current ? { ...current, [key]: value } : null))
  }

  const canSave = Boolean(editing?.name?.trim())

  const save = async () => {
    if (!editing || !canSave) return
    const slug = (editing.slug || makeSlug(editing.name)).trim()
    const data = { ...editing, slug }

    setSaving(true)
    try {
      if (isNew) await addCategory(data)
      else await updateCategory(data.id, data)
      closeEditor()
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to save'), variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = (category: Category) => {
    const productCount = countForCategory(category.id)
    if (productCount > 0) {
      dialog.alert({
        title: 'Cannot Delete',
        message: 'Remove products from this category first.',
        variant: 'warning',
      })
      return
    }
    setDeleteTarget(category)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      if (details?.id === deleteTarget.id) setDetails(null)
      setDeleteTarget(null)
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to delete'), variant: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const actionItems = (category: Category): AdminKebabItem[] => [
    { label: 'Delete category', tone: 'danger', onSelect: () => requestDelete(category) },
  ]

  const iconPickerBody = editing ? (
    <div className="admin-scope space-y-3">
      <input
        className="admin-input"
        value={iconQuery}
        onChange={event => setIconQuery(event.target.value)}
        placeholder="Filter or paste an icon..."
        aria-label="Filter category icons"
      />
      <div className="grid max-h-72 grid-cols-6 gap-1.5 overflow-y-auto overscroll-contain pe-1">
        {filteredIcons.map(icon => {
          const active = editing.icon === icon
          return (
            <button
              key={icon}
              type="button"
              aria-label={`Select icon ${icon}`}
              aria-pressed={active}
              onClick={() => {
                updateEditing('icon', icon)
                setIconPickerOpen(false)
              }}
              className={cn(
                'flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border text-[20px] transition',
                active
                  ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)]'
                  : 'border-[var(--admin-border)] bg-[var(--admin-surface)] hover:border-[var(--admin-accent)]'
              )}
            >
              {icon}
            </button>
          )
        })}
      </div>
    </div>
  ) : null

  const desktopIconPicker =
    iconPickerOpen && editing && isDesktop && typeof document !== 'undefined'
      ? createPortal(
          <div className="admin-scope pointer-events-none fixed inset-0 z-[160]" dir={dir}>
            <div
              ref={iconPopoverRef}
              className="surface-floating pointer-events-auto fixed rounded-[var(--admin-radius)] p-3"
              style={{
                insetBlockStart: iconPosition?.blockStart ?? 0,
                insetInlineStart: iconPosition?.inlineStart ?? 0,
                width: iconPosition?.width ?? 340,
                maxHeight: iconPosition?.maxHeight ?? 360,
                overflowY: 'auto',
                visibility: iconPosition ? 'visible' : 'hidden',
              }}
            >
              {iconPickerBody}
            </div>
          </div>,
          document.body
        )
      : null

  const previewCategory = editing
    ? {
        ...editing,
        slug: editing.slug?.trim() || makeSlug(editing.name || 'category'),
      }
    : empty

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Categories / Brands"
        actions={
          <AdminButton size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add Category
          </AdminButton>
        }
      />

      <div className="admin-card flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_170px_160px]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" strokeWidth={2} aria-hidden="true" />
            <input
              className="admin-input ps-9 pe-16"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search name, slug, description..."
              aria-label="Search categories"
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--admin-text-muted)]">
              {filtered.length}/{rows.length}
            </span>
          </div>

          <select className="admin-input" value={sortKey} onChange={event => setSortKey(event.target.value as CategorySort)} aria-label="Sort categories">
            <option value="name">Name</option>
            <option value="slug">Slug</option>
            <option value="products_desc">Products high to low</option>
            <option value="products_asc">Products low to high</option>
          </select>

          <select className="admin-input" value={pageSize} onChange={event => setPageSize(Number(event.target.value))} aria-label="Page size">
            {PAGE_SIZE_OPTIONS.map(value => (
              <option key={value} value={value}>
                {value} per page
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2.5 flex snap-x gap-1.5 overflow-x-auto pb-1 [scrollbar-width:thin]">
          {([
            ['all', `All (${rows.length})`],
            ['in_use', `In use (${rows.filter(row => row.productCount > 0).length})`],
            ['unused', `Unused (${rows.filter(row => row.productCount === 0).length})`],
          ] as Array<[CategoryFilter, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                'inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center rounded-full border px-3.5 text-[12px] font-bold transition',
                filter === value
                  ? 'border-transparent bg-[var(--admin-accent)] text-white'
                  : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <AdminEmptyState
              title={rows.length ? 'No categories match this view' : 'No categories yet'}
              description={rows.length ? 'Try another search, filter, or sort option.' : 'Add the first catalog category or brand.'}
              action={
                <AdminButton size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Add Category
                </AdminButton>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-3 hidden min-h-0 flex-1 overflow-y-auto md:block">
              <div className="admin-table-wrap">
                <table className="min-w-[860px] w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-2.5 text-start">Category</th>
                      <th className="px-3 py-2.5 text-start">Slug</th>
                      <th className="px-3 py-2.5 text-start">Status</th>
                      <th className="px-3 py-2.5 text-start">Products</th>
                      <th className="px-3 py-2.5 text-start">Visibility</th>
                      <th className="px-3 py-2.5 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(({ category, productCount }) => (
                      <tr key={category.id} className="border-t border-[var(--admin-border)] align-middle">
                        <td className="px-3 py-2.5">
                          <div className="flex max-w-[360px] items-center gap-3">
                            <CategoryThumb category={category} compact />
                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{category.name}</div>
                              <div className="line-clamp-1 text-[11px] text-[var(--admin-text-muted)]">{category.description || 'No description'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-[12px] font-semibold text-[var(--admin-text-muted)]">{category.slug || '-'}</td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone={productCount > 0 ? 'success' : 'warning'}>{productCount > 0 ? 'In use' : 'Unused'}</AdminBadge>
                        </td>
                        <td className="px-3 py-2.5 text-[13px] font-bold tabular-nums text-[var(--admin-text)]">{productCount}</td>
                        <td className="px-3 py-2.5">
                          <AdminBadge tone="accent">Visible</AdminBadge>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <AdminButton size="sm" variant="outline" onClick={() => setDetails(category)}>
                              <Eye className="h-4 w-4" aria-hidden="true" />
                              Details
                            </AdminButton>
                            <AdminButton size="sm" onClick={() => openEdit(category)}>
                              <Edit className="h-4 w-4" aria-hidden="true" />
                              Edit
                            </AdminButton>
                            <AdminKebabMenu label={`More actions for ${category.name}`} items={actionItems(category)} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pe-0.5 md:hidden">
              <div className="grid grid-cols-1 gap-2.5">
                {pageItems.map(({ category, productCount }) => (
                  <article key={category.id} className="admin-card p-3">
                    <div className="flex items-start gap-3">
                      <CategoryThumb category={category} compact />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h2 className="truncate text-[14px] font-black text-[var(--admin-text)]">{category.name}</h2>
                            <p className="truncate font-mono text-[11px] font-semibold text-[var(--admin-text-muted)]">{category.slug || '-'}</p>
                          </div>
                          <AdminBadge tone={productCount > 0 ? 'success' : 'warning'}>{productCount > 0 ? 'In use' : 'Unused'}</AdminBadge>
                        </div>
                        <p className="mt-2 line-clamp-2 text-[12px] leading-5 text-[var(--admin-text-muted)]">{category.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <Fact label="Products" value={productCount} />
                      <Fact label="Media" value={category.image ? 'Ready' : 'Missing'} />
                      <Fact label="Visible" value="Yes" />
                    </div>
                    <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                      <AdminButton size="sm" variant="outline" onClick={() => setDetails(category)}>Details</AdminButton>
                      <AdminButton size="sm" onClick={() => openEdit(category)}>Edit</AdminButton>
                      <AdminKebabMenu label={`More actions for ${category.name}`} items={actionItems(category)} />
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-2.5 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)] sm:flex-row sm:items-center sm:justify-between">
              <div>
                Showing {showingStart}-{showingEnd} of {filtered.length}
              </div>
              <div className="flex items-center gap-2">
                <AdminButton size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>
                  Previous
                </AdminButton>
                <span className="min-w-[72px] text-center tabular-nums">
                  {currentPage} / {pageCount}
                </span>
                <AdminButton size="sm" variant="outline" disabled={currentPage >= pageCount} onClick={() => setPage(value => Math.min(pageCount, value + 1))}>
                  Next
                </AdminButton>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.name || 'Category Details'}
        size="2xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          details ? (
            <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
              <AdminButton variant="ghost" onClick={() => setDetails(null)} className="sm:min-w-[96px]">Close</AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  const category = details
                  setDetails(null)
                  openEdit(category)
                }}
                className="sm:min-w-[128px]"
              >
                Edit Category
              </AdminButton>
              <AdminKebabMenu label={`More actions for ${details.name}`} items={actionItems(details)} />
            </div>
          ) : undefined
        }
      >
        {details && (
          <div className="admin-scope space-y-4">
            <section className="admin-card overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1fr)]">
                <div className="bg-[var(--admin-surface-2)] p-3">
                  <CategoryThumb category={details} />
                </div>
                <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone={countForCategory(details.id) > 0 ? 'success' : 'warning'}>
                        {countForCategory(details.id) > 0 ? 'In use' : 'Unused'}
                      </AdminBadge>
                      <AdminBadge tone="accent">Visible</AdminBadge>
                    </div>
                    <h3 className="mt-3 text-[1.2rem] font-black text-[var(--admin-text)]">{details.name}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--admin-text-muted)]">{details.description || 'No description has been added.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Fact label="Products" value={countForCategory(details.id)} />
                    <Fact label="Media" value={details.image ? 'Banner ready' : 'No banner'} />
                  </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              <Fact label="Name" value={details.name} />
              <Fact label="Slug" value={<span className="font-mono text-[11px]">{details.slug || '-'}</span>} />
              <Fact label="Icon" value={details.icon || '-'} />
              <Fact label="Visibility" value="Visible" />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={closeEditor}
        title={isNew ? 'Add Category / Brand' : 'Edit Category'}
        persistent
        size="3xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] leading-5 text-[var(--admin-text-muted)]">
              Products linked: <span className="font-bold text-[var(--admin-text)]">{editing?.id ? countForCategory(editing.id) : 0}</span>
              {' | '}Banner: <span className="font-bold text-[var(--admin-text)]">{editing?.image ? 'Ready' : 'Missing'}</span>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <AdminButton variant="ghost" onClick={closeEditor} disabled={saving} className="sm:min-w-[110px]">Cancel</AdminButton>
              <AdminButton onClick={save} loading={saving} disabled={!canSave} className="sm:min-w-[140px]">
                {isNew ? 'Add Category' : 'Save Changes'}
              </AdminButton>
            </div>
          </div>
        }
      >
        {editing && (
          <div className="admin-scope grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
              <FieldSection title="Identity" description="Name, slug, and icon are grouped so the catalog label stays easy to scan.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="admin-label mb-1.5" htmlFor="category-name">Name *</label>
                    <input
                      id="category-name"
                      className={cn('admin-input', !editing.name.trim() && 'admin-input--error')}
                      value={editing.name}
                      onChange={event => updateEditing('name', event.target.value)}
                      placeholder="Brand or category name"
                    />
                    {!editing.name.trim() && <p className="mt-1 text-[11px] font-semibold text-[var(--admin-danger)]">Name is required.</p>}
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="category-slug">Slug</label>
                    <input
                      id="category-slug"
                      className="admin-input"
                      value={editing.slug}
                      onChange={event => updateEditing('slug', event.target.value)}
                      placeholder={editing.name ? makeSlug(editing.name) : 'auto-generated'}
                    />
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="category-icon">Icon</label>
                    <button
                      ref={iconButtonRef}
                      id="category-icon"
                      type="button"
                      onClick={() => setIconPickerOpen(value => !value)}
                      aria-haspopup="dialog"
                      aria-expanded={iconPickerOpen}
                      className="admin-input flex items-center justify-between gap-3 text-start"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <span className="text-[20px]" aria-hidden="true">{editing.icon || '•'}</span>
                        <span className="truncate font-bold">{editing.icon ? 'Selected icon' : 'Choose an icon'}</span>
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-accent)]">
                        {iconPickerOpen ? 'Close' : 'Pick'}
                      </span>
                    </button>
                    {desktopIconPicker}
                  </div>
                </div>
              </FieldSection>

              <FieldSection title="Description">
                <label className="sr-only" htmlFor="category-description">Description</label>
                <textarea
                  id="category-description"
                  className="admin-input resize-y"
                  rows={4}
                  value={editing.description || ''}
                  onChange={event => updateEditing('description', event.target.value)}
                  placeholder="Brief description of this brand or category..."
                />
              </FieldSection>

              <FieldSection title="Banner / Image" description="The banner remains compact here; framing opens in the shared image placement dialog.">
                <ImageUploader
                  label="Category image"
                  value={editing.image}
                  onChange={url => updateEditing('image', url)}
                  removable
                  onRemove={() => updateEditing('image', '')}
                  folder="categories"
                  frameAspect={4 / 3}
                  defaultFit="cover"
                  frameTitle="Adjust Category Image"
                  frameHint="Position the image inside the category card frame."
                  previewAspectClass="aspect-[16/9]"
                  maxWidthClassName="w-full max-w-[46rem]"
                  compactPreview
                  renderFrameContextPreview={media => (
                    <CompactCategoryPreview category={{ ...previewCategory, image: media }} productCount={editing.id ? countForCategory(editing.id) : 0} />
                  )}
                  frameContextTitle="Category Card"
                  frameContextHint="Check the compact catalog card while framing."
                />
              </FieldSection>
            </div>

            <aside className="min-w-0 xl:sticky xl:top-0 xl:self-start">
              <FieldSection title="Compact Preview" description="A small admin preview, not a dominating public card.">
                <CompactCategoryPreview category={previewCategory} productCount={editing.id ? countForCategory(editing.id) : 0} />
              </FieldSection>
            </aside>
          </div>
        )}
      </Modal>

      {!isDesktop && (
        <Modal open={iconPickerOpen} onClose={() => setIconPickerOpen(false)} title="Choose an icon" size="sm">
          {iconPickerBody}
        </Modal>
      )}

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete Category?"
        description={deleteTarget ? `This will permanently remove ${deleteTarget.name}.` : undefined}
        tone="danger"
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
