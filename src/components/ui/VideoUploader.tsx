import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import { uploadVideo } from '../../services/storage.service'
import type { AssetSession } from '../../services/asset-session'
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
  compactPreview?: boolean
  /**
   * Optional asset session. When provided, uploads route through
   * `session.runUpload` so late completions (video finished uploading
   * after the editor closed) are detected and the resulting storage
   * object is auto-deleted. See ImageUploader for the same pattern.
   */
  session?: AssetSession | null
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
  compactPreview = false,
  session,
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
  const [previewExpanded, setPreviewExpanded] = useState(false)

  const sub = isDark ? 'text-purple-300/80' : 'text-gray-500'
  const isCollectionUploader = typeof value === 'undefined'

  useEffect(() => {
    setPreviewExpanded(false)
  }, [value])

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
      const url = session
        ? await session.runUpload<string>(
            () => uploadVideo(file, folder, undefined, setProgress),
            result => [result],
          )
        : await uploadVideo(file, folder, undefined, setProgress)
      setProgress('')

      // Late completion — session was disposed while upload ran.
      // The video has already been cleaned up by the session; do
      // not touch form state (parent editor is gone).
      if (url === null) return

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

  // Remove only mutates form state; the currently-persisted video is
  // NEVER deleted here. Storage reconciliation happens when the
  // parent editor session commits (successful DB save) or cancels
  // (throwing away session-temporary uploads). This prevents a
  // "Remove then Cancel" flow from destroying a persisted asset the
  // database still points at.
  const handleRemove = () => {
    onRemove?.()
    onChange('')
  }

  const compactVideoCard = value ? (
    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2.5 shadow-[0_1px_2px_rgba(20,8,50,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] sm:w-36">
          <FramedVideo
            media={value}
            className="h-full w-full"
            muted
            playsInline
            preload="metadata"
            fallbackTransform={{ fit: defaultFit }}
          />
          <span className="absolute start-2 top-2 rounded-full bg-[var(--admin-surface)]/90 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-success)] ring-1 ring-[var(--admin-border)]">
            Uploaded
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[color-mix(in_srgb,var(--admin-success)_10%,transparent)] px-2 py-1 text-[10px] font-bold text-[var(--admin-success)]">
              Video ready
            </span>
            <span className="text-[11px] font-medium text-[var(--admin-text-muted)]">
              Storefront hover preview
            </span>
          </div>
          <div className="mt-1.5 truncate font-mono text-[11px] text-[var(--admin-text-muted)]">
            {value.split('/').pop()?.split('#')[0] || 'Product video'}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => openFrameEditor(value)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[12px] font-bold text-[var(--admin-accent)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)]"
            >
              Adjust frame
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[12px] font-bold text-[var(--admin-accent)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            <button
              type="button"
              onClick={() => setPreviewExpanded(value => !value)}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[12px] font-bold text-[var(--admin-text-muted)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] hover:text-[var(--admin-accent)]"
            >
              {previewExpanded ? 'Hide preview' : 'Preview'}
            </button>
            <button
              type="button"
              onClick={() => void handleRemove()}
              className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[color-mix(in_srgb,var(--admin-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-danger)_8%,transparent)] px-3 text-[12px] font-bold text-[var(--admin-danger)] transition hover:bg-[color-mix(in_srgb,var(--admin-danger)_12%,transparent)]"
            >
              Remove
            </button>
          </div>
        </div>
      </div>

      {previewExpanded && (
        <div className="mt-3 overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
          <div className="aspect-video max-h-[240px]">
            <FramedVideo
              media={value}
              className="h-full w-full"
              controls
              playsInline
              preload="metadata"
              fallbackTransform={{ fit: defaultFit }}
            />
          </div>
        </div>
      )}
    </div>
  ) : null

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

        {value && compactPreview ? compactVideoCard : value ? (
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
