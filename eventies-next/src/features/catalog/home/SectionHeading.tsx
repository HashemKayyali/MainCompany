import type { ReactNode } from 'react'
import { Link } from '@/i18n/navigation'
import { Reveal } from '@/components/ui/Reveal'

/**
 * CAT-025 — shared centered section heading (VERBATIM port of the Vite
 * SectionHeading). Strings arrive already localized from the calling server
 * component, so this stays a presentational RSC.
 */
export function SectionHeading({
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
  return (
    <Reveal
      className={['mx-auto max-w-2xl text-center', className].filter(Boolean).join(' ')}
      y={20}
    >
      <div className="mb-4 flex items-center justify-center gap-2.5">
        <span
          className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400"
          aria-hidden="true"
        />
        <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">
          {eyebrow}
        </span>
        <span
          className="h-px w-7 bg-gradient-to-l from-transparent to-violet-400"
          aria-hidden="true"
        />
      </div>
      <h2 className="font-display text-[clamp(1.95rem,4.3vw,2.95rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
        {title}
      </h2>
      {description && (
        <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-[1.72] text-ink-600">
          {description}
        </p>
      )}
    </Reveal>
  )
}

/** Centered "view all" pill used beneath home grids. */
export function ViewAllButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <div className="mt-10 flex justify-center">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 rounded-full border border-violet-200/85 bg-white px-6 py-3 text-[12px] font-bold text-violet-700 shadow-[0_10px_26px_-14px_rgba(124,58,237,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400 hover:bg-violet-50 hover:text-violet-900"
      >
        {children}
      </Link>
    </div>
  )
}
