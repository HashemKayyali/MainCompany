import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  CircuitBoard,
  Cpu,
  FlaskConical,
  Gamepad2,
  Globe2,
  Hammer,
  HelpCircle,
  Images,
  Lightbulb,
  MapPin,
  type LucideIcon,
  Maximize2,
  PackageCheck,
  Plus,
  Radio,
  Send,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import type { CustomBuild } from '../data/custom-builds'
import { useCustomBuildsData } from '../contexts/DataContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useMotionEnabled } from '../hooks/useMotionEnabled'
import { preloadRoute } from '../utils/route-preload'
import FramedImage from '../components/ui/FramedImage'
import Reveal from '../components/home/Reveal'
import Lightbox from '../components/gallery/Lightbox'
import EventiesHero from '../components/layout/EventiesHero'
import { useI18n } from '../contexts/LanguageContext'

const BOOKING_EMAIL = 'booking@eventiesjo.com'
const VENDORS_EMAIL = 'vendors@eventiesjo.com'
const EASE = [0.16, 1, 0.3, 1] as const
const MONO: CSSProperties = { fontFamily: 'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace' }

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const buildTypes: { code: string; title: string; desc: string; icon: LucideIcon }[] = [
  { code: 'MOD-01', title: 'Interactive Games', desc: 'Challenge, scoring & reaction games.', icon: Gamepad2 },
  { code: 'MOD-02', title: 'Booths & Activations', desc: 'Branded booths & launch stations.', icon: Boxes },
  { code: 'MOD-03', title: 'Hardware + Software', desc: 'Screens, sensors, lighting & scoring.', icon: Cpu },
  { code: 'MOD-04', title: 'Special Project Builds', desc: 'One-off ideas, designed & fabricated.', icon: Wrench },
]

const heroFocusAreas: { label: string; icon: LucideIcon }[] = [
  { label: 'Design', icon: Lightbulb },
  { label: 'Engineering', icon: Cpu },
  { label: 'R&D', icon: FlaskConical },
  { label: 'Prototyping', icon: CircuitBoard },
  { label: 'Fabrication', icon: Hammer },
]

const heroLabCards: { title: string; detail: string; code: string; icon: LucideIcon }[] = [
  { title: 'Concept Design', detail: 'Sketches, flow, user interaction', code: 'DES-01', icon: Lightbulb },
  { title: 'Engineering', detail: 'Structure, electronics, controls', code: 'ENG-02', icon: Cpu },
  { title: 'R&D Testing', detail: 'Prototype trials and validation', code: 'RND-03', icon: FlaskConical },
  { title: 'Fabrication', detail: 'Build, finish, pack, deploy', code: 'FAB-04', icon: Wrench },
]

const processSteps: { title: string; detail: string; icon: LucideIcon }[] = [
  { title: 'Share the idea', detail: 'A sketch, reference, or goal is enough.', icon: Lightbulb },
  { title: 'Define scope', detail: 'Flow, materials, tech, branding, and timeline.', icon: FlaskConical },
  { title: 'Build & test', detail: 'Fabricated, assembled, event-tested.', icon: Hammer },
  { title: 'Deliver or ship', detail: 'Local delivery or worldwide shipping.', icon: PackageCheck },
]

const audiences: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Brands & Companies', desc: 'Campaigns, launches & engagement.', icon: Building2 },
  { title: 'Agencies & Organizers', desc: 'Custom activations for client work.', icon: Users },
  { title: 'Universities & Public', desc: 'Campus & festival engagement zones.', icon: MapPin },
  { title: 'International Clients', desc: 'Built, packed & shipped after review.', icon: Globe2 },
]

const audienceFitNotes = [
  ['Brand launch', 'Guest engagement', 'On-site support'],
  ['Client activation', 'Fast approval', 'Reusable setup'],
  ['Campus events', 'High traffic', 'Easy staffing'],
  ['Remote approval', 'Packed safely', 'Worldwide shipping'],
]

const reviewChecklist = [
  'Idea description',
  'Where it runs + audience',
  'Game / booth / activation',
  'Branding requirements',
  'Screens, sensors, lights, sound',
  'Size, quantity, event date',
  'Delivery or shipping destination',
  'Reference images or sketches',
]

const deliveryModes: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Local Delivery', desc: 'Installed across Jordan.', icon: Truck },
  { title: 'Regional Projects', desc: 'Events across the region.', icon: Radio },
  { title: 'International Shipping', desc: 'Packed & shipped worldwide.', icon: Globe2 },
]

const faqs: { q: string; a: string }[] = [
  { q: 'What if I can’t find the service I need?', a: 'Submit a custom build request. Eventies can review your idea and, when feasible, help design and build a custom interactive experience for your event, including software, hardware, branding, and setup requirements.' },
  { q: 'Do custom builds have fixed prices?', a: 'No. Custom build requests are reviewed before pricing and timeline confirmation. Pricing depends on size, materials, technology, branding, complexity, quantity, and delivery or shipping.' },
  { q: 'Can it include screens, sensors, lights, or scoring?', a: 'Yes. Builds can combine structure, screens, controls, sensors, lighting, sound, or scoring systems depending on scope.' },
  { q: 'Can you add our company branding?', a: 'Yes. Colors, printed surfaces, graphics, signage, screens, and overall experience styling can be reviewed as part of the request.' },
  { q: 'Can you ship outside Jordan?', a: 'Yes, projects can be reviewed for international shipping based on size, weight, packaging, destination, customs, and timeline.' },
  { q: 'How long does a build take?', a: 'It depends on scope. A simple customization is faster; a full game or booth needs design, fabrication, and testing. Timing is confirmed after review.' },
  { q: 'Can I rent the build instead of buying it?', a: 'Depends on the project. Some are made for purchase, others suit rental or repeated use. The team clarifies the model during review.' },
  { q: 'What happens after I send a request?', a: 'The team reviews the idea, asks for missing details, checks feasibility, defines scope, and follows up with the next step or pricing direction.' },
  { q: 'Which email should I use?', a: `For custom builds, ideas, and purchase quote requests, contact ${BOOKING_EMAIL}. For supplier or production partnerships, contact ${VENDORS_EMAIL}.` },
]

