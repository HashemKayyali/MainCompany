/** CAT-022 — segment loading skeleton (localized-agnostic, layout-stable). */
export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10" aria-busy="true" aria-live="polite">
      <div className="h-8 w-64 animate-pulse rounded bg-ink-100" />
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-ink-100" />
        ))}
      </div>
    </div>
  )
}
