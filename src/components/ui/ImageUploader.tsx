import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import { uploadImage } from '../../services/storage.service'
import type { AssetSession } from '../../services/asset-session'
import { stripMediaTransform, type MediaFit } from '../../utils/media-frame'
import { cn } from '../../utils/cn'
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
  compactPreview?: boolean
  ignoreTransformPreview?: boolean
  resetFrameOnOpen?: boolean
  multiple?: boolean
  maxFiles?: number
  onChangeMany?: (urls: string[]) => void
  adjustAfterUpload?: boolean
  /**
   * Optional asset session. When provided, uploads are wrapped in
   * `session.runUpload`, which:
   *   - registers each successful upload as a session-temporary
   *     asset (cleaned up on cancel or on save-if-not-referenced);
   *   - detects late completions after the parent editor has been
   *     closed and cleans the resulting storage object automatically.
   * When omitted (backward-compat), the uploader behaves as before
   * — the parent is fully responsible for storage lifecycle.
   */
  session?: AssetSession | null
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
  compactPreview = false,
  ignoreTransformPreview = false,
  resetFrameOnOpen = false,
  multiple = false,
  maxFiles = 100,
  onChangeMany,
  adjustAfterUpload = true,
  session,
}: Props) {
  const { isDark } = useTheme()
  const dialog = useDialog()
  const inputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ completed: number; total: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMedia, setEditorMedia] = useState('')
  const [previewExpanded, setPreviewExpanded] = useState(false)
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

  useEffect(() => {
    setPreviewExpanded(false)
  }, [value])

  const openFrameEditor = (media: string, pending = false) => {
    if (!media) return
    const nextMedia = resetFrameOnOpen ? stripMediaTransform(media) : media
    committedRef.current = false
    pendingRef.current = pending ? nextMedia : null
    setEditorMedia(nextMedia)
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
  const BULK_UPLOAD_CONCURRENCY = 4

  const validateFile = (file: File): string | null => {
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      return `${file.name}: unsupported file type`
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `${file.name}: larger than 10MB`
    }
    return null
  }

  const handleFile = async (file: File) => {
    const validationError = validateFile(file)
    if (validationError) {
      dialog.alert({
        title: 'Unsupported image',
        message: validationError,
        variant: 'warning',
      })
      return
    }

    setUploading(true)
    try {
      // Single-hero upload: the previous variant-pair path was
      // creating an orphan thumb every time because no caller here
      // consumes the thumb URL. `uploadImage` uploads exactly one
      // storage object. When a session is provided we route through
      // `runUpload` so a late completion after editor close is
      // detected and cleaned up automatically.
      const heroUrl = await runSessionUpload(() => uploadImage(file, folder))
      if (heroUrl === null) return

      if (isCollectionUploader) {
        if (adjustAfterUpload) openFrameEditor(heroUrl, true)
        else onChange(heroUrl)
      } else {
        onChange(heroUrl)
        if (adjustAfterUpload) openFrameEditor(heroUrl)
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

  /**
   * Route uploads through the parent session when one is provided so
   * late completions (uploader done AFTER the editor closed) do not
   * become storage orphans. Returns null when the session detected a
   * late completion and cleaned the result.
   */
  const runSessionUpload = async (work: () => Promise<string>): Promise<string | null> => {
    if (!session) return await work()
    return session.runUpload<string>(
      () => work(),
      url => [url],
    )
  }

  const handleFiles = async (files: File[]) => {
    if (!files.length) return

    if (!multiple) {
      await handleFile(files[0])
      return
    }

    if (files.length > maxFiles) {
      dialog.alert({
        title: 'Too many images',
        message: `You can upload up to ${maxFiles} images at once. You selected ${files.length}.`,
        variant: 'warning',
      })
      return
    }

    const invalidFiles = files
      .map(file => validateFile(file))
      .filter((message): message is string => Boolean(message))

    if (invalidFiles.length) {
      const preview = invalidFiles.slice(0, 5).join('\n')
      const remaining = invalidFiles.length > 5 ? `\n+ ${invalidFiles.length - 5} more invalid file(s)` : ''
      dialog.alert({
        title: 'Some images cannot be uploaded',
        message: `${preview}${remaining}`,
        variant: 'warning',
      })
      return
    }

    setUploading(true)
    setUploadProgress({ completed: 0, total: files.length })

    const uploaded = new Array<string | null>(files.length).fill(null)
    const failed: string[] = []
    let cursor = 0
    let completed = 0

    const worker = async () => {
      while (true) {
        const index = cursor
        cursor += 1
        if (index >= files.length) return

        const file = files[index]
        try {
          // Gallery bulk uploads only need the display asset. Avoid generating
          // and uploading a second unused thumbnail for every gallery photo.
          const url = await runSessionUpload(() => uploadImage(file, folder))
          // A null return means the session was disposed before the
          // upload finished and the result has already been cleaned;
          // treat it as a soft skip rather than a failure.
          if (url !== null) uploaded[index] = url
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error)
          failed.push(file.name)
        } finally {
          completed += 1
          setUploadProgress({ completed, total: files.length })
        }
      }
    }

    try {
      const workerCount = Math.min(BULK_UPLOAD_CONCURRENCY, files.length)
      await Promise.all(Array.from({ length: workerCount }, () => worker()))

      const urls = uploaded.filter((url): url is string => Boolean(url))
      if (urls.length) {
        if (onChangeMany) onChangeMany(urls)
        else urls.forEach(url => onChange(url))
      }

      if (failed.length) {
        dialog.alert({
          title: 'Upload partially completed',
          message: `${urls.length} image(s) uploaded successfully. ${failed.length} failed and can be retried.`,
          variant: 'warning',
        })
      }
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) void handleFiles(files)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length) void handleFiles(files)
  }

  if (compact) {
    return (
      <>
        <div className="relative group">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple={multiple} onChange={handleChange} className="hidden" />

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
                className={`absolute inset-0 flex flex-wrap items-center justify-center gap-1.5 p-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${
                  isDark ? 'bg-black/60' : 'bg-white/70'
                }`}
              >
                <button
                  type="button"
                  onClick={() => openFrameEditor(value)}
                  className={`min-h-[44px] rounded-lg px-2 py-1 text-[10px] font-semibold md:min-h-[32px] ${
                    isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  Frame
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`min-h-[44px] rounded-lg px-2 py-1 text-[10px] font-semibold md:min-h-[32px] ${
                    isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {uploading ? '...' : 'Replace'}
                </button>
                {removable && onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="min-h-[44px] rounded-lg bg-red-500/30 px-2 py-1 text-[10px] font-semibold text-white md:min-h-[32px]"
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
              <span className="text-lg">{uploading ? `${uploadProgress?.completed ?? 0}/${uploadProgress?.total ?? 1}` : 'Add'}</span>
              <span className={`text-[9px] font-medium ${sub}`}>{uploading ? 'Uploading...' : multiple ? 'Add Images' : 'Add Image'}</span>
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
    const logoPreviewMedia = value && ignoreTransformPreview ? stripMediaTransform(value) : value

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
            <div className="flex flex-col gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2.5 shadow-[0_1px_2px_rgba(20,8,50,0.04)] sm:flex-row sm:items-center">
              {/* Thumbnail */}
              <div className="relative flex aspect-[4/3] w-full shrink-0 items-center justify-center overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-4 sm:w-36">
                <FramedImage
                  media={logoPreviewMedia}
                  alt="Logo"
                  className="h-full w-full object-contain mix-blend-multiply"
                  loading="eager"
                  fallbackTransform={{ fit: 'contain' }}
                  onError={e => {
                    ;(e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                <span className="absolute start-2 top-2 rounded-full bg-[var(--admin-surface)]/90 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-success)] ring-1 ring-[var(--admin-border)]">
                  Uploaded
                </span>
              </div>

              {/* Always-visible action stack */}
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <div className="mb-3 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[color-mix(in_srgb,var(--admin-success)_10%,transparent)] px-2 py-1 text-[10px] font-bold text-[var(--admin-success)]">
                      Logo ready
                    </span>
                    <span className="text-[11px] font-medium text-[var(--admin-text-muted)]">
                      Public customer card logo
                    </span>
                  </div>
                  <div className="mt-1.5 truncate font-mono text-[11px] text-[var(--admin-text-muted)]">
                    {stripMediaTransform(value).split('/').pop()?.split('#')[0] || label || 'Customer logo'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <button
                  type="button"
                  onClick={() => openFrameEditor(value)}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[12px] font-bold text-[var(--admin-accent)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)]"
                >
                  Adjust Logo
                </button>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 text-[12px] font-bold text-[var(--admin-accent)] transition hover:border-[var(--admin-accent)] hover:bg-[var(--admin-surface-2)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {uploading ? 'Uploading...' : 'Replace'}
                </button>
                {removable && onRemove && (
                  <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[color-mix(in_srgb,var(--admin-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-danger)_8%,transparent)] px-3 text-[12px] font-bold text-[var(--admin-danger)] transition hover:bg-[color-mix(in_srgb,var(--admin-danger)_12%,transparent)]"
                  >
                    Remove
                  </button>
                )}
              </div>
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
                {uploading ? 'Uploading...' : 'Click or drop logo'}
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

  const compactImageCard = value ? (
    <div className="rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2.5 shadow-[0_1px_2px_rgba(20,8,50,0.04)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] sm:w-36">
          <FramedImage
            media={value}
            alt={label || 'Uploaded image'}
            className="h-full w-full"
            loading="eager"
            fallbackTransform={{ fit: defaultFit }}
          />
          <span className="absolute start-2 top-2 rounded-full bg-[var(--admin-surface)]/90 px-2 py-1 text-[9px] font-extrabold uppercase tracking-[0.12em] text-[var(--admin-success)] ring-1 ring-[var(--admin-border)]">
            Uploaded
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[color-mix(in_srgb,var(--admin-success)_10%,transparent)] px-2 py-1 text-[10px] font-bold text-[var(--admin-success)]">
              Image ready
            </span>
            <span className="text-[11px] font-medium text-[var(--admin-text-muted)]">
              Category card image
            </span>
          </div>
          <div className="mt-1.5 truncate font-mono text-[11px] text-[var(--admin-text-muted)]">
            {value.split('/').pop()?.split('#')[0] || label || 'Category image'}
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
            {removable && onRemove && (
              <button
                type="button"
                onClick={onRemove}
                className="inline-flex min-h-[44px] items-center justify-center rounded-[var(--admin-radius-sm)] border border-[color-mix(in_srgb,var(--admin-danger)_28%,transparent)] bg-[color-mix(in_srgb,var(--admin-danger)_8%,transparent)] px-3 text-[12px] font-bold text-[var(--admin-danger)] transition hover:bg-[color-mix(in_srgb,var(--admin-danger)_12%,transparent)]"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {previewExpanded && (
        <div className="mt-3 overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
          <div className={cn('max-h-[240px]', aspectClass)}>
            <FramedImage
              media={value}
              alt={label || 'Uploaded image preview'}
              className="h-full w-full"
              fallbackTransform={{ fit: defaultFit }}
            />
          </div>
        </div>
      )}
    </div>
  ) : null

  return (
    <>
      <div className={maxWidthClassName}>
        {label && <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>{label}</label>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="hidden" />

        {value && compactPreview ? compactImageCard : value ? (
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
              className={`absolute inset-0 flex flex-wrap items-center justify-center gap-2.5 p-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 ${
                isDark ? 'bg-black/60' : 'bg-white/60'
              }`}
            >
              <button
                type="button"
                onClick={() => openFrameEditor(value)}
                className={`min-h-[44px] rounded-xl px-3.5 py-2 text-[11px] font-semibold md:min-h-[38px] ${
                  isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'
                }`}
              >
                Adjust Frame
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className={`min-h-[44px] rounded-xl px-3.5 py-2 text-[11px] font-semibold md:min-h-[38px] ${
                  isDark ? 'bg-purple-500/40 text-white' : 'bg-violet-100 text-violet-700'
                }`}
              >
                {uploading ? 'Uploading...' : 'Replace'}
              </button>
              {removable && onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="min-h-[44px] rounded-xl bg-red-500/40 px-3.5 py-2 text-[11px] font-semibold text-white md:min-h-[38px]"
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
