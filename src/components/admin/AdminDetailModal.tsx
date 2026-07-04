import { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import type { AdminFact } from './AdminEntityCard'
import AdminActionButton from './AdminActionButton'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useI18n } from '../../contexts/LanguageContext'
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

// Collapsible on mobile (native <details>), always-open card on desktop.
function DetailSection({ section, isDesktop }: { section: AdminDetailSection; isDesktop: boolean }) {
  const body = (
    <>
      {section.description && (
        <p className="mt-1 text-[12.5px] leading-5 text-[#4b3a63]">{section.description}</p>
      )}

      {section.facts && section.facts.length > 0 && (
        <div className="mt-4 space-y-3">
          {section.facts.map(fact => (
            <div key={fact.label} className="flex items-start justify-between gap-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#6b5a82]">
                {fact.label}
              </div>
              <div className="max-w-[70%] text-end text-[13px] font-semibold leading-6 text-[#1a0b3d]">
                {fact.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {section.content && <div className="mt-4">{section.content}</div>}
    </>
  )

  if (isDesktop) {
    return (
      <section className="rounded-[18px] border border-violet-200/70 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(89,23,196,0.16)] sm:p-5">
        <h3 className="font-sans text-[1.05rem] font-extrabold text-[#1a0b3d]">{section.title}</h3>
        {body}
      </section>
    )
  }

  return (
    <details
      open
      className="group rounded-[18px] border border-violet-200/70 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(89,23,196,0.16)]"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <h3 className="font-sans text-[1.05rem] font-extrabold text-[#1a0b3d]">{section.title}</h3>
        <svg
          className="h-4 w-4 shrink-0 text-[#7126e3] transition-transform group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>
      {body}
    </details>
  )
}

// Light-only detail modal: compact media/summary header, readable facts
// grid, collapsible sections on mobile, tidy stacked footer.
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
  const isDesktop = useMediaQuery('(min-width: 768px)', true)
  const { translateText } = useI18n()
  const [subtitleExpanded, setSubtitleExpanded] = useState(false)

  useEffect(() => {
    if (open) setSubtitleExpanded(false)
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          <AdminActionButton onClick={onClose} className="w-full !min-h-[44px] sm:w-auto sm:!min-h-[38px]">
            {translateText('Cancel')}
          </AdminActionButton>
          {actions && (
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center [&>button]:w-full [&>button]:!min-h-[44px] sm:[&>button]:w-auto sm:[&>button]:!min-h-[38px]">
              {actions}
            </div>
          )}
        </div>
      }
    >
      <div className="admin-scope space-y-4">
        {(media || subtitle || badges) && (
          <div className="overflow-hidden rounded-[18px] border border-violet-200/70 bg-[linear-gradient(180deg,#ffffff,#faf6ff)]">
            {media && <div className="border-b border-violet-100">{media}</div>}
            {(subtitle || badges) && (
              <div className="space-y-3 p-4 sm:p-5">
                {subtitle && (
                  <div>
                    <p
                      className={cn(
                        'max-w-3xl text-[13px] leading-6 text-[#4b3a63]',
                        !subtitleExpanded && 'line-clamp-3'
                      )}
                    >
                      {subtitle}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubtitleExpanded(value => !value)}
                      className="mt-1 text-[11px] font-bold text-[#7126e3] transition hover:text-[#5d18c4] sm:hidden"
                    >
                      {subtitleExpanded ? translateText('Show less') : translateText('Show more')}
                    </button>
                  </div>
                )}
                {badges && <div className="flex flex-wrap gap-2">{badges}</div>}
              </div>
            )}
          </div>
        )}

        {summaryFacts.length > 0 && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {summaryFacts.map(fact => (
              <div
                key={fact.label}
                className="rounded-[14px] border border-violet-200/70 bg-white px-3.5 py-3"
              >
                <div className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#7126e3]">
                  {fact.label}
                </div>
                <div className="mt-1.5 text-[13px] font-medium leading-6 text-[#1a0b3d]">
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {sections.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {sections.map(section => (
              <DetailSection key={section.title} section={section} isDesktop={isDesktop} />
            ))}
          </div>
        )}
      </div>
    </Modal>
  )
}
