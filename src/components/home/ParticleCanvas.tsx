import { useRef, useEffect } from 'react'

/**
 * Canvas-based particle field — replaces 18 individual motion.div elements
 * with a single GPU-composited canvas for much better performance.
 */
export default function ParticleCanvas({ isDark, reduceMotion }: { isDark: boolean; reduceMotion: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      w = canvas.offsetWidth
      h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize, { passive: true })

    // Generate particles once
    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 2 + Math.random() * 3,
      speed: 0.15 + Math.random() * 0.3,
      opacity: 0.25 + Math.random() * 0.45,
      phase: Math.random() * Math.PI * 2,
    }))

    // If reduced motion, draw static and bail
    if (reduceMotion) {
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x * w, p.y * h, p.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(255,255,255,${p.opacity})`
          : `rgba(17,24,39,${p.opacity * 0.5})`
        ctx.fill()
      })
      return () => window.removeEventListener('resize', resize)
    }

    let animId: number
    const animate = (time: number) => {
      ctx.clearRect(0, 0, w, h)

      particles.forEach(p => {
        const t = time * 0.001
        const yOffset = Math.sin(t * p.speed + p.phase) * 14
        const xOffset = Math.cos(t * p.speed + p.phase) * 8
        const alpha = p.opacity * (0.7 + 0.3 * Math.sin(t + p.phase))

        ctx.beginPath()
        ctx.arc(p.x * w + xOffset, p.y * h + yOffset, p.size / 2, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(255,255,255,${alpha})`
          : `rgba(17,24,39,${alpha * 0.5})`
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [isDark, reduceMotion])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.8 }}
      aria-hidden="true"
    />
  )
}
