import { useMemo, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { CustomBuild } from '../../data/custom-builds'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import MediaPlacementModal from '../../components/ui/MediaPlacementModal'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminEditorWorkspace, { AdminEditorSection } from '../../components/admin/AdminEditorWorkspace'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
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

function normaliseOrder(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildImages(build: CustomBuild) {
  const seen = new Set<string>()
  return [build.image, ...(build.images || [])].filter(image => {
    if (!image || seen.has(image)) return false
    seen.add(image)
    return true
  })
}

function buildPreview(build: CustomBuild, isDark = false) {
  const images = buildImages(build)
  const cover = images[0] || ''

  return (
    <div className="mx-auto w-full max-w-[360px] overflow-hidden rounded-[8px] border border-violet-200/70 bg-white shadow-[0_20px_44px_-30px_rgba(89,23,196,0.35)]">
      <div className="relative aspect-[16/10] overflow-hidden bg-violet-50">
        {cover ? (
          <FramedImage
            media={cover}
            alt={build.title || 'Custom build'}
            className="h-full w-full"
            fallbackTransform={{ fit: 'cover' }}
          />
        ) : (
          <div className={cn('flex h-full w-full items-center justify-center text-[11px] font-bold uppercase tracking-normal', isDark ? 'text-purple-200/60' : 'text-violet-500')}>
            No image
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full border border-white/40 bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-normal text-[#2e0a72] backdrop-blur">
          {build.category || 'Custom'}
        </span>
        {images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full border border-white/40 bg-white/90 px-2.5 py-1 text-[10px] font-black text-[#2e0a72] backdrop-blur">
            {images.length} photos
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-sans text-[1.1rem] font-extrabold tracking-normal text-[#140832]">
          {build.title || 'Build title'}
        </h3>
        <p className="line-clamp-3 text-[12px] font-semibold leading-5 text-[#4a2c8f]">
          {build.description || 'Short build description appears here.'}
        </p>
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
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<CustomBuild | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [filter, setFilter] = useState('all')
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null)
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('custom-builds')

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

  const sortedBuilds = useMemo(
    () => [...customBuilds].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [customBuilds]
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

  const filteredBuilds = useMemo(() => {
    if (filter === 'active') return sortedBuilds.filter(build => build.active)
    if (filter === 'featured') return sortedBuilds.filter(build => build.featured)
    if (filter !== 'all') return sortedBuilds.filter(build => build.category === filter)
    return sortedBuilds
  }, [filter, sortedBuilds])

  const filterClass = (active: boolean) =>
    cn(
      'inline-flex min-h-[36px] items-center justify-center rounded-xl px-3.5 py-2 text-[11px] font-semibold transition active:translate-y-[1px]',
      active
        ? 'bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200 shadow-[0_10px_24px_-18px_rgba(124,58,237,0.22)]'
        : 'bg-white text-gray-600 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-gray-50'
    )

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
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to create custom build category'), variant: 'danger' })
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

  const close = () => {
    setEditing(null)
    setIsNew(false)
    setActiveImageIndex(null)
    setNewCategoryName('')
  }

  const patchEditing = <K extends keyof CustomBuild>(key: K, value: CustomBuild[K]) => {
    setEditing(current => (current ? { ...current, [key]: value } : null))
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
      close()
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to save custom build'), variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const remove = async (build: CustomBuild) => {
    if (!build.id) return

    const ok = await dialog.confirm({
      title: 'Delete Custom Build?',
      message: `This will remove "${build.title}" from the custom builds page.`,
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await deleteCustomBuild(build.id)
    } catch (err: unknown) {
      dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to delete custom build'), variant: 'danger' })
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

  const previewBuild = editing || emptyBuild
  const previewImages = buildImages(previewBuild)

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Custom Builds"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            <button onClick={openNew} className="btn-admin-create">
              + Add Build
            </button>
          </>
        }
      />

      <div
        className={cn(
          'min-h-0 flex flex-1 flex-col rounded-[22px] p-2.5',
          isDark
            ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(8,11,27,0.98))] ring-1 ring-inset ring-cyan-400/10 shadow-[0_28px_90px_-58px_rgba(7,15,36,0.96)]'
            : 'bg-white ring-1 ring-inset ring-gray-200'
        )}
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button onClick={() => setFilter('all')} className={filterClass(filter === 'all')}>
            All ({customBuilds.length})
          </button>
          <button onClick={() => setFilter('active')} className={filterClass(filter === 'active')}>
            Active ({customBuilds.filter(build => build.active).length})
          </button>
          <button onClick={() => setFilter('featured')} className={filterClass(filter === 'featured')}>
            Featured ({customBuilds.filter(build => build.featured).length})
          </button>
          {categoryNames.map(category => (
            <button key={category} onClick={() => setFilter(category)} className={filterClass(filter === category)}>
              {category} ({customBuilds.filter(build => build.category === category).length})
            </button>
          ))}
        </div>

        {filteredBuilds.length === 0 ? (
          <div className={cn('flex flex-1 items-center justify-center rounded-[18px] border px-5 py-11 text-center text-[13px]', isDark ? 'border-white/10 text-purple-200/70' : 'border-gray-100 text-gray-500')}>
            No custom builds match this filter.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
              <div className={cardsLayoutClass}>
                {filteredBuilds.map(build => (
                  <AdminEntityCard
                    key={build.id || build.title}
                    variant={getAdminEntityVariant(displayCardView)}
                    minHeightClassName={displayCardView === 'grid' ? 'min-h-[284px]' : 'min-h-[104px]'}
                    listMediaWrapClassName="md:self-center"
                    listMediaFrameClassName="!h-[78px] !w-[118px] md:!h-[78px] md:!w-[118px] !rounded-[14px] !bg-transparent !ring-0 !p-0"
                    actionsWrapClassName={displayCardView === 'list' ? 'xl:w-[118px]' : undefined}
                    media={
                      buildImages(build)[0] ? (
                        <div className="aspect-[16/10] h-full w-full overflow-hidden rounded-[12px]">
                          <FramedImage
                            media={buildImages(build)[0]}
                            alt={build.title}
                            className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                            fallbackTransform={{ fit: 'cover' }}
                          />
                        </div>
                      ) : (
                        <div className={cn('flex aspect-[16/10] h-full w-full items-center justify-center rounded-[12px]', isDark ? 'bg-purple-500/10' : 'bg-violet-50')}>
                          <span className={cn('text-[11px] font-mono uppercase tracking-normal', sub)}>No image</span>
                        </div>
                      )
                    }
                    title={build.title}
                    subtitle={build.description || undefined}
                    badges={
                      <>
                        <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', build.active ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700')}>
                          {build.active ? 'Active' : 'Hidden'}
                        </span>
                        {build.featured && (
                          <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold text-violet-700">
                            Featured
                          </span>
                        )}
                        {build.category && (
                          <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600">
                            {build.category}
                          </span>
                        )}
                      </>
                    }
                    facts={[
                      { label: 'Order', value: String(build.sortOrder || 0) },
                      { label: 'Photos', value: String(buildImages(build).length) },
                    ]}
                    actions={
                      <>
                        <AdminActionButton
                          onClick={event => {
                            event.stopPropagation()
                            openEdit(build)
                          }}
                        >
                          Edit
                        </AdminActionButton>
                        <AdminActionButton
                          tone="danger"
                          onClick={event => {
                            event.stopPropagation()
                            void remove(build)
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

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? 'Add Custom Build' : 'Edit Custom Build'}
        persistent
        size="xl"
        bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
      >
        {editing && (
          <AdminEditorWorkspace
            preview={buildPreview(previewBuild, isDark)}
            previewTitle="Public Card Preview"
            previewHint="This is the same image, title, and description that will feed the custom builds page."
            footer={
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className={cn('text-[11px] leading-5', sub)}>
                  Photos: <span className="font-bold text-[#1a0b3d]">{previewImages.length}</span>
                  {' · '}Status: <span className="font-bold text-[#1a0b3d]">{editing.active ? 'Active' : 'Hidden'}</span>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={save}
                    disabled={saving || !editing.title.trim()}
                    className="btn-primary !rounded-xl !px-5 !py-2 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : isNew ? 'Create Build' : 'Save Changes'}
                  </button>
                  <button onClick={close} className="btn-outline !rounded-xl !px-5 !py-2">
                    Cancel
                  </button>
                </div>
              </div>
            }
          >
            <AdminEditorSection title="Build Content" hint="Each item becomes one visual card on the custom builds page and one rotating hero image.">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Title *</label>
                  <input
                    className="form-field"
                    value={editing.title}
                    onChange={event => patchEditing('title', event.target.value)}
                    placeholder="Bike Blender activation"
                  />
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Category</label>
                  <select
                    className="form-field"
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
                  <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                    <input
                      className="form-field !min-h-[42px] !rounded-xl !px-3 !py-2 text-[12.5px]"
                      value={newCategoryName}
                      onChange={event => setNewCategoryName(event.target.value)}
                      onKeyDown={event => {
                        if (event.key !== 'Enter') return
                        event.preventDefault()
                        void createCategory()
                      }}
                      placeholder="New category"
                    />
                    <button
                      type="button"
                      onClick={() => void createCategory()}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 text-[11px] font-bold text-violet-700 transition hover:border-violet-300 hover:bg-violet-100 disabled:opacity-50"
                    >
                      {creatingCategory ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Sort Order</label>
                  <input
                    className="form-field"
                    type="number"
                    value={editing.sortOrder}
                    onChange={event => patchEditing('sortOrder', normaliseOrder(event.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Description</label>
                <textarea
                  className="form-field min-h-[112px] resize-none"
                  value={editing.description}
                  onChange={event => patchEditing('description', event.target.value)}
                  placeholder="A short visual description. Keep it tight."
                />
              </div>
            </AdminEditorSection>

            <AdminEditorSection title="Build Photos" hint="Upload multiple related photos for the same card. The first photo is the cover used in listings and the hero.">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                {previewImages.map((url, index) => (
                  <div key={`${url}-${index}`} className="group relative">
                    <div className="aspect-[16/10] overflow-hidden rounded-xl bg-violet-50">
                      <FramedImage
                        media={url}
                        alt=""
                        className="h-full w-full"
                        fallbackTransform={{ fit: 'cover' }}
                      />
                    </div>

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-white/90 px-1.5 py-0.5 text-[8px] font-black uppercase text-violet-700">
                        Cover
                      </span>
                    )}

                    <div className="absolute inset-0 flex flex-wrap content-start items-start gap-1.5 rounded-xl bg-white/75 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setActiveImageIndex(index)}
                        className="rounded-lg bg-violet-100 px-2.5 py-1 text-[10px] font-semibold text-violet-700"
                      >
                        Frame
                      </button>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-700"
                        >
                          {'<'}
                        </button>
                      )}
                      {index < previewImages.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-[11px] font-bold text-violet-700"
                        >
                          {'>'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/80 text-[11px] font-bold text-white"
                      >
                        x
                      </button>
                    </div>
                  </div>
                ))}

                <ImageUploader
                  compact
                  onChange={addImage}
                  folder="custom-builds"
                  frameAspect={16 / 10}
                  defaultFit="cover"
                  frameTitle="Adjust Custom Build Photo"
                  frameHint="Choose the crop used inside this custom build card."
                  previewAspectClass="aspect-[16/10]"
                  renderFrameContextPreview={media =>
                    buildPreview(
                      {
                        ...previewBuild,
                        image: previewImages[0] || media,
                        images: media ? [...previewImages, media] : previewImages,
                      },
                      isDark
                    )
                  }
                  frameContextTitle="Custom Build Card"
                  frameContextHint="Inspect the card while you refine this photo."
                />
              </div>
            </AdminEditorSection>

            <AdminEditorSection title="Visibility" hint="Hide drafts from the public page, or feature a build in the hero/stat treatment.">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[12px] border border-violet-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={editing.active}
                    onChange={event => patchEditing('active', event.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span className="text-[12.5px] font-bold text-[#1a0b3d]">Show on public page</span>
                </label>
                <label className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[12px] border border-violet-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={editing.featured}
                    onChange={event => patchEditing('featured', event.target.checked)}
                    className="h-4 w-4 accent-violet-600"
                  />
                  <span className="text-[12.5px] font-bold text-[#1a0b3d]">Feature this build</span>
                </label>
              </div>
            </AdminEditorSection>
          </AdminEditorWorkspace>
        )}
      </Modal>

      <MediaPlacementModal
        open={activeImageIndex !== null}
        media={activeImageIndex !== null ? previewImages[activeImageIndex] : ''}
        title="Adjust Custom Build Photo"
        type="image"
        aspectRatio={16 / 10}
        defaultFit="cover"
        hint="Choose what should stay visible inside this custom build card frame."
        contextPreview={media => {
          const nextImages =
            activeImageIndex === null
              ? previewImages
              : previewImages.map((image, index) => (index === activeImageIndex ? media : image))

          return buildPreview(
            {
              ...previewBuild,
              image: nextImages[0] || '',
              images: nextImages,
            },
            isDark
          )
        }}
        contextPreviewTitle="Custom Build Card"
        contextPreviewHint="Refine this related photo while seeing the same card context."
        onApply={media => {
          if (activeImageIndex === null) return
          updateImageFrame(activeImageIndex, media)
        }}
        onClose={() => setActiveImageIndex(null)}
      />
    </div>
  )
}
