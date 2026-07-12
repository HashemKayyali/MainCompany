'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useMotionEnabled } from '@/hooks/usePerfMode'

/**
 * CAT-024 — fixed animated hero backdrop (VERBATIM port of the Vite
 * `HeroBackground`). Two layered paper-design MeshGradients over a static
 * radial/linear violet gradient, plus a left-side legibility scrim. Shaders are
 * gated on motion + document visibility (perf/battery) and loaded ssr:false so
 * the WebGL chunk never enters the server module graph or the shared bundle.
 * The static gradient renders immediately (no flash, SSR-safe).
 */
const MeshGradient = dynamic(
  () => import('@paper-design/shaders-react').then((m) => ({ default: m.MeshGradient })),
  { ssr: false }
)

export function HeroBackground({
  active = true,
  fixed = true,
}: {
  active?: boolean
  fixed?: boolean
}) {
  const motionEnabled = useMotionEnabled()
  const [documentVisible, setDocumentVisible] = useState(true)

  useEffect(() => {
    if (typeof document === 'undefined') return undefined
    const onVis = () => setDocumentVisible(document.visibilityState !== 'hidden')
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // The MeshGradient chunk is dynamic(ssr:false) so it only mounts client-side;
  // no extra `mounted` gate needed (avoids a set-state-in-effect on first paint).
  const shadersOn = active && motionEnabled && documentVisible

  return (
    <div
      data-hero-background
      className={[
        'hero-background-surface pointer-events-none inset-0 overflow-hidden',
        fixed ? 'fixed' : 'absolute',
        active
          ? 'visible opacity-100 transition-opacity duration-300'
          : 'invisible opacity-0 transition-none duration-0',
      ].join(' ')}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(68% 58% at 53% 21%, rgba(217,70,239,0.6) 0%, rgba(168,85,247,0.28) 34%, transparent 66%),' +
            'radial-gradient(58% 54% at 82% 56%, rgba(168,85,247,0.5) 0%, transparent 64%),' +
            'radial-gradient(64% 58% at 15% 10%, rgba(91,33,182,0.62) 0%, transparent 66%),' +
            'radial-gradient(70% 60% at 46% 104%, rgba(216,180,254,0.42) 0%, transparent 64%),' +
            'linear-gradient(145deg, #0b0324 0%, #1b0646 38%, #5b16b6 68%, #9d2bd2 100%)',
        }}
      />

      {shadersOn && (
        <>
          <MeshGradient
            className="absolute inset-0 z-[1] h-full w-full"
            colors={['#0c0426', '#5d18c4', '#7126e3', '#a855f7', '#c026d3']}
            distortion={0.8}
            swirl={0.6}
            speed={0.3}
            maxPixelCount={2_500_000}
          />
          <MeshGradient
            className="absolute inset-0 z-[2] h-full w-full opacity-50"
            colors={['#0c0426', '#ffffff', '#a855f7', '#c026d3']}
            distortion={1}
            swirl={0.2}
            speed={0.2}
            maxPixelCount={2_500_000}
          />
        </>
      )}

      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            'linear-gradient(95deg, rgba(8,3,26,0.86) 0%, rgba(8,3,26,0.6) 30%, rgba(8,3,26,0.24) 52%, transparent 72%)',
        }}
      />
    </div>
  )
}
