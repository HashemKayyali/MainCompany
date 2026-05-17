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
import { cn } from '../../utils/cn'

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
  const sub = isDark ? 'text-purple-200/70' : 'text-[#211049]'
  const panel = isDark
    ? 'border border-purple-500/20 bg-purple-500/[0.05]'
    : 'border border-violet-200/80 bg-white shadow-[0_1px_2px_rgba(20,8,50,0.04),0_8px_18px_-12px_rgba(89,23,196,0.18)]'

  // Premium fit-mode button styling — clear active state with strong purple.
  const fitBtnBase =
    'inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[12px] border px-3.5 text-[11.5px] font-bold transition'
  const fitBtnActive = isDark
    ? 'border-prism-violet/45 bg-prism-violet/22 text-prism-violet shadow-[0_8px_18px_-8px_rgba(124,58,237,0.45)]'
    : 'border-violet-500 bg-[linear-gradient(135deg,rgba(113,38,227,0.16),rgba(168,85,247,0.10))] text-[#2e0a72] shadow-[0_8px_22px_-8px_rgba(89,23,196,0.32)]'
  const fitBtnInactive = isDark
    ? 'border-white/10 bg-white/[0.04] text-purple-200/80 hover:bg-white/[0.06]'
    : 'border-violet-200/80 bg-white text-[#211049] hover:border-violet-400 hover:text-[#07041a]'

  // Position-snap pill buttons (Left / Center / Right etc.)
  const snapBtnClass = (active: boolean) =>
    cn(
      'inline-flex min-h-[30px] flex-1 items-center justify-center rounded-[10px] border px-2.5 text-[10.5px] font-bold transition',
      active
        ? isDark
          ? 'border-prism-violet/45 bg-prism-violet/22 text-prism-violet'
          : 'border-violet-400 bg-violet-100 text-[#2e0a72]'
        : isDark
          ? 'border-white/10 bg-white/[0.04] text-purple-200/80'
          : 'border-violet-200/70 bg-white text-[#211049] hover:border-violet-300 hover:bg-violet-50'
    )

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
        interactive ? 'max-w-[20rem] sm:max-w-[22rem]' : 'max-w-[15rem] sm:max-w-[16rem]',
        isDark
          ? 'border-white/10 bg-black/30'
          : 'border-violet-200/80 bg-[linear-gradient(135deg,rgba(250,247,255,1),rgba(244,236,255,0.92))] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6),0_10px_28px_-14px_rgba(89,23,196,0.18)]',
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

      {interactive && (
        <>
          {/* Crosshair guides */}
          <div className="pointer-events-none absolute inset-x-[14%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          <div className="pointer-events-none absolute inset-y-[14%] left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-violet-400/50 to-transparent" />
          {/* Frame boundary highlight */}
          <div className="pointer-events-none absolute inset-1 rounded-[14px] ring-1 ring-inset ring-violet-300/40" />
          {/* Drag hint */}
          <div
            className={cn(
              'pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] backdrop-blur-sm',
              isDark
                ? 'border-white/10 bg-black/45 text-white/80'
                : 'border-violet-300/60 bg-white/90 text-[#2e0a72]'
            )}
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
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDraft(normalizeMediaTransform(undefined, { fit: defaultFit }))}
              className="inline-flex min-h-[38px] items-center justify-center rounded-[12px] border border-violet-200 bg-white px-3.5 text-[11.5px] font-bold text-[#211049] transition hover:border-violet-400 hover:bg-violet-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[38px] items-center justify-center rounded-[12px] border border-violet-200 bg-white px-3.5 text-[11.5px] font-bold text-[#211049] transition hover:border-violet-400 hover:bg-violet-50"
            >
              Keep Current
            </button>
            <button
              type="button"
              onClick={apply}
              className="btn-primary !min-h-[38px] !rounded-[12px] !px-5 !text-[11.5px]"
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

          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => updateDraft({ fit: 'cover', scale: Math.max(draft.scale, 1) })}
              className={cn(fitBtnBase, draft.fit === 'cover' ? fitBtnActive : fitBtnInactive)}
            >
              Fill Frame
            </button>
            <button
              type="button"
              onClick={() => updateDraft({ fit: 'contain' })}
              className={cn(fitBtnBase, draft.fit === 'contain' ? fitBtnActive : fitBtnInactive)}
            >
              Fit Inside
            </button>
            <button
              type="button"
              onClick={() => updateDraft({ x: 50, y: 50 })}
              className={cn(fitBtnBase, fitBtnInactive)}
            >
              Center
            </button>
          </div>
        </AdminEditorSection>

        <AdminEditorSection title="Position Controls" contentClassName="grid gap-3 xl:grid-cols-2">
          <div className="space-y-3">
            <div className={cn('rounded-[14px] p-3', panel)}>
              <div className="mb-2.5 flex items-center justify-between">
                <label className={cn('text-[11.5px] font-bold', isDark ? sub : 'text-[#07041a]')}>Zoom</label>
                <span className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-bold', isDark ? 'border-white/10 bg-white/[0.04] text-purple-200/85' : 'border-violet-200 bg-violet-50 text-[#2e0a72]')}>
                  {draft.scale.toFixed(2)}×
                </span>
              </div>
              <input
                type="range"
                min={minScale}
                max={4}
                step={0.01}
                value={draft.scale}
                onChange={e => updateDraft({ scale: Number(e.target.value) })}
                className="frame-slider"
              />
            </div>

            <div className={cn('rounded-[14px] p-3', panel)}>
              <div className="mb-2.5 flex items-center justify-between">
                <label className={cn('text-[11.5px] font-bold', isDark ? sub : 'text-[#07041a]')}>Horizontal</label>
                <span className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-bold', isDark ? 'border-white/10 bg-white/[0.04] text-purple-200/85' : 'border-violet-200 bg-violet-50 text-[#2e0a72]')}>
                  {draft.x.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={draft.x}
                onChange={e => updateDraft({ x: Number(e.target.value) })}
                className="frame-slider"
              />
              <div className="mt-2.5 flex gap-1.5">
                {[['Left', 0], ['Center', 50], ['Right', 100]].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateDraft({ x: Number(value) })}
                    className={snapBtnClass(Math.round(draft.x) === Number(value))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={cn('rounded-[14px] p-3', panel)}>
              <div className="mb-2.5 flex items-center justify-between">
                <label className={cn('text-[11.5px] font-bold', isDark ? sub : 'text-[#07041a]')}>Vertical</label>
                <span className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-bold', isDark ? 'border-white/10 bg-white/[0.04] text-purple-200/85' : 'border-violet-200 bg-violet-50 text-[#2e0a72]')}>
                  {draft.y.toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={draft.y}
                onChange={e => updateDraft({ y: Number(e.target.value) })}
                className="frame-slider"
              />
              <div className="mt-2.5 flex gap-1.5">
                {[['Top', 0], ['Middle', 50], ['Bottom', 100]].map(([label, value]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => updateDraft({ y: Number(value) })}
                    className={snapBtnClass(Math.round(draft.y) === Number(value))}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {kind === 'image' ? (
            <div className="space-y-3">
              <div className={cn('rounded-[14px] p-3', panel)}>
                <div className="mb-2.5 flex items-center justify-between">
                  <label className={cn('text-[11.5px] font-bold', isDark ? sub : 'text-[#07041a]')}>Background</label>
                  <span className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em]', isDark ? 'border-white/10 bg-white/[0.04] text-purple-200/85' : 'border-violet-200 bg-violet-50 text-[#2e0a72]')}>
                    {draft.bgOpacity > 0 ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <label className="relative inline-flex h-9 w-9 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-violet-200 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.6)]" style={{ backgroundColor: draft.bgColor }}>
                    <input
                      type="color"
                      value={draft.bgColor}
                      onChange={e => updateDraft({ bgColor: e.target.value, bgOpacity: draft.bgOpacity > 0 ? draft.bgOpacity : 0.85 })}
                      className="absolute inset-0 cursor-pointer opacity-0"
                      aria-label="Pick custom background color"
                    />
                  </label>
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {['#ffffff', '#f7f1ff', '#0b1020', '#7c3aed', '#22d3ee'].map(color => {
                      const active = draft.bgColor.toLowerCase() === color.toLowerCase()
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => updateDraft({ bgColor: color, bgOpacity: draft.bgOpacity > 0 ? draft.bgOpacity : 0.85 })}
                          className={cn(
                            'h-8 w-8 rounded-full transition-transform',
                            active
                              ? 'ring-2 ring-offset-2 ring-violet-600 ring-offset-white scale-[1.06]'
                              : 'ring-1 ring-violet-200 hover:scale-[1.04]'
                          )}
                          style={{ backgroundColor: color }}
                          aria-label={`Set background ${color}`}
                          aria-pressed={active}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className={cn('rounded-[14px] p-3', panel)}>
                <div className="mb-2.5 flex items-center justify-between">
                  <label className={cn('text-[11.5px] font-bold', isDark ? sub : 'text-[#07041a]')}>Bg Opacity</label>
                  <span className={cn('rounded-md border px-1.5 py-0.5 font-mono text-[10.5px] font-bold', isDark ? 'border-white/10 bg-white/[0.04] text-purple-200/85' : 'border-violet-200 bg-violet-50 text-[#2e0a72]')}>
                    {Math.round(draft.bgOpacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(draft.bgOpacity * 100)}
                  onChange={e => updateDraft({ bgOpacity: Number(e.target.value) / 100 })}
                  className="frame-slider"
                />
                <div className="mt-2.5 flex gap-1.5">
                  {[['Off', 0], ['Soft', 35], ['Strong', 85]].map(([label, value]) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => updateDraft({ bgOpacity: Number(value) / 100 })}
                      className={snapBtnClass(Math.round(draft.bgOpacity * 100) === Number(value))}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className={cn('rounded-[14px] p-3', panel)}>
              <div className={cn('text-[11.5px] font-bold', isDark ? sub : 'text-[#07041a]')}>Frame Tips</div>
              <p className={cn('mt-2 text-[11px] leading-[1.55]', sub)}>
                Drag the canvas to position, then fine-tune with the sliders. <span className="font-semibold">Fit Inside</span> keeps the full asset visible; <span className="font-semibold">Fill Frame</span> goes edge-to-edge.
              </p>
            </div>
          )}
        </AdminEditorSection>
      </AdminEditorWorkspace>
    </Modal>
  )
}

