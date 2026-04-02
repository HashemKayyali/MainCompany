import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import {
  encodeMediaValue,
  inferMediaKind,
  normalizeMediaTransform,
  parseMediaValue,
  type MediaFit,
  type MediaFrameTransform,
} from '../../utils/media-frame'
import Modal from './Modal'
import FramedImage from './FramedImage'
import FramedVideo from './FramedVideo'
import AdminEditorWorkspace, { AdminEditorSection } from '../admin/AdminEditorWorkspace'

interface Props {
  open: boolean
  media?: string
  title: string
  type?: 'image' | 'video' | 'auto'
  aspectRatio?: number
  defaultFit?: MediaFit
  hint?: string
  contextPreview?: (media: string) => ReactNode
  contextPreviewTitle?: string
  contextPreviewHint?: string
  onApply: (value: string) => void
  onClose: () => void
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function MediaPlacementModal({
  open,
  media = '',
  title,
  type = 'auto',
  aspectRatio = 16 / 9,
  defaultFit = 'cover',
  hint,
  contextPreview,
  contextPreviewTitle = 'Live Card Preview',
  contextPreviewHint,
  onApply,
  onClose,
}: Props) {
  const { isDark } = useTheme()
  const [draft, setDraft] = useState<MediaFrameTransform>(() =>
    normalizeMediaTransform(undefined, { fit: defaultFit })
  )
  const [dragging, setDragging] = useState(false)
  const dragStateRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startX: number
    startY: number
  } | null>(null)

  useEffect(() => {
    if (!open) return
    const parsed = parseMediaValue(media, { fit: defaultFit })
    setDraft(parsed.transform)
    setDragging(false)
    dragStateRef.current = null
  }, [defaultFit, media, open])

  const kind = type === 'auto' ? inferMediaKind(media) : type
  const parsedMedia = useMemo(() => parseMediaValue(media, { fit: defaultFit }), [defaultFit, media])
  const previewMedia = useMemo(
    () => encodeMediaValue(parsedMedia.src, draft),
    [draft, parsedMedia.src]
  )
  const minScale = draft.fit === 'cover' ? 1 : 0.25
  const sub = isDark ? 'text-purple-200/70' : 'text-gray-500'
  const panel = isDark
    ? 'border border-purple-500/20 bg-purple-500/[0.05]'
    : 'border border-violet-100 bg-violet-50/60'

  const apply = () => {
    onApply(encodeMediaValue(parsedMedia.src, draft))
    onClose()
  }

  const updateDraft = (patch: Partial<MediaFrameTransform>) => {
    setDraft(prev => normalizeMediaTransform({ ...prev, ...patch }, { fit: defaultFit }))
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    dragStateRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: draft.x,
      startY: draft.y,
    }
    setDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current
    if (!dragState || dragState.pointerId !== event.pointerId) return

    const rect = event.currentTarget.getBoundingClientRect()
    const deltaX = ((event.clientX - dragState.startClientX) / Math.max(rect.width, 1)) * 100
    const deltaY = ((event.clientY - dragState.startClientY) / Math.max(rect.height, 1)) * 100

