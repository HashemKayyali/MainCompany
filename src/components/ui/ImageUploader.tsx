import { useRef, useState, type ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import { uploadImageVariants } from '../../services/storage.service'
import type { MediaFit } from '../../utils/media-frame'
import FramedImage from './FramedImage'
import MediaPlacementModal from './MediaPlacementModal'

interface Props {
  value?: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  removable?: boolean
  onRemove?: () => void
  compact?: boolean
  /**
   * Premium "logo management" layout: shows a small fixed thumbnail with
   * always-visible Adjust / Replace / Remove actions on the side. Designed
   * for square brand logos in admin editors.
   */
  variant?: 'default' | 'logo'
  frameAspect?: number
  defaultFit?: MediaFit
  frameTitle?: string
  frameHint?: string
  previewAspectClass?: string
  renderFrameContextPreview?: (media: string) => ReactNode
  frameContextTitle?: string
  frameContextHint?: string
  maxWidthClassName?: string
}

export default function ImageUploader({
  value,
  onChange,
  folder = 'general',
  label,
  removable = false,
  onRemove,
  compact = false,
  variant = 'default',
  frameAspect = 16 / 9,
  defaultFit = 'cover',
  frameTitle = 'Adjust Image Frame',
  frameHint,
  previewAspectClass,
  renderFrameContextPreview,
  frameContextTitle,
  frameContextHint,
  maxWidthClassName,
}: Props) {
  const { isDark } = useTheme()
  const dialog = useDialog()
  const inputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMedia, setEditorMedia] = useState('')
  // Synchronous guard: MediaPlacementModal.apply() calls onApply() then
  // onClose() in the same tick. setPendingNewMedia(null) inside
  // commitEditorValue is async, so closeEditor would still read the stale
  // pendingNewMedia and emit the raw image a SECOND time (→ image saved
  // twice, especially for collection/gallery uploaders). A ref flips
  // synchronously, so closeEditor can tell a commit already happened.
  const committedRef = useRef(false)
  const pendingRef = useRef<string | null>(null)

  const sub = isDark ? 'text-purple-300/80' : 'text-gray-500'
  const aspectClass = previewAspectClass || (compact ? 'aspect-square' : 'aspect-video')
  const isCollectionUploader = typeof value === 'undefined'

  const openFrameEditor = (media: string, pending = false) => {
    if (!media) return
    committedRef.current = false
    pendingRef.current = pending ? media : null
    setEditorMedia(media)
    setEditorOpen(true)
  }

  const commitEditorValue = (nextValue: string) => {
    committedRef.current = true
    pendingRef.current = null
    onChange(nextValue)
  }

  const closeEditor = () => {
    // Only re-emit the raw uploaded media if the user closed WITHOUT
    // applying (cancel / backdrop / Escape). If a commit already ran in
    // this cycle, the framed value was emitted once — do not duplicate.
    if (!committedRef.current && pendingRef.current) {
      onChange(pendingRef.current)
    }
    committedRef.current = false
    pendingRef.current = null
    setEditorOpen(false)
  }

  const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      dialog.alert({
        title: 'Unsupported file',
        message: 'Please upload a JPG, PNG, WebP, or GIF image.',
        variant: 'warning',
      })
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      dialog.alert({
        title: 'Image too large',
        message: `Image must be smaller than 10MB (yours is ${(file.size / 1024 / 1024).toFixed(1)}MB).`,
        variant: 'warning',
      })
      return
    }

    setUploading(true)
    try {
      const { heroUrl } = await uploadImageVariants(file, folder)

      if (isCollectionUploader) {
        openFrameEditor(heroUrl, true)
      } else {
        onChange(heroUrl)
        openFrameEditor(heroUrl)
      }
    } catch (err) {
      console.error('Upload failed:', err)
      dialog.alert({
        title: 'Upload Failed',
        message: 'Failed to upload image. Please try again.',
        variant: 'danger',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  if (compact) {
    return (
      <>
        <div className="relative group">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="hidden" />

          {value ? (
            <div className={`relative overflow-hidden rounded-xl ${aspectClass}`}>
              <FramedImage
                media={value}
                alt=""
                className="h-full w-full"
                fallbackTransform={{ fit: defaultFit }}
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />

              <div
                className={`absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 ${
                  isDark ? 'bg-black/60' : 'bg-white/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => openFrameEditor(value)}
                  className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${
                    isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  Frame
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`rounded-lg px-2 py-1 text-[10px] font-semibold ${
                    isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {uploading ? '...' : 'Replace'}
                </button>
                {removable && onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="rounded-lg bg-red-500/30 px-2 py-1 text-[10px] font-semibold text-white"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-all ${aspectClass} ${
                isDark
                  ? 'border-purple-500/20 bg-purple-500/[0.04] hover:border-purple-500/40'
                  : 'border-violet-200 bg-violet-50/50 hover:border-violet-400'
              }`}
            >
              <span className="text-lg">{uploading ? '...' : 'Add'}</span>
              <span className={`text-[9px] font-medium ${sub}`}>{uploading ? 'Uploading...' : 'Add Image'}</span>
            </button>
          )}
        </div>

        <MediaPlacementModal
          open={editorOpen}
          media={editorMedia}
          title={frameTitle}
          type="image"
          aspectRatio={frameAspect}
          defaultFit={defaultFit}
          hint={frameHint}
          contextPreview={renderFrameContextPreview}
          contextPreviewTitle={frameContextTitle}
          contextPreviewHint={frameContextHint}
          onApply={commitEditorValue}
          onClose={closeEditor}
        />
      </>
    )
  }

  if (variant === 'logo') {
    return (
      <>
        <div className={maxWidthClassName}>
          {label && (
            <label className="mb-1.5 block text-[12px] font-bold text-[#07041a]">
              {label}
            </label>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="hidden" />

          {value ? (
            <div className="flex items-stretch gap-3 rounded-[16px] border border-violet-200/80 bg-white p-2.5 shadow-[0_1px_2px_rgba(20,8,50,0.04),0_8px_20px_-10px_rgba(89,23,196,0.14)]">
              {/* Thumbnail */}
              <div className="flex h-[96px] w-[96px] shrink-0 items-center justify-center rounded-[12px] border border-violet-100 bg-violet-50/70">
                <FramedImage
                  media={value}
                  alt="Logo"
                  className="h-[72px] w-[72px] object-contain mix-blend-multiply"
                  fallbackTransform={{ fit: 'contain' }}
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>

              {/* Always-visible action stack */}
              <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openFrameEditor(value)}
                  className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[10px] border border-violet-300/80 bg-violet-50 px-3 text-[11.5px] font-bold text-violet-800 transition hover:border-violet-500 hover:bg-violet-100 hover:text-violet-900"
                >
                  Adjust Logo
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[10px] border border-violet-200/80 bg-white px-3 text-[11.5px] font-semibold text-[#211049] transition hover:border-violet-400 hover:bg-violet-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? 'Uploading…' : 'Replace'}
                </button>
                {removable && onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex min-h-[34px] items-center justify-center gap-1.5 rounded-[10px] border border-red-200 bg-red-50 px-3 text-[11.5px] font-bold text-red-700 transition hover:border-red-300 hover:bg-red-100 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              onDragOver={e => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex w-full flex-col items-center justify-center gap-1.5 rounded-[16px] border-2 border-dashed py-7 transition-all ${
                dragOver
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-violet-300/70 bg-violet-50/40 hover:border-violet-400 hover:bg-violet-50/80'
              }`}
            >
              <span className="text-[12.5px] font-bold text-[#07041a]">
                {uploading ? 'Uploading…' : 'Click or drop logo'}
              </span>
              <span className="text-[10.5px] font-medium text-[#4a2c8f]">
                PNG / SVG / JPG · transparent background recommended
              </span>
            </button>
          )}
        </div>

        <MediaPlacementModal
          open={editorOpen}
          media={editorMedia}
          title={frameTitle}
          type="image"
          aspectRatio={frameAspect}
          defaultFit={defaultFit}
          hint={frameHint}
          contextPreview={renderFrameContextPreview}
          contextPreviewTitle={frameContextTitle}
          contextPreviewHint={frameContextHint}
          onApply={commitEditorValue}
          onClose={closeEditor}
        />
      </>
    )
  }

  return (
    <>
      <div className={maxWidthClassName}>
        {label && <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>{label}</label>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="hidden" />

        {value ? (
          <div className="group relative overflow-hidden rounded-xl">
            <div className={`overflow-hidden rounded-xl ${aspectClass}`}>
              <FramedImage
                media={value}
                alt="Uploaded"
                className="h-full w-full"
                fallbackTransform={{ fit: defaultFit }}
                onError={e => {
                  ;(e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            </div>

            <div
              className={`absolute inset-0 flex items-center justify-center gap-2.5 opacity-0 transition-opacity group-hover:opacity-100 ${
                isDark ? 'bg-black/60' : 'bg-white/60'
              }`}
            >
              <button
                type="button"
                onClick={() => openFrameEditor(value)}
                className={`rounded-xl px-3.5 py-2 text-[11px] font-semibold ${
                  isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'
                }`}
              >
                Adjust Frame
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className={`rounded-xl px-3.5 py-2 text-[11px] font-semibold ${
                  isDark ? 'bg-purple-500/40 text-white' : 'bg-violet-100 text-violet-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
              {removable && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="rounded-xl bg-red-500/40 px-3.5 py-2 text-[11px] font-semibold text-white"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-7 transition-all ${aspectClass} ${
              dragOver
                ? isDark
                  ? 'border-prism-violet bg-prism-violet/10'
                  : 'border-violet-500 bg-violet-50'
                : isDark
                  ? 'border-purple-500/20 bg-purple-500/[0.04] hover:border-purple-500/40'
                  : 'border-violet-200 bg-violet-50/50 hover:border-violet-400'
            }`}
          >
            <span className="text-[1.65rem]">{uploading ? '...' : 'Image'}</span>
            <span className={`text-[13px] font-semibold ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>
              {uploading ? 'Uploading...' : 'Click or drop image here'}
            </span>
            <span className={`text-[11px] ${sub}`}>Supports JPG, PNG, WebP and opens a framing step after upload</span>
          </button>
        )}
      </div>

      <MediaPlacementModal
        open={editorOpen}
        media={editorMedia}
        title={frameTitle}
        type="image"
        aspectRatio={frameAspect}
        defaultFit={defaultFit}
        hint={frameHint}
        contextPreview={renderFrameContextPreview}
        contextPreviewTitle={frameContextTitle}
        contextPreviewHint={frameContextHint}
        onApply={commitEditorValue}
        onClose={closeEditor}
      />
    </>
  )
}
