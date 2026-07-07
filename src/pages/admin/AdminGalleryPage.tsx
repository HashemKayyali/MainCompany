import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { Plus, Search } from 'lucide-react'
import { useData } from '../../contexts/DataContext'
import { useDialog } from '../../contexts/DialogContext'
import type { GalleryAlbum } from '../../data/gallery'
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
import { useAssetSession } from '../../hooks/useAssetSession'
import { deleteAssetsSafely } from '../../services/storage.service'

/**
 * Enforce the cover invariant BEFORE persistence.
 *
 * Rule: `cover === images[0] || ''`. This is deterministic, matches
 * the existing behaviour whenever images is non-empty, and — critically
 * — refuses to silently keep a stale cover URL when the last image was
 * removed. The forbidden state
 *
 *     images = []
 *     cover  = <some-old-image-that-was-removed>
 *
 * can no longer be persisted. The old cover is reconciled by the
 * session's commit diff.
 */
function enforceCoverInvariant(images: string[], _existingCover: string): string {
  void _existingCover
  return images[0] || ''
}

const emptyAlbum: GalleryAlbum = { slug: '', title: '', cover: '', images: [], category: '' }
const PAGE_SIZE_OPTIONS = [16, 32, 64]

type GallerySort = 'title' | 'category' | 'photos_desc' | 'photos_asc'

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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

function albumCover(album: GalleryAlbum) {
  return album.images[0] || album.cover || ''
}

function AlbumThumb({ album, compact = false }: { album: GalleryAlbum; compact?: boolean }) {
  const cover = albumCover(album)
  return (
    <div className={cn('overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]', compact ? 'aspect-[4/3]' : 'aspect-[16/10]')}>
      {cover ? (
        <FramedImage
          media={cover}
          alt={album.title}
          className="h-full w-full"
          fallbackTransform={{ fit: 'cover' }}
          onError={event => {
            ;(event.target as HTMLImageElement).style.display = 'none'
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-text-muted)]">
          No cover
        </div>
      )}
    </div>
  )
}

