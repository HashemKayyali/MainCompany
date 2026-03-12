import { useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import type { GalleryAlbum } from '../../data/gallery'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

const emptyAlbum: GalleryAlbum = { slug: '', title: '', cover: '', images: [], category: '' }

export default function AdminGalleryPage() {
  const { galleryAlbums, addGalleryAlbum, updateGalleryAlbum, deleteGalleryAlbum } = useData()
  const { isDark } = useTheme()
  const dialog = useDialog()

  const [editing, setEditing] = useState<GalleryAlbum | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState('All')

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'

  const cats = ['All', ...Array.from(new Set(galleryAlbums.map(a => a.category).filter(Boolean)))]
  const filtered = filterCat === 'All' ? galleryAlbums : galleryAlbums.filter(a => a.category === filterCat)

  const openNew = () => {
    setEditing({ ...emptyAlbum, images: [] })
    setIsNew(true)
  }
  const openEdit = (a: GalleryAlbum) => {
    setEditing({ ...a, images: [...a.images] })
    setIsNew(false)
  }
  const close = () => { setEditing(null); setIsNew(false) }

  const save = async () => {
    if (!editing || !editing.title) return
    const slug = editing.slug || editing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
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
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to save', variant: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  const del = async (slug: string) => {
    try {
      await deleteGalleryAlbum(slug)
    } catch (err: any) {
      dialog.alert({ title: 'Error', message: err.message || 'Failed to delete', variant: 'danger' })
    }
    setConfirm(null)
  }

  // Image management helpers
  const addImage = (url: string) => {
    setEditing(e => e ? { ...e, images: [...e.images, url] } : null)
  }
  const removeImage = (idx: number) => {
    setEditing(e => e ? { ...e, images: e.images.filter((_, i) => i !== idx) } : null)
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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className={`font-display text-2xl font-bold ${txt}`}>Gallery</h1>
          <p className={`text-sm ${sub}`}>{galleryAlbums.length} albums · {galleryAlbums.reduce((s, a) => s + a.images.length, 0)} total photos</p>
        </div>
        <button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">+ Add Album</button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {cats.map(c => (
          <button
            key={c}
            onClick={() => setFilterCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterCat === c
                ? isDark ? 'bg-prism-violet/15 text-prism-violet border border-prism-violet/40' : 'bg-violet-50 text-violet-700 border border-violet-200'
                : isDark ? 'bg-purple-500/[0.08] text-purple-200/80 border border-purple-500/20' : 'bg-gray-50 text-gray-500 border border-gray-200'
            }`}
          >
            {c} ({c === 'All' ? galleryAlbums.length : galleryAlbums.filter(a => a.category === c).length})
          </button>
        ))}
      </div>

      {/* Albums Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(album => (
          <div
            key={album.slug}
            className={`rounded-2xl overflow-hidden group transition-all hover:-translate-y-0.5 ${
              isDark
                ? 'bg-purple-500/[0.06] border border-purple-500/20 hover:border-prism-violet/40'
                : 'bg-white border border-gray-200 hover:border-violet-300 shadow-sm'
            }`}
          >
            {/* Cover */}
            <div className="aspect-video overflow-hidden relative">
              {album.cover || album.images[0] ? (
                <img
                  src={album.cover || album.images[0]}
                  alt={album.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-purple-500/10' : 'bg-gray-100'}`}>
                  <span className="text-4xl">📷</span>
                </div>
              )}
              {/* Photo count badge */}
              <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-[10px] font-bold ${
                isDark ? 'bg-black/60 text-white' : 'bg-white/80 text-gray-700'
              }`}>
                📷 {album.images.length}
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className={`font-display font-bold truncate ${txt}`}>{album.title}</div>
                <div className={`text-[11px] font-mono mt-0.5 ${sub}`}>
                  {album.category || 'Uncategorized'} · {album.images.length} photos
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(album)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg ${
                    isDark ? 'bg-purple-500/10 text-purple-200/90' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setConfirm(album.slug)}
                  className="btn-danger !text-[11px]"
                >
                  Del
                </button>
              </div>
            </div>

            {/* Thumbnails preview */}
            {album.images.length > 1 && (
              <div className={`px-4 pb-3 flex gap-1.5 overflow-hidden ${isDark ? 'border-t border-purple-500/10' : 'border-t border-gray-50'}`}>
                {album.images.slice(0, 5).map((img, i) => (
                  <div key={i} className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                    <img src={img} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  </div>
                ))}
                {album.images.length > 5 && (
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-gray-100 text-gray-400'
                  }`}>
                    +{album.images.length - 5}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {galleryAlbums.length === 0 && (
        <div className={`text-center py-20 ${sub}`}>
          <span className="text-5xl block mb-3">📸</span>
          <p className="font-display font-bold text-lg mb-1">No albums yet</p>
          <p className="text-sm">Create your first gallery album to showcase your events.</p>
        </div>
      )}

      {/* ── Edit/Create Modal ── */}
      <Modal open={!!editing} onClose={close} title={isNew ? 'Create Album' : `Edit: ${editing?.title}`} persistent>
        {editing && (
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Album Title *</label>
                <input
                  className="form-field"
                  value={editing.title}
                  onChange={e => setEditing(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="Events 2025"
                />
              </div>
              <div>
                <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Category</label>
                <input
                  className="form-field"
                  value={editing.category}
                  onChange={e => setEditing(prev => prev ? { ...prev, category: e.target.value } : null)}
                  placeholder="Events, BTS, Products..."
                  list="gallery-cats"
                />
                <datalist id="gallery-cats">
                  {Array.from(new Set(galleryAlbums.map(a => a.category).filter(Boolean))).map(c => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>Slug (URL)</label>
              <input
                className="form-field"
                value={editing.slug}
                onChange={e => setEditing(prev => prev ? { ...prev, slug: e.target.value } : null)}
                placeholder="auto-generated-from-title"
                disabled={!isNew}
              />
            </div>

            {/* Images Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={`text-[12px] font-medium ${sub}`}>
                  📷 Photos ({editing.images.length})
                </label>
                <span className={`text-[10px] ${sub}`}>First image = cover photo</span>
              </div>

              <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-purple-500/[0.05] border border-purple-500/15' : 'bg-violet-50/50 border border-violet-100'}`}>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {/* Existing images */}
                  {editing.images.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <div className="aspect-square rounded-xl overflow-hidden">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      </div>
                      {/* Cover badge */}
                      {idx === 0 && (
                        <span className={`absolute top-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                          isDark ? 'bg-cyan-400/20 text-cyan-300' : 'bg-violet-100 text-violet-700'
                        }`}>
                          COVER
                        </span>
                      )}
                      {/* Controls overlay */}
                      <div className={`absolute inset-0 rounded-xl flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                        isDark ? 'bg-black/60' : 'bg-white/70'
                      }`}>
                        {idx > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            className={`text-[10px] px-1.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}
                          >
                            ◀
                          </button>
                        )}
                        {idx < editing.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            className={`text-[10px] px-1.5 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}
                          >
                            ▶
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="text-[10px] px-1.5 py-1 rounded-lg bg-red-500/40 text-white"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add new image */}
                  <ImageUploader compact onChange={addImage} folder="gallery" />
                </div>
              </div>
            </div>

            {/* Save/Cancel */}
            <div className={`flex gap-3 pt-3 border-t ${isDark ? 'border-purple-500/20' : 'border-gray-100'}`}>
              <button
                onClick={save}
                disabled={saving || !editing.title}
                className="btn-primary !rounded-xl !px-6 !py-2.5 disabled:opacity-50"
              >
                <span>{saving ? '⏳ Saving...' : isNew ? 'Create Album' : 'Save Changes'}</span>
              </button>
              <button onClick={close} className="btn-outline !rounded-xl !px-6 !py-2.5">Cancel</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete Album?">
        <p className={`text-sm mb-5 ${sub}`}>This will permanently remove the album and all its photos from the gallery.</p>
        <div className="flex gap-3">
          <button onClick={() => del(confirm!)} className="btn-danger !px-5 !py-2.5">Delete</button>
          <button onClick={() => setConfirm(null)} className="btn-outline !rounded-xl !px-5 !py-2.5">Cancel</button>
        </div>
      </Modal>
    </div>
  )
}
