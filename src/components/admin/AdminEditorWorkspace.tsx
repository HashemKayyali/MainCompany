import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface AdminEditorWorkspaceProps {
  children: ReactNode
  preview?: ReactNode
  previewTitle?: string
  previewHint?: string
  footer?: ReactNode
  className?: string
  formPaneClassName?: string
  previewPaneClassName?: string
  previewContentClassName?: string
}

interface AdminEditorSectionProps {
  title?: string
  hint?: string
  children: ReactNode
  className?: string
  contentClassName?: string
}

// Light-only section card used inside every admin Add/Edit modal.
export function AdminEditorSection({
  title,
  hint,
  children,
  className = '',
  contentClassName = '',
}: AdminEditorSectionProps) {
  return (
    <section
      className={cn(
        'rounded-[18px] border border-violet-200/70 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(89,23,196,0.18)] sm:p-5',
        className
      )}
    >
      {(title || hint) && (
        <div className="mb-4 flex items-start gap-3 border-b border-violet-100 pb-3.5">
          <span
            aria-hidden="true"
            className="mt-1 h-[1.05rem] w-[3px] shrink-0 rounded-full bg-[linear-gradient(180deg,#7c3aed,#9d6bff)]"
          />
          <div className="min-w-0">
            {title ? (
              <h3 className="font-display text-[1.05rem] font-extrabold tracking-[-0.01em] text-[#1a0b3d]">
                {title}
              </h3>
            ) : null}
            {hint ? (
              <p className="mt-1 text-[12px] leading-5 text-[#4b3a63]">{hint}</p>
            ) : null}
          </div>
        </div>
      )}

      <div className={cn('space-y-4', contentClassName)}>{children}</div>
    </section>
  )
}

export default function AdminEditorWorkspace({
  children,
  preview,
  previewTitle = 'Live Preview',
  previewHint,
  footer,
  className = '',
  formPaneClassName = '',
  previewPaneClassName = '',
  previewContentClassName = '',
}: AdminEditorWorkspaceProps) {
  return (
    <div className={cn('admin-scope space-y-4', className)}>
      <div
        className={cn(
          'grid min-h-0 items-start gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(248px,0.72fr)]',
          preview ? '' : 'grid-cols-1'
        )}
      >
        <div className={cn('min-w-0 space-y-4', formPaneClassName)}>{children}</div>

        {preview ? (
          <aside className={cn('min-w-0 xl:sticky xl:top-2 xl:self-start', previewPaneClassName)}>
            <div
              className={cn(
                'rounded-[18px] border border-violet-200/70 bg-[linear-gradient(180deg,#ffffff,#faf6ff)] p-4 shadow-[0_10px_28px_-18px_rgba(89,23,196,0.20)] sm:p-5',
                previewContentClassName
              )}
            >
              <div className="mb-3 border-b border-violet-100 pb-3">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#7126e3]">
                    {previewTitle}
                  </div>
                </div>
                {previewHint ? (
                  <p className="mt-1.5 text-[11.5px] leading-5 text-[#4b3a63]">{previewHint}</p>
                ) : null}
              </div>
              <div className="min-w-0">{preview}</div>
            </div>
          </aside>
        ) : null}
      </div>

      {footer ? (
        <div className="sticky bottom-0 z-10 rounded-[16px] border border-violet-200/70 bg-white/95 px-4 py-3 shadow-[0_-10px_28px_-20px_rgba(89,23,196,0.22)] backdrop-blur-xl">
          {footer}
        </div>
      ) : null}
    </div>
  )
}
