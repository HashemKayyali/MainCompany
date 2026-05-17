import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { GalleryAlbum } from '../../data/gallery'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
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
import AlbumCard from '../../components/gallery/AlbumCard'
import { cn } from '../../utils/cn'
import { getErrorMessage } from '../../lib/errors'

const emptyAlbum: GalleryAlbum = { slug: '', title: '', cover: '', images: [], category: '' }


export default function AdminGalleryPage() {
  const { galleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<GalleryAlbum | null>(null)
  const [details, setDetails] = useState<GalleryAlbum | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('All')
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('gallery')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

  const cats = ['All', ...Array.from(new Set(galleryAlbums.map(a => a.category).filter(Boolean)))]
  const filtered = filterCat === 'All' ? galleryAlbums : galleryAlbums.filter(a => a.category === filterCat)
  const openNew = () => {
    setEditing({ ...emptyAlbum, images: [] })
    setIsNew(true)
  }

  const openEdit = (album: GalleryAlbum) => {
    setEditing({ ...album, images: [...album.images] })
    setIsNew(false)
  }

  const close = () => {
    setEditing(null)
    setIsNew(false)
    setActiveImageIndex(null)
  }

  const save = async () => {
    if (!editing || !editing.title) return
    const slug =
      editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const data: GalleryAlbum = {
      ...editing,
      slug,
      cover: editing.images?.[0] || editing.cover || '',
    }
    setSaving(true)
    try {
      if (isNew) await addGalleryAlbum(data)
      else await updateGalleryAlbum(editing.slug || slug, data)
      close()
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to save'), variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const del = async (slug: string) => {
    try {
      await deleteGalleryAlbum(slug)
      if (details?.slug === slug) setDetails(null)
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to delete'), variant: 'danger' })
    }
    setConfirm(null)
  }

  const addImage = (url: string) => {
    setEditing(e => (e ? { ...e, images: [...e.images, url] } : null))
  }

  const removeImage = (idx: number) => {
    setEditing(e => (e ? { ...e, images: e.images.filter((_, i) => i !== idx) } : null))
  }

  const moveImage = (idx: number, dir: -1 | 1) => {
    setEditing(e => {
      if (!e) return null
      const imgs = [...e.images]
      const newIdx = idx + dir
      if (newIdx < 0 || newIdx >= imgs.length) return e
      ;[imgs[idx], imgs[newIdx]] = [imgs[newIdx], imgs[idx]]
      return { ...e, images: imgs }
    })
  }

  const updateImageFrame = (idx: number, media: string) => {
    setEditing(e => {
      if (!e) return null
      const images = e.images.map((img, i) => (i === idx ? media : img))
      return { ...e, images, cover: images[0] || e.cover || '' }
    })
  }

  const filterChip = (active: boolean) =>
    active
      ? isDark
        ? 'bg-[linear-gradient(180deg,rgba(24,56,78,0.96),rgba(14,36,54,0.98))] text-cyan-100 ring-1 ring-inset ring-cyan-300/24 shadow-[0_12px_28px_-18px_rgba(34,211,238,0.3)]'
        : 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.22)]'
      : isDark
        ? 'bg-[#0f1630]/96 text-purple-100/78 ring-1 ring-inset ring-cyan-400/10 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)] hover:bg-[#111a39]'
        : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-gray-50'

  const previewAlbum: GalleryAlbum = editing
    ? {
        ...editing,
        slug:
          editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        cover: editing.images[0] || editing.cover || '',
      }
    : emptyAlbum

  const renderAlbumPreview = (overrides?: Partial<GalleryAlbum>) => {
    const merged = { ...previewAlbum, ...overrides }
    const preview = { ...merged, cover: merged.images[0] || merged.cover || '' }

    return (
      <div aria-hidden="true" className="mx-auto max-w-[340px] select-none [&_button]:pointer-events-none">
        <AlbumCard album={preview} onClick={() => {}} />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Gallery"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            <button onClick={openNew} className="btn-admin-create">
              + Add Album
            </button>
          </>
        }
      />

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[22px] p-2.5',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/12 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {cats.map(category => (
            <button
              key={category}
              onClick={() => setFilterCat(category)}
              className={cn('inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-[11px] font-semibold transition active:translate-y-[1px]', filterChip(filterCat === category))}
            >
              {category} ({category === 'All' ? galleryAlbums.length : galleryAlbums.filter(a => a.category === category).length})
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className={cn('flex flex-1 items-center justify-center rounded-[18px] border px-5 py-11 text-center text-[13px]', isDark ? 'border-white/10 text-purple-200/70' : 'border-gray-100 text-gray-500')}>
            No albums match this filter.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
            <div className={cardsLayoutClass}>
              {filtered.map(album => (
                <AdminEntityCard
                key={album.slug}
                  variant={getAdminEntityVariant(displayCardView)}
                minHeightClassName={displayCardView === 'grid' ? 'min-h-[226px]' : 'min-h-[96px]'}
                bodyClassName={displayCardView === 'grid' ? 'gap-2 p-3' : 'gap-1.5 p-2.5'}
                  listMediaWrapClassName="md:self-center"
                listMediaFrameClassName="!h-[76px] !w-[112px] md:!h-[76px] md:!w-[112px] !rounded-[18px] !bg-transparent !ring-0 !p-0"
                factsWrapClassName={displayCardView === 'list' ? 'xl:w-[156px]' : undefined}
                actionsWrapClassName={displayCardView === 'list' ? 'xl:w-[118px]' : undefined}
                media={
                  album.cover || album.images[0] ? (
                    <div className="aspect-[16/10] h-full w-full overflow-hidden rounded-[20px]">
                      <FramedImage
                        media={album.cover || album.images[0]}
                        alt={album.title}
                        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                        fallbackTransform={{ fit: 'cover' }}
                        onError={e => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className={cn('flex h-full w-full items-center justify-center rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                      <span className={cn('text-[11px] font-mono uppercase tracking-[0.24em]', sub)}>No cover</span>
                    </div>
                  )
                }
                mediaOverlayRight={
                  <span className={cn('rounded-full border px-3 py-1 text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'border-cyan-400/20 bg-cyan-400/12 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                    {album.images.length} photos
                  </span>
                }
                title={album.title}
                  subtitle={
                    album.images.length > 0
                      ? `${album.images.length} ${album.images.length === 1 ? 'image' : 'images'}${album.category ? ` in ${album.category}` : ''}.`
                      : album.category
                        ? `Album in ${album.category}.`
                        : undefined
                  }
                badges={
                  <>
                    <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                      {album.category || 'Uncategorized'}
                    </span>
                    <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', album.images.length > 0 ? (isDark ? 'border-white/10 bg-white/[0.04] text-purple-100/80' : 'border-gray-200 bg-gray-50 text-gray-600') : (isDark ? 'border-amber-400/15 bg-amber-400/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-700'))}>
                      {album.images.length > 0 ? 'Cover ready' : 'Needs photos'}
                    </span>
                  </>
                }
                facts={[
                  { label: 'Slug', value: <span className="block truncate text-xs font-mono">{album.slug}</span> },
                  { label: 'Images', value: String(album.images.length) },
                ]}
                actions={
                  <>
                    <AdminActionButton
                      tone="primary"
                      onClick={event => {
                        event.stopPropagation()
                        setDetails(album)
                      }}
                    >
                      Details
                    </AdminActionButton>
                    <AdminActionButton
                      onClick={event => {
                        event.stopPropagation()
                        openEdit(album)
                      }}
                    >
                      Edit
                    </AdminActionButton>
                    <AdminActionButton
                      tone="danger"
                      onClick={event => {
                        event.stopPropagation()
                        setConfirm(album.slug)
                      }}
                    >
                      Delete
                    </AdminActionButton>
                  </>
                }
                />
              ))}
            </div>
            </div>
          </div>
        )}
      </div>

      <AdminDetailModal
        open={!!details}
        onClose={() => setDetails(null)}
        title={details?.title || 'Album Details'}
        subtitle={details ? 'This panel lets the album card stay compact while still exposing category, slug, cover state, and image previews.' : undefined}
        media={
          details ? (
            details.cover || details.images[0] ? (
              <div className="aspect-[16/9] overflow-hidden">
                <FramedImage media={details.cover || details.images[0]} alt={details.title} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
              </div>
            ) : (
              <div className={cn('flex aspect-[16/9] items-center justify-center', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <div className={cn('text-sm', sub)}>No images uploaded yet.</div>
              </div>
            )
          ) : null
        }
        badges={
          details ? (
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700')}>
                {details.category || 'Uncategorized'}
              </span>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', isDark ? 'border-white/10 bg-white/[0.04] text-purple-100/80' : 'border-gray-200 bg-white text-gray-700')}>
                {details.images.length} images
              </span>
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Slug', value: <span className="font-mono text-xs">{details.slug}</span> },
                { label: 'Category', value: details.category || 'Not set' },
                { label: 'Cover', value: details.cover || details.images[0] ? 'Ready' : 'Missing' },
                { label: 'Image count', value: String(details.images.length) },
              ]
            : []
        }
        sections={
          details
            ? [
                {
                  title: 'Album Identity',
                  facts: [
                    { label: 'Title', value: details.title },
                    { label: 'Public slug', value: <span className="font-mono text-xs">{details.slug}</span> },
                    { label: 'Category', value: details.category || 'Not categorized' },
                  ],
                },
                {
                  title: 'Preview Strip',
                  content: details.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {details.images.slice(0, 6).map((image, index) => (
                        <div key={`${image}-${index}`} className={cn('overflow-hidden rounded-2xl border', isDark ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50')}>
                          <div className="aspect-square overflow-hidden">
                            <FramedImage media={image} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={cn('text-sm', sub)}>No images in this album yet.</p>
                  ),
                },
              ]
            : []
        }
        actions={
          details && (
            <>
              <AdminActionButton
                onClick={() => {
                  setDetails(null)
                  openEdit(details)
                }}
              >
                Edit Album
              </AdminActionButton>
              <AdminActionButton tone="danger" onClick={() => setConfirm(details.slug)}>
                Delete Album
              </AdminActionButton>
            </>
          )
        }
      />

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? 'Create Album' : `Edit: ${editing?.title}`}
        persistent
        size="2xl"
        bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
      >
        {editing && (
          <AdminEditorWorkspace
            preview={renderAlbumPreview()}
            previewTitle="Live Album Card"
            previewHint="The preview uses the real album card, so cover ordering and gallery framing stay trustworthy while you edit."
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className={cn('text-[11px] leading-5', sub)}>
                  Cover: <span className={txt}>{editing.images[0] || editing.cover ? 'Ready' : 'Missing'}</span>
                  {' ? '}Photos: <span className={txt}>{editing.images.length}</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={save}
                    disabled={saving || !editing.title}
                    className="btn-primary !rounded-xl !px-5 !py-2 disabled:opacity-50"
                  >
                    <span>{saving ? 'Saving...' : isNew ? 'Create Album' : 'Save Changes'}</span>
                  </button>
                  <button onClick={close} className="btn-outline !rounded-xl !px-5 !py-2">Cancel</button>
                </div>
              </div>
            }
          >
            <AdminEditorSection
              title="Album Identity"
              hint="Keep the title, category, and slug close together while the real album card preview remains visible on the side."
            >
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div>
                  <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Album Title *</label>
                  <input
                    className="form-field"
                    value={editing.title}
                    onChange={e => setEditing(prev => (prev ? { ...prev, title: e.target.value } : null))}
                    placeholder="Events 2025"
                  />
                </div>
                <div>
                  <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Category</label>
                  <input
                    className="form-field"
                    value={editing.category}
                    onChange={e => setEditing(prev => (prev ? { ...prev, category: e.target.value } : null))}
                    placeholder="Events, BTS, Products..."
                    list="gallery-cats"
                  />
                  <datalist id="gallery-cats">
                    {Array.from(new Set(galleryAlbums.map(a => a.category).filter(Boolean))).map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>

              <div>
                <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Slug (URL)</label>
                <input
                  className="form-field"
                  value={editing.slug}
                  onChange={e => setEditing(prev => (prev ? { ...prev, slug: e.target.value } : null))}
                  placeholder="auto-generated-from-title"
                  disabled={!isNew}
                />
              </div>
            </AdminEditorSection>

            <AdminEditorSection
              title="Photos"
              hint="The first photo becomes the cover automatically. Frame and reorder images here while watching the real album card update live."
            >
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {editing.images.map((url, idx) => (
                  <div key={idx} className="group relative">
                    <div className="aspect-square overflow-hidden rounded-xl">
                      <FramedImage media={url} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>

                    {idx === 0 && (
                      <span className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${isDark ? 'bg-cyan-400/20 text-cyan-300' : 'bg-violet-100 text-violet-700'}`}>
                        COVER
                      </span>
                    )}

                    <div className={`absolute inset-0 flex flex-wrap content-start items-start gap-1.5 rounded-xl p-2 opacity-0 transition-opacity group-hover:opacity-100 ${isDark ? 'bg-black/65' : 'bg-white/75'}`}>
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'}`}
                      >
                        Frame
                      </button>
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, -1)}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}
                        >
                          {'<'}
                        </button>
                      )}
                      {idx < editing.images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(idx, 1)}
                          className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}
                        >
                          {'>'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/75 text-[11px] font-bold text-white"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}

                <ImageUploader
                  compact
                  onChange={addImage}
                  folder="gallery"
                  frameAspect={1}
                  defaultFit="cover"
                  frameTitle="Adjust Gallery Photo"
                  frameHint="Choose what should stay visible inside the gallery photo frame."
                  previewAspectClass="aspect-square"
                  renderFrameContextPreview={media =>
                    renderAlbumPreview({
                      images: media ? [media, ...(previewAlbum.images || []).filter(item => item !== media)] : previewAlbum.images,
                      cover: media || previewAlbum.cover,
                    })
                  }
                  frameContextTitle="Album Card Result"
                  frameContextHint="Inspect the real album card result while you refine the gallery cover framing."
                />
              </div>
            </AdminEditorSection>
          </AdminEditorWorkspace>
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
        contextPreview={media =>
          renderAlbumPreview({
            images:
              activeImageIndex === null
                ? previewAlbum.images
                : previewAlbum.images.map((image, index) => (index === activeImageIndex ? media : image)),
            cover: activeImageIndex === 0 ? media : previewAlbum.cover,
          })
        }
        contextPreviewTitle="Album Card Result"
        contextPreviewHint="Refine the gallery photo while seeing the real album card result on the right."
        onApply={media => {
          if (activeImageIndex === null) return
          updateImageFrame(activeImageIndex, media)
        }}
        onClose={() => setActiveImageIndex(null)}
      />

      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Album?">
        <p className={`mb-5 text-sm ${sub}`}>This will permanently remove the album and all its photos from the gallery.</p>
        <div className="flex gap-3">
          <button onClick={() => del(confirm!)} className="btn-danger !px-5 !py-2.5">Delete</button>
          <button onClick={() => setConfirm(null)} className="btn-outline !rounded-xl !px-5 !py-2.5">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
