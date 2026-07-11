'use client'

import { PulsingBorder } from '@paper-design/shaders-react'

/**
 * CAT-002 / IMG-003 — the WebGL pulsing-border badge. Loaded ONLY via
 * next/dynamic({ ssr: false }) from HeroClient, so @paper-design/shaders-react
 * (WebGL, browser-only) never enters a server module or the shared bundle
 * (Constitution §2). Rendered only when motion is enabled.
 */
export default function HeroShaderBadge() {
  return (
    <PulsingBorder
      colors={['#7126e3', '#a855f7', '#c026d3', '#8344f5', '#d946ef', '#ffffff']}
      colorBack="#00000000"
      speed={1.5}
      roundness={1}
      thickness={0.1}
      softness={0.2}
      intensity={5}
      spotSize={0.1}
      pulse={0.1}
      smoke={0.5}
      smokeSize={4}
      scale={0.6}
      style={{ width: '48px', height: '48px', borderRadius: '50%' }}
    />
  )
}