const GLOBE_MARKERS: { location: [number, number]; size: number }[] = [
  { location: [31.95, 35.93], size: 0.12 }, // Amman
  { location: [51.5074, -0.1278], size: 0.05 }, // London
  { location: [40.7128, -74.006], size: 0.06 }, // New York
  { location: [25.2048, 55.2708], size: 0.06 }, // Dubai
  { location: [48.8566, 2.3522], size: 0.05 }, // Paris
  { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
  { location: [24.7136, 46.6753], size: 0.05 }, // Riyadh
  { location: [30.0444, 31.2357], size: 0.05 }, // Cairo
  { location: [-33.8688, 151.2093], size: 0.05 }, // Sydney
  { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
]

// ── Helpers ──────────────────────────────────────────────────────────────────

type FlowParticle = {
  x: number
  y: number
  directionX: number
  directionY: number
  size: number
}

function AetherFlowBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const motionEnabled = useMotionEnabled()

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    let animationFrameId = 0
    let width = 0
    let height = 0
    let particles: FlowParticle[] = []
    const mouse: { x: number | null; y: number | null; radius: number } = { x: null, y: null, radius: 190 }

    const drawParticle = (particle: FlowParticle) => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(191, 128, 255, 0.8)'
      ctx.fill()
    }

    const initParticles = () => {
      particles = []
      const count = Math.min(Math.max(Math.floor((width * height) / 9000), 28), 140)
      for (let i = 0; i < count; i += 1) {
        const size = Math.random() * 2 + 1
        particles.push({
          x: Math.random() * Math.max(width - size * 4, 1) + size * 2,
          y: Math.random() * Math.max(height - size * 4, 1) + size * 2,
          directionX: Math.random() * 0.4 - 0.2,
          directionY: Math.random() * 0.4 - 0.2,
          size,
        })
      }
    }

    const drawConnections = () => {
      const maxDistance = (width / 7) * (height / 7)
      for (let a = 0; a < particles.length; a += 1) {
        for (let b = a; b < particles.length; b += 1) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = dx * dx + dy * dy

          if (distance < maxDistance) {
            const opacity = Math.max(0, 1 - distance / 20000)
            let isMouseConnection = false

            if (mouse.x !== null && mouse.y !== null) {
              const mouseDx = particles[a].x - mouse.x
              const mouseDy = particles[a].y - mouse.y
              isMouseConnection = Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy) < mouse.radius
            }

            ctx.strokeStyle = isMouseConnection ? `rgba(255, 255, 255, ${opacity})` : `rgba(200, 150, 255, ${opacity})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(particles[a].x, particles[a].y)
            ctx.lineTo(particles[b].x, particles[b].y)
            ctx.stroke()
          }
        }
      }
    }

    const drawFrame = () => {
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, width, height)

      for (const particle of particles) {
        if (motionEnabled) {
          if (particle.x > width || particle.x < 0) particle.directionX *= -1
          if (particle.y > height || particle.y < 0) particle.directionY *= -1

          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - particle.x
            const dy = mouse.y - particle.y
            const distance = Math.sqrt(dx * dx + dy * dy) || 1
            if (distance < mouse.radius + particle.size) {
              const force = (mouse.radius - distance) / mouse.radius
              particle.x -= (dx / distance) * force * 5
              particle.y -= (dy / distance) * force * 5
            }
          }

          particle.x += particle.directionX
          particle.y += particle.directionY
        }

        drawParticle(particle)
      }

      drawConnections()
    }

    const animate = () => {
      drawFrame()
      if (motionEnabled) animationFrameId = requestAnimationFrame(animate)
    }

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(rect.width, 1)
      height = Math.max(rect.height, 1)
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * ratio)
      canvas.height = Math.floor(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      initParticles()
      drawFrame()
    }

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        mouse.x = null
        mouse.y = null
        return
      }
      mouse.x = event.clientX - rect.left
      mouse.y = event.clientY - rect.top
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    resizeCanvas()
    animate()
    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [motionEnabled])

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
}

function renderAnswer(text: string): ReactNode {
  return text.split(/([a-z0-9._%+-]+@eventiesjo\.com)/gi).map((part, index) =>
    part.toLowerCase().includes('@eventiesjo.com') ? (
      <a key={index} href={`mailto:${part}`} className="font-bold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

/** Bigger, cleaner section header used across all sections. */
function SectionHead({ icon: Icon, eyebrow, title, desc, dark = false, align = 'center' }: { icon: LucideIcon; eyebrow: string; title: ReactNode; desc?: string; dark?: boolean; align?: 'center' | 'left' }) {
  const centered = align === 'center'
  const { translateText } = useI18n()
  const translateNode = (value: ReactNode) => (typeof value === 'string' ? translateText(value) : value)
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'}>
      <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.18em] ${dark ? 'border-white/20 bg-white/[0.08] text-violet-100' : 'border-violet-200 bg-white text-violet-700 shadow-[0_8px_24px_-16px_rgba(124,58,237,0.4)]'}`}>
        <span className={`flex h-5 w-5 items-center justify-center rounded-md ${dark ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white' : 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white'}`}><Icon className="h-3 w-3" strokeWidth={2.6} /></span>
        {translateText(eyebrow)}
      </span>
      <h2 className={`mt-5 font-display text-[clamp(2rem,4.4vw,3.1rem)] font-extrabold leading-[1.03] tracking-[-0.04em] ${dark ? 'text-white' : 'text-ink-900'}`}>{translateNode(title)}</h2>
      {desc && <p className={`mt-3.5 text-[14px] leading-[1.7] ${centered ? 'mx-auto max-w-lg' : 'max-w-md'} ${dark ? 'text-white/70' : 'text-ink-600'}`}>{translateText(desc)}</p>}
    </div>
  )
}

function CornerTicks({ color = 'rgba(124,58,237,0.45)' }: { color?: string }) {
  const base = 'pointer-events-none absolute h-3.5 w-3.5'
  return (
    <>
      <span className={`${base} left-2 top-2 border-l border-t`} style={{ borderColor: color }} aria-hidden="true" />
      <span className={`${base} right-2 top-2 border-r border-t`} style={{ borderColor: color }} aria-hidden="true" />
      <span className={`${base} bottom-2 left-2 border-b border-l`} style={{ borderColor: color }} aria-hidden="true" />
      <span className={`${base} bottom-2 right-2 border-b border-r`} style={{ borderColor: color }} aria-hidden="true" />
    </>
  )
}

function CustomBuildSectionBackdrop({ variant }: { variant: 'electric' | 'waves' | 'deployment' | 'circuit' | 'hero' }) {
  return (
    <div className={`custom-builds-bg custom-builds-bg--${variant} pointer-events-none absolute inset-0 z-0 overflow-hidden`} aria-hidden="true" />
  )
}

