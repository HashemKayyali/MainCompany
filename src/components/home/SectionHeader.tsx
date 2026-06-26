import { cn } from '../../utils/cn'

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
  titleClassName?: string
}

export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  titleClassName,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-8 sm:mb-10',
        align === 'center' && 'mx-auto max-w-2xl text-center',
        className
      )}
    >
      {eyebrow && (
        <span className="mb-3 inline-flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700">
          <span className="h-px w-5 bg-brand-500" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'font-display text-[clamp(1.65rem,4vw,2.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-slate-900',
          titleClassName
        )}
      >
        {title}
      </h2>
      {description && (
        <p className="mt-3 max-w-2xl text-[0.98rem] leading-[1.7] text-slate-500">
          {description}
        </p>
      )}
    </div>
  )
}
