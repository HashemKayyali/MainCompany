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
  const [pendingNewMedia, setPendingNewMedia] = useState<string | null>(null)

  const sub = isDark ? 'text-purple-300/80' : 'text-gray-500'
  const aspectClass = previewAspectClass || (compact ? 'aspect-square' : 'aspect-video')
  const isCollectionUploader = typeof value === 'undefined'

  const openFrameEditor = (media: string, pending = false) => {
    if (!media) return
    setEditorMedia(media)
    setPendingNewMedia(pending ? media : null)
    setEditorOpen(true)
  }

  const commitEditorValue = (nextValue: string) => {
    onChange(nextValue)
    setPendingNewMedia(null)
  }

  const closeEditor = () => {
    if (pendingNewMedia) {
      onChange(pendingNewMedia)
      setPendingNewMedia(null)
    }
    setEditorOpen(false)
  }

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return

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
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

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

  return (
    <>
      <div className={maxWidthClassName}>
        {label && <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>{label}</label>}
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />

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
