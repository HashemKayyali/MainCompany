import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowDown, ArrowUp, Eye, Pencil, Plus, Search } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useDialog } from '../../contexts/DialogContext'
import type { CustomBuild } from '../../data/custom-builds'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import MediaPlacementModal from '../../components/ui/MediaPlacementModal'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminKebabMenu, { type AdminKebabItem } from '../../components/admin/AdminKebabMenu'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import BidiText from '../../components/admin/BidiText'
import AdminBadge from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

const emptyBuild: CustomBuild = {
  title: '',
  description: '',
  image: '',
  images: [],
  category: '',
  sortOrder: 0,
  featured: false,
  active: true,
}

const PAGE_SIZE_OPTIONS = [12, 24, 48]

type BuildFilter = 'all' | 'active' | 'hidden' | 'featured'
type BuildSort = 'order' | 'title' | 'category' | 'photos_desc' | 'photos_asc'

function orderValueForPosition(orderedWithoutCurrent: CustomBuild[], targetIndex: number) {
  const previous = orderedWithoutCurrent[targetIndex - 1]?.sortOrder
  const next = orderedWithoutCurrent[targetIndex]?.sortOrder

  if (previous === undefined && next === undefined) return 10
  if (previous === undefined) return next - 10
  if (next === undefined) return previous + 10
  if (previous === next) return previous + 0.01
  return previous + (next - previous) / 2
}

function buildOrderIndex(build: CustomBuild, orderedBuilds: CustomBuild[]) {
  return orderedBuilds.findIndex(item => (build.id ? item.id === build.id : item.title === build.title))
}

function buildPositionLabel(build: CustomBuild, orderedBuilds: CustomBuild[]) {
  const index = buildOrderIndex(build, orderedBuilds)
  return index >= 0 ? `#${index + 1}` : '-'
}

function buildImages(build: CustomBuild) {
  const seen = new Set<string>()
  return [build.image, ...(build.images || [])].filter(image => {
    if (!image || seen.has(image)) return false
    seen.add(image)
    return true
  })
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
      <div dir="auto" className="mt-1 truncate text-[13px] font-bold leading-5 text-[var(--admin-text)]">{value}</div>
    </div>
  )
}

