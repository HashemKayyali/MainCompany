import { useEffect, useMemo, useRef, useState } from 'react'
import { useData } from '../../contexts/DataContext'
import { useTheme } from '../../contexts/ThemeContext'
import type { Category } from '../../data/products/types'
import Modal from '../../components/ui/Modal'
import ImageUploader from '../../components/ui/ImageUploader'

const empty: Category = { id: '', name: '', slug: '', icon: '', description: '', image: '' }

function cn(...s: Array<string | false | undefined | null>) {
  return s.filter(Boolean).join(' ')
}

function makeSlug(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

/** ✅ 100 مناسبة للمشروع */
const EMOJI_ICONS: string[] = [
  // ───────────────────────── VR / AR / Wearables ─────────────────────────
  '🥽','🕶️','🎧','🎤','🔊','📢','📣','📷','🎥','📸',
  '📹','🛰️','🧠','🤖','🦾','🦿','👾','🧬','🧪','🔬',
  '🔭','📡','🧲','💡','🔦','🕹️','🎮','🧩','🧿','✨',
  '⭐','🌟','🌈','⚡','🔥','💎','🟣','🔵','🟢','🟡',
  '🟠','🔴','⚫','⚪','🌀','🌌','🪐','☄️','🌠','👓',

  // ───────────────────────── Gaming / Esports / Arcade ───────────────────
  '🎮','🕹️','👾','🧟','🧙','🧛','🧞','🧜','🧝','🧑‍🚀',
  '🛰️','🚀','🛸','🎯','🏆','🥇','🥈','🥉','🏅','🎖️',
  '🎲','🃏','🀄','♟️','🧩','🧸','🎈','🎉','🎊','🎆',
  '🎇','🎟️','🎫','🏟️','🎪','🎡','🎠','🛝','🏓','🏸',
  '🏒','🥅','🏀','⚽','🏈','⚾','🎳','🥊','🥋','⛳',
  '🧨','💥','🔫','🧿','🦖','🦕','🐉','👑','💫','🧠',

  // ───────────────────────── Screens / AV / Studio ───────────────────────
  '🖥️','🖨️','📺','📻','📽️','🎞️','🧾','🧿','🔌','🔋',
  '🔦','💡','🪫','⚙️','🔧','🪛','🔩','🧰','🛠️','🧲',
  '📱','☎️','📞','📟','📠','🧮','⌚','⏱️','⏲️','🕒',
  '🗜️','🎚️','🎛️','🎙️','🎧','🔊','🔉','🔈','📡','🛰️',
  '📷','📸','📹','🎥','🧾','🧷','📎','🗂️','🗃️','🗄️',

  // ───────────────────────── Printers / Printing / Design ────────────────
  '🖨️','🧾','📄','📃','📑','🗞️','📚','📖','📝','✍️',
  '🖊️','🖋️','✒️','🖍️','🖌️','🎨','🧵','🪡','📐','📏',
  '🧰','🧲','⚙️','🔩','🪛','🔧','🛠️','🗜️','🧪','🧬',
  '📦','📫','📬','📭','✉️','📩','📮','🏷️','🧾','🧷',

  // ───────────────────────── Service / Repair / Maintenance ──────────────
  '🧑‍💻','👨‍🔧','👩‍🔧','🧰','🛠️','🔧','🪛','🔩','⚙️','🧲',
  '🧯','🪜','🧱','🏗️','🏭','🏢','🏬','🏪','🏷️','📦',
  '🧼','🧽','🧴','🪣','🚿','🚰','🧹','🧺','🪠','🧻',
  '🔒','🔐','🛡️','📌','📍','🧭','🗺️','📋','✅','☑️',
  '📅','🗓️','⏱️','⏲️','🕒','📞','☎️','🧾','💳','🧰',

  // ───────────────────────── Tech / Network / Security ───────────────────
  '🌐','🖧','📡','🛰️','🧲','🔌','🔋','🪫','💾','💿',
  '📀','🧠','🤖','🧬','🧪','🔬','🔭','🗄️','🗃️','🗂️',
  '🧾','📈','📊','📉','🧮','🔍','🔎','🧷','📎','🔗',
  '🔑','🗝️','🔒','🔐','🛡️','🚨','⚠️','⛔','✅','🧿',

  // ───────────────────────── Business / Store / Events ───────────────────
  '🏷️','🛍️','🛒','📦','🎁','💳','💰','🪙','💵','💶',
  '💷','💴','🧾','📄','📝','📌','📍','📣','📢','🎤',
  '🎟️','🎫','🏁','🏆','🌟','✨','📅','🗓️','🕒','⏱️',
  '🏢','🏬','🏪','🏭','🏗️','🤝','👥','👤','🧑‍💼','📞',

  // ───────────────────────── Extras (transport / misc) ───────────────────
  '🚲','🛴','🏍️','🚗','🛞','⛓️','🧤','🪖','🧢','👕',
  '🎒','🍀','🌿','🌍','🌟','🏁','🧩','📚','📝','🧸'
]

export default function AdminCategoriesPage() {
  const { categories, products, addCategory, updateCategory, deleteCategory } = useData()
  const { isDark } = useTheme()

  const [editing, setEditing] = useState<Category | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)

  // ✅ Emoji picker state
  const [emojiQuery, setEmojiQuery] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)

  // ✅ refs لإغلاق البوب-أوفر عند الضغط خارجها
  const iconWrapRef = useRef<HTMLDivElement | null>(null)
  const popoverRef = useRef<HTMLDivElement | null>(null)

  const txt = isDark ? 'text-white' : 'text-gray-900'
  const sub = isDark ? 'text-purple-200/80' : 'text-gray-500'
  const border = isDark ? 'border-purple-500/15' : 'border-gray-200'
  const rowHover = isDark ? 'hover:border-prism-violet/40' : 'hover:border-violet-200'

  const openNew = () => {
    setEditing({ ...empty, id: `cat-${Date.now()}` })
    setIsNew(true)
    setEmojiQuery('')
    setShowEmoji(false)
  }
  const openEdit = (c: Category) => {
    setEditing({ ...c })
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
      alert('Error: ' + (err.message || 'Failed to save'))
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

  const filteredEmojis = useMemo(() => {
    const q = emojiQuery.trim()
    if (!q) return EMOJI_ICONS
    return EMOJI_ICONS.filter(e => e.includes(q))
  }, [emojiQuery])

  // ✅ إغلاق البوب-أوفر عند الضغط خارجها (بدون overlay يقتل الماوس/السكرول)
  useEffect(() => {
    if (!showEmoji) return

    const onPointerDown = (ev: PointerEvent) => {
      const t = ev.target as Node
      const wrap = iconWrapRef.current
      const pop = popoverRef.current

      // إذا الضغط داخل الزر/الحاوية أو داخل البوب-أوفر → لا تغلق
      if (wrap?.contains(t) || pop?.contains(t)) return

      setShowEmoji(false)
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [showEmoji])

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className={cn('font-display text-2xl font-bold', txt)}>Categories / Brands</h1>
          <p className={cn('text-sm', sub)}>
            {categories.length} categories — each represents a brand or service line
          </p>
        </div>

        <button onClick={openNew} className="btn-primary !text-xs !px-5 !py-2.5 !rounded-xl">
          + Add Category
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {catCards.map(({ c, count }) => (
          <div
            key={c.id}
            className={cn(
              'card-surface rounded-2xl overflow-hidden transition-all border group',
              border,
              rowHover
            )}
          >
            {c.image ? (
              <div className={cn('aspect-[3/1] overflow-hidden', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <img
                  src={c.image}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            ) : (
              <div className={cn('aspect-[3/1] flex items-center justify-center', isDark ? 'bg-purple-500/10' : 'bg-gray-50')}>
                <div className={cn('text-[11px] font-mono', sub)}>NO IMAGE</div>
              </div>
            )}

            <div className="p-5 flex items-start gap-4">
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border',
                  isDark ? 'bg-purple-500/[0.08] border-purple-500/25' : 'bg-white border-gray-200'
                )}
              >
                <span className="text-2xl leading-none">{c.icon || '📂'}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className={cn('font-display font-bold truncate', txt)}>{c.name}</div>
                {c.description ? (
                  <p className={cn('text-[11px] mt-0.5 line-clamp-2', sub)}>{c.description}</p>
                ) : (
                  <p className={cn('text-[11px] mt-0.5', sub)}>—</p>
                )}

                <div className="mt-2">
                  <span
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-mono',
                      isDark
                        ? 'border-purple-500/25 bg-purple-500/10 text-cyan-200/80'
                        : 'border-gray-200 bg-white text-violet-700'
                    )}
                  >
                    {count} product{count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => openEdit(c)}
                  className={cn(
                    'text-[11px] px-2.5 py-1 rounded-lg border transition',
                    isDark
                      ? 'border-purple-500/25 bg-purple-500/10 text-purple-200/90 hover:bg-purple-500/15'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  )}
                >
                  Edit
                </button>

                <button
                  onClick={async () => {
                    if (count > 0) {
                      alert('Remove products from this category first')
                      return
                    }
                    if (confirm('Delete?')) {
                      try {
                        await deleteCategory(c.id)
                      } catch (e: any) {
                        alert('Error: ' + (e.message || 'Failed to delete'))
                      }
                    }
                  }}
                  className="btn-danger !text-[11px] !px-3 !py-1 !rounded-lg"
                >
                  Del
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <Modal open={!!editing} onClose={close} title={isNew ? 'Add Category / Brand' : 'Edit Category'}>
        {editing && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-[1]">
              <div className="sm:col-span-2">
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>
                  Name * (e.g. "The Terminal VR", "Bike Land")
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
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Slug</label>
                <input
                  className="form-field"
                  value={editing.slug}
                  onChange={e => up('slug', e.target.value)}
                  placeholder={editing.name ? makeSlug(editing.name) : 'auto-generated-from-name'}
                />
              </div>

              {/* ✅ Icon picker (Popover فوق العناصر) */}
              <div ref={iconWrapRef} className="relative">
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Icon</label>

                <button
                  type="button"
                  onClick={() => setShowEmoji(v => !v)}
                  className={cn(
                    'w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition relative z-[20]',
                    isDark
                      ? 'border-purple-500/25 bg-purple-500/[0.06] hover:bg-purple-500/[0.10]'
                      : 'border-gray-200 bg-white hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl">{editing.icon || '📂'}</span>
                    <span className={cn('text-sm truncate', isDark ? 'text-purple-100/90' : 'text-gray-700')}>
                      {editing.icon ? 'Selected' : 'Choose an icon'}
                    </span>
                  </div>
                  <span className={cn('text-xs font-mono', sub)}>{showEmoji ? 'CLOSE' : 'PICK'}</span>
                </button>

                {showEmoji && (
                  <div
                    ref={popoverRef}
                    className={cn(
                      'absolute right-0 mt-2 w-[340px] z-[1000] rounded-2xl border p-3 shadow-2xl',
                      isDark ? 'border-purple-500/20 bg-[#0b0b1a]' : 'border-gray-200 bg-white'
                    )}
                    // ✅ أهم سطرين: امنع السكرول يطلع للمودال/الصفحة
                    onWheelCapture={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className={cn('text-[11px] font-mono', sub)}>FILTER</span>
                      <input
                        className={cn(
                          'flex-1 rounded-xl border px-3 py-2 text-sm bg-transparent outline-none',
                          isDark
                            ? 'border-purple-500/25 text-purple-50 placeholder:text-purple-200/60'
                            : 'border-gray-200 text-gray-800 placeholder:text-gray-500'
                        )}
                        placeholder="type / paste emoji to filter..."
                        value={emojiQuery}
                        onChange={e => setEmojiQuery(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setEmojiQuery('')}
                        className={cn(
                          'text-[11px] px-2.5 py-2 rounded-xl border',
                          isDark
                            ? 'border-purple-500/25 bg-purple-500/10 text-purple-100'
                            : 'border-gray-200 bg-white text-gray-700'
                        )}
                      >
                        Clear
                      </button>
                    </div>

                    <div className="grid grid-cols-10 gap-2 max-h-56 overflow-y-auto overscroll-contain pr-1">
                      {filteredEmojis.map(e => {
                        const active = editing.icon === e
                        return (
                          <button
                            key={e}
                            type="button"
                            onClick={() => {
                              setEditing(x => (x ? { ...x, icon: e } : x))
                              setShowEmoji(false)
                            }}
                            className={cn(
                              'h-10 rounded-xl border flex items-center justify-center text-xl transition select-none',
                              active
                                ? isDark
                                  ? 'border-prism-violet/50 bg-prism-violet/15'
                                  : 'border-violet-300 bg-violet-50'
                                : isDark
                                ? 'border-purple-500/20 bg-purple-500/10 hover:bg-purple-500/15'
                                : 'border-gray-200 bg-white hover:bg-gray-50'
                            )}
                            title="Select"
                          >
                            {e}
                          </button>
                        )
                      })}
                    </div>

                    <div className={cn('mt-2 text-[11px] font-mono', sub)}>
                      {filteredEmojis.length} icons
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={cn('block text-[12px] mb-1.5 font-medium', sub)}>Description</label>
                <textarea
                  className="form-field resize-none"
                  rows={3}
                  value={editing.description || ''}
                  onChange={e => up('description', e.target.value)}
                  placeholder="Brief description of this brand/category..."
                />
              </div>
            </div>

            <ImageUploader
              label="Category / Brand Image"
              value={editing.image}
              onChange={url => setEditing(e => (e ? { ...e, image: url } : null))}
              removable
              onRemove={() => setEditing(e => (e ? { ...e, image: '' } : null))}
              folder="categories"
            />

            <div className="flex gap-3 justify-end mt-6">
              <button onClick={close} className="btn-outline !px-5 !py-2.5 !rounded-xl !text-sm">
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving || !canSave}
                className="btn-primary !px-6 !py-2.5 !rounded-xl !text-xs disabled:opacity-50"
              >
                {saving ? '⏳ Saving...' : isNew ? 'Add' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}