import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { Category } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'
import FramedImage from '../../components/ui/FramedImage'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminDetailModal from '../../components/admin/AdminDetailModal'
import AdminEntityCard from '../../components/admin/AdminEntityCard'
import AdminEditorWorkspace, { AdminEditorSection } from '../../components/admin/AdminEditorWorkspace'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminViewToggle from '../../components/admin/AdminViewToggle'
import useAdminCardView from '../../components/admin/useAdminCardView'
import { getAdminCardsLayoutClass, getAdminEntityVariant } from '../../components/admin/useAdminCardView'
import { cn } from '../../utils/cn'

const empty: Category = { id: '', name: '', slug: '', icon: '', description: '', image: '' }


function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const EMOJI_ICONS = [
  '🚲',
  '🎮',
  '🕶️',
  '🛠️',
  '🧠',
  '🎯',
  '⚡',
  '🏁',
  '🔊',
  '🎥',
  '🖥️',
  '🎉',
  '💡',
  '🚀',
  '🎨',
  '🧩',
  '🛍️',
  '🌟',
  '🏆',
  '📸',
  '🤖',
  '🔧',
  '🎪',
  '🧃',
]

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<Category | null>(null)
  const [details, setDetails] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [emojiQuery, setEmojiQuery] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const { cardView, displayCardView, viewTransitionClassName, setCardView } = useAdminCardView('categories')

  const iconWrapRef = useRef<HTMLDivElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const cardsLayoutClass = getAdminCardsLayoutClass(displayCardView)

  const openNew = () => {
    setEditing({ ...empty, id: `cat-${Date.now()}` })
    setIsNew(true)
    setEmojiQuery('')
    setShowEmoji(false)
  }

  const openEdit = (category: Category) => {
    setEditing({ ...category })
    setIsNew(false)
    setEmojiQuery('')
    setShowEmoji(false)
  }

  const close = () => {
    setEditing(null)
    setIsNew(false)
    setEmojiQuery('')
    setShowEmoji(false)
  }

  const up = (f: keyof Category, v: string) => setEditing(e => (e ? { ...e, [f]: v } : null))
  const canSave = !!editing?.name?.trim()

  const save = async () => {
    if (!editing || !editing.name?.trim()) return
    const slug = (editing.slug || makeSlug(editing.name)).trim()
    const data = { ...editing, slug }

    setSaving(true)
    try {
      if (isNew) await addCategory(data)
      else await updateCategory(data.id, data)
      close()
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to save', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const catCards = useMemo(() => {
    return categories.map(c => {
      const count = products.filter(p => p.categoryId === c.id).length
      return { c, count }
    })
  }, [categories, products])

  const countForCategory = (id: string) => products.filter(p => p.categoryId === id).length

  const handleDeleteCategory = async (category: Category) => {
    const count = countForCategory(category.id)
    if (count > 0) {
      dialog.alert({
        title: 'Cannot Delete',
        message: 'Remove products from this category first.',
        variant: 'warning',
      })
      return
    }

    const ok = await dialog.confirm({
      title: 'Delete Category?',
      message: 'This will permanently remove this category.',
      confirmLabel: 'Delete',
      variant: 'danger',
    })
    if (!ok) return

    try {
      await deleteCategory(category.id)
      if (details?.id === category.id) setDetails(null)
    } catch (e: any) {
      dialog.alert({ title: 'Error', message: e.message || 'Failed to delete', variant: 'danger' })
    }
  }

  const filteredEmojis = useMemo(() => {
    const q = emojiQuery.trim()
    if (!q) return EMOJI_ICONS
    return EMOJI_ICONS.filter(icon => icon.includes(q))
  }, [emojiQuery])

  useEffect(() => {
    if (!showEmoji) return

    const onPointerDown = (ev: PointerEvent) => {
      const t = ev.target as Node
      const wrap = iconWrapRef.current
      const pop = popoverRef.current
      if (wrap?.contains(t) || pop?.contains(t)) return
      setShowEmoji(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [showEmoji])

  const previewCategory: Category = editing
    ? {
        ...editing,
        slug: editing.slug?.trim() || makeSlug(editing.name || 'category'),
      }
    : empty

  const renderCategoryPreview = (overrides?: Partial<Category>) => {
    const preview = { ...previewCategory, ...overrides }
    const linkedCount = preview.id ? countForCategory(preview.id) : 0

    return (
      <div aria-hidden="true" className="mx-auto max-w-[320px] select-none">
        <AdminEntityCard
          variant="grid"
          minHeightClassName="min-h-[216px]"
          bodyClassName="gap-2 p-3"
          media={
            preview.image ? (
              <div className={cn('aspect-[16/10] h-full w-full overflow-hidden rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <FramedImage media={preview.image} alt={preview.name} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
              </div>
            ) : (
              <div className={cn('flex h-full w-full items-center justify-center rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <div className={cn('text-[11px] font-mono uppercase tracking-[0.24em]', sub)}>No image</div>
              </div>
            )
          }
          title={preview.name || 'Category Name'}
          subtitle={preview.description || undefined}
          badges={
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', linkedCount > 0 ? (isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700') : (isDark ? 'border-amber-400/15 bg-amber-400/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-700'))}>
                {linkedCount > 0 ? 'In use' : 'Unused'}
              </span>
            </>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Categories / Brands"
        actions={
          <>
            <AdminViewToggle value={cardView} onChange={setCardView} />
            <button onClick={openNew} className="btn-admin-create">
              + Add Category
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
        {catCards.length === 0 ? (
          <div className={cn('flex flex-1 items-center justify-center rounded-[18px] border px-5 py-11 text-center text-[13px]', isDark ? 'border-white/10 text-purple-200/70' : 'border-gray-100 text-gray-500')}>
            No categories yet.
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            <div className={cn('origin-top transition-[opacity,transform,filter] duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform,filter]', viewTransitionClassName)}>
            <div className={cardsLayoutClass}>
              {catCards.map(({ c, count }) => (
                <AdminEntityCard
                key={c.id}
                variant={getAdminEntityVariant(displayCardView)}
                minHeightClassName={displayCardView === 'grid' ? 'min-h-[226px]' : 'min-h-[96px]'}
                bodyClassName={displayCardView === 'grid' ? 'gap-2 p-3' : 'gap-1.5 p-2.5'}
                  listMediaWrapClassName="md:self-center"
                listMediaFrameClassName="!h-[76px] !w-[112px] md:!h-[76px] md:!w-[112px] !rounded-[18px] !bg-transparent !ring-0 !p-0"
                factsWrapClassName={displayCardView === 'list' ? 'xl:w-[156px]' : undefined}
                actionsWrapClassName={displayCardView === 'list' ? 'xl:w-[118px]' : undefined}
                media={
                  c.image ? (
                    <div className={cn('aspect-[16/10] h-full w-full overflow-hidden rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                      <FramedImage
                        media={c.image}
                        alt={c.name}
                        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
                        fallbackTransform={{ fit: 'cover' }}
                        onError={e => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    </div>
                  ) : (
                    <div className={cn('flex h-full w-full items-center justify-center rounded-[20px]', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                      <div className={cn('text-[11px] font-mono uppercase tracking-[0.24em]', sub)}>No image</div>
                    </div>
                  )
                }
                title={c.name}
                  subtitle={c.description || undefined}
                badges={
                  <>
                    <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', count > 0 ? (isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700') : (isDark ? 'border-amber-400/15 bg-amber-400/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-700'))}>
                      {count > 0 ? 'In use' : 'Unused'}
                    </span>
                  </>
                }
                facts={[
                  { label: 'Slug', value: <span className="block truncate text-xs font-mono">{c.slug}</span> },
                  { label: 'Products', value: String(count) },
                ]}
                actions={
                  <>
                    <AdminActionButton
                      tone="primary"
                      onClick={event => {
                        event.stopPropagation()
                        setDetails(c)
                      }}
                    >
                      Details
                    </AdminActionButton>
                    <AdminActionButton
                      onClick={event => {
                        event.stopPropagation()
                        openEdit(c)
                      }}
                    >
                      Edit
                    </AdminActionButton>
                    <AdminActionButton
                      tone="danger"
                      onClick={event => {
                        event.stopPropagation()
                        void handleDeleteCategory(c)
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
        title={details?.name || 'Category Details'}
        subtitle={details ? 'This panel keeps the listing tidy while giving the category enough room for identity and usage context.' : undefined}
        media={
          details ? (
            details.image ? (
              <div className={cn('aspect-[16/9] overflow-hidden', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <FramedImage media={details.image} alt={details.name} className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
              </div>
            ) : (
              <div className={cn('flex aspect-[16/9] items-center justify-center', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <div className={cn('text-sm', sub)}>No category image uploaded yet.</div>
              </div>
            )
          ) : null
        }
        badges={
          details ? (
            <>
              <span className={cn('rounded-full border px-3 py-1 text-[11px] font-semibold', countForCategory(details.id) > 0 ? (isDark ? 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200' : 'border-violet-200 bg-violet-50 text-violet-700') : (isDark ? 'border-amber-400/15 bg-amber-400/10 text-amber-200' : 'border-amber-200 bg-amber-50 text-amber-700'))}>
                {countForCategory(details.id)} linked products
              </span>
            </>
          ) : null
        }
        summaryFacts={
          details
            ? [
                { label: 'Name', value: details.name },
                { label: 'Slug', value: <span className="font-mono text-xs">{details.slug}</span> },
                { label: 'Products', value: String(countForCategory(details.id)) },
                { label: 'Media', value: details.image ? 'Banner uploaded' : 'No banner yet' },
              ]
            : []
        }
        sections={
          details
            ? [
                {
                  title: 'Identity',
                  facts: [
                    { label: 'Display name', value: details.name },
                    { label: 'Public slug', value: <span className="font-mono text-xs">{details.slug}</span> },
                    { label: 'Products', value: String(countForCategory(details.id)) },
                  ],
                },
                {
                  title: 'Description',
                  content: (
                    <p className={cn('text-sm leading-6', isDark ? 'text-purple-100/80' : 'text-gray-700')}>
                      {details.description || 'No description has been added to this category yet.'}
                    </p>
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
                Edit Category
              </AdminActionButton>
              <AdminActionButton tone="danger" onClick={() => void handleDeleteCategory(details)}>
                Delete Category
              </AdminActionButton>
            </>
          )
        }
      />

      <Modal
        open={!!editing}
        onClose={close}
        title={isNew ? 'Add Category / Brand' : 'Edit Category'}
        persistent
        size="xl"
        bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
      >
        {editing && (
          <AdminEditorWorkspace
            preview={renderCategoryPreview()}
            previewTitle="Live Category Card"
            previewHint="See the actual category card outcome while you tune the name, icon, description, and banner image."
            footer={
              <div className="flex flex-wrap justify-end gap-2.5">
                <button onClick={close} className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
                  Cancel
                </button>
                <button
                  onClick={save}
                  disabled={saving || !canSave}
                  className="btn-primary !rounded-xl !px-5 !py-2 !text-xs disabled:opacity-50"
                >
                  {saving ? 'Saving...' : isNew ? 'Add' : 'Save'}
                </button>
              </div>
            }
          >
            <AdminEditorSection
              title="Identity"
              hint="Name, slug, and icon stay together here so the live category card preview remains trustworthy while you edit."
            >
              <div className="relative z-[1] grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>
                    Name * (e.g. "The Terminal VR", "Eventies")
                  </label>
                  <input
                    className="form-field"
                    value={editing.name}
                    onChange={e => up('name', e.target.value)}
                    placeholder="Brand or category name"
                  />
                  {!editing.name.trim() && <div className="mt-1 text-[11px] text-red-400">Name is required.</div>}
                </div>

                <div>
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Slug</label>
                  <input
                    className="form-field"
                    value={editing.slug}
                    onChange={e => up('slug', e.target.value)}
                    placeholder={editing.name ? makeSlug(editing.name) : 'auto-generated-from-name'}
                  />
                </div>

                <div ref={iconWrapRef} className="relative">
                  <label className={cn('mb-1.5 block text-[12px] font-medium', sub)}>Icon</label>

                  <button
                    type="button"
                    onClick={() => setShowEmoji(v => !v)}
                    className={cn(
                      'relative z-[20] flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl px-4 py-3 transition active:translate-y-[1px]',
                      isDark
                        ? 'bg-[linear-gradient(180deg,rgba(20,29,56,0.98),rgba(13,20,42,0.98))] ring-1 ring-inset ring-cyan-400/14 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)] hover:bg-[#152347]'
                        : 'bg-white ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)] hover:bg-gray-50'
                    )}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="text-xl">{editing.icon || '??'}</span>
                      <span className={cn('truncate text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>
                        {editing.icon ? 'Selected icon' : 'Choose an icon'}
                      </span>
                    </div>
                    <span className={cn('text-xs font-mono', sub)}>{showEmoji ? 'Close' : 'Pick'}</span>
                  </button>

                  {showEmoji && (
                    <div
                      ref={popoverRef}
                      className={cn(
                        'absolute right-0 z-[1000] mt-2 w-[340px] rounded-2xl border p-3 shadow-2xl',
                        isDark ? 'border-purple-500/20 bg-[#0b0b1a]' : 'border-gray-200 bg-white'
                      )}
                      onWheelCapture={event => event.stopPropagation()}
                      onTouchMove={event => event.stopPropagation()}
                    >
                      <div className="mb-3 flex items-center gap-2">
                        <span className={cn('text-[11px] font-mono', sub)}>Filter</span>
                        <input
                          className={cn(
                            'flex-1 rounded-xl border px-3 py-2 text-sm outline-none',
                            isDark
                              ? 'border-purple-500/25 bg-transparent text-purple-50 placeholder:text-purple-200/60'
                              : 'border-gray-200 bg-transparent text-gray-800 placeholder:text-gray-500'
                          )}
                          placeholder="Type or paste emoji to filter..."
                          value={emojiQuery}
                          onChange={e => setEmojiQuery(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setEmojiQuery('')}
                          className={cn(
                            'rounded-xl px-3 py-2 text-[11px] font-semibold active:translate-y-[1px]',
                            isDark
                              ? 'bg-[linear-gradient(180deg,rgba(20,29,56,0.98),rgba(13,20,42,0.98))] text-purple-100 ring-1 ring-inset ring-cyan-400/14 shadow-[0_10px_24px_-18px_rgba(4,8,20,0.8)]'
                              : 'bg-white text-gray-700 ring-1 ring-inset ring-gray-200 shadow-[0_10px_24px_-18px_rgba(15,23,42,0.14)]'
                          )}
                        >
                          Clear
                        </button>
                      </div>

                      <div className="grid max-h-56 grid-cols-6 gap-2 overflow-y-auto overscroll-contain pr-1">
                        {filteredEmojis.map(icon => {
                          const active = editing.icon === icon
                          return (
                            <button
                              key={icon}
                              type="button"
                              onClick={() => {
                                setEditing(x => (x ? { ...x, icon } : x))
                                setShowEmoji(false)
                              }}
                              className={cn(
                                'flex h-11 items-center justify-center rounded-xl border text-xl transition',
                                active
                                  ? isDark
                                    ? 'border-cyan-400/40 bg-cyan-400/15'
                                    : 'border-violet-300 bg-violet-50'
                                  : isDark
                                    ? 'border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15'
                                    : 'border-gray-200 bg-white hover:bg-gray-50'
                              )}
                            >
                              {icon}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </AdminEditorSection>

            <AdminEditorSection
              title="Description"
              hint="Keep the category description compact and clear so the preview card still feels balanced."
            >
              <textarea
                className="form-field resize-none"
                rows={4}
                value={editing.description || ''}
                onChange={e => up('description', e.target.value)}
                placeholder="Brief description of this brand/category..."
              />
            </AdminEditorSection>

            <AdminEditorSection
              title="Category Banner"
              hint="Adjust the banner image while seeing the actual category card result side by side."
            >
              <ImageUploader
                label="Category / Brand Image"
                value={editing.image}
                onChange={url => setEditing(e => (e ? { ...e, image: url } : null))}
                removable
                onRemove={() => setEditing(e => (e ? { ...e, image: '' } : null))}
                folder="categories"
                frameAspect={3}
                defaultFit="cover"
                frameTitle="Adjust Category Image"
                frameHint="Position the image inside the wide category banner frame."
                previewAspectClass="aspect-[3/1]"
                renderFrameContextPreview={media => renderCategoryPreview({ image: media })}
                frameContextTitle="Category Card Result"
                frameContextHint="Inspect the actual category card result while you refine the banner framing."
              />
            </AdminEditorSection>
          </AdminEditorWorkspace>
        )}
      </Modal>
    </div>
  )
}


