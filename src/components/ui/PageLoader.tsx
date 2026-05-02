import { useEffect, useState } from 'react'

export default function PageLoader({
  mode = 'page',
  delayMs = 0,
}: {
  mode?: 'page' | 'route'
  delayMs?: number
}) {
  const [ready, setReady] = useState(delayMs === 0)

  useEffect(() => {
    if (delayMs === 0) {
      setReady(true)
      return
    }

    setReady(false)
    const timeout = window.setTimeout(() => setReady(true), delayMs)
    return () => window.clearTimeout(timeout)
  }, [delayMs])

  if (!ready) return null

  if (mode === 'route') {
    return (
      <div className="pointer-events-none sticky top-[var(--app-navbar-height,0px)] z-20 -mt-1 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto h-1.5 max-w-[78rem] overflow-hidden rounded-full bg-violet-100/85">
          <div className="route-loader-bar h-full rounded-full bg-[linear-gradient(90deg,#7c3aed,#a855f7,#c026d3)]" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="relative mx-auto w-12 h-12 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-violet-300/40" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-violet-600 animate-spin" />
        </div>
        <p className="text-sm font-mono tracking-wider text-violet-600/70">Loading…</p>
      </div>
    </div>
  )
}