function Marquee({ items }: { items: string[] }) {
  const motionEnabled = useMotionEnabled()
  const loop = [...items, ...items]
  return (
    <div className="relative flex overflow-hidden py-2.5" aria-hidden="true">
      <motion.div className="flex shrink-0 items-center gap-5 pr-5" style={MONO} animate={motionEnabled ? { x: ['0%', '-50%'] } : undefined} transition={motionEnabled ? { duration: 24, repeat: Infinity, ease: 'linear' } : undefined}>
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
            <span className="text-fuchsia-300/70">▹</span> {item}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ── Real textured 3D globe (Three.js, lazy-loaded client-side) ──────────────────

function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let cancelled = false
    let frameId = 0
    let cleanupScene: (() => void) | null = null

    import('three').then(THREE => {
      if (cancelled || !canvasRef.current) return

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      })
      renderer.setClearColor(0x000000, 0)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.12

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
      camera.position.set(0, 0, 5.85)

      const globeRadius = 1.52
      const textureLoader = new THREE.TextureLoader()
      const earthTexture = textureLoader.load(
        '/assets/globe/earth-blue-marble.jpg',
        () => {
          if (canvasRef.current) canvasRef.current.style.opacity = '1'
        },
        undefined,
        () => {
          if (canvasRef.current) canvasRef.current.style.opacity = '1'
        }
      )
      earthTexture.colorSpace = THREE.SRGBColorSpace
      earthTexture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 8)

      const globeGeometry = new THREE.SphereGeometry(globeRadius, 96, 96)
      const globeMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        shininess: 18,
        specular: new THREE.Color(0x284a78),
        emissive: new THREE.Color(0x06163a),
        emissiveIntensity: 0.16,
      })
      const globe = new THREE.Mesh(globeGeometry, globeMaterial)
      globe.rotation.set(-0.12, 0.55, 0)
      scene.add(globe)

      const atmosphereGeometry = new THREE.SphereGeometry(globeRadius * 1.035, 96, 96)
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: 0x9d6bff,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      })
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
      atmosphere.rotation.copy(globe.rotation)
      scene.add(atmosphere)

      const markerGeometry = new THREE.SphereGeometry(0.022, 16, 16)
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xf05fe2 })
      const ammanMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })
      const markerGroup = new THREE.Group()

      const latLngToVector3 = ([lat, lng]: [number, number], radius: number) => {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lng + 180) * (Math.PI / 180)

        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )
      }

      GLOBE_MARKERS.forEach((marker, index) => {
        const dot = new THREE.Mesh(markerGeometry, index === 0 ? ammanMarkerMaterial : markerMaterial)
        dot.position.copy(latLngToVector3(marker.location, globeRadius + 0.035))
        dot.scale.setScalar(index === 0 ? 1.9 : 1 + marker.size * 4)
        markerGroup.add(dot)
      })
      globe.add(markerGroup)

      scene.add(new THREE.HemisphereLight(0xb8d7ff, 0x16042f, 1.85))
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.45)
      keyLight.position.set(-2.6, 1.6, 3.8)
      scene.add(keyLight)
      const rimLight = new THREE.DirectionalLight(0xc084fc, 1.55)
      rimLight.position.set(2.4, 0.8, -2.8)
      scene.add(rimLight)

      const resize = () => {
        const size = Math.max(280, canvasRef.current?.clientWidth || 420)
        renderer.setSize(size, size, false)
        camera.aspect = 1
        camera.updateProjectionMatrix()
      }

      const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
      resizeObserver?.observe(canvasRef.current)
      if (!resizeObserver) window.addEventListener('resize', resize)
      resize()

      let isDragging = false
      let lastPointerX = 0
      let dragVelocity = 0
      const onPointerDown = (event: PointerEvent) => {
        isDragging = true
        lastPointerX = event.clientX
        dragVelocity = 0
        canvas.setPointerCapture?.(event.pointerId)
        canvas.style.cursor = 'grabbing'
      }
      const onPointerMove = (event: PointerEvent) => {
        if (!isDragging) return
        const delta = (event.clientX - lastPointerX) * 0.008
        globe.rotation.y += delta
        atmosphere.rotation.y += delta
        dragVelocity = delta
        lastPointerX = event.clientX
      }
      const onPointerUp = (event: PointerEvent) => {
        isDragging = false
        canvas.releasePointerCapture?.(event.pointerId)
        canvas.style.cursor = 'grab'
      }

      canvas.style.cursor = 'grab'
      canvas.style.touchAction = 'pan-y'
      canvas.addEventListener('pointerdown', onPointerDown)
      canvas.addEventListener('pointermove', onPointerMove)
      canvas.addEventListener('pointerup', onPointerUp)
      canvas.addEventListener('pointercancel', onPointerUp)

      const clock = new THREE.Clock()
      const animate = () => {
        const delta = Math.min(clock.getDelta(), 0.04)
        if (!isDragging) {
          globe.rotation.y += delta * 0.2
          atmosphere.rotation.y += delta * 0.12
        }
        if (!isDragging && Math.abs(dragVelocity) > 0.0001) {
          globe.rotation.y += dragVelocity
          atmosphere.rotation.y += dragVelocity
          dragVelocity *= 0.92
        }
        renderer.render(scene, camera)
        frameId = requestAnimationFrame(animate)
      }
      animate()

      cleanupScene = () => {
        cancelAnimationFrame(frameId)
        resizeObserver?.disconnect()
        if (!resizeObserver) window.removeEventListener('resize', resize)
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('pointermove', onPointerMove)
        canvas.removeEventListener('pointerup', onPointerUp)
        canvas.removeEventListener('pointercancel', onPointerUp)
        earthTexture.dispose()
        globeGeometry.dispose()
        globeMaterial.dispose()
        atmosphereGeometry.dispose()
        atmosphereMaterial.dispose()
        markerGeometry.dispose()
        markerMaterial.dispose()
        ammanMarkerMaterial.dispose()
        renderer.dispose()
      }
    })

    return () => {
      cancelled = true
      cleanupScene?.()
    }
  }, [])

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[440px]">
      <span className="absolute inset-[2%] rounded-full bg-violet-500/20 blur-3xl" aria-hidden="true" />
      <span className="absolute inset-[12%] rounded-full border border-violet-300/20 shadow-[0_0_44px_rgba(139,92,246,0.42)]" aria-hidden="true" />
      <canvas
        ref={canvasRef}
        aria-label="Realistic Earth globe showing Eventies delivery and shipping reach"
        className="relative h-full w-full"
        style={{ contain: 'layout paint size', opacity: 0, transition: 'opacity 0.8s ease' }}
      />
    </div>
  )
}

