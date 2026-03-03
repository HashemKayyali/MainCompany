export default function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-purple-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
        </div>
        <p className="text-sm font-mono tracking-wider text-purple-300/50">Loading…</p>
      </div>
    </div>
  )
}
