import { useEffect, useMemo, useState, type InputHTMLAttributes, type ReactNode } from 'react'
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
import AdminButton from '../admin/primitives/AdminButton'
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

function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--admin-accent)]">
      {children}
    </div>
  )
}

function ValuePill({ children, uppercase = false }: { children: ReactNode; uppercase?: boolean }) {
  return (
    <span
      className={cn(
        'rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-1.5 py-0.5 font-mono text-[10.5px] font-bold text-[var(--admin-accent)]',
        uppercase && 'uppercase'
      )}
    >
      {children}
    </span>
  )
}

function FrameSlider({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="frame-slider-hit">
      <input {...props} type="range" className={cn('frame-slider', className)} />
    </div>
  )
}

function SnapRow({
  options,
  isActive,
  onSelect,
}: {
  options: Array<[string, number]>
  isActive: (value: number) => boolean
  onSelect: (value: number) => void
}) {
  return (
    <div className="mt-2 flex gap-1.5">
      {options.map(([label, value]) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(value)}
          className={cn(
            'inline-flex min-h-[40px] flex-1 items-center justify-center rounded-[8px] border px-2 text-[10.5px] font-bold transition md:min-h-[32px]',
            isActive(value)
              ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
              : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)]'
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function MediaPlacementModal({
  open,
  media = '',
  title,
  type = 'auto',
  aspectRatio = 4 / 3,
  defaultFit = 'cover',
  hint,
  contextPreview,
  contextPreviewTitle = 'Card result',
  contextPreviewHint,
  onApply,
  onClose,
}: Props) {
  const [draft, setDraft] = useState<MediaFrameTransform>(() =>
    normalizeMediaTransform(undefined, { fit: defaultFit })
  )

  useEffect(() => {
    if (!open) return
    const parsed = parseMediaValue(media, { fit: defaultFit })
    setDraft(parsed.transform)
  }, [defaultFit, media, open])

  const kind = type === 'auto' ? inferMediaKind(media) : type
  const parsedMedia = useMemo(() => parseMediaValue(media, { fit: defaultFit }), [defaultFit, media])
  const previewMedia = useMemo(
    () => encodeMediaValue(parsedMedia.src, draft, { previewSrc: parsedMedia.previewSrc }),
    [draft, parsedMedia.previewSrc, parsedMedia.src]
  )
  const minScale = draft.fit === 'cover' ? 1 : 0.25

  const apply = () => {
    onApply(encodeMediaValue(parsedMedia.src, draft, { previewSrc: parsedMedia.previewSrc }))
    onClose()
  }

  const reset = () => setDraft(normalizeMediaTransform(undefined, { fit: defaultFit }))

  const updateDraft = (patch: Partial<MediaFrameTransform>) => {
    setDraft(prev => normalizeMediaTransform({ ...prev, ...patch }, { fit: defaultFit }))
  }

  const renderCanvas = (compact = false) => (
    <div
      className={cn(
        'relative mx-auto w-full overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]',
        compact ? 'max-w-[18rem]' : 'max-w-[31rem]'
      )}
      style={{ aspectRatio: `${aspectRatio}` }}
    >
      {kind === 'video' ? (
        <FramedVideo media={previewMedia} className="h-full w-full" muted loop autoPlay playsInline controls={false} />
      ) : (
        <FramedImage media={previewMedia} alt="" className="h-full w-full" />
      )}

      <div className="pointer-events-none absolute inset-x-[14%] top-1/2 h-px -translate-y-1/2 bg-[var(--admin-accent)]/40" />
      <div className="pointer-events-none absolute inset-y-[14%] left-1/2 w-px -translate-x-1/2 bg-[var(--admin-accent)]/40" />
      <div className="pointer-events-none absolute inset-1 rounded-[var(--admin-radius-sm)] ring-1 ring-inset ring-[var(--admin-accent)]/25" />
    </div>
  )

  const fitButtons: Array<{ label: string; hint: string; active: boolean; onClick: () => void }> = [
    { label: 'Fill card', hint: 'Edge to edge', active: draft.fit === 'cover', onClick: () => updateDraft({ fit: 'cover', scale: Math.max(draft.scale, 1) }) },
    { label: 'Fit inside', hint: 'Show all', active: draft.fit === 'contain', onClick: () => updateDraft({ fit: 'contain' }) },
    { label: 'Center', hint: 'Reset position', active: false, onClick: () => updateDraft({ x: 50, y: 50 }) },
    { label: 'Reset', hint: 'Start over', active: false, onClick: reset },
  ]

  const renderFitButtons = (compact = false) => (
    <div className={cn('grid gap-1.5', compact ? 'grid-cols-4' : 'grid-cols-2 sm:grid-cols-4')}>
      {fitButtons.map(button => (
        <button
          key={button.label}
          type="button"
          onClick={button.onClick}
          className={cn(
            'flex flex-col items-center justify-center rounded-[var(--admin-radius-sm)] border text-center transition',
            compact ? 'min-h-[38px] px-1 py-1' : 'min-h-[40px] px-2 py-1',
            button.active
              ? 'border-[var(--admin-accent)] bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]'
              : 'border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-muted)] hover:border-[var(--admin-accent)]'
          )}
        >
          <span className={cn('font-bold', compact ? 'text-[10px]' : 'text-[11.5px]')}>{button.label}</span>
          {!compact && <span className="text-[9px] font-semibold uppercase tracking-[0.08em] opacity-70">{button.hint}</span>}
        </button>
      ))}
    </div>
  )

  const renderCanvasCard = () => (
    <div className="admin-card space-y-2.5 p-2.5 xl:p-3">
      <div>
        <GroupLabel>Framing canvas</GroupLabel>
        <p className="mt-1 text-[11.5px] leading-[1.5] text-[var(--admin-text-muted)]">
          {hint || 'Use the controls to choose what stays visible in the final card.'}
        </p>
      </div>
      {renderCanvas()}
      {renderFitButtons()}
    </div>
  )

  const renderContextCard = () => (
    <div className="admin-card relative z-0 isolate space-y-2 p-2.5 xl:p-3">
      <div>
        <GroupLabel>{contextPreview ? contextPreviewTitle : 'Card result'}</GroupLabel>
        {contextPreviewHint && (
          <p className="mt-1 text-[11px] leading-[1.5] text-[var(--admin-text-muted)]">{contextPreviewHint}</p>
        )}
      </div>
      {contextPreview ? (
        <div
          aria-hidden="true"
          className="frame-context-preview mx-auto w-full max-w-[300px] [&_a]:pointer-events-none [&_button]:pointer-events-none [&_input]:pointer-events-none [&_select]:pointer-events-none [&_textarea]:pointer-events-none"
        >
          {contextPreview(previewMedia)}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[15rem] overflow-hidden rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)]" style={{ aspectRatio: `${aspectRatio}` }}>
          {kind === 'video' ? (
            <FramedVideo media={previewMedia} className="h-full w-full" muted loop autoPlay playsInline controls={false} />
          ) : (
            <FramedImage media={previewMedia} alt="" className="h-full w-full" />
          )}
        </div>
      )}
    </div>
  )

  const renderControlsPanel = () => (
    <div className="admin-card relative z-0 isolate p-2.5 xl:p-3">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
        <div className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11.5px] font-bold text-[var(--admin-text)]">Zoom</label>
            <ValuePill>{draft.scale.toFixed(2)}x</ValuePill>
          </div>
          <FrameSlider
            min={minScale}
            max={4}
            step={0.01}
            value={draft.scale}
            onChange={e => updateDraft({ scale: Number(e.currentTarget.value) })}
            aria-label="Zoom"
          />
        </div>

        <div className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11.5px] font-bold text-[var(--admin-text)]">Horizontal (X)</label>
            <ValuePill>{draft.x.toFixed(0)}%</ValuePill>
          </div>
          <FrameSlider
            min={0}
            max={100}
            step={1}
            value={draft.x}
            onChange={e => updateDraft({ x: Number(e.currentTarget.value) })}
            aria-label="Horizontal position"
          />
          <SnapRow options={[['Left', 0], ['Center', 50], ['Right', 100]]} isActive={value => Math.round(draft.x) === value} onSelect={value => updateDraft({ x: value })} />
        </div>

        <div className="min-w-0">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-[11.5px] font-bold text-[var(--admin-text)]">Vertical (Y)</label>
            <ValuePill>{draft.y.toFixed(0)}%</ValuePill>
          </div>
          <FrameSlider
            min={0}
            max={100}
            step={1}
            value={draft.y}
            onChange={e => updateDraft({ y: Number(e.currentTarget.value) })}
            aria-label="Vertical position"
          />
          <SnapRow options={[['Top', 0], ['Middle', 50], ['Bottom', 100]]} isActive={value => Math.round(draft.y) === value} onSelect={value => updateDraft({ y: value })} />
        </div>

        {kind === 'image' && (
          <>
            <div className="min-w-0">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11.5px] font-bold text-[var(--admin-text)]">Background color</label>
                <ValuePill uppercase>{draft.bgOpacity > 0 ? 'On' : 'Off'}</ValuePill>
              </div>
              <div className="flex items-center gap-2.5">
                <label className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[10px] border border-[var(--admin-border)] md:h-9 md:w-9" style={{ backgroundColor: draft.bgColor }}>
                  <input
                    type="color"
                    value={draft.bgColor}
                    onChange={e => updateDraft({ bgColor: e.target.value, bgOpacity: draft.bgOpacity > 0 ? draft.bgOpacity : 0.85 })}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Pick custom background color"
                  />
                </label>
                <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                  {['#ffffff', '#f7f1ff', '#0b1020', '#7c3aed', '#22d3ee'].map(color => {
                    const active = draft.bgColor.toLowerCase() === color.toLowerCase()
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => updateDraft({ bgColor: color, bgOpacity: draft.bgOpacity > 0 ? draft.bgOpacity : 0.85 })}
                        className={cn(
                          'h-10 w-10 rounded-full transition-transform md:h-8 md:w-8 xl:h-7 xl:w-7',
                          active
                            ? 'ring-2 ring-[var(--admin-accent)] ring-offset-2 ring-offset-[var(--admin-surface)]'
                            : 'ring-1 ring-[var(--admin-border)] hover:scale-105'
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

            <div className="min-w-0">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11.5px] font-bold text-[var(--admin-text)]">Background opacity</label>
                <ValuePill>{Math.round(draft.bgOpacity * 100)}%</ValuePill>
              </div>
              <FrameSlider
                min={0}
                max={100}
                step={1}
                value={Math.round(draft.bgOpacity * 100)}
                onChange={e => updateDraft({ bgOpacity: Number(e.currentTarget.value) / 100 })}
                aria-label="Background opacity"
              />
              <SnapRow options={[['Off', 0], ['Soft', 35], ['Strong', 85]]} isActive={value => Math.round(draft.bgOpacity * 100) === value} onSelect={value => updateDraft({ bgOpacity: value / 100 })} />
            </div>
          </>
        )}
      </div>
    </div>
  )

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      persistent
      size="3xl"
      overlayClassName="media-placement-overlay"
      contentClassName="media-placement-modal sm:!max-w-[calc(100vw-1rem)] 2xl:!max-w-[90rem]"
      bodyClassName="media-placement-body px-0 pb-3 pt-0 md:px-4 md:pb-4 md:pt-3"
      footer={
        <div className="admin-scope flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          <AdminButton variant="ghost" onClick={reset} className="sm:min-w-[96px]">
            Reset
          </AdminButton>
          <AdminButton variant="outline" onClick={onClose} className="sm:min-w-[120px]">
            Keep Current
          </AdminButton>
          <AdminButton onClick={apply} className="sm:min-w-[130px]">
            Apply Frame
          </AdminButton>
        </div>
      }
    >
      <div className="admin-scope md:hidden">
        <div className="media-placement-mobile-sticky sticky top-0 z-40 isolate border-b border-[var(--admin-border)] bg-white px-3 pb-2.5 pt-3">
          <div className="space-y-2">
            {renderCanvas(true)}
            {renderFitButtons(true)}
          </div>
        </div>
        <div className="relative z-0 space-y-3 px-3 pt-3">
          {renderControlsPanel()}
          {renderContextCard()}
        </div>
      </div>

      <div className="admin-scope hidden items-start gap-3 md:grid md:grid-cols-[minmax(360px,1fr)_minmax(280px,320px)] xl:justify-center xl:grid-cols-[minmax(400px,520px)_minmax(280px,320px)_minmax(300px,320px)]">
        <div className="min-w-0 md:sticky md:top-0">{renderCanvasCard()}</div>
        <div className="min-w-0 md:sticky md:top-0">{renderControlsPanel()}</div>
        <div className="min-w-0 md:col-span-2 xl:sticky xl:top-0 xl:col-span-1">{renderContextCard()}</div>
      </div>
    </Modal>
  )
}