function LazyGlobe() {
  const frameRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (shouldRender) return undefined

    const element = frameRef.current
    if (!element) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setShouldRender(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      entries => {
        if (!entries.some(entry => entry.isIntersecting)) return
        setShouldRender(true)
        observer.disconnect()
      },
      { rootMargin: '420px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [shouldRender])

  return (
    <div ref={frameRef} className="relative mx-auto min-h-[280px] w-full max-w-[440px]">
      {shouldRender ? (
        <Globe />
      ) : (
        <div className="relative mx-auto aspect-square w-full max-w-[440px]">
          <span className="absolute inset-[10%] rounded-full border border-violet-300/20 bg-white/[0.04]" aria-hidden="true" />
          <span className="absolute inset-[20%] rounded-full border border-fuchsia-300/20" aria-hidden="true" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22px] border border-white/15 bg-white/[0.08] text-violet-100">
            <Globe2 className="h-9 w-9" strokeWidth={1.6} />
          </span>
        </div>
      )}
    </div>
  )
}

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const motionEnabled = useMotionEnabled()
  const { translateText } = useI18n()
  const [open, setOpen] = useState(0)

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((item, index) => {
        const isOpen = open === index
        return (
          <Reveal key={item.q} delay={Math.min(index * 0.03, 0.24)} y={14}>
            <div className={`overflow-hidden rounded-[16px] border transition-colors duration-300 ${isOpen ? 'border-violet-300/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 shadow-[0_22px_48px_-28px_rgba(124,58,237,0.5)]' : 'border-violet-200/70 bg-white hover:border-violet-300/70'}`}>
              <button type="button" onClick={() => setOpen(current => (current === index ? -1 : index))} aria-expanded={isOpen} className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5">
                <span className={`flex h-8 w-9 shrink-0 items-center justify-center rounded-[7px] text-[11px] font-bold transition-all duration-300 ${isOpen ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' : 'bg-violet-100 text-violet-700'}`} style={MONO}>{String(index + 1).padStart(2, '0')}</span>
                <span className="flex-1 font-sans text-[14px] font-bold tracking-[-0.01em] text-ink-900 sm:text-[15px]">{translateText(item.q)}</span>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'rotate-45 border-violet-300 bg-white text-violet-700' : 'border-violet-200 bg-violet-50 text-violet-600'}`}><Plus className="h-4 w-4" strokeWidth={2.4} /></span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={motionEnabled ? { height: 0, opacity: 0 } : false} animate={{ height: 'auto', opacity: 1 }} exit={motionEnabled ? { height: 0, opacity: 0 } : undefined} transition={{ duration: 0.3, ease: EASE }} className="overflow-hidden">
                    <p className="px-4 pb-4 pl-[4.25rem] text-[13px] leading-[1.75] text-ink-600 sm:px-5 sm:pb-5">{renderAnswer(translateText(item.a))}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        )
      })}
    </div>
  )
}

const buildKey = (build: CustomBuild, index: number) => build.id || `${build.title}-${index}`

function buildImages(build: CustomBuild) {
  const seen = new Set<string>()

  return [build.image, ...(build.images || [])]
    .map(image => image.trim())
    .filter(image => {
      if (!image || seen.has(image)) return false
      seen.add(image)
      return true
    })
}

function cleanRepeatedText(value?: string) {
  const text = value?.trim().replace(/\s+/g, ' ') ?? ''
  if (!text) return ''

  const compact = text.toLowerCase().replace(/\s+/g, '')
  for (let length = 3; length <= Math.floor(compact.length / 3); length += 1) {
    if (compact.length % length !== 0) continue

    const unit = compact.slice(0, length)
    const repeatCount = compact.length / length
    if (repeatCount < 3 || unit.repeat(repeatCount) !== compact) continue

    let compactIndex = 0
    let endIndex = 0
    while (endIndex < text.length && compactIndex < length) {
      if (!/\s/.test(text[endIndex])) compactIndex += 1
      endIndex += 1
    }

    return text.slice(0, endIndex).trim()
  }

  return text
}

// ── Page ─────────────────────────────────────────────────────────────────────

function CustomBuildsHeroShowcase({ motionEnabled }: { motionEnabled: boolean }) {
  const { translateText } = useI18n()
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(58% 48% at 47% 38%, rgba(255,255,255,0.18) 0%, transparent 62%),' +
            'radial-gradient(46% 38% at 72% 18%, rgba(217,70,239,0.18) 0%, transparent 68%)',
        }}
        aria-hidden="true"
      />
      <div
        className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.07] p-3 backdrop-blur-xl"
        style={{ boxShadow: '0 40px 90px -34px rgba(8,3,26,0.8), inset 0 1px 0 rgba(255,255,255,0.18)' }}
      >
        <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0f0630]/78 p-4 sm:p-5">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.42) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.42) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/25 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-fuchsia-100/75" style={MONO}>
                {translateText('Lab workflow')}
              </div>
              <div className="mt-1 font-display text-[17px] font-bold tracking-[-0.03em] text-white">
                {translateText('Design / Engineer / Test')}
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/25 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
              {translateText('Prototype ready')}
            </span>
          </div>

          <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {heroLabCards.map(({ title, detail, code, icon: Icon }, index) => (
              <motion.div
                key={title}
                className="relative min-h-[118px] overflow-hidden rounded-[18px] border border-white/15 bg-white/[0.09] p-4 backdrop-blur-md"
                animate={
                  motionEnabled
                    ? {
                        y: [0, index % 2 === 0 ? -6 : 6, 0],
                      }
                    : undefined
                }
                transition={{ duration: 5 + index * 0.35, repeat: Infinity, ease: 'easeInOut', delay: index * 0.12 }}
              >
                <CornerTicks color="rgba(240,171,252,0.42)" />
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="text-[9px] font-bold tracking-[0.14em] text-violet-100/55" style={MONO}>
                    {code}
                  </span>
                </div>
                <h3 className="mt-3 font-sans text-[14px] font-black tracking-[-0.03em] text-white">
                  {translateText(title)}
                </h3>
                <p className="mt-1.5 text-[11.5px] font-medium leading-[1.5] text-white/62">
                  {translateText(detail)}
                </p>
              </motion.div>
            ))}
          </div>

          <div className="relative mt-4 overflow-hidden rounded-[16px] border border-white/12 bg-black/22 p-3">
            <div className="mb-2 flex items-center justify-between gap-3" style={MONO}>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/45">{translateText('Build pipeline')}</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-fuchsia-100/70">{translateText('Field tested')}</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {['Brief', 'CAD', 'Prototype', 'Deploy'].map((step, index) => (
                <span key={step} className="relative h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.span
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                    initial={motionEnabled ? { width: 0 } : false}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.7, delay: 0.35 + index * 0.18, ease: EASE }}
                  />
                  <span className="sr-only">{step}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-[9px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
              <CircuitBoard className="h-4 w-4" strokeWidth={2.3} />
            </span>
            <span className="font-display text-[13px] font-bold text-white">Eventies Lab</span>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            {['CAD', 'Sensors', 'Controls', 'Finish'].map(tag => (
              <span key={tag} className="rounded-full border border-white/15 bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold text-white/80">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default function CustomBuildsPage() {
  const { customBuilds, customBuildCategories } = useCustomBuildsData()
  const motionEnabled = useMotionEnabled()
  const { translateText } = useI18n()

  const faqJsonLd = useMemo(
    () => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) }),
    []
  )
  usePageMeta({
    title: 'Custom Event Builds & Interactive Experiences | Eventies',
    description: 'Eventies designs and builds custom interactive experiences, branded activations, games, software, hardware, and event-ready setups for local and international projects.',
    canonical: 'https://www.eventiesjo.com/custom-builds',
    jsonLd: faqJsonLd,
  })
  useEffect(() => {
    if (window.location.hash !== '#global-reach') return

    const timer = window.setTimeout(() => {
      document.getElementById('global-reach')?.scrollIntoView({ block: 'start' })
    }, 250)

    return () => window.clearTimeout(timer)
  }, [])

  const builds = useMemo<CustomBuild[]>(
    () => customBuilds.filter(build => build.active && buildImages(build).length > 0).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [customBuilds]
  )

  const marqueeItems = useMemo(() => {
    const fromCats = customBuildCategories.filter(c => c.active !== false).map(c => c.name.trim()).filter(Boolean)
    const base = fromCats.length ? fromCats : buildTypes.map(b => b.title)
    return base.length >= 4 ? base : [...base, 'Custom Builds', 'Branded Activations', 'Interactive Games']
  }, [customBuildCategories])

  const tabs = useMemo(() => {
    const fromCats = customBuildCategories.filter(c => c.active !== false).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)).map(c => c.name.trim()).filter(Boolean)
    const present = new Set(builds.map(b => b.category.trim()).filter(Boolean))
    const ordered = fromCats.filter(name => present.has(name))
    present.forEach(name => { if (!ordered.includes(name)) ordered.push(name) })
    return ordered
  }, [customBuildCategories, builds])

  const [activeTab, setActiveTab] = useState<string>('All')
  const visibleBuilds = useMemo(
    () => (activeTab === 'All' ? builds : builds.filter(b => b.category.trim() === activeTab)).slice(0, 12),
    [builds, activeTab]
  )

  // In-section inspection viewer
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  useEffect(() => {
    if (visibleBuilds.length === 0) { setSelectedKey(null); return }
    setSelectedKey(current => (current && visibleBuilds.some((b, i) => buildKey(b, i) === current) ? current : buildKey(visibleBuilds[0], 0)))
  }, [visibleBuilds])

  const selectedBuild = useMemo(
    () => visibleBuilds.find((b, i) => buildKey(b, i) === selectedKey) ?? visibleBuilds[0] ?? null,
    [visibleBuilds, selectedKey]
  )
  const photos = useMemo(
    () => (selectedBuild ? buildImages(selectedBuild) : []),
    [selectedBuild]
  )
  const selectedDescription = useMemo(
    () => cleanRepeatedText(selectedBuild?.description),
    [selectedBuild]
  )
  const [photoIdx, setPhotoIdx] = useState(0)
  useEffect(() => { setPhotoIdx(0) }, [selectedKey])
  const safeIdx = photos.length ? photoIdx % photos.length : 0
  const stepPhoto = (dir: 1 | -1) => setPhotoIdx(i => (photos.length ? (i + dir + photos.length) % photos.length : 0))

  const [lightbox, setLightbox] = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 })

  return (
    <div className="overflow-x-clip pb-2">
      {/* ══ 1. HERO — short lab bench (the only grid section) ══ */}
      <EventiesHero
        eyebrow="R&D Studio - Custom Builds"
        title="Custom interactive experiences, built for your event."
        description="Custom builds can be reviewed for rental, purchase, or international shipping depending on scope, size, materials, and timeline."
        primaryAction={{ label: 'Request a Custom Build Quote', to: '/contact' }}
        secondaryAction={{ label: 'Inspect Our Work', href: '#work' }}
        chipsLabel="Studio"
        chips={heroFocusAreas.map(({ label }) => ({ label }))}
        rightSlot={<CustomBuildsHeroShowcase motionEnabled={motionEnabled} />}
      />
      <div className="bg-[#f7f4ff]">
      {/* 2. CAPABILITIES - clean section */}
      <section className="relative w-full overflow-hidden bg-[#f7f4ff] py-[clamp(3rem,6vw,5rem)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" aria-hidden="true" />
        <div className="site-container-wide">
          <Reveal className="mb-10 flex justify-center" y={20}>
            <SectionHead icon={Cpu} eyebrow="Capabilities" title="Modules we design & build" />
          </Reveal>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {buildTypes.map((card, index) => (
              <Reveal key={card.title} delay={Math.min(index * 0.06, 0.24)} y={20} className="h-full">
                <div className="group relative flex h-full flex-col rounded-[18px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-all duration-300 hover:-translate-y-1.5 hover:border-violet-300 hover:shadow-[0_28px_56px_-30px_rgba(89,23,196,0.45)]">
                  <CornerTicks />
                  <span className="pointer-events-none absolute -left-[3px] top-1/2 flex -translate-y-1/2 flex-col gap-1.5" aria-hidden="true">
                    {[0, 1, 2].map(p => <span key={p} className="h-1 w-1.5 rounded-l bg-violet-300/70" />)}
                  </span>
                  <span className="pointer-events-none absolute -right-[3px] top-1/2 flex -translate-y-1/2 flex-col gap-1.5" aria-hidden="true">
                    {[0, 1, 2].map(p => <span key={p} className="h-1 w-1.5 rounded-r bg-violet-300/70" />)}
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-[13px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_12px_26px_-12px_rgba(217,70,239,0.6)] transition-transform group-hover:scale-105">
                      <card.icon className="h-6 w-6" strokeWidth={1.9} />
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.12em] text-violet-400" style={MONO}>{card.code}</span>
                  </div>
                  <h3 className="mt-4 font-display text-[1.08rem] font-bold tracking-[-0.02em] text-ink-900">{translateText(card.title)}</h3>
                  <p className="mt-1.5 flex-1 text-[12.5px] leading-[1.55] text-ink-600">{translateText(card.desc)}</p>
                  <div className="mt-5 grid grid-cols-4 gap-1.5" aria-hidden="true">
                    {[0, 1, 2, 3].map(unit => (
                      <span key={unit} className={`h-1.5 rounded-full ${unit <= index ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' : 'bg-violet-100'}`} />
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      {/* ══ 3. OUR WORK — inspection console (compact viewer) ══ */}
      <section id="work" className="relative scroll-mt-[calc(var(--app-navbar-height)+1rem)] w-full overflow-hidden bg-[#0b0322] py-6 text-white lg:h-[calc(100svh-var(--app-navbar-height,72px))] lg:py-0">
        <CustomBuildSectionBackdrop variant="hero" />
        <div className="relative z-10 mx-auto flex h-full w-full max-w-[1280px] flex-col justify-center px-[clamp(1rem,3vw,2.25rem)]">
          <Reveal className="mb-3 flex justify-center" y={20}>
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-100 backdrop-blur-md">
                <Boxes className="h-3.5 w-3.5 text-fuchsia-200" strokeWidth={2.4} />
                Our Work
              </span>
              <h2 className="mt-2 font-display text-[clamp(1.55rem,3vw,2.25rem)] font-extrabold leading-[1.02] tracking-[-0.035em] text-white">Built, tested, event-ready</h2>
              <p className="mx-auto mt-1.5 max-w-lg text-[12px] leading-[1.45] text-white/64">Preview a build, switch photos, then pick the next project from the list beside it.</p>
            </div>
          </Reveal>

          {builds.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-[20px] border border-dashed border-white/20 bg-white/[0.04] py-14 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-violet-200"><Boxes className="h-7 w-7" strokeWidth={1.8} /></span>
              <p className="mt-4 text-[1.05rem] font-bold">Builds coming soon</p>
              <p className="mt-1 text-[13px] text-white/55">Have a project in mind? Start the conversation.</p>
              <Link to="/contact" className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-[12px] font-bold text-white">Request a Custom Build Quote <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} /></Link>
            </div>
          ) : (
            <>
              {tabs.length > 0 && (
                <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
                  {['All', ...tabs].map(tab => {
                    const isActive = activeTab === tab
                    return (
                      <button key={tab} type="button" onClick={() => setActiveTab(tab)} aria-pressed={isActive} className={`relative rounded-full border px-4 py-1.5 text-[11.5px] font-bold transition-colors ${isActive ? 'border-transparent text-white' : 'border-white/15 bg-white/[0.04] text-white/70 hover:border-white/30 hover:text-white'}`}>
                        {isActive && <motion.span layoutId="cbTabPill" className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500" transition={{ type: 'spring', stiffness: 380, damping: 32 }} aria-hidden="true" />}
                        {tab}
                      </button>
                    )
                  })}
                </div>
              )}

              <div className="grid min-h-0 w-full grid-cols-1 gap-3 lg:grid-cols-[minmax(250px,310px)_minmax(0,1fr)] lg:items-start">
                {/* Registry list */}
                <div className="scrollbar-hide order-2 flex gap-2 overflow-x-auto rounded-[18px] border border-white/10 bg-white/[0.05] p-2 backdrop-blur-xl lg:order-1 lg:max-h-[520px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:p-2.5">
                  {visibleBuilds.map((build, index) => {
                    const key = buildKey(build, index)
                    const isActive = key === selectedKey
                    const images = buildImages(build)
                    const cover = images[0] || ''
                    const count = images.length
                    const description = cleanRepeatedText(build.description)
                    return (
                      <button key={key} type="button" onClick={() => setSelectedKey(key)} aria-pressed={isActive} className={`group flex w-[230px] shrink-0 items-start gap-3 rounded-[16px] border p-2.5 text-left transition-all sm:w-[250px] lg:w-full ${isActive ? 'border-fuchsia-300/70 bg-white/[0.14] shadow-[0_22px_46px_-28px_rgba(217,70,239,0.75)]' : 'border-white/10 bg-white/[0.035] hover:border-white/25 hover:bg-white/[0.08]'}`}>
                        <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[12px]">
                          <FramedImage media={cover} alt={build.title} width={320} height={240} loading="lazy" sizes="64px" fallbackTransform={{ fit: 'cover' }} className="h-full w-full object-cover" />
                          <span className="absolute right-0.5 top-0.5 inline-flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm" style={MONO}><Images className="h-2.5 w-2.5" strokeWidth={2.4} />{count}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-sans text-[13.5px] font-bold tracking-[-0.01em] text-white">{build.title}</span>
                          <span className="mt-0.5 block truncate text-[10px] font-semibold text-white/45" style={MONO}>{(build.category || 'CUSTOM').toUpperCase()}</span>
                          {description && <span className="mt-1 hidden line-clamp-2 text-[11px] font-medium leading-[1.35] text-white/55 lg:block">{description}</span>}
                          <span className={`mt-2 block h-1.5 rounded-full transition-colors ${isActive ? 'bg-gradient-to-r from-violet-400 to-fuchsia-400' : 'bg-white/10 group-hover:bg-white/20'}`} aria-hidden="true" />
                        </span>
                        <ChevronRight className={`h-4 w-4 shrink-0 transition-colors ${isActive ? 'text-fuchsia-300' : 'text-white/25 group-hover:text-white/50'}`} strokeWidth={2.4} />
                      </button>
                    )
                  })}
                </div>

                {/* Viewer / monitor — constrained size */}
                {selectedBuild && (
                  <div className="order-1 relative mx-auto w-full max-w-[900px] overflow-hidden rounded-[24px] border border-white/14 bg-[#0f0630]/88 p-2.5 shadow-[0_30px_76px_-44px_rgba(0,0,0,0.9)] lg:order-2">
                    <CornerTicks color="rgba(240,171,252,0.45)" />
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1.5" style={MONO}>
                      <span className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] text-white/50"><span className="h-2 w-2 animate-pulse rounded-full bg-fuchsia-400" /> LIVE BUILD VIEWER · {String(safeIdx + 1).padStart(2, '0')}/{String(photos.length).padStart(2, '0')}</span>
                      <button type="button" onClick={() => setLightbox({ open: true, images: photos, index: safeIdx })} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[10px] font-bold text-white/75 transition-colors hover:bg-white/[0.14] hover:text-white"><Maximize2 className="h-3 w-3" strokeWidth={2.4} /> FULLSCREEN</button>
                    </div>

                    <button type="button" onClick={() => setLightbox({ open: true, images: photos, index: safeIdx })} className="group relative block aspect-video w-full overflow-hidden rounded-[18px] bg-[#050214] outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400">
                      <AnimatePresence mode="wait">
                        <motion.div key={photos[safeIdx]} initial={motionEnabled ? { opacity: 0, scale: 1.03 } : false} animate={{ opacity: 1, scale: 1 }} exit={motionEnabled ? { opacity: 0 } : undefined} transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0">
                          <FramedImage media={photos[safeIdx]} alt={`${selectedBuild.title} — photo ${safeIdx + 1}`} width={1600} height={900} loading="eager" fetchPriority="high" sizes="(max-width: 1280px) 100vw, 1050px" fallbackTransform={{ fit: 'contain' }} className="h-full w-full object-contain" />
                        </motion.div>
                      </AnimatePresence>
                      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,2,18,0.42)_0%,rgba(5,2,18,0.12)_38%,rgba(5,2,18,0.04)_70%),linear-gradient(0deg,rgba(5,2,18,0.72)_0%,transparent_42%)]" aria-hidden="true" />
                      <span className="pointer-events-none absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100"><Maximize2 className="h-5 w-5" strokeWidth={2.2} /></span>
                      <span className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                        {selectedBuild.category && <span className="inline-flex items-center rounded-[6px] border border-white/20 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-violet-100 backdrop-blur-md" style={MONO}>{selectedBuild.category}</span>}
                        <span className="mt-2 block max-w-2xl font-display text-[clamp(1.45rem,3vw,2.4rem)] font-black leading-[1] tracking-[-0.035em] text-white">{selectedBuild.title}</span>
                        {selectedDescription && <span className="mt-2 line-clamp-2 block max-w-xl text-[12.5px] font-semibold leading-[1.55] text-white/75 sm:text-[13.5px]">{selectedDescription}</span>}
                      </span>
                      {photos.length > 1 && (
                        <>
                          <span role="button" tabIndex={-1} onClick={e => { e.stopPropagation(); stepPhoto(-1) }} className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:left-5"><ChevronLeft className="h-6 w-6" strokeWidth={2.2} /></span>
                          <span role="button" tabIndex={-1} onClick={e => { e.stopPropagation(); stepPhoto(1) }} className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/70 sm:right-5"><ChevronRight className="h-6 w-6" strokeWidth={2.2} /></span>
                        </>
                      )}
                    </button>

                    {photos.length > 1 && (
                      <div className="scrollbar-hide mx-auto mt-3 flex max-w-[760px] justify-start gap-2.5 overflow-x-auto px-1 pb-1 sm:justify-center">
                        {photos.map((src, i) => (
                          <button key={`${src}-${i}`} type="button" onClick={() => setPhotoIdx(i)} aria-pressed={i === safeIdx} className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-[12px] border transition-all ${i === safeIdx ? 'border-fuchsia-400 ring-2 ring-fuchsia-400/55' : 'border-white/10 opacity-65 hover:opacity-100'}`}>
                            <FramedImage media={src} alt="" width={384} height={216} loading="lazy" sizes="96px" fallbackTransform={{ fit: 'cover' }} className="h-full w-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 flex justify-center lg:hidden">
                <Link to="/contact" onMouseEnter={() => preloadRoute('/contact')} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-[12px] font-bold text-white transition-all hover:-translate-y-0.5">Request a Custom Build Quote <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} /></Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ══ 4. PROCESS — vertical scan lines ══ */}
      <section className="relative w-full overflow-hidden bg-[#f7f4ff] py-[clamp(3.5rem,7vw,5.5rem)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" aria-hidden="true" />
        <div className="site-container-wide relative">
          <Reveal className="mb-12 flex justify-center" y={20}>
            <SectionHead icon={FlaskConical} eyebrow="Process" title="From idea to a real, event-ready build." desc="Four clear steps. Every custom request is reviewed before pricing and timeline confirmation." />
          </Reveal>

          <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <div className="pointer-events-none absolute left-[12%] right-[12%] top-9 hidden h-[2px] overflow-hidden rounded-full bg-violet-200 lg:block" aria-hidden="true">
              <motion.span className="block h-full w-full bg-gradient-to-r from-violet-400 to-fuchsia-400" initial={motionEnabled ? { scaleX: 0 } : false} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} style={{ transformOrigin: 'left' }} />
            </div>
            {processSteps.map((step, index) => (
              <Reveal key={step.title} delay={Math.min(index * 0.1, 0.3)} y={22} className="h-full">
                <div className="relative flex h-full flex-col items-center text-center">
                  <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-[20px] border border-violet-200/80 bg-white text-violet-700 shadow-[0_24px_52px_-34px_rgba(124,58,237,0.55)]">
                    <step.icon className="h-7 w-7" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-1 font-display text-[1.05rem] font-bold tracking-[-0.02em] text-ink-900">{translateText(step.title)}</h3>
                  <p className="mt-1.5 max-w-[15rem] text-[12px] leading-[1.55] text-ink-600">{translateText(step.detail)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal y={16} delay={0.12}>
            <p className="mx-auto mt-12 max-w-2xl rounded-[14px] border border-violet-200/80 bg-white px-5 py-3.5 text-center text-[12.5px] leading-[1.6] text-ink-600 shadow-[0_18px_44px_-34px_rgba(124,58,237,0.45)]">
              <ShieldCheck className="mr-1.5 inline h-4 w-4 -translate-y-0.5 text-violet-600" strokeWidth={2.2} />
              {translateText('Custom builds can be reviewed for rental, purchase, or international shipping depending on scope, size, materials, and timeline.')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ 5. WHO IT'S FOR — gradient mesh ══ */}
      <section className="relative w-full overflow-hidden py-[clamp(3rem,5vw,4.5rem)]">
        <CustomBuildSectionBackdrop variant="deployment" />
        <div className="site-container-wide relative z-10">
          <Reveal className="mb-8 flex justify-center" y={20}>
            <SectionHead icon={Users} eyebrow="Who it's for" title="Built for the way your event moves" desc="Every build is planned around the people using it, the place it runs, and the route it takes to launch." />
          </Reveal>
          <Reveal y={22}>
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/75 bg-white/86 p-4 shadow-[0_34px_90px_-58px_rgba(89,23,196,0.58)] backdrop-blur-md sm:p-5 lg:p-6">
              <CornerTicks color="rgba(124,58,237,0.32)" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply" style={{ backgroundImage: GRAIN }} aria-hidden="true" />
              <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-fuchsia-300/28 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -right-24 bottom-4 h-72 w-72 rounded-full bg-cyan-300/24 blur-3xl" aria-hidden="true" />

              <div className="relative mb-4 overflow-hidden rounded-[24px] border border-white/15 bg-[#14042d] px-5 py-5 text-white shadow-[0_22px_54px_-34px_rgba(20,4,45,0.8)] sm:px-6 lg:px-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(217,70,239,0.34),transparent_32%),radial-gradient(circle_at_84%_30%,rgba(45,212,191,0.22),transparent_34%),linear-gradient(135deg,rgba(124,58,237,0.38),transparent_58%)]" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent" aria-hidden="true" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-3xl">
                    <span className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-100" style={MONO}>Who we build for</span>
                    <h3 className="mt-2 font-display text-2xl font-black leading-tight tracking-normal text-white sm:text-3xl lg:text-4xl">Built around the audience, space, and delivery.</h3>
                  </div>
                  <div className="grid w-full grid-cols-3 gap-2 lg:max-w-[470px]">
                    {['Audience', 'Venue', 'Delivery'].map((label) => (
                      <span key={label} className="rounded-[16px] border border-white/18 bg-white/10 px-3.5 py-3 text-center text-[12px] font-extrabold leading-tight text-white backdrop-blur-md">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[24px] border border-violet-200/65 bg-white/82">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-400 to-cyan-300" aria-hidden="true" />
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {audiences.map((card, index) => (
                    <motion.div
                      key={card.title}
                      initial={motionEnabled ? { opacity: 0, y: 12 } : false}
                      whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined}
                      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                      transition={motionEnabled ? { duration: 0.5, delay: Math.min(index * 0.06, 0.24), ease: EASE } : undefined}
                      className="group relative flex min-h-[260px] flex-col border-b border-violet-100/80 p-5 text-left last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-violet-500 text-white shadow-[0_16px_34px_-20px_rgba(217,70,239,0.78)] transition-transform duration-300 group-hover:scale-105">
                          <card.icon className="h-6 w-6" strokeWidth={2} />
                        </span>
                        <span className="rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600" style={MONO}>
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <h3 className="mt-5 font-display text-[1.18rem] font-black tracking-normal text-ink-950 sm:text-[1.28rem]">{card.title}</h3>
                      <p className="mt-2 text-[13px] leading-[1.6] text-ink-600">{card.desc}</p>

                      <div className="mt-5 grid gap-2">
                        {(audienceFitNotes[index] ?? []).map((note) => (
                          <span key={note} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/65 px-3 text-[11px] font-extrabold text-violet-800">
                            <Check className="h-3.5 w-3.5 text-fuchsia-500" strokeWidth={3} />
                            {note}
                          </span>
                        ))}
                      </div>

                      <span className="mt-auto block pt-5">
                        <span className="block h-1.5 overflow-hidden rounded-full bg-violet-100">
                          <motion.span
                            className="block h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-400 to-cyan-300"
                            initial={motionEnabled ? { width: '18%' } : false}
                            whileInView={motionEnabled ? { width: '100%' } : undefined}
                            viewport={{ once: true }}
                            transition={motionEnabled ? { duration: 0.75, delay: 0.1 + index * 0.06, ease: EASE } : undefined}
                          />
                        </span>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ 6. INTAKE — split colored panel ══ */}
      <section className="site-section">
        <div className="site-container-wide">
          <div className="relative overflow-hidden rounded-[26px] border border-violet-200/70 bg-white shadow-[0_30px_70px_-50px_rgba(89,23,196,0.5)]">
            <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr]">
              <Reveal y={0} className="relative overflow-hidden bg-gradient-to-br from-[#4912a0] via-[#6d1fd0] to-[#a126c9] p-7 text-white sm:p-9">
                <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-fuchsia-400/30 blur-3xl" aria-hidden="true" />
                <div className="pointer-events-none absolute inset-0 opacity-[0.1] mix-blend-overlay" style={{ backgroundImage: GRAIN }} aria-hidden="true" />
                <div className="relative">
                  <SectionHead icon={Send} eyebrow="Intake" title="What to send us" desc="Even a rough idea is enough — the more you share, the faster we can review rental, purchase, shipping, and quote scope." dark align="left" />
                  <Link to="/contact" onMouseEnter={() => preloadRoute('/contact')} className="group mt-7 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-bold text-violet-800 transition-all hover:-translate-y-0.5">Request a Custom Build Quote <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.2} /></Link>
                </div>
              </Reveal>

              <div className="p-7 sm:p-9">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-400" style={MONO}>Intake checklist</span>
                <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {reviewChecklist.map((item, index) => (
                    <motion.div key={item} initial={motionEnabled ? { opacity: 0, y: 12 } : false} whileInView={motionEnabled ? { opacity: 1, y: 0 } : undefined} viewport={{ once: true, margin: '0px 0px -10% 0px' }} transition={motionEnabled ? { duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: EASE } : undefined} className="flex items-center gap-3 rounded-[12px] border border-violet-200/70 bg-violet-50/40 px-3.5 py-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white"><Check className="h-3 w-3" strokeWidth={3} /></span>
                      <span className="text-[12.5px] font-semibold leading-[1.35] text-ink-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 7. GLOBAL REACH — real 3D globe ══ */}
      <section id="global-reach" className="relative w-full overflow-hidden bg-[#0b0324] py-[clamp(3.5rem,7vw,5.5rem)] text-white">
        <CustomBuildSectionBackdrop variant="hero" />
        <div className="site-container-wide relative z-10">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
            <Reveal y={24}>
              <SectionHead icon={Globe2} eyebrow="Global reach" title="Built in Jordan and reviewed for local or international delivery." desc="From our Amman lab, builds are delivered locally and shipped worldwide after a logistics review." dark align="left" />

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {deliveryModes.map((mode, index) => (
                  <Reveal key={mode.title} delay={Math.min(index * 0.08, 0.24)} y={16} className="h-full">
                    <div className="flex h-full items-start gap-3 rounded-[14px] border border-white/12 bg-white/[0.05] p-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white"><mode.icon className="h-4 w-4" strokeWidth={2.1} /></span>
                      <div>
                        <h3 className="font-sans text-[13px] font-bold tracking-[-0.01em] text-white">{mode.title}</h3>
                        <p className="mt-0.5 text-[11px] leading-[1.45] text-white/55">{mode.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
              <p className="mt-6 text-[11.5px] leading-[1.55] text-white/45" style={MONO}>INTL SHIPPING · COST &amp; TIMELINE CONFIRMED AFTER SIZE / DESTINATION / CUSTOMS REVIEW</p>
            </Reveal>

            <Reveal y={28} delay={0.1}>
              <LazyGlobe />
              <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/45" style={MONO} aria-hidden="true">Amman → Worldwide</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ 8. FAQ — knowledge base ══ */}
      <section className="site-section">
        <div className="site-container-wide">
          <Reveal className="mb-10 flex justify-center" y={20}>
            <SectionHead icon={HelpCircle} eyebrow="Knowledge base" title="Before you start a build" />
          </Reveal>
          <FaqAccordion items={faqs} />
        </div>
      </section>

      {/* ══ 9. CTA ══ */}
      <section className="site-section">
        <div className="site-container-wide">
          <Reveal y={24}>
            <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#190453] via-[#4912a0] to-[#a126c9] px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/40 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" style={{ backgroundImage: GRAIN }} aria-hidden="true" />
              <div className="relative mx-auto max-w-2xl">
                <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/55" style={MONO}>Open a build ticket</span>
                <h2 className="mt-3 font-display text-[clamp(1.85rem,4.4vw,2.85rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">Have an idea for a custom build?</h2>
                <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-[1.7] text-white/80">Send a concept, sketch, or event goal and we'll review how to bring it to life.</p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/contact" onMouseEnter={() => preloadRoute('/contact')} className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-bold text-violet-800 transition-all hover:-translate-y-0.5 sm:w-auto">Request a Custom Build Quote <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} /></Link>
                  <a href={`mailto:${BOOKING_EMAIL}`} className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto">Email Eventies Team</a>
                </div>
                <a href={`mailto:${BOOKING_EMAIL}`} className="mt-5 inline-block text-[12.5px] font-semibold text-white/75 underline decoration-white/40 underline-offset-2 hover:text-white" style={MONO}>{BOOKING_EMAIL}</a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      </div>
      <Lightbox images={lightbox.images} initialIndex={lightbox.index} open={lightbox.open} onClose={() => setLightbox(s => ({ ...s, open: false }))} />
    </div>
  )
}