function BuildThumb({ build, compact = false }: { build: CustomBuild; compact?: boolean }) {
  const cover = buildImages(build)[0]
  return (
    <div className={cn('overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]', compact ? 'h-14 w-24 shrink-0' : 'aspect-video w-full')}>
      {cover ? (
        <FramedImage
          media={cover}
          alt={build.title || 'Custom build'}
          className="h-full w-full"
          fallbackTransform={{ fit: 'cover' }}
          onError={event => {
            ;(event.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-text-muted)]">
          No image
        </div>
      )}
    </div>
  )
}

function CustomBuildViewerPreview({ build, images: imageOverride }: { build: CustomBuild; images?: string[] }) {
  const images = imageOverride?.filter(Boolean) ?? buildImages(build)
  const cover = images[0] || ''
  const title = build.title.trim() || 'Build title'
  const category = (build.category.trim() || 'Custom').toUpperCase()
  const description = build.description.trim() || 'Preview how this photo sits in the public build viewer.'
  const previewThumbs = images.length ? images.slice(0, 3) : ['']

  return (
    <div className="relative mx-auto w-full max-w-[20rem] overflow-hidden rounded-[var(--admin-radius)] border border-[color-mix(in_srgb,var(--admin-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--admin-accent)_30%,var(--admin-text))] p-2.5 text-white shadow-[0_18px_46px_-30px_rgba(20,8,50,0.65)]">
      <div className="relative grid grid-cols-[44px_minmax(0,1fr)] gap-2" dir="ltr">
        <div className="flex flex-col gap-1.5 pt-8">
          {previewThumbs.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className={cn(
                'aspect-video overflow-hidden rounded-[8px] border bg-white/10',
                index === 0 ? 'border-fuchsia-200 ring-1 ring-fuchsia-200/45' : 'border-white/15 opacity-75'
              )}
            >
              {image ? (
                <FramedImage media={image} alt="" className="h-full w-full" fallbackTransform={{ fit: 'contain' }} />
              ) : (
                <div className="h-full w-full bg-white/10" />
              )}
            </div>
          ))}
        </div>

        <div className="relative overflow-hidden rounded-[14px] border border-white/15 bg-black/25 p-1.5">
          <div className="mb-1.5 flex items-center justify-between gap-2 px-1">
            <span className="flex min-w-0 items-center gap-1.5 truncate text-[8px] font-black uppercase tracking-[0.12em] text-white/58">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-300" />
              Live Build Viewer
            </span>
            <span className="shrink-0 rounded-full border border-white/15 bg-white/10 px-1.5 py-0.5 text-[8px] font-bold text-white/70">
              01/{String(Math.max(images.length, 1)).padStart(2, '0')}
            </span>
          </div>

          <div className="relative aspect-video overflow-hidden rounded-[10px] bg-black/35">
            {cover ? (
              <FramedImage media={cover} alt={title} className="h-full w-full" fallbackTransform={{ fit: 'contain' }} />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                No photo
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/18 to-transparent p-2.5">
              <div className="inline-flex max-w-full rounded-[6px] border border-white/20 bg-black/35 px-1.5 py-0.5 text-[7px] font-black uppercase tracking-[0.14em] text-violet-100">
                <span className="truncate">{category}</span>
              </div>
              <div className="mt-1 truncate text-[14px] font-black leading-none">{title}</div>
              <div className="mt-1 line-clamp-1 text-[9.5px] font-semibold leading-4 text-white/72">{description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PhotoTile({
  url,
  index,
  isCover,
  canMoveUp,
  canMoveDown,
  onFrame,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  url: string
  index: number
  isCover: boolean
  canMoveUp: boolean
  canMoveDown: boolean
  onFrame: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
}) {
  return (
    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2">
      <div className="relative overflow-hidden rounded-[var(--admin-radius-sm)] bg-[var(--admin-surface-2)]">
        <div className="aspect-video overflow-hidden">
          <FramedImage
            media={url}
            alt=""
            className="h-full w-full"
            fallbackTransform={{ fit: 'cover' }}
            onError={event => {
              ;(event.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
        <span className="absolute start-2 top-2 rounded-md border border-white/70 bg-white/90 px-1.5 py-0.5 text-[8px] font-black uppercase text-[var(--admin-accent)]">
          {isCover ? 'Cover' : `#${index + 1}`}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1.5">
        <button type="button" onClick={onFrame} className="min-h-[44px] rounded-[8px] bg-[var(--admin-accent-soft)] px-2 text-[11px] font-bold text-[var(--admin-accent)] md:min-h-[34px]">
          Frame
        </button>
        <button type="button" onClick={onRemove} className="min-h-[44px] rounded-[8px] bg-[color-mix(in_srgb,var(--admin-danger)_11%,transparent)] px-2 text-[11px] font-bold text-[var(--admin-danger)] md:min-h-[34px]">
          Remove
        </button>
        <button
          type="button"
          onClick={onMoveUp}
          disabled={!canMoveUp}
          className="min-h-[44px] rounded-[8px] border border-[var(--admin-border)] px-2 text-[11px] font-bold text-[var(--admin-text-muted)] disabled:opacity-45 md:min-h-[34px]"
        >
          Up
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={!canMoveDown}
          className="min-h-[44px] rounded-[8px] border border-[var(--admin-border)] px-2 text-[11px] font-bold text-[var(--admin-text-muted)] disabled:opacity-45 md:min-h-[34px]"
        >
          Down
        </button>
      </div>
    </div>
  )
}

export default function AdminCustomBuildsPage() {
  const {
    customBuilds,
    customBuildCategories,
    addCustomBuild,
    updateCustomBuild,
    deleteCustomBuild,
    addCustomBuildCategory,
  } = useData()
  const dialog = useDialog()

  const [editing, setEditing] = useState<CustomBuild | null>(null)
  const [details, setDetails] = useState<CustomBuild | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<CustomBuild | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [reorderingId, setReorderingId] = useState<string | null>(null)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BuildFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortKey, setSortKey] = useState<BuildSort>('order')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)

  const sortedBuilds = useMemo(
    () => [...customBuilds].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title)),
    [customBuilds]
  )

  const buildsWithoutEditing = useMemo(
    () => (editing?.id ? sortedBuilds.filter(build => build.id !== editing.id) : sortedBuilds),
    [editing?.id, sortedBuilds]
  )

  const editingPosition = useMemo(() => {
    if (!editing) return 1
    const orderedWithEditing = [...buildsWithoutEditing, editing].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title))
    const index = orderedWithEditing.indexOf(editing)
    return index >= 0 ? index + 1 : orderedWithEditing.length
  }, [buildsWithoutEditing, editing])

  const orderOptions = useMemo(
    () => Array.from({ length: buildsWithoutEditing.length + 1 }, (_, index) => index + 1),
    [buildsWithoutEditing.length]
  )

  const categoryNames = useMemo(
    () =>
      Array.from(
        new Set([
          ...customBuildCategories
            .filter(category => category.active !== false)
            .map(category => category.name.trim())
            .filter(Boolean),
          ...customBuilds.map(build => build.category.trim()).filter(Boolean),
        ])
      ).sort((a, b) => a.localeCompare(b)),
    [customBuildCategories, customBuilds]
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return sortedBuilds
      .filter(build => {
        if (statusFilter === 'active' && build.active === false) return false
        if (statusFilter === 'hidden' && build.active !== false) return false
        if (statusFilter === 'featured' && !build.featured) return false
        if (categoryFilter !== 'all' && build.category !== categoryFilter) return false
        if (!needle) return true
        return (
          build.title.toLowerCase().includes(needle) ||
          build.description.toLowerCase().includes(needle) ||
          build.category.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        if (sortKey === 'title') return a.title.localeCompare(b.title)
        if (sortKey === 'category') return a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
        if (sortKey === 'photos_desc') return buildImages(b).length - buildImages(a).length || a.title.localeCompare(b.title)
        if (sortKey === 'photos_asc') return buildImages(a).length - buildImages(b).length || a.title.localeCompare(b.title)
        return (a.sortOrder || 0) - (b.sortOrder || 0) || a.title.localeCompare(b.title)
      })
  }, [categoryFilter, search, sortKey, sortedBuilds, statusFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const showingStart = filtered.length ? (currentPage - 1) * pageSize + 1 : 0
  const showingEnd = Math.min(currentPage * pageSize, filtered.length)

  useEffect(() => {
    setPage(1)
  }, [categoryFilter, pageSize, search, sortKey, statusFilter])

  const patchEditing = <K extends keyof CustomBuild>(key: K, value: CustomBuild[K]) => {
    setEditing(current => (current ? { ...current, [key]: value } : null))
  }

  const setEditingPosition = (position: number) => {
    const targetIndex = Math.min(Math.max(position - 1, 0), buildsWithoutEditing.length)
    patchEditing('sortOrder', orderValueForPosition(buildsWithoutEditing, targetIndex))
  }

  const moveEditingPosition = (direction: -1 | 1) => {
    setEditingPosition(editingPosition + direction)
  }

  const createCategory = async () => {
    const name = newCategoryName.trim()
    if (!name) return

    const existingSaved = customBuildCategories.find(category => category.name.trim().toLowerCase() === name.toLowerCase())
    if (existingSaved) {
      patchEditing('category', existingSaved.name.trim())
      setNewCategoryName('')
      return
    }

    const nextOrder = customBuildCategories.length
      ? Math.max(...customBuildCategories.map(category => category.sortOrder || 0)) + 10
      : 10

    setCreatingCategory(true)
    try {
      await addCustomBuildCategory({
        name,
        sortOrder: nextOrder,
        active: true,
      })
      patchEditing('category', name)
      setNewCategoryName('')
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to create custom build category'), variant: 'danger' })
    } finally {
      setCreatingCategory(false)
    }
  }

  const openNew = () => {
    const nextOrder = sortedBuilds.length
      ? Math.max(...sortedBuilds.map(build => build.sortOrder || 0)) + 10
      : 10
    setNewCategoryName('')
    setEditing({ ...emptyBuild, images: [], sortOrder: nextOrder })
    setIsNew(true)
  }

  const openEdit = (build: CustomBuild) => {
    const images = buildImages(build)
    setNewCategoryName('')
    setEditing({ ...build, image: images[0] || '', images })
    setIsNew(false)
  }

  const closeEditor = () => {
    setEditing(null)
    setIsNew(false)
    setActiveImageIndex(null)
    setNewCategoryName('')
  }

  const save = async () => {
    if (!editing?.title.trim()) return
    const images = buildImages(editing)

    const payload: CustomBuild = {
      ...editing,
      title: editing.title.trim(),
      description: editing.description.trim(),
      category: editing.category.trim(),
      image: images[0] || '',
      images,
      sortOrder: Number(editing.sortOrder || 0),
      featured: Boolean(editing.featured),
      active: editing.active !== false,
    }

    setSaving(true)
    try {
      if (isNew) await addCustomBuild(payload)
      else if (editing.id) await updateCustomBuild(editing.id, payload)
      closeEditor()
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to save custom build'), variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return

    setDeleting(true)
    try {
      await deleteCustomBuild(deleteTarget.id)
      if (details?.id === deleteTarget.id) setDetails(null)
      setDeleteTarget(null)
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to delete custom build'), variant: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const addImage = (url: string) => {
    setEditing(current => {
      if (!current) return current
      const images = buildImages({ ...current, images: [...(current.images || []), url], image: current.image || url })
      return { ...current, image: images[0] || '', images }
    })
  }

  const removeImage = (index: number) => {
    setEditing(current => {
      if (!current) return current
      const images = buildImages(current).filter((_, imageIndex) => imageIndex !== index)
      return { ...current, image: images[0] || '', images }
    })
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    setEditing(current => {
      if (!current) return current
      const images = buildImages(current)
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= images.length) return current
      ;[images[index], images[nextIndex]] = [images[nextIndex], images[index]]
      return { ...current, image: images[0] || '', images }
    })
  }

  const updateImageFrame = (index: number, media: string) => {
    setEditing(current => {
      if (!current) return current
      const images = buildImages(current).map((image, imageIndex) => (imageIndex === index ? media : image))
      return { ...current, image: images[0] || '', images }
    })
  }

  const moveBuildInOrder = async (build: CustomBuild, direction: -1 | 1) => {
    if (!build.id) return
    const currentIndex = buildOrderIndex(build, sortedBuilds)
    const targetIndex = currentIndex + direction
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= sortedBuilds.length) return

    const withoutCurrent = sortedBuilds.filter(item => item.id !== build.id)
    const nextSortOrder = orderValueForPosition(withoutCurrent, targetIndex)

    setReorderingId(build.id)
    try {
      await updateCustomBuild(build.id, { sortOrder: nextSortOrder })
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to reorder custom build'), variant: 'danger' })
    } finally {
      setReorderingId(null)
    }
  }

  const actionItems = (build: CustomBuild): AdminKebabItem[] => [
    {
      label: 'Move up',
      icon: <ArrowUp className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />,
      disabled: !build.id || buildOrderIndex(build, sortedBuilds) <= 0 || reorderingId === build.id,
      onSelect: () => void moveBuildInOrder(build, -1),
    },
    {
      label: 'Move down',
      icon: <ArrowDown className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />,
      disabled: !build.id || buildOrderIndex(build, sortedBuilds) < 0 || buildOrderIndex(build, sortedBuilds) >= sortedBuilds.length - 1 || reorderingId === build.id,
      onSelect: () => void moveBuildInOrder(build, 1),
    },
    {
      label: build.id ? 'Delete build' : 'Delete unavailable',
      tone: 'danger',
      disabled: !build.id,
      onSelect: () => setDeleteTarget(build),
    },
  ]

  const statusChips: Array<[BuildFilter, string]> = [
    ['all', `All (${customBuilds.length})`],
    ['active', `Active (${customBuilds.filter(build => build.active !== false).length})`],
    ['hidden', `Hidden (${customBuilds.filter(build => build.active === false).length})`],
    ['featured', `Featured (${customBuilds.filter(build => build.featured).length})`],
  ]

  const previewBuild = editing || emptyBuild
  const previewImages = buildImages(previewBuild)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Custom Builds"
        actions={
          <AdminButton size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add Build
          </AdminButton>
        }
      />

      <div className="admin-card flex min-h-0 flex-1 flex-col p-3 sm:p-4">
        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1fr)_170px_160px_160px]">
          <div className="relative min-w-0">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" strokeWidth={2} aria-hidden="true" />
            <input
              className="admin-input ps-9 pe-16"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search title, category, description..."
              aria-label="Search custom builds"
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--admin-text-muted)]">
              {filtered.length}/{customBuilds.length}
            </span>
          </div>

          <select className="admin-input" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} aria-label="Filter by category">
            <option value="all">All categories</option>
            {categoryNames.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select className="admin-input" value={sortKey} onChange={event => setSortKey(event.target.value as BuildSort)} aria-label="Sort custom builds">
            <option value="order">Order</option>
            <option value="title">Title</option>
            <option value="category">Category</option>
            <option value="photos_desc">Photos high to low</option>
            <option value="photos_asc">Photos low to high</option>
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
          {statusChips.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={cn(
                'inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center rounded-full border px-3.5 text-[12px] font-bold transition',
                statusFilter === value
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
              title={customBuilds.length ? 'No custom builds match this view' : 'No custom builds yet'}
              description={customBuilds.length ? 'Try another status, category, sort, or search.' : 'Create the first custom build entry.'}
              action={
                <AdminButton size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Add Build
                </AdminButton>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-3 hidden min-h-0 flex-1 overflow-y-auto md:block">
              <div className="admin-table-wrap">
                <table className="min-w-[900px] w-full border-collapse text-start">
                  <thead className="sticky top-0 z-10 bg-[var(--admin-surface-2)]">
                    <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                      <th className="px-3 py-2.5 text-start">Build</th>
                      <th className="px-3 py-2.5 text-start">Position</th>
                      <th className="px-3 py-2.5 text-start">Photos</th>
                      <th className="px-3 py-2.5 text-start">Category</th>
                      <th className="px-3 py-2.5 text-start">Status</th>
                      <th className="px-3 py-2.5 text-start">Featured</th>
                      <th className="px-3 py-2.5 text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map(build => {
                      const images = buildImages(build)
                      const orderIndex = buildOrderIndex(build, sortedBuilds)
                      const isReordering = reorderingId === build.id
                      return (
                        <tr key={build.id || build.title} className="border-t border-[var(--admin-border)] align-middle hover:bg-[var(--admin-surface-2)]">
                          <td className="px-3 py-2.5">
                            <div className="flex max-w-[420px] items-center gap-3">
                              <BuildThumb build={build} compact />
                              <div className="min-w-0">
                                <div className="truncate text-start text-[13px] font-bold text-[var(--admin-text)]"><BidiText>{build.title}</BidiText></div>
                                <div className="line-clamp-1 text-start text-[11px] text-[var(--admin-text-muted)]">{build.description ? <BidiText>{build.description}</BidiText> : 'No description'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex min-h-[32px] min-w-[3rem] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-2 text-[12px] font-black tabular-nums text-[var(--admin-text)]">
                                {buildPositionLabel(build, sortedBuilds)}
                              </span>
                              <button
                                type="button"
                                className="admin-icon-btn"
                                aria-label={`Move ${build.title} up`}
                                disabled={!build.id || orderIndex <= 0 || isReordering}
                                onClick={() => void moveBuildInOrder(build, -1)}
                              >
                                <ArrowUp className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="admin-icon-btn"
                                aria-label={`Move ${build.title} down`}
                                disabled={!build.id || orderIndex < 0 || orderIndex >= sortedBuilds.length - 1 || isReordering}
                                onClick={() => void moveBuildInOrder(build, 1)}
                              >
                                <ArrowDown className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-[13px] font-bold tabular-nums text-[var(--admin-text)]">{images.length}</td>
                          <td className="px-3 py-2.5">
                            <span className="block max-w-[150px] truncate text-start text-[12px] font-semibold text-[var(--admin-text-muted)]"><BidiText>{build.category || 'Uncategorized'}</BidiText></span>
                          </td>
                          <td className="px-3 py-2.5">
                            <AdminBadge tone={build.active !== false ? 'success' : 'warning'}>{build.active !== false ? 'Active' : 'Hidden'}</AdminBadge>
                          </td>
                          <td className="px-3 py-2.5">
                            <AdminBadge tone={build.featured ? 'accent' : 'warning'}>{build.featured ? 'Featured' : 'No'}</AdminBadge>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-end gap-1.5">
                              <AdminButton size="sm" variant="outline" onClick={() => setDetails(build)}>
                                <Eye className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                                Details
                              </AdminButton>
                              <AdminButton size="sm" onClick={() => openEdit(build)}>
                                <Pencil className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                                Edit
                              </AdminButton>
                              <AdminKebabMenu label={`More actions for ${build.title}`} items={actionItems(build)} />
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pe-0.5 md:hidden">
              <div className="grid grid-cols-1 gap-2.5">
                {pageItems.map(build => {
                  const images = buildImages(build)
                  return (
                    <article key={build.id || build.title} className="admin-card min-w-0 p-3">
                      <div className="flex items-start gap-3">
                        <BuildThumb build={build} compact />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="truncate text-start text-[14px] font-black text-[var(--admin-text)]"><BidiText>{build.title}</BidiText></h2>
                              <p className="truncate text-start text-[11px] font-semibold text-[var(--admin-text-muted)]"><BidiText>{build.category || 'Uncategorized'}</BidiText></p>
                            </div>
                            <AdminBadge tone={build.active !== false ? 'success' : 'warning'}>{build.active !== false ? 'Active' : 'Hidden'}</AdminBadge>
                          </div>
                          <p className="mt-2 line-clamp-2 text-start text-[12px] leading-5 text-[var(--admin-text-muted)]">{build.description ? <BidiText>{build.description}</BidiText> : 'No description'}</p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <Fact label="Position" value={buildPositionLabel(build, sortedBuilds)} />
                        <Fact label="Photos" value={images.length} />
                        <Fact label="Featured" value={build.featured ? 'Yes' : 'No'} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {build.featured && <AdminBadge tone="accent">Featured</AdminBadge>}
                        <AdminBadge tone={images.length > 0 ? 'success' : 'warning'}>{images.length > 0 ? 'Photos ready' : 'Needs photos'}</AdminBadge>
                      </div>

                      <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                        <AdminButton size="sm" variant="outline" onClick={() => setDetails(build)}>
                          <Eye className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                          Details
                        </AdminButton>
                        <AdminButton size="sm" onClick={() => openEdit(build)}>
                          <Pencil className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                          Edit
                        </AdminButton>
                        <AdminKebabMenu label={`More actions for ${build.title}`} items={actionItems(build)} />
                      </div>
                    </article>
                  )
                })}
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
        title={details?.title || 'Build Details'}
        size="2xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          details ? (
            <div className="admin-scope grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 sm:flex sm:flex-row sm:items-center sm:justify-end">
              <AdminButton variant="ghost" onClick={() => setDetails(null)} className="hidden sm:inline-flex sm:min-w-[96px]">Close</AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  const build = details
                  setDetails(null)
                  openEdit(build)
                }}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                Edit Build
              </AdminButton>
              <AdminKebabMenu label={`More actions for ${details.title}`} items={actionItems(details)} />
            </div>
          ) : undefined
        }
      >
        {details && (
          <div className="admin-scope space-y-4">
            <section className="admin-card overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,0.84fr)_minmax(0,1fr)]">
                <div className="bg-[var(--admin-surface-2)] p-3">
                  <BuildThumb build={details} />
                </div>
                <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone={details.active !== false ? 'success' : 'warning'}>{details.active !== false ? 'Active' : 'Hidden'}</AdminBadge>
                      {details.featured && <AdminBadge tone="accent">Featured</AdminBadge>}
                      <AdminBadge tone="accent"><BidiText>{details.category || 'Uncategorized'}</BidiText></AdminBadge>
                    </div>
                    <h3 className="mt-3 text-start text-[1.2rem] font-black text-[var(--admin-text)]"><BidiText>{details.title}</BidiText></h3>
                    <p className="mt-2 text-start text-[13px] leading-6 text-[var(--admin-text-muted)]">{details.description ? <BidiText>{details.description}</BidiText> : 'No description has been added.'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Fact label="Position" value={buildPositionLabel(details, sortedBuilds)} />
                    <Fact label="Photos" value={buildImages(details).length} />
                  </div>
                </div>
              </div>
            </section>

            <FieldSection title="Photos">
              {buildImages(details).length > 0 ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {buildImages(details).slice(0, 8).map((image, index) => (
                    <div key={`${image}-${index}`} className="aspect-video overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                      <FramedImage media={image} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[var(--admin-text-muted)]">No photos uploaded yet.</p>
              )}
            </FieldSection>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={closeEditor}
        title={isNew ? 'Add Custom Build' : 'Edit Custom Build'}
        persistent
        size="3xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] leading-5 text-[var(--admin-text-muted)]">
              Photos: <span className="font-bold text-[var(--admin-text)]">{previewImages.length}</span>
              {' | '}Status: <span className="font-bold text-[var(--admin-text)]">{editing?.active !== false ? 'Active' : 'Hidden'}</span>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <AdminButton variant="ghost" onClick={closeEditor} disabled={saving} className="sm:min-w-[110px]">Cancel</AdminButton>
              <AdminButton onClick={save} loading={saving} disabled={!editing?.title.trim()} className="sm:min-w-[140px]">
                {isNew ? 'Create Build' : 'Save Changes'}
              </AdminButton>
            </div>
          </div>
        }
      >
        {editing && (
          <div className="admin-scope min-h-0">
            <div className="min-w-0 space-y-4">
              <FieldSection title="Content / Category" description="Title, category, and public position stay in one compact editing group.">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="admin-label mb-1.5" htmlFor="build-title">Title *</label>
                    <input
                      id="build-title"
                      className={cn('admin-input', !editing.title.trim() && 'admin-input--error')}
                      value={editing.title}
                      onChange={event => patchEditing('title', event.target.value)}
                      placeholder="Bike Blender activation"
                    />
                    {!editing.title.trim() && <p className="mt-1 text-[11px] font-semibold text-[var(--admin-danger)]">Title is required.</p>}
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="build-category">Category</label>
                    <select
                      id="build-category"
                      className="admin-input"
                      value={editing.category}
                      onChange={event => patchEditing('category', event.target.value)}
                    >
                      <option value="">Select category</option>
                      {categoryNames.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <input
                        className="admin-input"
                        value={newCategoryName}
                        onChange={event => setNewCategoryName(event.target.value)}
                        onKeyDown={event => {
                          if (event.key !== 'Enter') return
                          event.preventDefault()
                          void createCategory()
                        }}
                        placeholder="New category"
                        aria-label="New custom build category"
                      />
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => void createCategory()}
                        loading={creatingCategory}
                        disabled={!newCategoryName.trim()}
                      >
                        Add
                      </AdminButton>
                    </div>
                  </div>
                  <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
                    <label className="admin-label mb-1.5" htmlFor="build-position">Public position</label>
                    <select
                      id="build-position"
                      className="admin-input bg-[var(--admin-surface)]"
                      value={editingPosition}
                      onChange={event => setEditingPosition(Number(event.target.value))}
                    >
                      {orderOptions.map(position => (
                        <option key={position} value={position}>
                          Position {position} of {orderOptions.length}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => moveEditingPosition(-1)}
                        disabled={editingPosition <= 1}
                      >
                        <ArrowUp className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                        Move up
                      </AdminButton>
                      <AdminButton
                        size="sm"
                        variant="outline"
                        onClick={() => moveEditingPosition(1)}
                        disabled={editingPosition >= orderOptions.length}
                      >
                        <ArrowDown className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                        Move down
                      </AdminButton>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="admin-label mb-1.5" htmlFor="build-description">Description</label>
                    <textarea
                      id="build-description"
                      className="admin-input resize-y"
                      rows={4}
                      value={editing.description}
                      onChange={event => patchEditing('description', event.target.value)}
                      placeholder="A short visual description. Keep it tight."
                    />
                  </div>
                </div>
              </FieldSection>

              <FieldSection title="Build Photos" description="The first photo is the cover. Controls remain visible on touch devices.">
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
                  {previewImages.map((url, index) => (
                    <PhotoTile
                      key={`${url}-${index}`}
                      url={url}
                      index={index}
                      isCover={index === 0}
                      canMoveUp={index > 0}
                      canMoveDown={index < previewImages.length - 1}
                      onFrame={() => setActiveImageIndex(index)}
                      onMoveUp={() => moveImage(index, -1)}
                      onMoveDown={() => moveImage(index, 1)}
                      onRemove={() => removeImage(index)}
                    />
                  ))}

                  <ImageUploader
                    compact
                    onChange={addImage}
                    folder="custom-builds"
                    frameAspect={16 / 9}
                    defaultFit="contain"
                    frameTitle="Adjust Custom Build Photo"
                    frameHint="Position the photo inside the public custom build viewer."
                    previewAspectClass="aspect-video"
                    renderFrameContextPreview={media =>
                      <CustomBuildViewerPreview build={previewBuild} images={media ? [media, ...previewImages.filter(image => image !== media)] : previewImages} />
                    }
                    frameContextTitle="Public Build Viewer"
                    frameContextHint="Matches the large image container on the custom builds page."
                  />
                </div>
              </FieldSection>

              <FieldSection title="Visibility / Featured">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3">
                    <input
                      type="checkbox"
                      checked={editing.active}
                      onChange={event => patchEditing('active', event.target.checked)}
                      className="h-5 w-5 accent-violet-600"
                    />
                    <span className="text-[13px] font-bold text-[var(--admin-text)]">Show on public page</span>
                  </label>
                  <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3">
                    <input
                      type="checkbox"
                      checked={editing.featured}
                      onChange={event => patchEditing('featured', event.target.checked)}
                      className="h-5 w-5 accent-violet-600"
                    />
                    <span className="text-[13px] font-bold text-[var(--admin-text)]">Feature this build</span>
                  </label>
                </div>
              </FieldSection>
            </div>
          </div>
        )}
      </Modal>

      <MediaPlacementModal
        open={activeImageIndex !== null}
        media={activeImageIndex !== null ? previewImages[activeImageIndex] : ''}
        title="Adjust Custom Build Photo"
        type="image"
        aspectRatio={16 / 9}
        defaultFit="contain"
        hint="Position the photo inside the public custom build viewer frame."
        contextPreview={media => {
          const nextImages =
            activeImageIndex === null
              ? previewImages
              : previewImages.map((image, index) => (index === activeImageIndex ? media : image))

          return <CustomBuildViewerPreview build={previewBuild} images={nextImages} />
        }}
        contextPreviewTitle="Public Build Viewer"
        contextPreviewHint="Matches the large image container on the custom builds page."
        onApply={media => {
          if (activeImageIndex === null) return
          updateImageFrame(activeImageIndex, media)
        }}
        onClose={() => setActiveImageIndex(null)}
      />

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete Custom Build?"
        description={deleteTarget ? `This will remove ${deleteTarget.title} from the custom builds page.` : undefined}
        tone="danger"
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
