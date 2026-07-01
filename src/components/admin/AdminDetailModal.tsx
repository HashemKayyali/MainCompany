import Modal from '../ui/Modal'
import type { AdminFact } from './AdminEntityCard'
import AdminActionButton from './AdminActionButton'
import { cn } from '../../utils/cn'

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

// Light-only detail modal: clean media/summary header, readable facts
// grid, organised sections, tidy footer (Cancel + custom actions).
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
  return (
    <Modal open={open} onClose={onClose} title={title} size={size}>
      <div className="admin-scope space-y-4">
        {(media || subtitle || badges) && (
          <div className="overflow-hidden rounded-[18px] border border-violet-200/70 bg-[linear-gradient(180deg,#ffffff,#faf6ff)]">
            {media && <div className="border-b border-violet-100">{media}</div>}
            {(subtitle || badges) && (
              <div className="space-y-3 p-4 sm:p-5">
                {subtitle && (
                  <p className="max-w-3xl text-[13px] leading-6 text-[#4b3a63]">{subtitle}</p>
                )}
                {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
              </div>
            )}
          </div>
        )}

        {summaryFacts.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summaryFacts.map(fact => (
              <div
                key={fact.label}
                className="rounded-[14px] border border-violet-200/70 bg-white px-4 py-3.5"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7126e3]">
                  {fact.label}
                </div>
                <div className="mt-1.5 text-[13.5px] font-bold leading-6 text-[#1a0b3d]">
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
                className="rounded-[18px] border border-violet-200/70 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(89,23,196,0.16)] sm:p-5"
              >
                <h3 className="font-sans text-[1.05rem] font-extrabold text-[#1a0b3d]">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="mt-1 text-[12.5px] leading-5 text-[#4b3a63]">
                    {section.description}
                  </p>
                )}

                {section.facts && section.facts.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {section.facts.map(fact => (
                      <div key={fact.label} className="flex items-start justify-between gap-4">
                        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b5a82]">
                          {fact.label}
                        </div>
                        <div className="max-w-[70%] text-right text-[13px] font-semibold leading-6 text-[#1a0b3d]">
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

        <div className={cn('flex flex-wrap items-center justify-end gap-2 pt-1')}>
          <AdminActionButton onClick={onClose}>Cancel</AdminActionButton>
          {actions}
        </div>
      </div>
    </Modal>
  )
}
