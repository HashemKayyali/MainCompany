import { useState, type MouseEvent, type ReactNode } from 'react'
import { Plus, X } from 'lucide-react'
import { useI18n } from '../../contexts/LanguageContext'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import Reveal from '../home/Reveal'
import { cn } from '../../utils/cn'

export type FaqEntry = { q: string; a: string }

// Linkify Eventies emails inside answers so contact FAQs stay clickable.
function renderAnswer(text: string): ReactNode {
  return text.split(/([a-z0-9._%+-]+@eventies(?:jo)?\.com)/gi).map((part, index) =>
    part.toLowerCase().includes('@eventies') ? (
      <a
        key={index}
        href={`mailto:${part}`}
        onClick={event => event.stopPropagation()}
        className="font-semibold text-white underline decoration-white/40 underline-offset-2 hover:decoration-white"
      >
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

function FaqFlipCard({
  index,
  question,
  answer,
  motionEnabled,
}: {
  index: number
  question: string
  answer: string
  motionEnabled: boolean
}) {
  const [open, setOpen] = useState(false)
  const number = String(index + 1).padStart(2, '0')

  const close = (event: MouseEvent) => {
    event.stopPropagation()
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
        {/* Front: question */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          className={cn(
            'group absolute inset-0 flex h-full w-full flex-col rounded-[20px] border border-violet-200/70 bg-white p-4 text-left [backface-visibility:hidden] sm:p-5',
            'shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-[border-color,box-shadow,transform] duration-300',
            'hover:-translate-y-1 hover:border-violet-300/80 hover:shadow-[0_22px_48px_-28px_rgba(124,58,237,0.5)]',
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
            View answer
          </span>
        </button>

        {/* Back: answer */}
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
            className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-fuchsia-500/35 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative flex items-center justify-between">
            <span className="font-sans text-[12px] font-black text-white/45">{number}</span>
            <button
              type="button"
              onClick={close}
              aria-label="Close answer"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.12] text-white transition-colors duration-300 hover:bg-white/[0.22]"
            >
              <X className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>

          <p className="relative mt-3 overflow-y-auto pr-1 text-[12.5px] leading-[1.7] text-white/[0.92]">
            {renderAnswer(answer)}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Unified FAQ grid used across all pages: fixed-height flip cards in a
 * 4-column grid, so the section height never changes when cards open.
 */
export default function FaqFlipGrid({ items }: { items: FaqEntry[] }) {
  const motionEnabled = useMotionEnabled()
  const { translateText } = useI18n()

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <Reveal key={item.q} delay={Math.min(index * 0.03, 0.24)} y={14}>
          <FaqFlipCard
            index={index}
            question={translateText(item.q)}
            answer={translateText(item.a)}
            motionEnabled={motionEnabled}
          />
        </Reveal>
      ))}
    </div>
  )
}
