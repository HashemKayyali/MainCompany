import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { useI18n } from '../../contexts/LanguageContext'
import Reveal from './Reveal'

/**
 * Shared, centered section heading used across the homepage so every section
 * shares the same eyebrow / title / description rhythm and alignment.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  className?: string
}) {
  const { translateText } = useI18n()
  const translateNode = (value: ReactNode) => (typeof value === 'string' ? translateText(value) : value)

  return (
    <Reveal className={cn('mx-auto max-w-2xl text-center', className)} y={20}>
      <div className="mb-4 flex items-center justify-center gap-2.5">
        <span className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400" aria-hidden="true" />
        <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">{translateText(eyebrow)}</span>
        <span className="h-px w-7 bg-gradient-to-l from-transparent to-violet-400" aria-hidden="true" />
      </div>
      <h2 className="font-display text-[clamp(1.95rem,4.3vw,2.95rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
        {translateNode(title)}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-[1.72] text-ink-600">{translateNode(description)}</p>
      )}
    </Reveal>
  )
}

/** Centered "view all" style pill used beneath grids. */
export function ViewAllButton({ to, children, onMouseEnter }: { to: string; children: ReactNode; onMouseEnter?: () => void }) {
  const { translateText } = useI18n()
  const translateNode = (value: ReactNode) => (typeof value === 'string' ? translateText(value) : value)

  return (
    <div className="mt-10 flex justify-center">
      <Link
        to={to}
        onMouseEnter={onMouseEnter}
        onFocus={onMouseEnter}
        className="group inline-flex items-center gap-2 rounded-full border border-violet-200/85 bg-white px-6 py-3 text-[12px] font-bold text-violet-700 shadow-[0_10px_26px_-14px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900"
      >
        {translateNode(children)}
      </Link>
    </div>
  )
}