    setDraft(prev =>
      normalizeMediaTransform(
        {
          ...prev,
          x: clamp(dragState.startX + deltaX, 0, 100),
          y: clamp(dragState.startY + deltaY, 0, 100),
        },
        { fit: defaultFit }
      )
    )
  }

  const endDrag = (event?: React.PointerEvent<HTMLDivElement>) => {
    if (event && dragStateRef.current?.pointerId === event.pointerId) {
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        // no-op
      }
    }
    dragStateRef.current = null
    setDragging(false)
  }

  const renderMediaFrame = (interactive = false) => (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden rounded-[18px] border',
        interactive ? 'max-w-[24rem]' : 'max-w-[18rem]',
        isDark ? 'border-white/10 bg-black/30' : 'border-white/90 bg-white',
        interactive && (dragging ? 'cursor-grabbing' : 'cursor-grab')
      )}
      style={{ aspectRatio: `${aspectRatio}` }}
      onPointerDown={interactive ? handlePointerDown : undefined}
      onPointerMove={interactive ? handlePointerMove : undefined}
      onPointerUp={interactive ? endDrag : undefined}
      onPointerCancel={interactive ? endDrag : undefined}
    >
      {kind === 'video' ? (
        <FramedVideo
          media={previewMedia}
          className="h-full w-full"
          muted
          loop
          autoPlay
          playsInline
          controls={false}
        />
      ) : (
        <FramedImage media={previewMedia} alt="" className="h-full w-full" />
      )}

      <div
        className={`pointer-events-none absolute inset-0 border ${
          isDark ? 'border-white/10' : 'border-black/5'
        }`}
      />

      {interactive && (
        <>
          <div className="pointer-events-none absolute inset-x-[18%] top-1/2 h-px -translate-y-1/2 bg-white/12" />
          <div className="pointer-events-none absolute inset-y-[18%] left-1/2 w-px -translate-x-1/2 bg-white/12" />
          <div
            className={`pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
              isDark ? 'bg-black/40 text-white/70' : 'bg-white/80 text-gray-600'
            }`}
          >
            Drag to position
          </div>
        </>
      )}
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      persistent
      size="xl"
      bodyClassName="px-3.5 pb-3.5 pt-2.5 sm:px-4 sm:pb-4 sm:pt-3"
    >
      <AdminEditorWorkspace
        preview={
          contextPreview ? (
            <div
              aria-hidden="true"
              className="[&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_textarea]:pointer-events-none [&_select]:pointer-events-none"
            >
              {contextPreview(previewMedia)}
            </div>
          ) : (
            renderMediaFrame(false)
          )
        }
        previewTitle={contextPreview ? contextPreviewTitle : 'Frame Result'}
        previewHint={
          contextPreview
            ? contextPreviewHint || 'Judge zoom, background, and placement inside the real final card context.'
            : hint || 'Adjust placement inside the frame, then apply the final result.'
        }
        previewPaneClassName="xl:max-w-[19rem] xl:justify-self-end"
        previewContentClassName="!p-3.5"
        footer={
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setDraft(normalizeMediaTransform(undefined, { fit: defaultFit }))}
              className="btn-outline !rounded-xl !px-4 !py-2 !text-sm"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline !rounded-xl !px-4 !py-2 !text-sm"
            >
              Keep Current
            </button>
            <button
              type="button"
              onClick={apply}
              className="btn-primary !rounded-xl !px-5 !py-2 !text-xs"
            >
              Apply Frame
            </button>
          </div>
        }
      >
        <AdminEditorSection
          title="Frame Editor"
          hint={hint || 'Adjust fit, zoom, drag position, and verify the real final output on the right.'}
        >
          {renderMediaFrame(true)}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateDraft({ fit: 'cover', scale: Math.max(draft.scale, 1) })}
              className={`rounded-xl px-3 py-2 text-[10.5px] font-semibold ${
                draft.fit === 'cover'
                  ? isDark
                    ? 'border border-prism-violet/35 bg-prism-violet/20 text-prism-violet'
                    : 'border border-violet-200 bg-violet-100 text-violet-700'
                  : isDark
                    ? 'border border-white/10 bg-white/[0.04] text-purple-200/80'
                    : 'border border-gray-200 bg-white text-gray-600'
              }`}
            >
              Fill Frame
            </button>
            <button
              type="button"
              onClick={() => updateDraft({ fit: 'contain' })}
              className={`rounded-xl px-3 py-2 text-[10.5px] font-semibold ${
                draft.fit === 'contain'
                  ? isDark
                    ? 'border border-prism-violet/35 bg-prism-violet/20 text-prism-violet'
                    : 'border border-violet-200 bg-violet-100 text-violet-700'
                  : isDark
                    ? 'border border-white/10 bg-white/[0.04] text-purple-200/80'
                    : 'border border-gray-200 bg-white text-gray-600'
              }`}
            >
              Fit Inside
            </button>
            <button
              type="button"
              onClick={() => updateDraft({ x: 50, y: 50 })}
              className={`rounded-xl px-3 py-2 text-[10.5px] font-semibold ${
                isDark
                  ? 'border border-white/10 bg-white/[0.04] text-purple-200/80'
                  : 'border border-gray-200 bg-white text-gray-600'
              }`}
            >
              Center
            </button>
          </div>
        </AdminEditorSection>

        <AdminEditorSection title="Position Controls" contentClassName="grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <div className={`rounded-[18px] p-3 ${panel}`}>
              <div className="mb-2 flex items-center justify-between">
                <label className={`text-[11px] font-medium ${sub}`}>Zoom</label>
                <span className={`text-[10px] font-mono ${sub}`}>{draft.scale.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min={minScale}
                max={4}
                step={0.01}
                value={draft.scale}
                onChange={e => updateDraft({ scale: Number(e.target.value) })}
                className="w-full"
              />
            </div>

            <div className={`rounded-[18px] p-3 ${panel}`}>
              <div className="mb-2 flex items-center justify-between">
                <label className={`text-[11px] font-medium ${sub}`}>Horizontal Position</label>
                <span className={`text-[10px] font-mono ${sub}`}>{draft.x.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={draft.x}
                onChange={e => updateDraft({ x: Number(e.target.value) })}
                className="w-full"
              />
              <div className="mt-2 flex gap-2">
                {[['Left', 0], ['Center', 50], ['Right', 100]].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateDraft({ x: Number(value) })}
                    className={`rounded-xl px-2.5 py-1.5 text-[10px] font-semibold ${
                      isDark
                        ? 'border border-white/10 bg-white/[0.04] text-purple-200/80'
                        : 'border border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={`rounded-[18px] p-3 ${panel}`}>
              <div className="mb-2 flex items-center justify-between">
                <label className={`text-[11px] font-medium ${sub}`}>Vertical Position</label>
                <span className={`text-[10px] font-mono ${sub}`}>{draft.y.toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={draft.y}
                onChange={e => updateDraft({ y: Number(e.target.value) })}
                className="w-full"
              />
              <div className="mt-2 flex gap-2">
                {[['Top', 0], ['Middle', 50], ['Bottom', 100]].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateDraft({ y: Number(value) })}
                    className={`rounded-xl px-2.5 py-1.5 text-[10px] font-semibold ${
                      isDark
                        ? 'border border-white/10 bg-white/[0.04] text-purple-200/80'
                        : 'border border-gray-200 bg-white text-gray-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {kind === 'image' ? (
            <div className="space-y-3">
              <div className={`rounded-[18px] p-3 ${panel}`}>
                <div className="mb-2 flex items-center justify-between">
                  <label className={`text-[11px] font-medium ${sub}`}>Background Color</label>
                  <span className={`text-[10px] font-mono ${sub}`}>{draft.bgOpacity > 0 ? 'Enabled' : 'Transparent'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={draft.bgColor}
                    onChange={e => updateDraft({ bgColor: e.target.value, bgOpacity: draft.bgOpacity > 0 ? draft.bgOpacity : 0.85 })}
                    className="h-10 w-12 cursor-pointer rounded-xl border-0 bg-transparent p-0"
                  />
                  <div className="flex flex-wrap gap-2">
                    {['#0b1020', '#ffffff', '#7c3aed', '#22d3ee'].map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateDraft({ bgColor: color, bgOpacity: draft.bgOpacity > 0 ? draft.bgOpacity : 0.85 })}
                        className="h-8 w-8 rounded-full border border-white/15"
                        style={{ backgroundColor: color }}
                        aria-label={`Set background ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className={`rounded-[18px] p-3 ${panel}`}>
                <div className="mb-2 flex items-center justify-between">
                  <label className={`text-[11px] font-medium ${sub}`}>Background Opacity</label>
                  <span className={`text-[10px] font-mono ${sub}`}>{Math.round(draft.bgOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(draft.bgOpacity * 100)}
                  onChange={e => updateDraft({ bgOpacity: Number(e.target.value) / 100 })}
                  className="w-full"
                />
                <div className="mt-2 flex gap-2">
                  {[['Off', 0], ['Soft', 35], ['Strong', 85]].map(([label, value]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => updateDraft({ bgOpacity: Number(value) / 100 })}
                      className={`rounded-xl px-2.5 py-1.5 text-[10px] font-semibold ${
                        isDark
                          ? 'border border-white/10 bg-white/[0.04] text-purple-200/80'
                          : 'border border-gray-200 bg-white text-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-[18px] p-3 ${panel}`}>
              <div className={cn('text-[11px] font-medium', sub)}>Frame Tips</div>
              <p className={cn('mt-2 text-[10.5px] leading-5', sub)}>
                Use drag for quick framing, then fine tune with the sliders. "Fit Inside" keeps the full asset visible, while "Fill Frame" prioritizes edge-to-edge coverage.
              </p>
            </div>
          )}
        </AdminEditorSection>
      </AdminEditorWorkspace>
    </Modal>
  )
}

