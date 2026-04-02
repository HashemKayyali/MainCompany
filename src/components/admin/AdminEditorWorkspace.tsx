import type { ReactNode } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

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

export function AdminEditorSection({
  title,
  hint,
  children,
  className = '',
  contentClassName = '',
}: AdminEditorSectionProps) {
  const { isDark } = useTheme()

  return (
    <section
      className={cn(
        'rounded-[18px] p-3 sm:p-3.5',
        isDark
          ? 'border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(14,19,40,0.92),rgba(9,13,28,0.96))] shadow-[0_22px_54px_-40px_rgba(34,211,238,0.18)]'
          : 'border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      {(title || hint) && (
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            {title ? (
              <h3 className={cn('text-[12.5px] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{title}</h3>
            ) : null}
            {hint ? (
              <p className={cn('mt-1 text-[10px] leading-[1.26rem]', isDark ? 'text-purple-200/60' : 'text-gray-500')}>
                {hint}
              </p>
            ) : null}
          </div>
        </div>
      )}

      <div className={cn('space-y-3', contentClassName)}>{children}</div>
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
  const { isDark } = useTheme()

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'grid min-h-0 items-start gap-3 xl:grid-cols-[minmax(0,1.06fr)_minmax(236px,0.74fr)]',
          preview ? '' : 'grid-cols-1'
        )}
      >
        <div className={cn('min-w-0 space-y-3', formPaneClassName)}>{children}</div>

        {preview ? (
          <aside className={cn('min-w-0 xl:sticky xl:top-2 xl:self-start', previewPaneClassName)}>
            <div
              className={cn(
                'rounded-[18px] p-3 sm:p-3.5',
                isDark
                  ? 'border border-cyan-400/12 bg-[linear-gradient(180deg,rgba(11,16,34,0.96),rgba(7,10,24,0.98))] shadow-[0_28px_72px_-56px_rgba(34,211,238,0.25)]'
                  : 'border border-gray-200 bg-white shadow-sm',
                previewContentClassName
              )}
            >
              <div className="mb-2">
                <div className={cn('text-[8.75px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-cyan-200/78' : 'text-violet-700/75')}>
                  {previewTitle}
                </div>
                {previewHint ? (
                  <p className={cn('mt-1 text-[10px] leading-[1.24rem]', isDark ? 'text-purple-200/58' : 'text-gray-500')}>
                    {previewHint}
                  </p>
                ) : null}
              </div>
              <div className="min-w-0">{preview}</div>
            </div>
          </aside>
        ) : null}
      </div>

      {footer ? (
        <div
          className={cn(
            'sticky bottom-0 z-10 rounded-[17px] border px-3.5 py-2.5 backdrop-blur-xl sm:px-4',
            isDark
              ? 'border-cyan-400/12 bg-[linear-gradient(180deg,rgba(8,12,27,0.9),rgba(7,10,23,0.96))] shadow-[0_-20px_36px_-30px_rgba(4,8,20,0.9)]'
              : 'border-gray-200 bg-white/92 shadow-[0_-12px_28px_-20px_rgba(15,23,42,0.14)]'
          )}
        >
          {footer}
        </div>
      ) : null}
    </div>
  )
}
