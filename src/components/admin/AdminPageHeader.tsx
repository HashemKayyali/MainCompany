interface AdminPageHeaderProps {
  title: string
  actions?: React.ReactNode
}

// Clean, light-only admin page header. Accent bar + title + underline,
// actions right-aligned on >= sm, stacked on mobile.
export default function AdminPageHeader({ title, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <div className="flex min-w-0 items-start gap-3.5">
          <span
            aria-hidden="true"
            className="mt-1 h-7 w-1.5 shrink-0 rounded-full bg-[linear-gradient(180deg,#6d28d9,#7c3aed_55%,#9d6bff)]"
          />
          <div className="min-w-0">
            <h1 className="font-sans text-[1.3rem] font-extrabold tracking-[-0.04em] text-[#1a0b3d] sm:text-[1.46rem] lg:text-[1.6rem]">
              {title}
            </h1>
            <div
              aria-hidden="true"
              className="mt-1.5 h-[2px] w-14 rounded-full bg-[linear-gradient(90deg,#7c3aed,#9d6bff,transparent)]"
            />
          </div>
        </div>
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end sm:gap-2.5">
          {actions}
        </div>
      )}
    </div>
  )
}
