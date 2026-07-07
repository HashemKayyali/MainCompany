import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
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
  Images,
  Lightbulb,
  MapPin,
  type LucideIcon,
  Maximize2,
  PackageCheck,
  Radio,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from 'lucide-react'
import type { CustomBuild } from '../data/custom-builds'
import { useCustomBuildsData } from '../contexts/DataContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { useElementActivity } from '../hooks/useElementActivity'
import { useMotionEnabled } from '../hooks/useMotionEnabled'
import { preloadRoute } from '../utils/route-preload'
import FramedImage from '../components/ui/FramedImage'
import Reveal from '../components/home/Reveal'
import Lightbox from '../components/gallery/Lightbox'
import EventiesHero from '../components/layout/EventiesHero'
import { useI18n } from '../contexts/LanguageContext'

const BOOKING_EMAIL = 'booking@eventiesjo.com'
const EASE = [0.16, 1, 0.3, 1] as const
const MONO: CSSProperties = {
  fontFamily:
    'ui-monospace, "SF Mono", "Cascadia Mono", Menlo, Consolas, monospace',
}

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

const buildTypes: {
  code: string
  title: string
  desc: string
  icon: LucideIcon
}[] = [
  {
    code: 'MOD-01',
    title: 'Interactive Games',
    desc: 'Challenge, scoring & reaction games.',
    icon: Gamepad2,
  },
  {
    code: 'MOD-02',
    title: 'Booths & Activations',
    desc: 'Branded booths & launch stations.',
    icon: Boxes,
  },
  {
    code: 'MOD-03',
    title: 'Hardware + Software',
    desc: 'Screens, sensors, lighting & scoring.',
    icon: Cpu,
  },
  {
    code: 'MOD-04',
    title: 'Special Project Builds',
    desc: 'One-off ideas, designed & fabricated.',
    icon: Wrench,
  },
]

type CapabilityItem = {
  id: string
  code: string
  title: string
  titleAr: string
  shortTitle: string
  shortTitleAr: string
  description: string
  descriptionAr: string
  image: string
  icon: LucideIcon
  tags: string[]
}

const capabilities: CapabilityItem[] = [
  {
    id: 'custom-pcb',
    code: 'CAP-01',
    title: 'Custom PCB & Electronics Design',
    titleAr: 'تصميم الدوائر الإلكترونية وPCB',
    shortTitle: 'Custom PCB Design',
    shortTitleAr: 'تصميم الدوائر وPCB',
    description:
      'We design custom circuit boards and electronic control systems around the exact requirements of each interactive build.',
    descriptionAr:
      'نصمم لوحات إلكترونية وأنظمة تحكم مخصصة حسب متطلبات كل تجربة، من توزيع الطاقة وربط الحساسات إلى التحكم الكامل بالنظام.',
    image: '/images/custom-builds/capabilities/custom-pcb.webp',
    icon: CircuitBoard,
    tags: [
      'PCB Design',
      'Control Boards',
      'Power Systems',
      'Electronic Interfaces',
    ],
  },
  {
    id: 'embedded-systems',
    code: 'CAP-02',
    title: 'Embedded Systems & Firmware',
    titleAr: 'الأنظمة المدمجة والبرمجة الداخلية',
    shortTitle: 'Embedded Systems',
    shortTitleAr: 'الأنظمة المدمجة',
    description:
      'We develop the embedded logic that connects sensors, motors, lighting, displays, and physical interaction in real time.',
    descriptionAr:
      'نطوّر البرمجيات الداخلية التي تربط الحساسات والمحركات والإضاءة والشاشات، وتدير تفاعل النظام بشكل لحظي.',
    image: '/images/custom-builds/capabilities/embedded-systems.webp',
    icon: Cpu,
    tags: ['Firmware', 'Sensors', 'MCU', 'Real-Time Control'],
  },
  {
    id: 'interactive-software',
    code: 'CAP-03',
    title: 'Interactive Software & Game Systems',
    titleAr: 'البرمجيات والأنظمة التفاعلية',
    shortTitle: 'Interactive Software',
    shortTitleAr: 'البرمجيات التفاعلية',
    description:
      'We build interactive games, live control systems, score engines, dashboards, and digital experiences connected to real-world activity.',
    descriptionAr:
      'نطوّر الألعاب والأنظمة التفاعلية ولوحات النتائج والتحكم، ونربط النشاط الحقيقي بالتجربة الرقمية بشكل لحظي.',
    image: '/images/custom-builds/capabilities/interactive-software.webp',
    icon: Gamepad2,
    tags: ['Interactive Games', 'Live Data', 'Dashboards', 'Game Logic'],
  },
  {
    id: 'hardware-integration',
    code: 'CAP-04',
    title: 'Hardware Engineering & System Integration',
    titleAr: 'هندسة الهاردوير وتكامل الأنظمة',
    shortTitle: 'Hardware Integration',
    shortTitleAr: 'تكامل الأنظمة والهاردوير',
    description:
      'We bring electronics, software, sensors, mechanics, displays, and physical structures together into one complete working system.',
    descriptionAr:
      'ندمج الإلكترونيات والبرمجيات والحساسات والآليات والشاشات والهياكل في نظام واحد متكامل وجاهز للعمل.',
    image: '/images/custom-builds/capabilities/hardware-integration.webp',
    icon: Wrench,
    tags: ['System Integration', 'Mechanisms', 'Enclosures', 'Assembly'],
  },
  {
    id: '3d-prototyping',
    code: 'CAP-05',
    title: '3D Printing & Rapid Prototyping',
    titleAr: 'الطباعة ثلاثية الأبعاد والنماذج الأولية',
    shortTitle: '3D Prototyping',
    shortTitleAr: 'الطباعة والنماذج الأولية',
    description:
      'We rapidly prototype custom parts, enclosures, mounts, and mechanisms to test ideas and refine the build before final production.',
    descriptionAr:
      'نصنع نماذج وقطعًا وهياكل مخصصة بسرعة لتجربة الفكرة واختبارها وتطويرها قبل الوصول إلى النسخة النهائية.',
    image: '/images/custom-builds/capabilities/3d-prototyping.webp',
    icon: Boxes,
    tags: ['3D Printing', 'Rapid Prototyping', 'Custom Parts', 'Enclosures'],
  },
  {
    id: 'electronics-lab',
    code: 'CAP-06',
    title: 'Electronics Lab, Testing & Calibration',
    titleAr: 'مختبر الإلكترونيات والاختبار والمعايرة',
    shortTitle: 'Testing Lab',
    shortTitleAr: 'الاختبار والمعايرة',
    description:
      'Every system is measured, tested, calibrated, and validated before deployment to ensure stable performance in real event conditions.',
    descriptionAr:
      'نقيس الأنظمة ونختبرها ونعايرها قبل التشغيل لضمان أداء مستقر وموثوق في ظروف الفعاليات الحقيقية.',
    image: '/images/custom-builds/capabilities/electronics-lab.webp',
    icon: FlaskConical,
    tags: ['Testing', 'Calibration', 'Diagnostics', 'Validation'],
  },
]


type LabWorkflowItem = {
  title: string
  titleAr: string
  desc: string
  descAr: string
  icon: LucideIcon
}

const labWorkflow: LabWorkflowItem[] = [
  {
    title: 'Electronics Design',
    titleAr: 'تصميم الإلكترونيات',
    desc: 'Custom circuits, control boards, sensors, and power architecture.',
    descAr: 'دوائر مخصصة، لوحات تحكم، حساسات وأنظمة طاقة.',
    icon: CircuitBoard,
  },
  {
    title: 'Firmware & Control',
    titleAr: 'البرمجة والتحكم',
    desc: 'Embedded logic that connects motion, lighting, motors, and displays.',
    descAr: 'برمجة داخلية تربط الحركة والإضاءة والمحركات والشاشات.',
    icon: Cpu,
  },
  {
    title: 'Rapid Prototyping',
    titleAr: 'النماذج الأولية',
    desc: 'Fast physical iterations for parts, enclosures, and mechanisms.',
    descAr: 'نماذج سريعة للقطع والهياكل والآليات قبل النسخة النهائية.',
    icon: Boxes,
  },
  {
    title: 'Integration & Assembly',
    titleAr: 'التجميع والتكامل',
    desc: 'Hardware, software, electronics, and mechanics brought together.',
    descAr: 'دمج الهاردوير والبرمجيات والإلكترونيات والميكانيك في نظام واحد.',
    icon: Wrench,
  },
  {
    title: 'Testing & Calibration',
    titleAr: 'الاختبار والمعايرة',
    desc: 'Measurement, diagnostics, tuning, and reliability checks before deployment.',
    descAr: 'قياس وتشخيص ومعايرة واختبارات موثوقية قبل التشغيل.',
    icon: FlaskConical,
  },
]

type BuildPossibilityItem = {
  title: string
  titleAr: string
  desc: string
  descAr: string
  icon: LucideIcon
}

const buildPossibilities: BuildPossibilityItem[] = [
  {
    title: 'Interactive Games',
    titleAr: 'ألعاب تفاعلية',
    desc: 'Competitive games, reaction challenges, scoring systems, and multiplayer experiences.',
    descAr: 'ألعاب تنافسية وتجارب متعددة اللاعبين.',
    icon: Gamepad2,
  },
  {
    title: 'Branded Activations',
    titleAr: 'تجارب للعلامات التجارية',
    desc: 'Custom interactive experiences designed around campaigns, launches, and brand goals.',
    descAr: 'تجارب تفاعلية خاصة بالعلامات التجارية والحملات.',
    icon: Building2,
  },
  {
    title: 'Motion-Based Experiences',
    titleAr: 'تجارب تعتمد على الحركة',
    desc: 'Systems driven by movement, speed, touch, distance, pressure, or tracking.',
    descAr: 'أنظمة تعتمد على الحركة والسرعة واللمس أو التتبع.',
    icon: Radio,
  },
  {
    title: 'Smart Installations',
    titleAr: 'تركيبات تفاعلية ذكية',
    desc: 'Interactive installations combining lighting, sound, screens, sensors, and control.',
    descAr: 'تركيبات تفاعلية تجمع الإضاءة والصوت والشاشات والحساسات.',
    icon: CircuitBoard,
  },
  {
    title: 'Custom Event Technology',
    titleAr: 'تقنيات مخصصة للفعاليات',
    desc: 'Purpose-built devices and systems designed for a specific event requirement or workflow.',
    descAr: 'أنظمة وأجهزة خاصة بمتطلبات الفعالية.',
    icon: Cpu,
  },
  {
    title: 'Gamified Experiences',
    titleAr: 'تجارب بأسلوب اللعب',
    desc: 'Turn participation into a game with points, levels, timers, rankings, and live leaderboards.',
    descAr: 'تحويل النشاط أو التحدي إلى تجربة لعب مع نقاط ونتائج ولوحات صدارة.',
    icon: Users,
  },
]

