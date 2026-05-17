import { useRef, useState, type ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import { deleteVideo, uploadVideo } from '../../services/storage.service'
import { getErrorMessage } from '../../lib/errors'
import type { MediaFit } from '../../utils/media-frame'
import FramedVideo from './FramedVideo'
import MediaPlacementModal from './MediaPlacementModal'

interface Props {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  folder?: string
  label?: string
  frameAspect?: number
  defaultFit?: MediaFit
  frameTitle?: string
  frameHint?: string
  renderFrameContextPreview?: (media: string) => ReactNode
  frameContextTitle?: string
  frameContextHint?: string
}

const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
const ACCEPTED_EXTENSIONS = /\.(mp4|webm|mov|m4v)$/i
const MAX_SIZE = 50 * 1024 * 1024

export default function VideoUploader({
  value,
  onChange,
  onRemove,
  folder = 'products',
  label,
  frameAspect = 16 / 9,
  defaultFit = 'cover',
  frameTitle = 'Adjust Video Frame',
  frameHint,
  renderFrameContextPreview,
  frameContextTitle,
  frameContextHint,
}: Props) {
  const { isDark } = useTheme()
  const dialog = useDialog()
  const inputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMedia, setEditorMedia] = useState('')
  const [pendingNewMedia, setPendingNewMedia] = useState<string | null>(null)

  const sub = isDark ? 'text-purple-300/80' : 'text-gray-500'
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
    const isAcceptedType = ACCEPTED_TYPES.includes(file.type) || ACCEPTED_EXTENSIONS.test(file.name)
    if (!isAcceptedType) {
      dialog.alert({
        title: 'Invalid File',
        message: 'Please upload a video file in MP4, WebM, MOV, or M4V format.',
        variant: 'warning',
      })
      return
    }

    if (file.size > MAX_SIZE) {
      dialog.alert({
        title: 'File Too Large',
        message: 'Video is too large. Max size is 50MB.',
        variant: 'warning',
      })
      return
    }

    setUploading(true)
    setProgress('Preparing video...')

    try {
      const url = await uploadVideo(file, folder, undefined, setProgress)
      setProgress('')

      if (isCollectionUploader) {
        openFrameEditor(url, true)
      } else {
        onChange(url)
        openFrameEditor(url)
      }
    } catch (err: unknown) {
      console.error('Video upload failed:', err)
      dialog.alert({
        title: 'Upload Failed',
        message: 'Failed to upload video: ' + getErrorMessage(err, 'Unknown error'),
        variant: 'danger',
      })
      setProgress('')
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

  const handleRemove = async () => {
    if (value) {
      try {
        await deleteVideo(value)
      } catch {
        // ignore delete failures here
      }
    }

    onRemove?.()
    onChange('')
  }

  return (
    <>
      <div>
        {label && <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>{label}</label>}

        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v"
          onChange={handleChange}
          className="hidden"
        />

        {value ? (
          <div className="group relative overflow-hidden rounded-xl">
            <div className="aspect-video overflow-hidden rounded-xl">
              <FramedVideo
                media={value}
                className="h-full w-full"
                muted
                loop
                playsInline
                preload="metadata"
                fallbackTransform={{ fit: defaultFit }}
                onMouseEnter={e => {
                  void (e.target as HTMLVideoElement).play().catch(() => {})
                }}
                onMouseLeave={e => {
                  const video = e.target as HTMLVideoElement
                  video.pause()
                  video.currentTime = 0
                }}
              />
            </div>

            <div
              className={`absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition-opacity group-hover:opacity-100 ${
                isDark ? 'bg-black/60' : 'bg-white/60'
              }`}
            >
              <button
                type="button"
                onClick={() => openFrameEditor(value)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                  isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'
                }`}
              >
                Adjust Frame
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className={`rounded-xl px-4 py-2 text-xs font-semibold ${
                  isDark ? 'bg-purple-500/40 text-white' : 'bg-violet-100 text-violet-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
              <button
                type="button"
                onClick={() => void handleRemove()}
                className="rounded-xl bg-red-500/40 px-4 py-2 text-xs font-semibold text-white"
              >
                Remove
              </button>
            </div>

            <div className="pointer-events-none absolute bottom-2 right-2">
              <span
                className={`rounded-lg px-2 py-1 font-mono text-[9px] ${
                  isDark ? 'bg-black/50 text-white/60' : 'bg-white/70 text-gray-500'
                }`}
              >
                Hover to preview
              </span>
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
            className={`flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 transition-all ${
              dragOver
                ? isDark
                  ? 'border-prism-violet bg-prism-violet/10'
                  : 'border-violet-500 bg-violet-50'
                : isDark
                  ? 'border-purple-500/20 bg-purple-500/[0.04] hover:border-purple-500/40'
                  : 'border-violet-200 bg-violet-50/50 hover:border-violet-400'
            }`}
          >
            <span className="text-2xl">{uploading ? '...' : 'Video'}</span>
            <span className={`text-sm font-semibold ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>
              {uploading ? progress || 'Uploading...' : 'Click or drop video here'}
            </span>
            <span className={`text-[11px] ${sub}`}>
              MP4, WebM, MOV, M4V - opens a framing step after upload
            </span>
          </button>
        )}
      </div>

      <MediaPlacementModal
        open={editorOpen}
        media={editorMedia}
        title={frameTitle}
        type="video"
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
