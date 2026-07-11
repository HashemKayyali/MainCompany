'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'
import { ArrowRight, Plus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useReducedMotion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/ui/Reveal'

/**
 * CAT-026 — FAQ (client island). VERBATIM port of the Vite FAQ + FaqFlipGrid:
 * heading panel + contact card on the left, 3D flip cards on the right. Email
 * addresses inside answers are linkified. Copy localized (EN + AR).
 */
type FaqEntry = { q: string; a: string }

function renderAnswer(text: string): ReactNode {
  return text.split(/([a-z0-9._%+-]+@eventies(?:jo)?\.com)/gi).map((part, index) =>
    part.toLowerCase().includes('@eventies') ? (
      <a
        key={index}
        href={`mailto:${part}`}
        onClick={(e) => e.stopPropagation()}
        className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

function cn(...parts: (string | false | undefined)[]) {
  return parts.filter(Boolean).join(' ')
}

function FlipCard({
  index,
  question,
  answer,
  motionEnabled,
  viewAnswer,
  closeAnswer,
}: {
  index: number
  question: string
  answer: string
  motionEnabled: boolean
  viewAnswer: string
  closeAnswer: string
}) {
  const [open, setOpen] = useState(false)
  const number = String(index + 1).padStart(2, '0')
  const close = (e: MouseEvent) => {
    e.stopPropagation()
    setOpen(false)
  }

  return (
    <div className="h-[10.75rem] sm:h-[11.25rem] [perspective:1400px]">
      <div
        className={cn(
          'relative h-full w-full [transform-style:preserve-3d]',
          motionEnabled && 'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          open && '[transform:rotateY(180deg)]'
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className={cn(
            'group absolute inset-0 flex h-full w-full flex-col rounded-[20px] border border-violet-200/70 bg-white p-4 text-start [backface-visibility:hidden] shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-violet-300/80 hover:shadow-[0_22px_48px_-28px_rgba(124,58,237,0.5)] sm:p-5',
            open && 'pointer-events-none'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 font-sans text-[12px] font-black text-violet-700">
              {number}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:rotate-90">
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </span>
          </div>
          <span className="mt-auto line-clamp-4 font-display text-[15.5px] font-extrabold leading-[1.3] tracking-[-0.02em] text-ink-900 sm:text-[16.5px]">
            {question}
          </span>
          <span className="mt-3 text-[9.5px] font-bold uppercase tracking-[0.2em] text-violet-500/80">
            {viewAnswer}
          </span>
        </button>

        <div
          onClick={close}
          className={cn(
            'absolute inset-0 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[20px] p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-5',
            !open && 'pointer-events-none'
          )}
          style={{
            background: 'linear-gradient(150deg, #2a0a63 0%, #4912a0 55%, #7126e3 100%)',
            boxShadow: '0 26px 54px -30px rgba(89,23,196,0.65)',
          }}
        >
          <div
            className="pointer-events-none absolute -end-14 -top-14 h-36 w-36 rounded-full bg-fuchsia-500/35 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between">
            <span className="font-sans text-[12px] font-black text-white/45">{number}</span>
            <button
              type="button"
              onClick={close}
              aria-label={closeAnswer}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.12] text-white transition-colors duration-300 hover:bg-white/[0.22]"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
          <p className="relative mt-3 overflow-y-auto pe-1 text-[12.5px] leading-[1.7] text-white/[0.92]">
            {renderAnswer(answer)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function Faq() {
  const t = useTranslations('catalog.home')
  const items = t.raw('faqSection.items') as FaqEntry[]
  const reduce = useReducedMotion()
  const motionEnabled = !reduce

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          <Reveal y={24}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
              <div>
                <div className="mb-4 inline-flex items-center gap-2.5">
                  <span
                    className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400"
                    aria-hidden="true"
                  />
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">
                    {t('faqSection.eyebrow')}
                  </span>
                </div>
                <h2 className="font-display text-[clamp(1.95rem,4.3vw,2.95rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
                  {t('faqSection.titleLead')}{' '}
                  <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                    {t('faqSection.titleHi')}
                  </span>
                </h2>
                <p className="mt-4 max-w-md text-[14.5px] leading-[1.72] text-ink-600">
                  {t('faqSection.description')}
                </p>
              </div>

              <div
                className="overflow-hidden rounded-[20px] border border-white/10 p-6"
                style={{
                  background: 'linear-gradient(150deg, #2a0a63 0%, #4912a0 55%, #7126e3 100%)',
                  boxShadow: '0 30px 64px -34px rgba(89,23,196,0.6)',
                }}
              >
                <div className="text-[13px] font-semibold text-white">
                  {t('faqSection.stillTitle')}
                </div>
                <p className="mt-1.5 text-[12px] leading-[1.6] text-white/75">
                  {t('faqSection.stillBody')}
                </p>
                <Link
                  href="/contact"
                  className="group mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-violet-800 transition-all hover:-translate-y-0.5"
                >
                  {t('faqSection.contactCta')}
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                    strokeWidth={2.4}
                  />
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {items.map((item, index) => (
              <Reveal key={item.q} delay={Math.min(index * 0.03, 0.24)} y={14}>
                <FlipCard
                  index={index}
                  question={item.q}
                  answer={item.a}
                  motionEnabled={motionEnabled}
                  viewAnswer={t('faqSection.viewAnswer')}
                  closeAnswer={t('faqSection.closeAnswer')}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