const heroFocusAreas: { label: string; labelAr: string; icon: LucideIcon }[] = [
  { label: 'Design', labelAr: 'تصميم', icon: Lightbulb },
  { label: 'Engineering', labelAr: 'هندسة', icon: Cpu },
  { label: 'R&D', labelAr: 'بحث وتطوير', icon: FlaskConical },
  { label: 'Prototyping', labelAr: 'نماذج أولية', icon: CircuitBoard },
  { label: 'Fabrication', labelAr: 'تصنيع', icon: Hammer },
]

const heroLabCards: {
  title: string
  detail: string
  code: string
  icon: LucideIcon
}[] = [
  {
    title: 'Concept Design',
    detail: 'Sketches, flow, user interaction',
    code: 'DES-01',
    icon: Lightbulb,
  },
  {
    title: 'Engineering',
    detail: 'Structure, electronics, controls',
    code: 'ENG-02',
    icon: Cpu,
  },
  {
    title: 'R&D Testing',
    detail: 'Prototype trials and validation',
    code: 'RND-03',
    icon: FlaskConical,
  },
  {
    title: 'Fabrication',
    detail: 'Build, finish, pack, deploy',
    code: 'FAB-04',
    icon: Wrench,
  },
]

const processSteps: {
  title: string
  titleAr: string
  detail: string
  detailAr: string
  icon: LucideIcon
}[] = [
  {
    title: 'Share the idea',
    titleAr: 'شاركنا الفكرة',
    detail: 'A sketch, reference, or goal is enough.',
    detailAr: 'يكفي رسم أولي أو مرجع أو هدف واضح للفعالية.',
    icon: Lightbulb,
  },
  {
    title: 'Define scope',
    titleAr: 'نحدد نطاق التنفيذ',
    detail: 'Flow, materials, tech, branding, and timeline.',
    detailAr: 'نحدد مسار التجربة والمواد والتقنيات والهوية والجدول الزمني.',
    icon: FlaskConical,
  },
  {
    title: 'Build & test',
    titleAr: 'نبني ونختبر',
    detail: 'Fabricated, assembled, event-tested.',
    detailAr: 'نصنع النظام ونجمعه ونختبره في ظروف تحاكي الفعالية.',
    icon: Hammer,
  },
  {
    title: 'Deliver or ship',
    titleAr: 'نسلّم أو نشحن',
    detail: 'Local delivery or worldwide shipping.',
    detailAr: 'تسليم محلي أو شحن دولي وفق متطلبات المشروع.',
    icon: PackageCheck,
  },
]

const audiences: {
  title: string
  titleAr: string
  desc: string
  descAr: string
  icon: LucideIcon
}[] = [
  {
    title: 'Brands & Companies',
    titleAr: 'العلامات التجارية والشركات',
    desc: 'Campaigns, launches & engagement.',
    descAr: 'حملات وإطلاقات وتجارب ترفع تفاعل الجمهور.',
    icon: Building2,
  },
  {
    title: 'Agencies & Event Organizers',
    titleAr: 'الوكالات ومنظمو الفعاليات',
    desc: 'Custom activations for client work.',
    descAr: 'تجارب مخصصة لمشاريع العملاء والفعاليات.',
    icon: Users,
  },
  {
    title: 'Universities & Public Events',
    titleAr: 'الجامعات والفعاليات العامة',
    desc: 'Campus & festival engagement zones.',
    descAr: 'مناطق تفاعلية للجامعات والمهرجانات والفعاليات الجماهيرية.',
    icon: MapPin,
  },
  {
    title: 'Global Clients',
    titleAr: 'العملاء الدوليون',
    desc: 'Built, packed & shipped after review.',
    descAr: 'تنفيذ وتجهيز وتغليف وشحن بعد مراجعة متطلبات التسليم.',
    icon: Globe2,
  },
]

const audienceFitNotes = [
  ['Brand launch', 'Guest engagement', 'On-site support'],
  ['Client activation', 'Fast approval', 'Reusable setup'],
  ['Campus events', 'High traffic', 'Easy staffing'],
  ['Remote approval', 'Packed safely', 'Worldwide shipping'],
]

const audienceFitNotesAr = [
  ['إطلاق علامة تجارية', 'تفاعل الضيوف', 'دعم في الموقع'],
  ['تنفيذ للعملاء', 'اعتماد سريع', 'إعداد قابل لإعادة الاستخدام'],
  ['فعاليات جامعية', 'حركة جمهور كبيرة', 'تشغيل سهل'],
  ['اعتماد عن بُعد', 'تغليف آمن', 'شحن دولي'],
]


const deliveryModes: {
  title: string
  titleAr: string
  desc: string
  descAr: string
  icon: LucideIcon
}[] = [
  {
    title: 'Local Delivery',
    titleAr: 'تسليم محلي',
    desc: 'Installed across Jordan.',
    descAr: 'تركيب وتسليم داخل الأردن.',
    icon: Truck,
  },
  {
    title: 'Regional Projects',
    titleAr: 'مشاريع إقليمية',
    desc: 'Events across the region.',
    descAr: 'تنفيذ لمشاريع وفعاليات في المنطقة.',
    icon: Radio,
  },
  {
    title: 'International Shipping',
    titleAr: 'شحن دولي',
    desc: 'Packed & shipped worldwide.',
    descAr: 'تغليف وتجهيز للشحن إلى مختلف الدول.',
    icon: Globe2,
  },
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

const GLOBE_TEXTURE_SRC = '/assets/globe/earth-blue-marble.jpg'
let globeAssetsPreloadStarted = false

function preloadGlobeAssets(): void {
  if (globeAssetsPreloadStarted || typeof window === 'undefined') return
  globeAssetsPreloadStarted = true

  void import('three').catch(() => undefined)

  const image = new Image()
  image.decoding = 'async'
  image.src = GLOBE_TEXTURE_SRC
}

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
    const mouse: { x: number | null; y: number | null; radius: number } = {
      x: null,
      y: null,
      radius: 190,
    }

    const drawParticle = (particle: FlowParticle) => {
      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(191, 128, 255, 0.8)'
      ctx.fill()
    }

    const initParticles = () => {
      particles = []
      const count = Math.min(
        Math.max(Math.floor((width * height) / 9000), 28),
        140
      )
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
              isMouseConnection =
                Math.sqrt(mouseDx * mouseDx + mouseDy * mouseDy) < mouse.radius
            }

            ctx.strokeStyle = isMouseConnection
              ? `rgba(255, 255, 255, ${opacity})`
              : `rgba(200, 150, 255, ${opacity})`
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
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      ) {
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

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}

/** Bigger, cleaner section header used across all sections. */
function SectionHead({
  icon: Icon,
  eyebrow,
  title,
  desc,
  dark = false,
  align = 'center',
}: {
  icon: LucideIcon
  eyebrow: string
  title: ReactNode
  desc?: string
  dark?: boolean
  align?: 'center' | 'left'
}) {
  const centered = align === 'center'
  const { translateText, locale } = useI18n()
  const isArabic = locale === 'ar'
  const translateNode = (value: ReactNode) =>
    typeof value === 'string' ? translateText(value) : value
  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className={`${centered ? 'mx-auto max-w-2xl text-center' : 'max-w-xl'} ${!centered && isArabic ? 'text-right' : ''}`}
    >
      <span
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.18em] ${dark ? 'border-white/20 bg-white/[0.08] text-violet-100' : 'border-violet-200 bg-white text-violet-700 shadow-[0_8px_24px_-16px_rgba(124,58,237,0.4)]'}`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-md ${dark ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white' : 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white'}`}
        >
          <Icon className="h-3 w-3" strokeWidth={2.6} />
        </span>
        {translateText(eyebrow)}
      </span>
      <h2
        className={`mt-5 font-display text-[clamp(2rem,4.4vw,3.1rem)] font-extrabold ${isArabic ? 'leading-[1.18] tracking-[-0.015em]' : 'leading-[1.03] tracking-[-0.04em]'} ${dark ? 'text-white' : 'text-ink-900'}`}
      >
        {translateNode(title)}
      </h2>
      {desc && (
        <p
          className={`mt-4 text-[14px] ${isArabic ? 'leading-[1.85]' : 'leading-[1.7]'} ${centered ? 'mx-auto max-w-lg' : 'max-w-md'} ${dark ? 'text-white/70' : 'text-ink-600'}`}
        >
          {translateText(desc)}
        </p>
      )}
    </div>
  )
}

function CornerTicks({ color = 'rgba(124,58,237,0.45)' }: { color?: string }) {
  const base = 'pointer-events-none absolute h-3.5 w-3.5'
  return (
    <>
      <span
        className={`${base} left-2 top-2 border-l border-t`}
        style={{ borderColor: color }}
        aria-hidden="true"
      />
      <span
        className={`${base} right-2 top-2 border-r border-t`}
        style={{ borderColor: color }}
        aria-hidden="true"
      />
      <span
        className={`${base} bottom-2 left-2 border-b border-l`}
        style={{ borderColor: color }}
        aria-hidden="true"
      />
      <span
        className={`${base} bottom-2 right-2 border-b border-r`}
        style={{ borderColor: color }}
        aria-hidden="true"
      />
    </>
  )
}

