import Modal from '../ui/Modal'
import { useTheme } from '../../contexts/ThemeContext'
import type { AdminFact } from './AdminEntityCard'
import AdminActionButton from './AdminActionButton'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export type AdminDetailSection = {
  title: string
  description?: string
  facts?: AdminFact[]
  content?: React.ReactNode
}

interface AdminDetailModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: React.ReactNode
  media?: React.ReactNode
  badges?: React.ReactNode
  summaryFacts?: AdminFact[]
  sections?: AdminDetailSection[]
  actions?: React.ReactNode
  size?: 'lg' | 'xl' | '2xl'
}

export default function AdminDetailModal({
  open,
  onClose,
  title,
  subtitle,
  media,
  badges,
  summaryFacts = [],
  sections = [],
  actions,
  size = 'lg',
}: AdminDetailModalProps) {
  const { isDark } = useTheme()

  return (
    <Modal open={open} onClose={onClose} title={title} size={size}>
      <div className="space-y-4">
        {(media || subtitle || badges) && (
          <div
            className={cn(
              'overflow-hidden rounded-[26px]',
              isDark
                ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(9,13,30,0.98))] ring-1 ring-inset ring-cyan-400/12'
                : 'bg-gray-50/70 ring-1 ring-inset ring-gray-200'
            )}
          >
            {media && <div className={cn(isDark ? 'border-b border-cyan-400/10' : 'border-b border-gray-200')}>{media}</div>}

            <div className="space-y-3 p-4 sm:p-5">
              {subtitle && (
                <p className={cn('max-w-3xl text-sm leading-6', isDark ? 'text-purple-200/72' : 'text-gray-500')}>
                  {subtitle}
                </p>
              )}

              {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
            </div>
          </div>
        )}

        {summaryFacts.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryFacts.map(fact => (
              <div
                key={fact.label}
                className={cn(
                  'rounded-2xl px-4 py-4',
                  isDark ? 'bg-[#0e152f]/94 ring-1 ring-inset ring-cyan-400/10' : 'bg-gray-50/80 ring-1 ring-inset ring-gray-200'
                )}
              >
                <div className={cn('text-[10px] font-mono font-semibold uppercase tracking-[0.16em]', isDark ? 'text-cyan-100/36' : 'text-gray-400')}>
                  {fact.label}
                </div>
                <div className={cn('mt-2 text-sm font-semibold leading-6', isDark ? 'text-white' : 'text-gray-900')}>
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {sections.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map(section => (
              <section
                key={section.title}
                className={cn(
                  'rounded-2xl p-4 sm:p-5',
                  isDark
                    ? 'bg-[linear-gradient(145deg,rgba(11,15,34,0.96),rgba(9,13,30,0.98))] ring-1 ring-inset ring-cyan-400/10'
                    : 'bg-white ring-1 ring-inset ring-gray-200'
                )}
              >
                <h3 className={cn('font-display text-lg font-bold', isDark ? 'text-white' : 'text-gray-900')}>
                  {section.title}
                </h3>
                {section.description && (
                  <p className={cn('mt-1 text-sm', isDark ? 'text-purple-200/65' : 'text-gray-500')}>
                    {section.description}
                  </p>
                )}

                {section.facts && section.facts.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {section.facts.map(fact => (
                      <div key={fact.label} className="flex items-start justify-between gap-4">
                        <div className={cn('text-[11px] font-mono font-semibold uppercase tracking-[0.14em]', isDark ? 'text-cyan-100/36' : 'text-gray-400')}>
                          {fact.label}
                        </div>
                        <div className={cn('max-w-[70%] text-right text-sm leading-6', isDark ? 'text-white' : 'text-gray-800')}>
                          {fact.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.content && <div className="mt-4">{section.content}</div>}
              </section>
            ))}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-2 pt-1">
          <AdminActionButton onClick={onClose}>Cancel</AdminActionButton>
          {actions}
        </div>
      </div>
    </Modal>
  )
}
