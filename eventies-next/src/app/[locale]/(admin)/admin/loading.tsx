export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading admin data" className="space-y-4" aria-live="polite">
      <div className="h-10 w-64 animate-pulse rounded-xl bg-slate-200 motion-reduce:animate-none" />
      <div className="h-72 animate-pulse rounded-2xl bg-slate-200 motion-reduce:animate-none" />
    </div>
  )
}