function WorkSideDecor({ side }: { side: 'left' | 'right' }) {
  const motionEnabled = useMotionEnabled()
  const { ref: activityRef, active: activityActive } =
    useElementActivity<HTMLDivElement>()
  const effectiveMotion = motionEnabled && activityActive
  const isLeft = side === 'left'
  const sideClass = isLeft ? 'left-8 2xl:left-20' : 'right-8 2xl:right-20'
  const cardAlign = isLeft ? 'items-start text-left' : 'items-end text-right'
  const rowDir = isLeft ? 'flex-row' : 'flex-row-reverse'

  return (
    <div
      ref={activityRef}
      className={`pointer-events-none absolute top-1/2 z-[1] hidden -translate-y-1/2 ${sideClass} xl:block`}
      aria-hidden="true"
    >
      <div className="relative h-[300px] w-[190px] 2xl:h-[330px] 2xl:w-[230px]">
        <div
          className={`absolute inset-y-8 ${isLeft ? 'left-1/2 right-0' : 'left-0 right-1/2'} rounded-full bg-gradient-to-b ${isLeft ? 'from-fuchsia-500/8 via-violet-500/8 to-cyan-400/6' : 'from-cyan-400/6 via-violet-500/8 to-fuchsia-500/8'} blur-3xl`}
        />

        <motion.div
          className={`absolute ${isLeft ? 'left-3 top-1' : 'right-3 top-1'} h-[112px] w-[112px] rounded-full border border-white/12 bg-white/[0.04] backdrop-blur-sm`}
          animate={
            effectiveMotion
              ? { y: [0, -7, 0], rotate: isLeft ? [0, 6, 0] : [0, -6, 0] }
              : undefined
          }
          transition={
            effectiveMotion
              ? { duration: 8.5, repeat: Infinity, ease: 'easeInOut' }
              : undefined
          }
        >
          <span className="absolute inset-[13px] rounded-full border border-dashed border-white/18" />
          <span className="absolute inset-[29px] rounded-full border border-white/12" />
          <span className="absolute inset-0 flex items-center justify-center text-fuchsia-200/90">
            <CircuitBoard className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <span className="absolute left-[12px] top-[40px] flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#16053a]/80 text-violet-100 shadow-[0_12px_28px_-20px_rgba(217,70,239,0.85)]">
            <Cpu className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="absolute right-[10px] top-[18px] flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#16053a]/80 text-fuchsia-100 shadow-[0_12px_28px_-20px_rgba(217,70,239,0.85)]">
            <Radio className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <span className="absolute bottom-[14px] left-1/2 flex h-7 w-7 -translate-x-1/2 items-center justify-center rounded-full border border-white/10 bg-[#16053a]/80 text-cyan-100 shadow-[0_12px_28px_-20px_rgba(59,130,246,0.85)]">
            <Lightbulb className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
        </motion.div>

        <motion.div
          className={`absolute ${isLeft ? 'left-0 top-[138px]' : 'right-0 top-[132px]'} flex w-[170px] flex-col gap-2.5 rounded-[22px] border border-white/10 bg-white/[0.05] p-3.5 shadow-[0_26px_60px_-44px_rgba(0,0,0,0.88)] backdrop-blur-md 2xl:w-[200px]`}
          animate={effectiveMotion ? { y: [0, 8, 0] } : undefined}
          transition={
            effectiveMotion
              ? {
                  duration: 9.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: isLeft ? 0.6 : 0.2,
                }
              : undefined
          }
        >
          <div className={`flex ${rowDir} items-center gap-2`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/85 to-fuchsia-500/85 text-white shadow-[0_16px_32px_-18px_rgba(217,70,239,0.92)]">
              {isLeft ? (
                <Wrench className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Cpu className="h-4 w-4" strokeWidth={2.2} />
              )}
            </span>
            <div className={`flex flex-1 flex-col ${cardAlign}`}>
              <span className="h-2 w-14 rounded-full bg-white/70" />
              <span className="mt-2 h-1.5 w-20 rounded-full bg-white/18" />
            </div>
          </div>
          <div className="rounded-[16px] border border-white/10 bg-[#12052f]/55 p-2.5">
            <div className={`flex ${rowDir} items-center gap-2`}>
              <span className="h-2 w-2 rounded-full bg-fuchsia-300 shadow-[0_0_14px_rgba(244,114,182,0.95)]" />
              <span className="h-1.5 flex-1 rounded-full bg-white/12" />
            </div>
            <div className={`mt-2.5 flex ${rowDir} items-center gap-2`}>
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.95)]" />
              <span className="h-1.5 flex-1 rounded-full bg-white/12" />
            </div>
            <div className={`mt-2.5 flex ${rowDir} items-center gap-2`}>
              <span className="h-2 w-2 rounded-full bg-violet-300 shadow-[0_0_14px_rgba(196,181,253,0.95)]" />
              <span className="h-1.5 flex-1 rounded-full bg-white/12" />
            </div>
          </div>
        </motion.div>

        <motion.div
          className={`absolute ${isLeft ? 'bottom-1 left-6' : 'bottom-1 right-6'} flex ${rowDir} gap-2`}
          animate={effectiveMotion ? { y: [0, -5, 0] } : undefined}
          transition={
            effectiveMotion
              ? {
                  duration: 7.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: isLeft ? 0.3 : 0.8,
                }
              : undefined
          }
        >
          {[CircuitBoard, Radio, Cpu].map((Icon, idx) => (
            <span
              key={idx}
              className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/70 backdrop-blur-sm"
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
          ))}
        </motion.div>

        <svg
          className={`absolute ${isLeft ? 'left-[58px] top-[86px]' : 'right-[58px] top-[88px]'} h-[158px] w-[118px] opacity-55`}
          viewBox="0 0 132 188"
          fill="none"
        >
          <path
            d={
              isLeft
                ? 'M10 18 C54 18, 54 54, 88 54 S122 86, 80 98 S40 132, 76 150 S108 174, 120 174'
                : 'M122 18 C78 18, 78 54, 44 54 S10 86, 52 98 S92 132, 56 150 S24 174, 12 174'
            }
            stroke="rgba(244,114,182,0.42)"
            strokeWidth="2"
            strokeDasharray="6 7"
            strokeLinecap="round"
          />
          <circle
            cx={isLeft ? '88' : '44'}
            cy="54"
            r="4.5"
            fill="rgba(255,255,255,0.9)"
          />
          <circle
            cx={isLeft ? '80' : '52'}
            cy="98"
            r="4.5"
            fill="rgba(196,181,253,0.95)"
          />
          <circle
            cx={isLeft ? '76' : '56'}
            cy="150"
            r="4.5"
            fill="rgba(103,232,249,0.95)"
          />
        </svg>
      </div>
    </div>
  )
}

function CustomBuildSectionBackdrop({
  variant,
}: {
  variant: 'electric' | 'waves' | 'deployment' | 'circuit' | 'hero'
}) {
  return (
    <div
      className={`custom-builds-bg custom-builds-bg--${variant} pointer-events-none absolute inset-0 z-0 overflow-hidden`}
      aria-hidden="true"
    />
  )
}

