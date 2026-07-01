import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import { cn } from '../../utils/cn'

const MeshGradient = lazy(() =>
  import('@paper-design/shaders-react').then(module => ({ default: module.MeshGradient }))
)

type HeroBackgroundProps = {
  active?: boolean
  className?: string
  fixed?: boolean
}

let heroBackgroundInstanceSeed = 0

export default function HeroBackground({ active = true, className, fixed = false }: HeroBackgroundProps) {
  const motionEnabled = useMotionEnabled()
  const [mounted, setMounted] = useState(false)
  const instanceId = useRef<number | null>(null)

  if (instanceId.current === null) {
    heroBackgroundInstanceSeed += 1
    instanceId.current = heroBackgroundInstanceSeed
  }

  useEffect(() => setMounted(true), [])
  const shadersOn = mounted && motionEnabled

  return (
    <div
      data-hero-background
      data-hero-background-instance={instanceId.current}
      className={cn(
        'hero-background-surface pointer-events-none inset-0 overflow-hidden transition-opacity duration-300',
        fixed ? 'fixed' : 'absolute',
        active ? 'opacity-100' : 'opacity-0',
        className
      )}
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
        <Suspense fallback={null}>
          <MeshGradient
            className="absolute inset-0 z-[1] h-full w-full"
            colors={['#0c0426', '#5d18c4', '#7126e3', '#a855f7', '#c026d3']}
            distortion={0.8}
            swirl={0.6}
            speed={0.3}
          />
          <MeshGradient
            className="absolute inset-0 z-[2] h-full w-full opacity-50"
            colors={['#0c0426', '#ffffff', '#a855f7', '#c026d3']}
            distortion={1}
            swirl={0.2}
            speed={0.2}
          />
        </Suspense>
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