function CompactAlbumPreview({ album }: { album: GalleryAlbum }) {
  return (
    <div className="mx-auto w-full max-w-[18rem] overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)]">
      <AlbumThumb album={album} />
      <div className="space-y-2 p-3">
        <div className="min-w-0">
          <div className="truncate text-start text-[14px] font-black text-[var(--admin-text)]"><BidiText>{album.title || 'Album title'}</BidiText></div>
          <div className="truncate text-start font-mono text-[10.5px] font-semibold text-[var(--admin-text-muted)]"><BidiText dir="ltr">{album.slug || 'auto-slug'}</BidiText></div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <AdminBadge tone="accent"><BidiText>{album.category || 'Uncategorized'}</BidiText></AdminBadge>
          <AdminBadge tone={album.images.length > 0 ? 'success' : 'warning'}>{album.images.length} photos</AdminBadge>
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
        <div className="aspect-square overflow-hidden">
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
          Adjust
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

export default function AdminGalleryPage() {
  const { galleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum } = useData()
  const dialog = useDialog()

  const [editing, setEditing] = useState<GalleryAlbum | null>(null)
  const [details, setDetails] = useState<GalleryAlbum | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<GalleryAlbum | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('all')
  const [sortKey, setSortKey] = useState<GallerySort>('title')
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0])
  const [page, setPage] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  // Snapshot of every media reference the album holds at open time
  // — both `cover` and `images[]`, so a legacy cover that lives
  // outside images is not lost.
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
    sessionKey: editing ? openId : null,
    originalUrls: sessionOriginals,
  })

  const categories = useMemo(
    () => Array.from(new Set(galleryAlbums.map(album => album.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)),
    [galleryAlbums]
  )

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return galleryAlbums
      .filter(album => {
        if (filterCat !== 'all' && album.category !== filterCat) return false
        if (!needle) return true
        return (
          album.title.toLowerCase().includes(needle) ||
          album.slug.toLowerCase().includes(needle) ||
          album.category.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => {
        if (sortKey === 'category') return a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
        if (sortKey === 'photos_desc') return b.images.length - a.images.length || a.title.localeCompare(b.title)
        if (sortKey === 'photos_asc') return a.images.length - b.images.length || a.title.localeCompare(b.title)
        return a.title.localeCompare(b.title)
      })
  }, [filterCat, galleryAlbums, search, sortKey])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const showingStart = filtered.length ? (currentPage - 1) * pageSize + 1 : 0
  const showingEnd = Math.min(currentPage * pageSize, filtered.length)

  useEffect(() => {
    setPage(1)
  }, [filterCat, pageSize, search, sortKey])

  const openNew = () => {
    setSessionOriginals([])
    setOpenId(id => id + 1)
    setEditing({ ...emptyAlbum, images: [] })
    setIsNew(true)
  }

  const openEdit = (album: GalleryAlbum) => {
    // Original ref set = union of cover + images so a legacy
    // independently-set cover is tracked and reconciled correctly.
    const originals = [album.cover, ...album.images].filter(
      (url): url is string => Boolean(url),
    )
    setSessionOriginals(originals)
    setOpenId(id => id + 1)
    setEditing({ ...album, images: [...album.images] })
    setIsNew(false)
  }

  const closeEditor = () => {
    if (!sessionSnapshot.committed && !sessionSnapshot.disposed) {
      void cancel()
    }
    setEditing(null)
    setIsNew(false)
    setActiveImageIndex(null)
    setSessionOriginals([])
  }

  const canSave =
    Boolean(editing?.title.trim()) && !isUploading && !isPersisting && !saving && canCommit

  const save = async () => {
    if (!editing || !canSave) return
    const editingSlug = editing.slug
    const slug = editingSlug || slugify(editing.title)
    const cover = enforceCoverInvariant(editing.images, editing.cover)
    const data: GalleryAlbum = {
      ...editing,
      title: editing.title.trim(),
      slug,
      category: editing.category.trim(),
      cover,
    }
    setSaving(true)
    try {
      const outcome = await runPersistence({
        mutate: async () => {
          if (isNew) await addGalleryAlbum(data)
          else await updateGalleryAlbum(editingSlug || slug, data)
          return data
        },
        // Canonical dedup collapses cover===images[0] into one identity,
        // so a shared URL is never scheduled for deletion while still
        // referenced.
        finalRefs: result =>
          [result.cover, ...result.images].filter(
            (url): url is string => Boolean(url),
          ),
      })
      if (outcome.status === 'success') {
        if (outcome.cleanup.failed.length > 0) {
          console.warn('[Gallery] storage cleanup partial failure', outcome.cleanup.failed)
        }
        closeEditor()
      } else if (!outcome.disposed) {
        dialog.alert({
          title: 'Error',
          message: getErrorMessage(outcome.error, 'Failed to save'),
          variant: 'danger',
        })
      }
    } catch (error: unknown) {
      console.error('[Gallery] runPersistence rejected', error)
      dialog.alert({
        title: 'Error',
        message: getErrorMessage(error, 'Save cannot start right now'),
        variant: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    // Snapshot ALL media refs — cover + every image — before DB
    // delete. Storage cleanup happens ONLY after DB delete succeeds
    // and is deduplicated canonically (so a shared cover/image URL
    // is only removed once).
    const mediaRefs = [deleteTarget.cover, ...deleteTarget.images].filter(
      (url): url is string => Boolean(url),
    )
    setDeleting(true)
    try {
      await deleteGalleryAlbum(deleteTarget.slug)
      if (details?.slug === deleteTarget.slug) setDetails(null)
      setDeleteTarget(null)
      if (mediaRefs.length > 0) {
        const cleanup = await deleteAssetsSafely(mediaRefs)
        if (cleanup.failed.length > 0) {
          console.warn('[Gallery] entity-delete cleanup partial failure', cleanup.failed)
        }
      }
    } catch (error: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(error, 'Failed to delete'), variant: 'danger' })
    } finally {
      setDeleting(false)
    }
  }

  const addImage = (url: string) => {
    setEditing(current => {
      if (!current) return current
      const images = [...current.images, url]
      return { ...current, images, cover: images[0] || '' }
    })
  }

  const addImages = (urls: string[]) => {
    if (!urls.length) return
    setEditing(current => {
      if (!current) return current
      const images = [...current.images, ...urls]
      return { ...current, images, cover: images[0] || '' }
    })
  }

  const removeImage = (index: number) => {
    setEditing(current => {
      if (!current) return current
      const images = current.images.filter((_, imageIndex) => imageIndex !== index)
      return { ...current, images, cover: images[0] || '' }
    })
  }

  const moveImage = (index: number, direction: -1 | 1) => {
    setEditing(current => {
      if (!current) return current
      const images = [...current.images]
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= images.length) return current
      ;[images[index], images[nextIndex]] = [images[nextIndex], images[index]]
      return { ...current, images, cover: images[0] || '' }
    })
  }

  const updateImageFrame = (index: number, media: string) => {
    setEditing(current => {
      if (!current) return current
      const images = current.images.map((image, imageIndex) => (imageIndex === index ? media : image))
      return { ...current, images, cover: images[0] || '' }
    })
  }

  const actionItems = (album: GalleryAlbum): AdminKebabItem[] => [
    { label: 'Delete album', tone: 'danger', onSelect: () => setDeleteTarget(album) },
  ]

  const previewAlbum: GalleryAlbum = editing
    ? {
        ...editing,
        slug: editing.slug || slugify(editing.title || 'album'),
        cover: editing.images[0] || '',
      }
    : emptyAlbum

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Gallery"
        actions={
          <AdminButton size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add Album
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
              placeholder="Search album, slug, category..."
              aria-label="Search gallery albums"
            />
            <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 rounded-full border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-2 py-0.5 text-[10.5px] font-bold tabular-nums text-[var(--admin-text-muted)]">
              {filtered.length}/{galleryAlbums.length}
            </span>
          </div>

          <select className="admin-input" value={sortKey} onChange={event => setSortKey(event.target.value as GallerySort)} aria-label="Sort albums">
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
          <button
            type="button"
            onClick={() => setFilterCat('all')}
            className={cn(
              'inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center rounded-full border px-3.5 text-[12px] font-bold transition',
              filterCat === 'all'
                ? 'border-transparent bg-[var(--admin-accent)] text-white'
                : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
            )}
          >
            All ({galleryAlbums.length})
          </button>
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => setFilterCat(category)}
              className={cn(
                'inline-flex min-h-[44px] shrink-0 snap-start items-center justify-center rounded-full border px-3.5 text-[12px] font-bold transition',
                filterCat === category
                  ? 'border-transparent bg-[var(--admin-accent)] text-white'
                  : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)] hover:text-[var(--admin-accent)]'
              )}
            >
              {category} ({galleryAlbums.filter(album => album.category === category).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-8">
            <AdminEmptyState
              title={galleryAlbums.length ? 'No albums match this view' : 'No gallery albums yet'}
              description={galleryAlbums.length ? 'Try another category, sort, or search.' : 'Create an album and upload the first gallery photos.'}
              action={
                <AdminButton size="sm" onClick={openNew}>
                  <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                  Add Album
                </AdminButton>
              }
            />
          </div>
        ) : (
          <>
            <div className="mt-3 min-h-0 flex-1 overflow-y-auto pe-0.5">
              <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 2xl:grid-cols-5">
                {pageItems.map(album => (
                  <article key={album.slug} className="admin-card min-w-0 overflow-hidden p-2.5">
                    <AlbumThumb album={album} compact />
                    <div className="mt-2.5 min-w-0 space-y-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-start text-[13px] font-black text-[var(--admin-text)]"><BidiText>{album.title}</BidiText></h2>
                        <p className="truncate text-start font-mono text-[10.5px] font-semibold text-[var(--admin-text-muted)]"><BidiText dir="ltr">{album.slug || '-'}</BidiText></p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <AdminBadge tone="accent" className="max-w-full truncate"><BidiText>{album.category || 'Uncategorized'}</BidiText></AdminBadge>
                        <AdminBadge tone={album.images.length > 0 ? 'success' : 'warning'}>{album.images.length}</AdminBadge>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr_auto] gap-1.5">
                        <AdminButton size="sm" variant="outline" onClick={() => setDetails(album)} className="px-2">
                          Details
                        </AdminButton>
                        <AdminButton size="sm" onClick={() => openEdit(album)} className="px-2">
                          Edit
                        </AdminButton>
                        <AdminKebabMenu label={`More actions for ${album.title}`} items={actionItems(album)} />
                      </div>
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
        title={details?.title || 'Album Details'}
        size="2xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          details ? (
            <div className="admin-scope grid grid-cols-[minmax(0,1fr)_auto] gap-2.5 sm:flex sm:flex-row sm:items-center sm:justify-end">
              <AdminButton variant="ghost" onClick={() => setDetails(null)} className="hidden sm:inline-flex sm:min-w-[96px]">Close</AdminButton>
              <AdminButton
                variant="outline"
                onClick={() => {
                  const album = details
                  setDetails(null)
                  openEdit(album)
                }}
                className="w-full sm:w-auto sm:min-w-[120px]"
              >
                Edit Album
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
                  <AlbumThumb album={details} />
                </div>
                <div className="flex min-w-0 flex-col justify-between gap-4 p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone="accent"><BidiText>{details.category || 'Uncategorized'}</BidiText></AdminBadge>
                      <AdminBadge tone={details.images.length > 0 ? 'success' : 'warning'}>{details.images.length} photos</AdminBadge>
                    </div>
                    <h3 className="mt-3 text-start text-[1.2rem] font-black text-[var(--admin-text)]"><BidiText>{details.title}</BidiText></h3>
                    <p className="mt-2 break-all text-start font-mono text-[12px] font-semibold text-[var(--admin-text-muted)]"><BidiText dir="ltr">{details.slug || '-'}</BidiText></p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Fact label="Cover" value={albumCover(details) ? 'Ready' : 'Missing'} />
                    <Fact label="Category" value={<BidiText>{details.category || 'Not set'}</BidiText>} />
                  </div>
                </div>
              </div>
            </section>

            <FieldSection title="Preview Strip">
              {details.images.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
                  {details.images.slice(0, 12).map((image, index) => (
                    <div key={`${image}-${index}`} className="aspect-square overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                      <FramedImage media={image} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-[var(--admin-text-muted)]">No images in this album yet.</p>
              )}
            </FieldSection>
          </div>
        )}
      </Modal>

      <Modal
        open={!!editing}
        onClose={closeEditor}
        title={isNew ? 'Create Album' : 'Edit Album'}
        persistent
        size="3xl"
        bodyClassName="px-3 pb-3 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
        footer={
          <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[11px] leading-5 text-[var(--admin-text-muted)]">
              Cover: <span className="font-bold text-[var(--admin-text)]">{editing?.images[0] || editing?.cover ? 'Ready' : 'Missing'}</span>
              {' | '}Photos: <span className="font-bold text-[var(--admin-text)]">{editing?.images.length ?? 0}</span>
            </div>
            <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <AdminButton variant="ghost" onClick={closeEditor} disabled={saving} className="sm:min-w-[110px]">Cancel</AdminButton>
              <AdminButton onClick={save} loading={saving} disabled={!canSave} className="sm:min-w-[140px]">
                {isNew ? 'Create Album' : 'Save Changes'}
              </AdminButton>
            </div>
          </div>
        }
      >
        {editing && (
          <div className="admin-scope grid min-h-0 gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-w-0 space-y-4">
              <FieldSection title="Album Identity" description="Title, category, and slug stay compact and close to the photo manager.">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="album-title">Album title *</label>
                    <input
                      id="album-title"
                      className={cn('admin-input', !editing.title.trim() && 'admin-input--error')}
                      value={editing.title}
                      onChange={event => setEditing(current => (current ? { ...current, title: event.target.value } : null))}
                      placeholder="Events 2026"
                    />
                    {!editing.title.trim() && <p className="mt-1 text-[11px] font-semibold text-[var(--admin-danger)]">Title is required.</p>}
                  </div>
                  <div>
                    <label className="admin-label mb-1.5" htmlFor="album-category">Category</label>
                    <input
                      id="album-category"
                      className="admin-input"
                      value={editing.category}
                      onChange={event => setEditing(current => (current ? { ...current, category: event.target.value } : null))}
                      placeholder="Events, BTS, Products..."
                      list="gallery-categories"
                    />
                    <datalist id="gallery-categories">
                      {categories.map(category => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  </div>
                  <div className="lg:col-span-2">
                    <label className="admin-label mb-1.5" htmlFor="album-slug">Slug</label>
                    <input
                      id="album-slug"
                      className="admin-input"
                      value={editing.slug}
                      onChange={event => setEditing(current => (current ? { ...current, slug: event.target.value } : null))}
                      placeholder="auto-generated-from-title"
                      disabled={!isNew}
                    />
                  </div>
                </div>
              </FieldSection>

              <FieldSection title="Photos" description="Select up to 100 photos at once. The first photo becomes the cover; use Adjust only when you want to refine a frame.">
                <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
                  {editing.images.map((url, index) => (
                    <PhotoTile
                      key={`${url}-${index}`}
                      url={url}
                      index={index}
                      isCover={index === 0}
                      canMoveUp={index > 0}
                      canMoveDown={index < editing.images.length - 1}
                      onFrame={() => setActiveImageIndex(index)}
                      onMoveUp={() => moveImage(index, -1)}
                      onMoveDown={() => moveImage(index, 1)}
                      onRemove={() => removeImage(index)}
                    />
                  ))}

                  <ImageUploader
                    compact
                    multiple
                    maxFiles={100}
                    adjustAfterUpload={false}
                    onChange={addImage}
                    onChangeMany={addImages}
                    folder="gallery"
                    session={session}
                    frameAspect={1}
                    defaultFit="cover"
                    frameTitle="Adjust Gallery Photo"
                    frameHint="Choose what should stay visible inside the gallery photo frame."
                    previewAspectClass="aspect-square"
                    renderFrameContextPreview={media =>
                      <CompactAlbumPreview album={{ ...previewAlbum, images: media ? [media, ...previewAlbum.images.filter(item => item !== media)] : previewAlbum.images, cover: media || previewAlbum.cover }} />
                    }
                    frameContextTitle="Album Card"
                    frameContextHint="Check the compact album tile while framing."
                  />
                </div>
              </FieldSection>
            </div>

            <aside className="min-w-0 xl:sticky xl:top-0 xl:self-start">
              <FieldSection title="Compact Preview" description="A small admin preview of the gallery tile.">
                <CompactAlbumPreview album={previewAlbum} />
              </FieldSection>
            </aside>
          </div>
        )}
      </Modal>

      <MediaPlacementModal
        open={activeImageIndex !== null}
        media={activeImageIndex !== null ? editing?.images[activeImageIndex] : ''}
        title="Adjust Gallery Photo"
        type="image"
        aspectRatio={1}
        defaultFit="cover"
        hint="Choose what should stay visible inside the gallery photo frame."
        contextPreview={media => (
          <CompactAlbumPreview
            album={{
              ...previewAlbum,
              images:
                activeImageIndex === null
                  ? previewAlbum.images
                  : previewAlbum.images.map((image, index) => (index === activeImageIndex ? media : image)),
              cover: activeImageIndex === 0 ? media : previewAlbum.cover,
            }}
          />
        )}
        contextPreviewTitle="Album Card"
        contextPreviewHint="Refine the gallery photo while checking the compact tile."
        onApply={media => {
          if (activeImageIndex === null) return
          updateImageFrame(activeImageIndex, media)
        }}
        onClose={() => setActiveImageIndex(null)}
      />

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="Delete Album?"
        description={deleteTarget ? `This will permanently remove ${deleteTarget.title} and its gallery photos.` : undefined}
        tone="danger"
        confirmLabel="Delete"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}