function Marquee({ items }: { items: string[] }) {
  const motionEnabled = useMotionEnabled()
  const { ref: activityRef, active: activityActive } =
    useElementActivity<HTMLDivElement>()
  const effectiveMotion = motionEnabled && activityActive
  const loop = [...items, ...items]
  return (
    <div
      ref={activityRef}
      className="relative flex overflow-hidden py-2.5"
      aria-hidden="true"
    >
      <motion.div
        className="flex shrink-0 items-center gap-5 pr-5"
        style={MONO}
        animate={effectiveMotion ? { x: ['0%', '-50%'] } : undefined}
        transition={
          effectiveMotion
            ? { duration: 24, repeat: Infinity, ease: 'linear' }
            : undefined
        }
      >
        {loop.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex shrink-0 items-center gap-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/40"
          >
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

    import('three').then((THREE) => {
      if (cancelled || !canvasRef.current) return

      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: false,
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
        GLOBE_TEXTURE_SRC,
        () => {
          if (canvasRef.current) canvasRef.current.style.opacity = '1'
        },
        undefined,
        () => {
          if (canvasRef.current) canvasRef.current.style.opacity = '1'
        }
      )
      earthTexture.colorSpace = THREE.SRGBColorSpace
      earthTexture.anisotropy = Math.min(
        renderer.capabilities.getMaxAnisotropy(),
        8
      )

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

      const atmosphereGeometry = new THREE.SphereGeometry(
        globeRadius * 1.035,
        96,
        96
      )
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
      const ammanMarkerMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      })
      const markerGroup = new THREE.Group()

      const latLngToVector3 = (
        [lat, lng]: [number, number],
        radius: number
      ) => {
        const phi = (90 - lat) * (Math.PI / 180)
        const theta = (lng + 180) * (Math.PI / 180)

        return new THREE.Vector3(
          -radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta)
        )
      }

      GLOBE_MARKERS.forEach((marker, index) => {
        const dot = new THREE.Mesh(
          markerGeometry,
          index === 0 ? ammanMarkerMaterial : markerMaterial
        )
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

      const resizeObserver =
        typeof ResizeObserver !== 'undefined'
          ? new ResizeObserver(resize)
          : null
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
      let elementVisible = true
      let animationRunning = false

      const animate = () => {
        if (!animationRunning) return

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

      const stopAnimation = () => {
        if (!animationRunning) return
        animationRunning = false
        cancelAnimationFrame(frameId)
      }

      const startAnimation = () => {
        if (
          animationRunning ||
          !elementVisible ||
          document.visibilityState === 'hidden'
        )
          return
        animationRunning = true
        clock.start()
        clock.getDelta()
        frameId = requestAnimationFrame(animate)
      }

      const syncAnimationState = () => {
        if (elementVisible && document.visibilityState !== 'hidden') {
          startAnimation()
        } else {
          stopAnimation()
        }
      }

      const visibilityObserver =
        typeof IntersectionObserver !== 'undefined'
          ? new IntersectionObserver(
              (entries) => {
                elementVisible = Boolean(entries[0]?.isIntersecting)
                syncAnimationState()
              },
              { rootMargin: '240px 0px', threshold: 0.01 }
            )
          : null

      renderer.render(scene, camera)
      visibilityObserver?.observe(canvas)
      document.addEventListener('visibilitychange', syncAnimationState)
      startAnimation()

      cleanupScene = () => {
        stopAnimation()
        visibilityObserver?.disconnect()
        document.removeEventListener('visibilitychange', syncAnimationState)
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
      <span
        className="absolute inset-[2%] rounded-full bg-violet-500/20 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="absolute inset-[12%] rounded-full border border-violet-300/20 shadow-[0_0_44px_rgba(139,92,246,0.42)]"
        aria-hidden="true"
      />
      <canvas
        ref={canvasRef}
        aria-label="Realistic Earth globe showing Eventies delivery and shipping reach"
        className="relative h-full w-full"
        style={{
          contain: 'layout paint size',
          opacity: 0,
          transition: 'opacity 0.25s ease',
        }}
      />
    </div>
  )
}

function LazyGlobe() {
  const frameRef = useRef<HTMLDivElement>(null)
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    preloadGlobeAssets()
    if (shouldRender) return undefined

    const element = frameRef.current
    if (!element) return undefined

    if (typeof IntersectionObserver === 'undefined') {
      setShouldRender(true)
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        setShouldRender(true)
        observer.disconnect()
      },
      { rootMargin: '2200px 0px 1600px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [shouldRender])

  return (
    <div
      ref={frameRef}
      className="relative mx-auto min-h-[280px] w-full max-w-[440px]"
    >
      {shouldRender ? (
        <Globe />
      ) : (
        <div className="relative mx-auto aspect-square w-full max-w-[440px]">
          <span
            className="absolute inset-[10%] rounded-full border border-violet-300/20 bg-white/[0.04]"
            aria-hidden="true"
          />
          <span
            className="absolute inset-[20%] rounded-full border border-fuchsia-300/20"
            aria-hidden="true"
          />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[22px] border border-white/15 bg-white/[0.08] text-violet-100">
            <Globe2 className="h-9 w-9" strokeWidth={1.6} />
          </span>
        </div>
      )}
    </div>
  )
}

const PROJECT_DESCRIPTIONS: Record<string, string> = {
  'Bike Blender':
    'A pedal-powered experience where cycling directly drives a real blender. As participants pedal, the blender spins and prepares a fresh drink using their own energy, turning a simple refreshment into a fun and memorable interactive activity.',
  'Bike Tower v1':
    'The first Bike Tower prototype transformed cycling distance into a physical visual race. Two riders competed side by side, with each tower moving according to the distance covered on the bike, creating a simple and exciting real-time competition.',
  'Bike Tower v2':
    'The second generation of Bike Tower evolved from a two-player wired prototype into a fully wireless multiplayer racing system. With a larger tower, wireless bike connectivity, and support for up to 20 players, the experience was redesigned for bigger events, larger audiences, and more competitive gameplay.',
  'Basket Beats':
    'A fast-paced basketball challenge where players bounce the ball on a dedicated base and compete to finish first, either by time or by score. Designed for competitive group play, the experience can scale up to 20 players at once.',
  'Bike VR':
    'A virtual reality cycling experience that lets players ride through cities around the world with a strong sense of realism. By combining physical cycling with immersive VR environments, the experience creates an engaging and highly believable ride.',
}

const buildKey = (build: CustomBuild, index: number) =>
  build.id || `${build.title}-${index}`

function buildImages(build: CustomBuild) {
  const seen = new Set<string>()

  return [build.image, ...(build.images || [])]
    .map((image) => image.trim())
    .filter((image) => {
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

function CustomBuildsHeroShowcase({
  motionEnabled: _motionEnabled,
}: {
  motionEnabled: boolean
}) {
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
        style={{
          boxShadow:
            '0 40px 90px -34px rgba(8,3,26,0.8), inset 0 1px 0 rgba(255,255,255,0.18)',
        }}
      >
        <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0f0630]/40">
          <img
            src="/images/randd.webp"
            alt={translateText('Eventies R&D custom builds studio')}
            width={1600}
            height={1100}
            loading="eager"
            decoding="async"
            draggable={false}
            className="block h-full w-full object-cover"
          />
          {/* Subtle inner ring to keep the framed look consistent with the rest
              of the hero shell. */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-inset ring-white/10"
            aria-hidden="true"
          />
        </div>
      </div>
    </>
  )
}

export default function CustomBuildsPage() {
  const { customBuilds, customBuildCategories } = useCustomBuildsData()
  const motionEnabled = useMotionEnabled()
  const { ref: heroSectionRef, active: heroActive } =
    useElementActivity<HTMLElement>()
  const { translateText, locale } = useI18n()
  const [activeCapabilityId, setActiveCapabilityId] = useState(
    capabilities[0].id
  )
  const activeCapability =
    capabilities.find((item) => item.id === activeCapabilityId) ??
    capabilities[0]

  usePageMeta({
    title: 'Custom Event Builds & Interactive Experiences | Eventies',
    description:
      'Eventies designs and builds custom interactive experiences, branded activations, games, software, hardware, and event-ready setups for local and international projects.',
    canonical: 'https://www.eventiesjo.com/custom-builds',
  })

  useEffect(() => {
    const scheduleGlobePreload = () => preloadGlobeAssets()
    const win = window as Window & {
      requestIdleCallback?: (
        callback: () => void,
        options?: { timeout?: number }
      ) => number
      cancelIdleCallback?: (handle: number) => void
    }

    if (win.requestIdleCallback) {
      const handle = win.requestIdleCallback(scheduleGlobePreload, {
        timeout: 900,
      })
      return () => win.cancelIdleCallback?.(handle)
    }

    const timer = window.setTimeout(scheduleGlobePreload, 350)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (window.location.hash !== '#global-reach') return

    const timer = window.setTimeout(() => {
      document
        .getElementById('global-reach')
        ?.scrollIntoView({ block: 'start' })
    }, 250)

    return () => window.clearTimeout(timer)
  }, [])

  const builds = useMemo<CustomBuild[]>(
    () =>
      customBuilds
        .filter((build) => build.active && buildImages(build).length > 0)
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [customBuilds]
  )

  const marqueeItems = useMemo(() => {
    const fromCats = customBuildCategories
      .filter((c) => c.active !== false)
      .map((c) => c.name.trim())
      .filter(Boolean)
    const base = fromCats.length ? fromCats : buildTypes.map((b) => b.title)
    return base.length >= 4
      ? base
      : [...base, 'Custom Builds', 'Branded Activations', 'Interactive Games']
  }, [customBuildCategories])

  const tabs = useMemo(() => {
    const fromCats = customBuildCategories
      .filter((c) => c.active !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((c) => c.name.trim())
      .filter(Boolean)
    const present = new Set(
      builds.map((b) => b.category.trim()).filter(Boolean)
    )
    const ordered = fromCats.filter((name) => present.has(name))
    present.forEach((name) => {
      if (!ordered.includes(name)) ordered.push(name)
    })
    return ordered
  }, [customBuildCategories, builds])

  const [activeTab, setActiveTab] = useState<string>('All')
  const visibleBuilds = useMemo(
    () =>
      (activeTab === 'All'
        ? builds
        : builds.filter((b) => b.category.trim() === activeTab)
      ).slice(0, 12),
    [builds, activeTab]
  )

  // In-section inspection viewer
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  useEffect(() => {
    if (visibleBuilds.length === 0) {
      setSelectedKey(null)
      return
    }
    setSelectedKey((current) =>
      current && visibleBuilds.some((b, i) => buildKey(b, i) === current)
        ? current
        : buildKey(visibleBuilds[0], 0)
    )
  }, [visibleBuilds])

  const selectedBuild = useMemo(
    () =>
      visibleBuilds.find((b, i) => buildKey(b, i) === selectedKey) ??
      visibleBuilds[0] ??
      null,
    [visibleBuilds, selectedKey]
  )
  const photos = useMemo(
    () => (selectedBuild ? buildImages(selectedBuild) : []),
    [selectedBuild]
  )
  const selectedDescription = useMemo(
    () =>
      selectedBuild
        ? PROJECT_DESCRIPTIONS[selectedBuild.title] ??
          cleanRepeatedText(selectedBuild.description)
        : '',
    [selectedBuild]
  )
  const [photoIdx, setPhotoIdx] = useState(0)
  useEffect(() => {
    setPhotoIdx(0)
  }, [selectedKey])
  const safeIdx = photos.length ? photoIdx % photos.length : 0
  const stepPhoto = (dir: 1 | -1) =>
    setPhotoIdx((i) =>
      photos.length ? (i + dir + photos.length) % photos.length : 0
    )

  const [lightbox, setLightbox] = useState<{
    open: boolean
    images: string[]
    index: number
  }>({ open: false, images: [], index: 0 })

  return (
    <div className="overflow-x-clip pb-2">
      {/* ══ 1. HERO — short lab bench (the only grid section) ══ */}
      <EventiesHero
        sectionRef={heroSectionRef}
        eyebrow={locale === 'ar' ? 'استوديو البحث والتطوير — تنفيذات مخصصة' : 'R&D Studio - Custom Builds'}
        title={locale === 'ar' ? 'تجارب تفاعلية مخصصة، مبنية خصيصًا لفعاليتك.' : 'Custom interactive experiences, built for your event.'}
        description={
          locale === 'ar'
            ? 'نراجع كل تنفيذ مخصص لتحديد إمكانية التأجير أو الشراء أو الشحن الدولي وفق نطاق المشروع وحجمه ومواده والجدول الزمني.'
            : 'Custom builds can be reviewed for rental, purchase, or international shipping depending on scope, size, materials, and timeline.'
        }
        primaryAction={{
          label: locale === 'ar' ? 'اطلب عرض سعر لتنفيذ مخصص' : 'Request a Custom Build Quote',
          to: '/contact',
        }}
        secondaryAction={{
          label: locale === 'ar' ? 'استكشف أعمالنا' : 'Inspect Our Work',
          href: '#work',
        }}
        chipsLabel={locale === 'ar' ? 'الاستوديو' : 'Studio'}
        chips={heroFocusAreas.map(({ label, labelAr }) => ({
          label: locale === 'ar' ? labelAr : label,
        }))}
        rightSlot={
          <CustomBuildsHeroShowcase
            motionEnabled={motionEnabled && heroActive}
          />
        }
      />
      <div className="bg-[#f7f4ff]">
        {/* ══ 2. OUR CAPABILITIES — interactive capability showcase ══ */}
        <section
          id="capabilities"
          className="relative w-full overflow-hidden bg-[#f7f4ff] py-[clamp(3.5rem,7vw,6.5rem)]"
        >
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-violet-300/25 blur-3xl" />
            <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-fuchsia-200/30 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          </div>

          <div className="site-container-wide relative z-10">
            <Reveal className="mb-8 flex justify-center sm:mb-10" y={20}>
              <div
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="mx-auto max-w-3xl text-center"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full border border-violet-200/80 bg-white/85 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-700 shadow-[0_12px_30px_-22px_rgba(124,58,237,0.7)] backdrop-blur-md"
                  style={MONO}
                >
                  <Cpu className="h-3.5 w-3.5" strokeWidth={2.3} />
                  {locale === 'ar' ? 'قدراتنا' : 'Our Capabilities'}
                </span>
                <h2
                  className={`mt-4 font-display text-[clamp(2rem,4.4vw,4.25rem)] font-black text-ink-900 ${
                    locale === 'ar'
                      ? 'leading-[1.16] tracking-[-0.015em]'
                      : 'leading-[0.98] tracking-[-0.045em]'
                  }`}
                >
                  {locale === 'ar'
                    ? 'كل ما نحتاجه لبناء التجربة، تحت سقف واحد'
                    : 'Everything needed to build the experience, under one roof.'}
                </h2>
                <p
                  className={`mx-auto mt-5 max-w-2xl text-[13px] text-ink-600 sm:text-[15px] ${
                    locale === 'ar' ? 'leading-[1.85]' : 'leading-[1.7]'
                  }`}
                >
                  {locale === 'ar'
                    ? 'من تصميم الإلكترونيات والأنظمة المدمجة إلى البرمجيات التفاعلية والتصنيع والاختبار، نجمع جميع مراحل التنفيذ ضمن مسار تطوير واحد متكامل.'
                    : 'From custom electronics and embedded systems to interactive software, fabrication, and testing — we bring every layer of the build together.'}
                </p>
              </div>
            </Reveal>

            <Reveal y={22}>
              <div className="relative mx-auto max-w-[1380px] overflow-hidden rounded-[30px] border border-violet-200/75 bg-white/88 p-3 shadow-[0_34px_90px_-54px_rgba(89,23,196,0.52)] backdrop-blur-md sm:p-4 lg:p-5">
                <CornerTicks color="rgba(124,58,237,0.38)" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-multiply"
                  style={{ backgroundImage: GRAIN }}
                  aria-hidden="true"
                />

                <div className="relative grid gap-4 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.72fr)] lg:gap-5">
                  {/* Main capability viewer */}
                  <div className="relative min-w-0 overflow-hidden rounded-[24px] border border-violet-200/80 bg-[#10052d] p-2.5 shadow-[0_28px_70px_-42px_rgba(46,16,101,0.68)] sm:p-3">
                    <div
                      className="mb-2 flex items-center justify-between gap-3 px-1.5"
                      style={locale === 'ar' ? undefined : MONO}
                    >
                      <span className="flex items-center gap-2 text-[9px] font-bold tracking-[0.14em] text-violet-200/75 sm:text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.9)]" />
                        {locale === 'ar' ? 'عارض القدرات' : 'CAPABILITY VIEWER'} ·{' '}
                        {String(
                          capabilities.findIndex(
                            (item) => item.id === activeCapability.id
                          ) + 1
                        ).padStart(2, '0')}
                        /{String(capabilities.length).padStart(2, '0')}
                      </span>
                      <span className="rounded-full border border-white/12 bg-white/[0.07] px-2.5 py-1 text-[8.5px] font-bold tracking-[0.12em] text-white/55 sm:text-[9px]">
{locale === 'ar' ? 'استوديو البحث والتطوير' : 'R&D STUDIO'}
                      </span>
                    </div>

                    <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[#08031c] sm:aspect-video">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeCapability.image}
                          initial={
                            motionEnabled ? { opacity: 0, scale: 1.025 } : false
                          }
                          animate={{ opacity: 1, scale: 1 }}
                          exit={motionEnabled ? { opacity: 0 } : undefined}
                          transition={{ duration: 0.42, ease: EASE }}
                          className="absolute inset-0"
                        >
                          <img
                            src={activeCapability.image}
                            alt={
                              locale === 'ar'
                                ? activeCapability.titleAr
                                : activeCapability.title
                            }
                            width={1600}
                            height={900}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-cover"
                          />
                        </motion.div>
                      </AnimatePresence>
                      <div
                        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,2,24,0.62)_0%,rgba(7,2,24,0.18)_50%,rgba(7,2,24,0.06)_76%),linear-gradient(0deg,rgba(7,2,24,0.96)_0%,rgba(7,2,24,0.42)_34%,rgba(7,2,24,0.08)_68%)]"
                        aria-hidden="true"
                      />

                      <div
                        className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7"
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      >
                        <div className={locale === 'ar' ? 'ml-auto max-w-3xl text-right' : 'max-w-3xl text-left'}>
                          <span
                            dir="ltr"
                            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/38 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-fuchsia-100 backdrop-blur-md"
                            style={MONO}
                          >
                            <activeCapability.icon
                              className="h-3.5 w-3.5"
                              strokeWidth={2.2}
                            />
                            {activeCapability.code}
                          </span>
                          <h3
                            className={`mt-2.5 max-w-3xl font-display text-[clamp(1.45rem,3vw,2.75rem)] font-black text-white ${
                              locale === 'ar'
                                ? 'leading-[1.16] tracking-[-0.01em]'
                                : 'leading-[0.98] tracking-[-0.04em]'
                            }`}
                          >
                            {locale === 'ar'
                              ? activeCapability.titleAr
                              : activeCapability.title}
                          </h3>
                          <p
                            className={`mt-3 max-w-2xl text-[11.5px] font-medium text-white sm:text-[13px] lg:text-[14px] ${
                              locale === 'ar'
                                ? 'leading-[1.8]'
                                : 'leading-[1.62]'
                            }`}
                            style={{ textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}
                          >
                            {locale === 'ar'
                              ? activeCapability.descriptionAr
                              : activeCapability.description}
                          </p>
                          <div
                            className="mt-3 hidden flex-wrap gap-2 sm:flex"
                            dir="ltr"
                          >
                            {activeCapability.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full border border-white/22 bg-black/35 px-2.5 py-1 text-[9px] font-bold text-white backdrop-blur-md sm:text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capability selector */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 lg:gap-2.5">
                    {capabilities.map((item, index) => {
                      const isActive = item.id === activeCapability.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveCapabilityId(item.id)}
                          aria-pressed={isActive}
                          dir={locale === 'ar' ? 'rtl' : 'ltr'}
                          className={`group relative overflow-hidden rounded-[18px] border p-3 transition-all duration-300 sm:p-3.5 lg:min-h-[84px] ${
                            locale === 'ar' ? 'text-right' : 'text-left'
                          } ${isActive ? 'border-violet-400/70 bg-gradient-to-br from-violet-700 to-fuchsia-600 text-white shadow-[0_20px_42px_-28px_rgba(124,58,237,0.85)]' : 'border-violet-200/75 bg-white/92 text-ink-900 hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_20px_38px_-30px_rgba(89,23,196,0.55)]'}`}
                        >
                          <span className="flex items-start gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] transition-colors ${isActive ? 'bg-white/14 text-white' : 'bg-violet-50 text-violet-700 group-hover:bg-violet-100'}`}
                            >
                              <item.icon className="h-5 w-5" strokeWidth={2} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span
                                dir="ltr"
                                className={`block text-left text-[8px] font-black uppercase tracking-[0.14em] ${isActive ? 'text-white/55' : 'text-violet-400'}`}
                                style={MONO}
                              >
                                {String(index + 1).padStart(2, '0')} ·{' '}
                                {item.code}
                              </span>
                              <span
                                className={`mt-1 block font-display text-[11px] font-black sm:text-[12px] lg:text-[13px] ${
                                  locale === 'ar' ? 'leading-[1.5]' : 'leading-[1.15]'
                                }`}
                              >
                                {locale === 'ar' ? item.shortTitleAr : item.shortTitle}
                              </span>
                            </span>
                          </span>
                          <span
                            className={`absolute inset-x-3 bottom-2 h-1 rounded-full ${isActive ? 'bg-white/45' : 'bg-violet-100'}`}
                            aria-hidden="true"
                          >
                            {isActive && (
                              <motion.span
                                layoutId="capability-progress"
                                className="block h-full w-full rounded-full bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200"
                              />
                            )}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
                {/* ══ 3. INSIDE THE LAB — tools, prototyping, testing ══ */}
        <section
          id="lab"
          className="relative w-full overflow-hidden bg-[#0b0324] py-[clamp(3.5rem,7vw,5.8rem)] text-white"
        >
          <CustomBuildSectionBackdrop variant="hero" />
          <div className="site-container-wide relative z-10">
            <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
              <Reveal y={24}>
                <div className="relative overflow-hidden rounded-[28px] border border-white/14 bg-white/[0.06] p-3 shadow-[0_34px_90px_-48px_rgba(0,0,0,0.92)] backdrop-blur-xl">
                  <CornerTicks color="rgba(232,121,249,0.58)" />
                  <div className="relative aspect-video overflow-hidden rounded-[20px] bg-[#08031c]">
                    <img
                      src="/images/custom-builds/lab/eventies-electronics-lab.webp"
                      alt={locale === 'ar' ? 'مختبر Eventies للإلكترونيات والتطوير' : 'Eventies electronics and prototyping lab'}
                      width={1600}
                      height={900}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                      onError={(event) => {
                        event.currentTarget.onerror = null
                        event.currentTarget.src = '/images/randd.webp'
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(8,3,28,0.08),rgba(8,3,28,0.04)_55%,rgba(8,3,28,0.48)),linear-gradient(0deg,rgba(8,3,28,0.72),transparent_48%)]"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 p-4 sm:p-5">
                      {(locale === 'ar'
                        ? ['تصميم', 'برمجة', 'بناء', 'نموذج أولي', 'اختبار']
                        : ['Design', 'Code', 'Build', 'Prototype', 'Test']
                      ).map((label, index) => (
                        <span
                          key={label}
                          dir={locale === 'ar' ? 'rtl' : 'ltr'}
                          className="rounded-full border border-white/18 bg-black/35 px-3 py-1.5 text-[9px] font-black tracking-[0.12em] text-white backdrop-blur-md"
                          style={locale === 'ar' ? undefined : MONO}
                        >
                          {String(index + 1).padStart(2, '0')} · {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>

              <Reveal y={24} delay={0.08}>
                <SectionHead
                  icon={FlaskConical}
                  eyebrow={locale === 'ar' ? 'داخل المختبر' : 'Inside the Lab'}
                  title={locale === 'ar' ? 'هنا تتحول الأفكار إلى أنظمة تعمل فعليًا.' : 'Where ideas become working systems.'}
                  desc={locale === 'ar' ? 'نجمع تصميم الإلكترونيات والبرمجة والنماذج الأولية والتجميع والاختبار داخل مسار تطوير واحد قبل نقل النظام إلى الفعالية.' : 'Our lab brings electronics design, firmware, prototyping, integration, testing, and calibration into one controlled workflow before deployment.'}
                  dark
                  align="left"
                />

                <div className="mt-7 grid gap-2.5">
                  {labWorkflow.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={motionEnabled ? { opacity: 0, x: 14 } : false}
                      whileInView={motionEnabled ? { opacity: 1, x: 0 } : undefined}
                      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                      transition={motionEnabled ? { duration: 0.45, delay: Math.min(index * 0.06, 0.24), ease: EASE } : undefined}
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                      className="group flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/[0.055] p-3.5 backdrop-blur-md transition-colors hover:bg-white/[0.085]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-[0_14px_30px_-20px_rgba(217,70,239,0.9)]">
                        <item.icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="min-w-0">
                        <span className={`block font-display text-[14px] font-black text-white ${locale === 'ar' ? 'leading-[1.55]' : 'leading-normal'}`}>
                          {locale === 'ar' ? item.titleAr : item.title}
                        </span>
                        <span className={`mt-1 block text-[11.5px] text-white/64 ${locale === 'ar' ? 'leading-[1.8]' : 'leading-[1.55]'}`}>
                          {locale === 'ar' ? item.descAr : item.desc}
                        </span>
                      </span>
                    </motion.div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

{/* ══ 4. HOW WE BUILD — from idea to deployment ══ */}
        <section className="relative w-full overflow-hidden bg-[#f7f4ff] py-[clamp(3.5rem,7vw,5.5rem)]">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent"
            aria-hidden="true"
          />
          <div className="site-container-wide relative">
            <Reveal className="mb-12 flex justify-center" y={20}>
              <SectionHead
                icon={FlaskConical}
                eyebrow={locale === 'ar' ? 'طريقة العمل' : 'Process'}
                title={
                  locale === 'ar'
                    ? 'من الفكرة إلى تنفيذ حقيقي جاهز للفعالية'
                    : 'From idea to a real, event-ready build.'
                }
                desc={
                  locale === 'ar'
                    ? 'أربع خطوات واضحة. تتم مراجعة كل طلب مخصص قبل تأكيد السعر والجدول الزمني.'
                    : 'Four clear steps. Every custom request is reviewed before pricing and timeline confirmation.'
                }
              />
            </Reveal>

            <div className="relative grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              <div
                className="pointer-events-none absolute left-[12%] right-[12%] top-9 hidden h-[2px] overflow-hidden rounded-full bg-violet-200 lg:block"
                aria-hidden="true"
              >
                <motion.span
                  className="block h-full w-full bg-gradient-to-r from-violet-400 to-fuchsia-400"
                  initial={motionEnabled ? { scaleX: 0 } : false}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, ease: EASE }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>
              {processSteps.map((step, index) => (
                <Reveal
                  key={step.title}
                  delay={Math.min(index * 0.1, 0.3)}
                  y={22}
                  className="h-full"
                >
                  <div
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    className="relative flex h-full flex-col items-center text-center"
                  >
                    <span className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-[18px] border border-violet-200/80 bg-white text-violet-700 shadow-[0_24px_52px_-34px_rgba(124,58,237,0.55)]">
                      <step.icon className="h-7 w-7" strokeWidth={1.9} />
                    </span>
                    <h3
                      className={`mt-1 font-display text-[1.05rem] font-bold text-ink-900 ${
                        locale === 'ar'
                          ? 'leading-[1.5] tracking-normal'
                          : 'tracking-[-0.02em]'
                      }`}
                    >
                      {locale === 'ar' ? step.titleAr : step.title}
                    </h3>
                    <p
                      className={`mt-1.5 max-w-[15rem] text-[12px] text-ink-600 ${
                        locale === 'ar' ? 'leading-[1.8]' : 'leading-[1.55]'
                      }`}
                    >
                      {locale === 'ar' ? step.detailAr : step.detail}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal y={16} delay={0.12}>
              <p
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className={`mx-auto mt-12 max-w-2xl rounded-[14px] border border-violet-200/80 bg-white px-5 py-3.5 text-center text-[12.5px] text-ink-600 shadow-[0_18px_44px_-34px_rgba(124,58,237,0.45)] ${
                  locale === 'ar' ? 'leading-[1.8]' : 'leading-[1.6]'
                }`}
              >
                <ShieldCheck
                  className="mr-1.5 inline h-4 w-4 -translate-y-0.5 text-violet-600"
                  strokeWidth={2.2}
                />
                {locale === 'ar'
                  ? 'يمكن مراجعة التنفيذات المخصصة للتأجير أو الشراء أو الشحن الدولي حسب نطاق المشروع وحجمه ومواده والجدول الزمني.'
                  : 'Custom builds can be reviewed for rental, purchase, or international shipping depending on scope, size, materials, and timeline.'}
              </p>
            </Reveal>
          </div>
        </section>

        {/* ══ 5. SELECTED BUILDS — real project showcase ══ */}
        <section
          id="work"
          className="relative scroll-mt-[calc(var(--app-navbar-height)+1rem)] w-full overflow-hidden bg-[#0b0322] py-[clamp(2.5rem,4.2vw,4rem)] text-white"
        >
          <CustomBuildSectionBackdrop variant="hero" />
          <WorkSideDecor side="left" />
          <WorkSideDecor side="right" />

          <div className="relative z-10 site-container-wide">
            <Reveal className="mb-4 flex justify-center sm:mb-5" y={16}>
              <div
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="mx-auto max-w-3xl text-center"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/[0.08] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-100 backdrop-blur-md">
                  <Boxes
                    className="h-3.5 w-3.5 text-fuchsia-200"
                    strokeWidth={2.4}
                  />
                  {locale === 'ar' ? 'أعمالنا' : 'Our Work'}
                </span>
                <h2
                  className={`mt-2.5 font-display text-[clamp(1.7rem,3.2vw,3rem)] font-black text-white ${
                    locale === 'ar'
                      ? 'leading-[1.18] tracking-[-0.01em]'
                      : 'leading-[0.98] tracking-[-0.045em]'
                  }`}
                >
                  {locale === 'ar'
                    ? 'استكشف ما قمنا ببنائه'
                    : 'Explore What We’ve Built'}
                </h2>
                <p
                  className={`mx-auto mt-3 max-w-2xl text-[11px] text-white/72 sm:text-[12px] ${
                    locale === 'ar' ? 'leading-[1.85]' : 'leading-[1.55]'
                  }`}
                >
                  {locale === 'ar'
                    ? 'مشاريع تفاعلية حقيقية صممناها وطوّرناها ونفذناها، تجمع بين الهاردوير والبرمجيات والحركة والتفاعل في تجربة واحدة متكاملة.'
                    : 'Real interactive systems designed, engineered, and built by Eventies. Explore each project to see how hardware, software, and physical interaction come together.'}
                </p>
              </div>
            </Reveal>

            {builds.length === 0 ? (
              <div className="mx-auto max-w-xl rounded-[24px] border border-dashed border-white/20 bg-white/[0.05] px-6 py-14 text-center backdrop-blur-md">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-violet-200">
                  <Boxes className="h-7 w-7" strokeWidth={1.8} />
                </span>
                <p className="mt-4 text-[1.1rem] font-bold">
                  {locale === 'ar' ? 'المشاريع قادمة قريبًا' : 'Builds coming soon'}
                </p>
                <p className="mt-1 text-[13px] text-white/55">
                  {locale === 'ar'
                    ? 'لديك مشروع في ذهنك؟ ابدأ الحديث معنا.'
                    : 'Have a project in mind? Start the conversation.'}
                </p>
                <Link
                  to="/contact"
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-[12px] font-bold text-white"
                >
                  {locale === 'ar'
                    ? 'اطلب عرض سعر لتنفيذ مخصص'
                    : 'Request a Custom Build Quote'}{' '}
                  <ArrowRight
                    className={`h-3.5 w-3.5 ${locale === 'ar' ? 'rotate-180' : ''}`}
                    strokeWidth={2.4}
                  />
                </Link>
              </div>
            ) : (
              <>
                {tabs.length > 0 && (
                  <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:mb-4">
                    {['All', ...tabs].map((tab) => {
                      const isActive = activeTab === tab
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveTab(tab)}
                          aria-pressed={isActive}
                          className={`relative isolate overflow-hidden rounded-full border px-4 py-2 text-[11px] font-bold transition-all sm:px-5 sm:text-[12px] ${isActive ? 'border-fuchsia-400/35 text-white shadow-[0_12px_30px_-18px_rgba(217,70,239,0.8)]' : 'border-white/14 bg-white/[0.045] text-white/68 hover:border-white/30 hover:bg-white/[0.08] hover:text-white'}`}
                        >
                          {isActive && (
                            <motion.span
                              layoutId="cbTabPill"
                              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                              transition={{
                                type: 'spring',
                                stiffness: 380,
                                damping: 32,
                              }}
                              aria-hidden="true"
                            />
                          )}
                          <span
                            dir={tab === 'All' && locale === 'ar' ? 'rtl' : 'ltr'}
                            className="inline-block"
                          >
                            {tab === 'All'
                              ? locale === 'ar'
                                ? 'الكل'
                                : 'All'
                              : tab}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}

                <Reveal y={20}>
                  <div className="mx-auto grid max-w-[1080px] gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-4">
                    {/* Main project viewer */}
                    <div className="min-w-0 rounded-[26px] border border-white/14 bg-white/[0.055] p-2.5 shadow-[0_32px_80px_-42px_rgba(0,0,0,0.88)] backdrop-blur-xl sm:p-3">
                      {selectedBuild && (
                        <>
                          <div
                            className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1.5"
                            style={locale === 'ar' ? undefined : MONO}
                          >
                            <span className="flex items-center gap-2 text-[9px] font-bold tracking-[0.13em] text-white/52 sm:text-[10px]">
                              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fuchsia-400 shadow-[0_0_12px_rgba(232,121,249,0.9)]" />
                              {locale === 'ar' ? 'عارض المشروع' : 'LIVE BUILD VIEWER'} ·{' '}
                              {String(safeIdx + 1).padStart(2, '0')}/
                              {String(photos.length).padStart(2, '0')}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setLightbox({
                                  open: true,
                                  images: photos,
                                  index: safeIdx,
                                })
                              }
                              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.08] px-3 py-1.5 text-[9px] font-bold text-white/76 transition-colors hover:bg-white/[0.14] hover:text-white sm:text-[10px]"
                            >
                              <Maximize2
                                className="h-3 w-3"
                                strokeWidth={2.4}
                              />{' '}
                              {locale === 'ar' ? 'ملء الشاشة' : 'Fullscreen'}
                            </button>
                          </div>

                          <div className="relative pl-[68px] sm:pl-[76px]">
                            <div
                              className="absolute inset-y-0 left-0 flex w-[58px] flex-col gap-2 overflow-y-auto pr-0.5 sm:w-[64px] [scrollbar-width:thin]"
                              dir="ltr"
                              aria-label={locale === 'ar' ? 'صور المشروع' : 'Project photos'}
                            >
                              {photos.map((src, i) => (
                                <button
                                  key={`${src}-${i}`}
                                  type="button"
                                  onClick={() => setPhotoIdx(i)}
                                  aria-pressed={i === safeIdx}
                                  className={`relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-[10px] border transition-all ${i === safeIdx ? 'border-fuchsia-400 ring-2 ring-fuchsia-400/45' : 'border-white/10 opacity-55 hover:border-white/30 hover:opacity-100'}`}
                                >
                                  <FramedImage
                                    media={src}
                                    alt=""
                                    width={240}
                                    height={160}
                                    loading="lazy"
                                    sizes="64px"
                                    fallbackTransform={{ fit: 'cover' }}
                                    className="h-full w-full object-cover"
                                  />
                                  <span
                                    className="absolute bottom-0.5 right-0.5 rounded-full bg-black/60 px-1 py-0.5 text-[7px] font-bold text-white/85"
                                    style={MONO}
                                  >
                                    {String(i + 1).padStart(2, '0')}
                                  </span>
                                </button>
                              ))}
                            </div>

                            <div className="relative aspect-[4/3] overflow-hidden rounded-[19px] bg-[#050214] sm:aspect-video">
                            {/* Soft backdrop prevents empty bars for portrait or transparent assets. */}
                            <AnimatePresence mode="wait">
                              <motion.div
                                key={`backdrop-${photos[safeIdx]}`}
                                initial={motionEnabled ? { opacity: 0 } : false}
                                animate={{ opacity: 1 }}
                                exit={
                                  motionEnabled ? { opacity: 0 } : undefined
                                }
                                transition={{ duration: 0.35, ease: EASE }}
                                className="absolute inset-0"
                              >
                                <FramedImage
                                  media={photos[safeIdx]}
                                  alt=""
                                  width={1600}
                                  height={900}
                                  loading="eager"
                                  sizes="(max-width: 1024px) 100vw, 980px"
                                  fallbackTransform={{ fit: 'cover' }}
                                  className="h-full w-full scale-110 object-cover opacity-45 blur-2xl"
                                />
                              </motion.div>
                            </AnimatePresence>

                            <button
                              type="button"
                              onClick={() =>
                                setLightbox({
                                  open: true,
                                  images: photos,
                                  index: safeIdx,
                                })
                              }
                              className="absolute inset-0 block h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-fuchsia-400"
                              aria-label={`${locale === 'ar' ? 'فتح' : 'Open'} ${selectedBuild.title}`}
                            >
                              <AnimatePresence mode="wait">
                                <motion.div
                                  key={photos[safeIdx]}
                                  initial={
                                    motionEnabled
                                      ? { opacity: 0, scale: 1.02 }
                                      : false
                                  }
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={
                                    motionEnabled ? { opacity: 0 } : undefined
                                  }
                                  transition={{ duration: 0.42, ease: EASE }}
                                  className="absolute inset-0"
                                >
                                  <FramedImage
                                    media={photos[safeIdx]}
                                    alt={`${selectedBuild.title} — photo ${safeIdx + 1}`}
                                    width={1600}
                                    height={900}
                                    loading="eager"
                                    fetchPriority="high"
                                    sizes="(max-width: 1024px) 100vw, 980px"
                                    fallbackTransform={{ fit: 'contain' }}
                                    className="h-full w-full object-contain"
                                  />
                                </motion.div>
                              </AnimatePresence>
                            </button>

                            <div
                              className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,2,18,0.38)_0%,transparent_52%),linear-gradient(0deg,rgba(5,2,18,0.96)_0%,rgba(5,2,18,0.48)_34%,rgba(5,2,18,0.08)_68%)]"
                              aria-hidden="true"
                            />

                            <div
                              className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-7"
                              dir="ltr"
                            >
                              <div className="max-w-3xl text-left">
                                {selectedBuild.category && (
                                  <span
                                    className="inline-flex items-center rounded-full border border-white/20 bg-black/38 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-violet-100 backdrop-blur-md"
                                    style={MONO}
                                  >
                                    {selectedBuild.category}
                                  </span>
                                )}
                                <h3
                                  className="mt-2 font-display text-[clamp(1.55rem,3.2vw,3.1rem)] font-black leading-[0.98] tracking-[-0.04em] text-white"
                                  style={{ textShadow: '0 3px 18px rgba(0,0,0,0.95)' }}
                                >
                                  {selectedBuild.title}
                                </h3>
                                {selectedDescription && (
                                  <p
                                    className="mt-2.5 max-w-3xl text-[11px] font-medium leading-[1.62] text-white sm:text-[13px] lg:text-[14px]"
                                    style={{ textShadow: '0 2px 14px rgba(0,0,0,0.95)' }}
                                  >
                                    {selectedDescription}
                                  </p>
                                )}
                              </div>
                            </div>

                            {photos.length > 1 && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => stepPhoto(-1)}
                                  aria-label={locale === 'ar' ? 'الصورة السابقة' : 'Previous photo'}
                                  className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/45 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/70 sm:left-4 sm:h-11 sm:w-11"
                                >
                                  <ChevronLeft
                                    className="h-6 w-6"
                                    strokeWidth={2.2}
                                  />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => stepPhoto(1)}
                                  aria-label={locale === 'ar' ? 'الصورة التالية' : 'Next photo'}
                                  className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/14 bg-black/45 text-white backdrop-blur-md transition-all hover:scale-105 hover:bg-black/70 sm:right-4 sm:h-11 sm:w-11"
                                >
                                  <ChevronRight
                                    className="h-6 w-6"
                                    strokeWidth={2.2}
                                  />
                                </button>
                              </>
                            )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Project registry */}
                    <div
                      className="min-w-0 rounded-[26px] border border-white/14 bg-white/[0.065] p-3 backdrop-blur-xl sm:p-4"
                      dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    >
                      <div className="mb-3 flex items-center justify-between gap-3 px-1">
                        <div>
                          <span
                            className="block text-[9px] font-black uppercase tracking-[0.16em] text-fuchsia-200/80"
                            style={locale === 'ar' ? undefined : MONO}
                          >
                            {locale === 'ar' ? 'سجل المشاريع' : 'Project Registry'}
                          </span>
                          <span className="mt-1 block text-[12px] font-semibold text-white/56">
                            {locale === 'ar' ? 'اختر مشروعًا لاستكشافه' : 'Select a build to explore'}
                          </span>
                        </div>
                        <span
                          className="rounded-full border border-white/12 bg-white/[0.07] px-2.5 py-1 text-[9px] font-bold text-white/55"
                          style={locale === 'ar' ? undefined : MONO}
                        >
                          {String(visibleBuilds.length).padStart(2, '0')}{' '}
                          {locale === 'ar' ? 'مشروع' : 'BUILDS'}
                        </span>
                      </div>

                      <div className="flex gap-2 overflow-x-auto pb-1 lg:max-h-[430px] lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto lg:pr-1 [scrollbar-color:rgba(240,171,252,0.72)_rgba(255,255,255,0.08)] [scrollbar-width:thin]">
                        {visibleBuilds.map((build, index) => {
                          const key = buildKey(build, index)
                          const isActive = key === selectedKey
                          const images = buildImages(build)
                          const cover = images[0] || ''
                          const count = images.length
                          return (
                            <button
                              key={key}
                              type="button"
                              onClick={() => setSelectedKey(key)}
                              aria-pressed={isActive}
                              dir="ltr"
                              className={`group relative flex w-[250px] shrink-0 items-center gap-2.5 overflow-hidden rounded-[15px] border p-2 text-left transition-all sm:w-[280px] lg:w-full ${isActive ? 'border-fuchsia-300/60 bg-gradient-to-r from-violet-600/36 to-fuchsia-500/18 shadow-[0_18px_40px_-28px_rgba(217,70,239,0.82)]' : 'border-white/10 bg-white/[0.035] hover:border-white/24 hover:bg-white/[0.075]'}`}
                            >
                              <span className="relative h-[56px] w-[76px] shrink-0 overflow-hidden rounded-[11px] border border-white/10 bg-black/20">
                                <FramedImage
                                  media={cover}
                                  alt={build.title}
                                  width={384}
                                  height={256}
                                  loading="lazy"
                                  sizes="96px"
                                  fallbackTransform={{ fit: 'cover' }}
                                  className="h-full w-full object-cover"
                                />
                                <span
                                  className="absolute right-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white backdrop-blur-sm"
                                  style={MONO}
                                >
                                  <Images
                                    className="h-2.5 w-2.5"
                                    strokeWidth={2.4}
                                  />
                                  {count}
                                </span>
                              </span>
                              <span className="min-w-0 flex-1">
                                <span
                                  className={`block truncate font-display text-[13px] font-black leading-tight tracking-[-0.02em] ${isActive ? 'text-white' : 'text-white/90'}`}
                                >
                                  {build.title}
                                </span>
                                <span
                                  className="mt-0.5 block truncate text-[8.5px] font-bold uppercase tracking-[0.11em] text-fuchsia-200/60"
                                  style={MONO}
                                >
                                  {build.category || 'Custom Build'}
                                </span>
                              </span>
                              <ChevronRight
                                className={`h-4 w-4 shrink-0 transition-all ${locale === 'ar' ? 'rotate-180' : ''} ${isActive ? 'translate-x-0 text-fuchsia-200' : 'text-white/22 group-hover:translate-x-0.5 group-hover:text-white/60'}`}
                                strokeWidth={2.4}
                              />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </Reveal>

                <div className="mt-4 flex justify-center sm:mt-5">
                  <Link
                    to="/contact"
                    onMouseEnter={() => preloadRoute('/contact')}
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-6 py-3 text-[12px] font-bold text-white shadow-[0_18px_38px_-24px_rgba(217,70,239,0.95)] transition-all hover:-translate-y-0.5"
                  >
                    {locale === 'ar'
                      ? 'اطلب عرض سعر لتنفيذ مخصص'
                      : 'Request a Custom Build Quote'}{' '}
                    <ArrowRight
                      className={`h-3.5 w-3.5 ${locale === 'ar' ? 'rotate-180' : ''}`}
                      strokeWidth={2.4}
                    />
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

                {/* ══ 6. WHAT CAN WE BUILD — use-case inspiration ══ */}
        <section className="relative w-full overflow-hidden bg-[#f7f4ff] py-[clamp(3.5rem,7vw,5.8rem)]">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute -left-28 top-16 h-72 w-72 rounded-full bg-violet-300/22 blur-3xl" />
            <div className="absolute -right-24 bottom-4 h-80 w-80 rounded-full bg-fuchsia-200/28 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
          </div>
          <div className="site-container-wide relative z-10">
            <Reveal className="mb-9 flex justify-center" y={20}>
              <SectionHead
                icon={Lightbulb}
                eyebrow={locale === 'ar' ? 'أفكار للاستخدام' : 'What can we build?'}
                title={locale === 'ar' ? 'ما الذي يمكننا بناؤه لفعاليتك؟' : 'What Can We Build Together?'}
                desc={locale === 'ar' ? 'قد لا تحتاج إلى معرفة اسم التقنية. أخبرنا كيف تريد أن يتفاعل الناس، وما النتيجة التي تريد الوصول إليها، وسنبني النظام المناسب.' : 'You do not need to know the technical name of the solution. Tell us how people should interact and what outcome you want — we can design the system around it.'}
              />
            </Reveal>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {buildPossibilities.map((item, index) => (
                <Reveal key={item.title} delay={Math.min(index * 0.06, 0.24)} y={18} className="h-full">
                  <div
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    className="group relative h-full overflow-hidden rounded-[22px] border border-violet-200/75 bg-white/88 p-5 shadow-[0_22px_54px_-40px_rgba(89,23,196,0.42)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_30px_68px_-42px_rgba(89,23,196,0.58)] sm:p-6"
                  >
                    <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-200/40 to-cyan-200/25 blur-2xl" aria-hidden="true" />
                    <div className="relative flex items-start justify-between gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_16px_34px_-22px_rgba(217,70,239,0.9)]">
                        <item.icon className="h-5.5 w-5.5" strokeWidth={2} />
                      </span>
                      <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.15em] text-violet-600" style={MONO}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <h3
                      className={`relative mt-5 font-display text-[1.2rem] font-black text-ink-950 sm:text-[1.35rem] ${
                        locale === 'ar'
                          ? 'leading-[1.55] tracking-normal'
                          : 'tracking-[-0.02em]'
                      }`}
                    >
                      {locale === 'ar' ? item.titleAr : item.title}
                    </h3>
                    <p
                      className={`relative mt-2 text-[12.5px] text-ink-600 sm:text-[13px] ${
                        locale === 'ar' ? 'leading-[1.85]' : 'leading-[1.65]'
                      }`}
                    >
                      {locale === 'ar' ? item.descAr : item.desc}
                    </p>
                    <span className="relative mt-5 block h-1.5 overflow-hidden rounded-full bg-violet-100">
                      <span className="block h-full w-1/3 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-400 to-cyan-300 transition-all duration-500 group-hover:w-full" />
                    </span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

{/* ══ 7. WHO WE BUILD FOR — audience fit ══ */}
        <section className="relative w-full overflow-hidden py-[clamp(3rem,5vw,4.5rem)]">
          <CustomBuildSectionBackdrop variant="deployment" />
          <div className="site-container-wide relative z-10">
            <Reveal className="mb-8 flex justify-center" y={20}>
              <SectionHead
                icon={Users}
                eyebrow={locale === 'ar' ? 'لمن نبني' : "Who it's for"}
                title={
                  locale === 'ar'
                    ? 'مصمم حسب طريقة حركة فعاليتك'
                    : 'Built for the way your event moves'
                }
                desc={
                  locale === 'ar'
                    ? 'نخطط كل تنفيذ بناءً على الجمهور الذي سيستخدمه، والمكان الذي سيعمل فيه، وطريقة التسليم والتشغيل.'
                    : 'Every build is planned around the people using it, the place it runs, and the route it takes to launch.'
                }
              />
            </Reveal>
            <Reveal y={22}>
              <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[30px] border border-white/75 bg-white/86 p-4 shadow-[0_34px_90px_-58px_rgba(89,23,196,0.58)] backdrop-blur-md sm:p-5 lg:p-6">
                <CornerTicks color="rgba(124,58,237,0.32)" />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply"
                  style={{ backgroundImage: GRAIN }}
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-fuchsia-300/28 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -right-24 bottom-4 h-72 w-72 rounded-full bg-cyan-300/24 blur-3xl"
                  aria-hidden="true"
                />

                <div className="relative mb-4 overflow-hidden rounded-[24px] border border-white/15 bg-[#14042d] px-5 py-5 text-white shadow-[0_22px_54px_-34px_rgba(20,4,45,0.8)] sm:px-6 lg:px-7">
                  <div
                    className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(217,70,239,0.34),transparent_32%),radial-gradient(circle_at_84%_30%,rgba(45,212,191,0.22),transparent_34%),linear-gradient(135deg,rgba(124,58,237,0.38),transparent_58%)]"
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/24 to-transparent"
                    aria-hidden="true"
                  />
                  <div
                    dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="max-w-3xl">
                      <span
                        className="text-[10px] font-black uppercase tracking-[0.22em] text-fuchsia-100"
                        style={locale === 'ar' ? undefined : MONO}
                      >
                        {locale === 'ar' ? 'لمن نبني' : 'Who we build for'}
                      </span>
                      <h3
                        className={`mt-2 font-display text-2xl font-black tracking-normal text-white sm:text-3xl lg:text-4xl ${
                          locale === 'ar' ? 'leading-[1.25]' : 'leading-tight'
                        }`}
                      >
                        {locale === 'ar'
                          ? 'نبني حول الجمهور والمكان وطريقة التسليم.'
                          : 'Built around the audience, space, and delivery.'}
                      </h3>
                    </div>
                    <div className="grid w-full grid-cols-3 gap-2 lg:max-w-[470px]">
                      {(locale === 'ar'
                        ? ['الجمهور', 'المكان', 'التسليم']
                        : ['Audience', 'Venue', 'Delivery']
                      ).map((label) => (
                        <span
                          key={label}
                          className={`rounded-[16px] border border-white/18 bg-white/10 px-3.5 py-3 text-center text-[12px] font-extrabold text-white backdrop-blur-md ${
                            locale === 'ar' ? 'leading-[1.55]' : 'leading-tight'
                          }`}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative overflow-hidden rounded-[24px] border border-violet-200/65 bg-white/82">
                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-600 via-fuchsia-400 to-cyan-300"
                    aria-hidden="true"
                  />
                  <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {audiences.map((card, index) => (
                      <motion.div
                        key={card.title}
                        initial={motionEnabled ? { opacity: 0, y: 12 } : false}
                        whileInView={
                          motionEnabled ? { opacity: 1, y: 0 } : undefined
                        }
                        viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                        transition={
                          motionEnabled
                            ? {
                                duration: 0.5,
                                delay: Math.min(index * 0.06, 0.24),
                                ease: EASE,
                              }
                            : undefined
                        }
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        className={`group relative flex min-h-[260px] flex-col border-b border-violet-100/80 p-5 last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 ${
                          locale === 'ar' ? 'text-right' : 'text-left'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-600 via-fuchsia-500 to-violet-500 text-white shadow-[0_16px_34px_-20px_rgba(217,70,239,0.78)] transition-transform duration-300 group-hover:scale-105">
                            <card.icon className="h-6 w-6" strokeWidth={2} />
                          </span>
                          <span
                            className="rounded-full border border-violet-200/80 bg-violet-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600"
                            style={MONO}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>

                        <h3 className={`mt-5 font-display text-[1.18rem] font-black tracking-normal text-ink-950 sm:text-[1.28rem] ${locale === 'ar' ? 'leading-[1.55]' : 'leading-tight'}`}>
                          {locale === 'ar' ? card.titleAr : card.title}
                        </h3>
                        <p className={`mt-2 text-[13px] text-ink-600 ${locale === 'ar' ? 'leading-[1.85]' : 'leading-[1.6]'}`}>
                          {locale === 'ar' ? card.descAr : card.desc}
                        </p>

                        <div className="mt-5 grid gap-2">
                          {(locale === 'ar'
                            ? audienceFitNotesAr[index] ?? []
                            : audienceFitNotes[index] ?? []
                          ).map((note) => (
                            <span
                              key={note}
                              className="inline-flex min-h-9 items-center gap-2 rounded-full border border-violet-200/80 bg-violet-50/65 px-3 text-[11px] font-extrabold leading-[1.5] text-violet-800"
                            >
                              <Check
                                className="h-3.5 w-3.5 shrink-0 text-fuchsia-500"
                                strokeWidth={3}
                              />
                              {note}
                            </span>
                          ))}
                        </div>

                        <span className="mt-auto block pt-5">
                          <span className="block h-1.5 overflow-hidden rounded-full bg-violet-100">
                            <motion.span
                              className="block h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-400 to-cyan-300"
                              initial={motionEnabled ? { width: '18%' } : false}
                              whileInView={
                                motionEnabled ? { width: '100%' } : undefined
                              }
                              viewport={{ once: true }}
                              transition={
                                motionEnabled
                                  ? {
                                      duration: 0.75,
                                      delay: 0.1 + index * 0.06,
                                      ease: EASE,
                                    }
                                  : undefined
                              }
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

        {/* ══ 8. LOCAL & INTERNATIONAL DEPLOYMENT ══ */}
        <section
          id="global-reach"
          className="relative w-full overflow-hidden bg-[#0b0324] py-[clamp(3.5rem,7vw,5.5rem)] text-white"
        >
          <CustomBuildSectionBackdrop variant="hero" />
          <div className="site-container-wide relative z-10">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1fr_0.95fr] lg:gap-14">
              <Reveal y={24}>
                <SectionHead
                  icon={Globe2}
                  eyebrow={locale === 'ar' ? 'وصول محلي ودولي' : 'Global reach'}
                  title={
                    locale === 'ar'
                      ? 'يتم التنفيذ في الأردن ومراجعة التسليم محليًا أو دوليًا.'
                      : 'Built in Jordan and reviewed for local or international delivery.'
                  }
                  desc={
                    locale === 'ar'
                      ? 'من مختبرنا في عمّان، نسلّم المشاريع داخل الأردن ونجهزها للشحن الدولي بعد مراجعة متطلبات الحجم والوجهة والخدمات اللوجستية.'
                      : 'From our Amman lab, builds are delivered locally and shipped worldwide after a logistics review.'
                  }
                  dark
                  align="left"
                />

                <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {deliveryModes.map((mode, index) => (
                    <Reveal
                      key={mode.title}
                      delay={Math.min(index * 0.08, 0.24)}
                      y={16}
                      className="h-full"
                    >
                      <div
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                        className="flex h-full items-start gap-3 rounded-[14px] border border-white/12 bg-white/[0.05] p-3.5"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                          <mode.icon className="h-4 w-4" strokeWidth={2.1} />
                        </span>
                        <div>
                          <h3 className="font-sans text-[13px] font-bold tracking-[-0.01em] text-white">
                            {locale === 'ar' ? mode.titleAr : mode.title}
                          </h3>
                          <p
                            className={`mt-0.5 text-[11px] text-white/60 ${
                              locale === 'ar' ? 'leading-[1.75]' : 'leading-[1.45]'
                            }`}
                          >
                            {locale === 'ar' ? mode.descAr : mode.desc}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
                <p
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  className={`mt-6 text-[11.5px] text-white/52 ${
                    locale === 'ar' ? 'leading-[1.8]' : 'leading-[1.55]'
                  }`}
                  style={locale === 'ar' ? undefined : MONO}
                >
                  {locale === 'ar'
                    ? 'الشحن الدولي: يتم تأكيد التكلفة والمدة بعد مراجعة الحجم والوجهة والمتطلبات الجمركية.'
                    : 'INTL SHIPPING · COST & TIMELINE CONFIRMED AFTER SIZE / DESTINATION / CUSTOMS REVIEW'}
                </p>
              </Reveal>

              <Reveal y={28} delay={0.1}>
                <LazyGlobe />
                <p
                  className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-white/45"
                  style={locale === 'ar' ? undefined : MONO}
                  aria-hidden="true"
                >
{locale === 'ar' ? 'عمّان ← إلى العالم' : 'Amman → Worldwide'}
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ══ 9. CUSTOM BUILD CTA ══ */}
        <section className="site-section">
          <div className="site-container-wide">
            <Reveal y={24}>
              <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-br from-[#190453] via-[#4912a0] to-[#a126c9] px-6 py-12 text-center sm:px-10 sm:py-16">
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/40 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
                  style={{ backgroundImage: GRAIN }}
                  aria-hidden="true"
                />
                <div
                  dir={locale === 'ar' ? 'rtl' : 'ltr'}
                  className="relative mx-auto max-w-2xl"
                >
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60"
                    style={locale === 'ar' ? undefined : MONO}
                  >
                    {locale === 'ar' ? 'ابدأ طلب تنفيذ مخصص' : 'Open a build ticket'}
                  </span>
                  <h2
                    className={`mt-3 font-display text-[clamp(1.85rem,4.4vw,2.85rem)] font-extrabold text-white ${
                      locale === 'ar'
                        ? 'leading-[1.18] tracking-[-0.01em]'
                        : 'leading-[1.05] tracking-[-0.03em]'
                    }`}
                  >
                    {locale === 'ar'
                      ? 'لديك فكرة لتنفيذ مخصص؟'
                      : 'Have an idea for a custom build?'}
                  </h2>
                  <p
                    className={`mx-auto mt-4 max-w-xl text-[14.5px] text-white/82 ${
                      locale === 'ar' ? 'leading-[1.85]' : 'leading-[1.7]'
                    }`}
                  >
                    {locale === 'ar'
                      ? 'أرسل الفكرة أو الرسم أو هدف الفعالية وسنراجع كيفية تحويلها إلى تجربة حقيقية.'
                      : "Send a concept, sketch, or event goal and we'll review how to bring it to life."}
                  </p>
                  <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      to="/contact"
                      onMouseEnter={() => preloadRoute('/contact')}
                      className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-bold text-violet-800 transition-all hover:-translate-y-0.5 sm:w-auto"
                    >
                      {locale === 'ar'
                        ? 'اطلب عرض سعر لتنفيذ مخصص'
                        : 'Request a Custom Build Quote'}{' '}
                      <ArrowRight
                        className={`h-4 w-4 transition-transform ${
                          locale === 'ar'
                            ? 'rotate-180 group-hover:-translate-x-1'
                            : 'group-hover:translate-x-1'
                        }`}
                        strokeWidth={2.4}
                      />
                    </Link>
                    <a
                      href={`mailto:${BOOKING_EMAIL}`}
                      className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                    >
                      {locale === 'ar'
                        ? 'تواصل مع فريق Eventies'
                        : 'Email Eventies Team'}
                    </a>
                  </div>
                  <a
                    href={`mailto:${BOOKING_EMAIL}`}
                    className="mt-5 inline-block text-[12.5px] font-semibold text-white/75 underline decoration-white/40 underline-offset-2 hover:text-white"
                    style={MONO}
                  >
                    {BOOKING_EMAIL}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>
      <Lightbox
        images={lightbox.images}
        initialIndex={lightbox.index}
        open={lightbox.open}
        onClose={() => setLightbox((s) => ({ ...s, open: false }))}
      />
    </div>
  )
}
