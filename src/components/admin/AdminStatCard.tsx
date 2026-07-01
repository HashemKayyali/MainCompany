import { cn } from '../../utils/cn'

interface AdminStatCardProps {
  label: string
  value: React.ReactNode
  accent?: React.ReactNode
  className?: string
}

// Light-only stat card: strong contrast label + big near-black value,
// soft violet top accent, premium glass surface.
export default function AdminStatCard({
  label,
  value,
  accent,
  className,
}: AdminStatCardProps) {
  return (
    <div
      className={cn(
        'relative min-h-[92px] overflow-hidden rounded-[18px] border border-violet-200/70 bg-white px-4 py-3.5 shadow-[0_10px_28px_-18px_rgba(89,23,196,0.18)]',
        className
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(124,58,237,0.35),transparent)]"
      />
      <div className="relative flex h-full items-start justify-between gap-3.5">
        <div className="space-y-2">
          <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7126e3]">
            {label}
          </div>
          <div className="font-sans text-[1.5rem] font-black leading-none tracking-[-0.04em] text-[#1a0b3d] sm:text-[1.65rem]">
            {value}
          </div>
        </div>
        {accent && <div className="pt-1">{accent}</div>}
      </div>
    </div>
  )
}
