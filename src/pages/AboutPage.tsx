import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  ClipboardList,
  Compass,
  FileText,
  LayoutGrid,
  LifeBuoy,
  ListChecks,
  Mail,
  MapPin,
  MessagesSquare,
  PackagePlus,
  Plus,
  Repeat,
  ScanSearch,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  type LucideIcon,
} from 'lucide-react'
import { usePageMeta } from '../hooks/usePageMeta'
import { useMotionEnabled } from '../hooks/useMotionEnabled'
import { social } from '../data/social'
import { preloadRoute } from '../utils/route-preload'
import SectionHeading from '../components/home/SectionHeading'
import Reveal from '../components/home/Reveal'
import EventiesHero from '../components/layout/EventiesHero'
import { useI18n } from '../contexts/LanguageContext'

// ── Data ─────────────────────────────────────────────────────────────────────

const whyCards: { title: string; desc: string; icon: LucideIcon; solution?: boolean }[] = [
  { title: 'Fragmented Search', desc: 'Customers often search across different pages, contacts, and messages before finding what they need.', icon: Search },
  { title: 'Unclear Availability', desc: 'Rental items and event equipment need date and quantity checks before confirmation.', icon: CalendarClock },
  { title: 'Hard Comparison', desc: 'Without structured listings, it is difficult to compare options, details, and service types.', icon: Scale },
  { title: 'Organized Requests', desc: 'Eventies turns scattered communication into a clearer request flow that can be reviewed and followed up.', icon: ClipboardCheck, solution: true },
]

const doCards: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Browse Event Rentals', desc: 'Explore games, VR experiences, screens, booths, lighting, and event equipment by category.', icon: LayoutGrid },
  { title: 'Compare Details', desc: 'Review images, descriptions, pricing type, and service information before sending a request.', icon: ScanSearch },
  { title: 'Request Rentals', desc: 'Add rental items, choose what your event needs, and send one organized request for review.', icon: PackagePlus },
  { title: 'Submit Custom Requests', desc: 'Send purchase quote requests, custom build ideas, or special setup needs for review.', icon: FileText },
  { title: 'Track Requests', desc: 'Use your account to follow rental and purchase quote requests as they move through the review process.', icon: ListChecks },
  { title: 'Connect with the Team', desc: 'Use the right contact channel for support, event requests, or provider partnerships.', icon: MessagesSquare },
]

const audiences: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Individuals', desc: 'For private events, birthdays, gatherings, entertainment corners, and memorable experiences.', icon: User },
  { title: 'Companies', desc: 'For activations, brand days, employee events, exhibitions, brand launches, and corporate setups.', icon: Building2 },
  { title: 'Organizers', desc: 'For teams that need to compare options, collect items into one request, and coordinate event needs.', icon: ClipboardList },
  { title: 'Providers', desc: 'For event service providers who want a more organized way to showcase services and receive qualified inquiries.', icon: Store },
]

const steps: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Discover', desc: 'Browse event rentals, service categories, service details, media, and setup ideas.', icon: Compass },
  { title: 'Shortlist', desc: 'Add useful services to your request and compare what fits your event.', icon: ListChecks },
  { title: 'Request', desc: 'Send a rental or purchase quote request with event details, dates, quantities, and notes.', icon: Send },
  { title: 'Review', desc: 'The Eventies team reviews availability, logistics, request details, and next steps before final confirmation.', icon: ShieldCheck },
]

const differentiators: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'Event-Focused Marketplace', desc: 'Eventies is built specifically around event rentals, services, equipment, and activations.', icon: Sparkles },
  { title: 'Request-Based Workflows', desc: 'Some services can be requested as rentals, while custom services can be submitted for pricing and scope review.', icon: Repeat },
  { title: 'Availability Awareness', desc: 'Rental requests depend on dates, quantities, and active availability before confirmation.', icon: CalendarClock },
  { title: 'Jordan-Focused Experience', desc: 'Eventies is designed around the local event market, customer behavior, and communication needs in Jordan.', icon: MapPin },
  { title: 'Admin Review', desc: 'Requests are reviewed before final confirmation to reduce confusion and avoid unreliable commitments.', icon: ShieldCheck },
  { title: 'Provider Vision', desc: 'Eventies is building a more organized space for providers to showcase services and reach the right customers.', icon: Store },
]

const contacts: { title: string; desc: string; email: string; icon: LucideIcon }[] = [
  { title: 'General Inquiries', desc: 'For main inbox questions, company inquiries, or help routing your message.', email: social.email, icon: Mail },
  { title: 'Support', desc: 'For account help, platform questions, and request follow-up.', email: 'support@eventiesjo.com', icon: LifeBuoy },
  { title: 'Event Requests', desc: 'For rental requests, purchase quote requests, custom builds, and event setup questions.', email: 'booking@eventiesjo.com', icon: CalendarCheck },
  { title: 'Providers & Partnerships', desc: 'For service providers, vendor onboarding, and partnership inquiries.', email: 'vendors@eventiesjo.com', icon: Store },
]

const faqs: { q: string; a: string }[] = [
  {
    q: 'Does submitting a request confirm the service?',
    a: 'No. Sending a request means your event details are submitted for review. The Eventies team checks the selected services, dates, quantities, availability, logistics, and any pricing requirements before final confirmation.',
  },
  {
    q: 'Why are some services request-based instead of showing a fixed price?',
    a: 'Many event services depend on date, location, duration, setup needs, staffing, delivery, and availability. That is why Eventies uses a request review flow for accurate pricing and next steps.',
  },
  {
    q: 'What is the difference between a rental request and a purchase quote request?',
    a: 'A rental request is usually for services or equipment needed for specific event dates and quantities. A purchase quote request is used when pricing depends on custom details, service scope, setup complexity, shipping, or special event requirements.',
  },
  {
    q: 'Can I request multiple services together?',
    a: 'Yes. Eventies is designed to help you build an organized request that can include multiple rentals, services, and event needs. This makes it easier to review the full setup instead of handling each item separately.',
  },
  {
    q: 'How does availability checking work?',
    a: 'Rental availability depends on the selected dates, requested quantity, existing reservations, and available capacity. The system can help check availability, but final confirmation may still require team review to account for logistics and request details.',
  },
  {
    q: 'Why is admin review needed before final confirmation?',
    a: 'Events involve timing, setup requirements, delivery, availability, quantity, staffing, and sometimes custom pricing. Admin review helps make sure the request is realistic, accurate, and ready for proper follow-up before anything is confirmed.',
  },
  {
    q: 'Can Eventies help if I do not know exactly what I need?',
    a: 'Yes. You can browse categories, explore services, and submit a request with your event idea. The team can review your request and help guide you toward suitable options.',
  },
  {
    q: 'Does Eventies handle online payment?',
    a: 'At this stage, Eventies focuses on discovery, request submission, availability review, and communication. Payment or deposit details can be handled after the request is reviewed and confirmed by the team.',
  },
  {
    q: 'Is Eventies only for private parties?',
    a: 'No. Eventies supports different event types, including corporate activations, exhibitions, university events, brand launches, private gatherings, entertainment zones, and public event setups.',
  },
  {
    q: 'Can companies use Eventies for activations and exhibitions?',
    a: 'Yes. Companies and organizers can use Eventies to explore booths, displays, screens, interactive experiences, and event services for activations, exhibitions, launches, and team events.',
  },
  {
    q: 'Can service providers join Eventies?',
    a: 'Eventies is building a provider-focused marketplace experience. Providers who want to showcase services or discuss partnership opportunities can contact the provider team at vendors@eventiesjo.com.',
  },
  {
    q: 'Which email should I use?',
    a: 'For general questions or unsure requests, use info@eventiesjo.com. For support, use support@eventiesjo.com. For rental requests, purchase quote requests, custom builds, and event setup questions, use booking@eventiesjo.com. For providers, vendor onboarding, and partnerships, use vendors@eventiesjo.com.',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Render answer text, turning Eventies email addresses into mailto links. */
function renderAnswer(text: string): ReactNode {
  return text.split(/([a-z0-9._%+-]+@eventies(?:jo)?\.com)/gi).map((part, index) =>
    part.toLowerCase().includes('@eventies') ? (
      <a key={index} href={`mailto:${part}`} className="font-semibold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900">
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  )
}

function StorySection({
  id,
  variant = 'plain',
  className,
  children,
}: {
  id?: string
  variant?: 'plain' | 'waves' | 'ribbons' | 'signals'
  className?: string
  children: ReactNode
}) {
  const backgroundClass = variant === 'plain' ? 'bg-white' : `story-section story-section--${variant}`

  return (
    <section id={id} className={`site-section ${backgroundClass}${className ? ` ${className}` : ''}`}>
      {children}
    </section>
  )
}

function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
      <Icon className="h-5 w-5" strokeWidth={2} />
    </span>
  )
}

function AboutHeroShowcase() {
  const flow = [
    { label: 'Discover', icon: Compass, className: 'left-[6%] top-[18%]', tone: 'from-sky-300 to-cyan-500' },
    { label: 'Shortlist', icon: ListChecks, className: 'right-[7%] top-[22%]', tone: 'from-violet-500 to-indigo-500' },
    { label: 'Request', icon: Send, className: 'right-[12%] bottom-[18%]', tone: 'from-fuchsia-500 to-rose-400' },
    { label: 'Review', icon: ShieldCheck, className: 'left-[11%] bottom-[18%]', tone: 'from-emerald-400 to-teal-500' },
  ]
  const marketplaceLayers: { label: string; icon: LucideIcon }[] = [
    { label: 'Rentals', icon: LayoutGrid },
    { label: 'Providers', icon: Store },
    { label: 'Teams', icon: Building2 },
  ]

  return (
    <div className="hero-symbol-stage relative mx-auto aspect-[1.08/1] w-full max-w-[560px]" aria-label="Eventies marketplace map visual">
      <div className="absolute inset-0 rounded-[36px] border border-white/12 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]" />
      <div className="absolute inset-[7%] rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(217,70,239,0.22),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(16,185,129,0.14),transparent_26%),radial-gradient(circle_at_82%_18%,rgba(14,165,233,0.17),transparent_27%)] blur-sm" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 560 520" fill="none" aria-hidden="true">
        <path className="hero-signal-dash" d="M90 148 C164 98 230 94 280 176 C332 96 404 104 470 158" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" />
        <path className="hero-signal-dash hero-signal-dash--slow" d="M466 356 C400 420 326 420 280 344 C232 422 154 414 96 350" stroke="rgba(255,255,255,0.26)" strokeWidth="2" strokeLinecap="round" />
        <path d="M150 262 C202 214 248 218 280 262 C316 310 360 306 414 262" stroke="rgba(240,171,252,0.3)" strokeWidth="11" strokeLinecap="round" />
        <path d="M280 128 L407 201 L280 274 L153 201 Z" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.16)" />
        <path d="M280 246 L407 319 L280 392 L153 319 Z" fill="rgba(124,58,237,0.12)" stroke="rgba(255,255,255,0.14)" />
        <path d="M153 201 L153 319 L280 392 L280 274 Z" fill="rgba(14,165,233,0.08)" />
        <path d="M407 201 L407 319 L280 392 L280 274 Z" fill="rgba(217,70,239,0.08)" />
      </svg>

      <div className="absolute left-1/2 top-[49%] flex h-[148px] w-[148px] -translate-x-1/2 -translate-y-1/2 rotate-45 items-center justify-center rounded-[30px] bg-gradient-to-br from-white via-violet-50 to-fuchsia-100 text-violet-800 shadow-[0_34px_80px_-30px_rgba(0,0,0,0.9),0_0_0_12px_rgba(255,255,255,0.06)] ring-1 ring-white/75 sm:h-[174px] sm:w-[174px]">
        <span className="hero-center-pulse absolute inset-0 rounded-[30px] bg-fuchsia-300/20" aria-hidden="true" />
        <div className="relative flex -rotate-45 flex-col items-center text-center">
          <Sparkles className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={1.8} />
          <span className="mt-2 font-display text-[1.08rem] font-black tracking-normal text-violet-900 sm:text-[1.3rem]">Eventies</span>
          <span className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-violet-500">Marketplace</span>
        </div>
      </div>

      {flow.map(item => (
        <div key={item.label} className={`hero-signal-node absolute ${item.className}`}>
          <span className={`flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br ${item.tone} text-white shadow-2xl ring-1 ring-white/35 sm:h-16 sm:w-16`}>
            <item.icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2} />
          </span>
          <span className="mt-2 block rounded-full border border-white/16 bg-white/[0.08] px-3 py-1 text-center text-[10px] font-bold text-white/80 backdrop-blur-sm">
            {item.label}
          </span>
        </div>
      ))}

      <div className="absolute left-1/2 top-[7%] flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-white/[0.08] px-4 py-2 text-white/80 backdrop-blur-sm">
        <MapPin className="h-4 w-4 text-amber-200" strokeWidth={2.2} />
        <span className="text-[10px] font-black uppercase tracking-[0.18em]">Jordan events</span>
      </div>

      <div className="absolute bottom-[5%] left-1/2 grid w-[72%] -translate-x-1/2 grid-cols-3 overflow-hidden rounded-[18px] border border-white/12 bg-white/[0.07] text-center backdrop-blur-sm">
        {marketplaceLayers.map(layer => (
          <div key={layer.label} className="flex flex-col items-center gap-1 border-r border-white/10 px-2 py-3 last:border-r-0">
            <layer.icon className="h-4 w-4 text-fuchsia-100" strokeWidth={2.1} />
            <span className="text-[10px] font-bold text-white/70">{layer.label}</span>
          </div>
        ))}
      </div>

      <div className="hero-flow-dot absolute left-[24%] top-[42%] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.9)]" />
      <div className="hero-flow-dot hero-flow-dot--late absolute bottom-[36%] right-[25%] h-2.5 w-2.5 rounded-full bg-fuchsia-200 shadow-[0_0_22px_rgba(240,171,252,0.85)]" />
    </div>
  )
}

// ── Accordion ────────────────────────────────────────────────────────────────

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const motionEnabled = useMotionEnabled()
  const { translateText } = useI18n()
  const [open, setOpen] = useState(0)

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const isOpen = open === index
        return (
          <Reveal key={item.q} delay={Math.min(index * 0.03, 0.24)} y={14}>
            <div
              className={`overflow-hidden rounded-[18px] border transition-colors duration-300 ${
                isOpen
                  ? 'border-violet-300/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 shadow-[0_22px_48px_-28px_rgba(124,58,237,0.5)]'
                  : 'border-violet-200/70 bg-white hover:border-violet-300/70'
              }`}
            >
              <button
                type="button"
                onClick={() => setOpen(current => (current === index ? -1 : index))}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-4 px-4 py-3.5 text-left sm:px-5"
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-[12px] font-black transition-all duration-300 ${
                    isOpen ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' : 'bg-violet-100 text-violet-700'
                  }`}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 font-sans text-[14.5px] font-bold tracking-[-0.01em] text-ink-900 sm:text-[15.5px]">
                  {translateText(item.q)}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                    isOpen ? 'rotate-45 border-violet-300 bg-white text-violet-700' : 'border-violet-200 bg-violet-50 text-violet-600'
                  }`}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={motionEnabled ? { height: 0, opacity: 0 } : false}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={motionEnabled ? { height: 0, opacity: 0 } : undefined}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 pl-16 text-[13px] leading-[1.75] text-ink-600 sm:px-5 sm:pb-5 sm:pl-[4.25rem]">
                      {renderAnswer(translateText(item.a))}
                    </p>
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { translateText } = useI18n()

  const faqJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a },
      })),
    }),
    []
  )

  usePageMeta({
    title: 'About Eventies | Event Rentals & Services Marketplace in Jordan',
    description:
      'Learn how Eventies helps clients, organizers, companies, and providers discover rentals, activations, production support, custom builds, and trusted event services across Jordan.',
    canonical: 'https://www.eventiesjo.com/about',
    jsonLd: faqJsonLd,
  })

  return (
    <div className="pb-4">
      {/* ── 1. Hero ───────────────────────────────────────────────── */}
      <EventiesHero
        eyebrow="About Eventies - Jordan"
        title="A smarter way to prepare events in Jordan."
        description="Eventies is an organized event services marketplace that helps people discover rentals, activations, production support, custom builds, and trusted providers across Jordan."
        primaryAction={{ label: 'Explore Services', to: '/products' }}
        secondaryAction={{ label: 'Submit Request', to: '/contact' }}
        chips={[
          { label: 'Browse', to: '/products' },
          { label: 'Compare', to: '/products' },
          { label: 'Request', to: '/contact' },
          { label: 'Review', to: '/about' },
        ]}
        rightSlot={<AboutHeroShowcase />}
      />

      <div className="bg-[#f8f3ff]">
      {/* ── 2. Why Eventies Exists ───────────────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Why we built it"
            title="Why Eventies Exists"
            description="Planning an event often starts with scattered searches, Instagram pages, WhatsApp messages, referrals, and unclear availability. Eventies was created to make that process easier by giving customers one place to discover event services and equipment, review details, and submit organized requests."
            className="mb-12"
          />
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[30px] border border-violet-200/70 bg-white p-5 shadow-[0_28px_70px_-42px_rgba(89,23,196,0.45)] sm:p-7 lg:p-9">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(124,58,237,0.16),transparent_34%),radial-gradient(circle_at_82%_70%,rgba(217,70,239,0.13),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,243,255,0.78))]" />
              <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-70" viewBox="0 0 1100 480" fill="none" aria-hidden="true">
                <path className="hero-signal-dash" d="M80 320 C238 160 390 196 520 258 C656 324 804 292 1018 126" stroke="rgba(124,58,237,0.24)" strokeWidth="2.5" strokeLinecap="round" />
                <path className="hero-signal-dash hero-signal-dash--slow" d="M118 134 C270 242 392 102 548 182 C706 264 846 218 980 344" stroke="rgba(217,70,239,0.2)" strokeWidth="2" strokeLinecap="round" />
              </svg>

              <div className="relative grid gap-8 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 shadow-[0_10px_24px_-18px_rgba(89,23,196,0.45)]">
                    <Search className="h-3.5 w-3.5" strokeWidth={2.4} />
                    Before Eventies
                  </span>
                  <h3 className="mt-5 max-w-xl font-display text-[clamp(1.6rem,3.4vw,2.55rem)] font-extrabold leading-[1.05] tracking-[-0.035em] text-ink-900">
                    Scattered planning becomes one reviewed request.
                  </h3>
                  <p className="mt-4 max-w-lg text-[14px] leading-[1.75] text-ink-600">
                    Eventies connects discovery, comparison, availability, and follow-up into a cleaner path for customers and the team.
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                    {whyCards.slice(0, 3).map((card, index) => (
                      <div key={card.title} className={`flex items-center gap-3 rounded-full border border-violet-200/75 bg-white/78 px-4 py-3 shadow-[0_14px_28px_-24px_rgba(89,23,196,0.45)] ${index === 1 ? 'lg:ml-8' : ''}`}>
                        <card.icon className="h-4 w-4 shrink-0 text-violet-600" strokeWidth={2.2} />
                        <span className="text-[12.5px] font-bold text-ink-800">{card.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[360px] overflow-hidden rounded-[28px] border border-white/80 bg-white/62 p-5 backdrop-blur-sm">
                  <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-500/18 to-fuchsia-400/18 blur-2xl" aria-hidden="true" />
                  <div className="relative mx-auto flex max-w-xl flex-col gap-4">
                    <div className="flex items-center justify-between gap-4 rounded-[20px] border border-violet-200/70 bg-white/82 px-4 py-3 shadow-[0_18px_40px_-30px_rgba(89,23,196,0.5)]">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-500">Eventies layer</span>
                        <h4 className="mt-1 font-display text-[1.25rem] font-bold tracking-[-0.02em] text-ink-900">Request flow</h4>
                      </div>
                      <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                        <ClipboardCheck className="h-5 w-5" strokeWidth={2.2} />
                      </span>
                    </div>

                    <div className="relative grid gap-3 before:absolute before:left-[23px] before:top-6 before:h-[calc(100%-3rem)] before:w-px before:bg-gradient-to-b before:from-violet-300 before:via-fuchsia-300 before:to-violet-200">
                      {steps.map((step, index) => (
                        <div key={step.title} className="relative flex items-start gap-4 rounded-[18px] bg-white/72 p-3.5">
                          <span className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-violet-50 text-violet-700 ring-4 ring-white">
                            <step.icon className="h-5 w-5" strokeWidth={2.1} />
                          </span>
                          <span className="min-w-0">
                            <span className="mt-0.5 block font-display text-[1rem] font-bold tracking-[-0.02em] text-ink-900">{step.title}</span>
                            <span className="mt-1 block text-[12.5px] leading-[1.55] text-ink-600">{step.desc}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal y={22} className="hidden">
            <div className="relative overflow-hidden rounded-[28px] border border-violet-200/70 bg-white p-4 shadow-[0_28px_70px_-42px_rgba(89,23,196,0.45)] sm:p-6 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,rgba(184,92,255,0.18),transparent_36%),linear-gradient(135deg,rgba(248,243,255,0.96),rgba(255,255,255,0.82)_46%,rgba(245,236,255,0.96))]" />
              <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px_minmax(0,1.08fr)] lg:items-center">
                <div className="relative min-h-[300px] rounded-[24px] border border-violet-200/70 bg-white/72 p-5">
                  <div className="absolute left-7 top-8 h-14 w-32 -rotate-6 rounded-full bg-violet-100/90" />
                  <div className="absolute right-7 top-20 h-14 w-36 rotate-3 rounded-full bg-fuchsia-100/80" />
                  <div className="absolute bottom-10 left-12 h-14 w-40 rotate-6 rounded-full bg-violet-50" />
                  <div className="relative">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-500 shadow-[0_10px_24px_-18px_rgba(89,23,196,0.45)]">
                      <Search className="h-3.5 w-3.5" strokeWidth={2.4} />
                      Before Eventies
                    </span>
                    <h3 className="mt-6 max-w-[16rem] font-display text-[1.45rem] font-extrabold tracking-[-0.03em] text-ink-900">
                      Scattered planning signals
                    </h3>
                  </div>
                  <div className="relative mt-8 grid gap-3">
                    {[
                      { label: 'Search pages', icon: Search },
                      { label: 'Ask on WhatsApp', icon: MessagesSquare },
                      { label: 'Check availability', icon: CalendarClock },
                      { label: 'Compare manually', icon: Scale },
                    ].map((item, index) => (
                      <div
                        key={item.label}
                        className={`flex max-w-[16rem] items-center gap-3 rounded-full border border-violet-200/80 bg-white/88 px-4 py-3 text-[12.5px] font-bold text-ink-800 shadow-[0_12px_28px_-24px_rgba(89,23,196,0.5)] ${
                          index % 2 === 0 ? 'ml-0' : 'ml-auto'
                        }`}
                      >
                        <item.icon className="h-4 w-4 text-violet-600" strokeWidth={2.2} />
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="relative flex min-h-[250px] items-center justify-center">
                  <div className="absolute h-[250px] w-[250px] rounded-full border border-violet-200/80 bg-violet-100/35" />
                  <div className="absolute h-[178px] w-[178px] rounded-full border border-dashed border-fuchsia-300/70" />
                  <div className="absolute h-[120px] w-[120px] rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 opacity-35 blur-2xl" />
                  <ArrowRight className="absolute -left-4 top-1/2 hidden h-7 w-7 -translate-y-1/2 text-violet-400 lg:block" strokeWidth={2.2} />
                  <ArrowRight className="absolute -right-4 top-1/2 hidden h-7 w-7 -translate-y-1/2 text-violet-400 lg:block" strokeWidth={2.2} />
                  <div className="relative flex h-[154px] w-[154px] flex-col items-center justify-center rounded-full border border-white/80 bg-white text-center shadow-[0_26px_58px_-30px_rgba(89,23,196,0.6)]">
                    <ClipboardCheck className="h-9 w-9 text-violet-700" strokeWidth={2.1} />
                    <span className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">Eventies</span>
                    <span className="mt-1 font-display text-[1.05rem] font-bold tracking-[-0.02em] text-ink-900">Organizes</span>
                  </div>
                </div>

                <div className="relative min-h-[300px] rounded-[24px] border border-violet-200/70 bg-white/72 p-5">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-500 shadow-[0_10px_24px_-18px_rgba(89,23,196,0.45)]">
                    <ListChecks className="h-3.5 w-3.5" strokeWidth={2.4} />
                    After Eventies
                  </span>
                  <h3 className="mt-6 max-w-[18rem] font-display text-[1.45rem] font-extrabold tracking-[-0.03em] text-ink-900">
                    One clear request journey
                  </h3>
                  <div className="relative mt-8 space-y-3 before:absolute before:left-[17px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-violet-200">
                    {steps.map((step, index) => (
                      <div key={step.title} className="relative flex items-start gap-4">
                        <span className="z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-[12px] font-black text-white shadow-[0_12px_26px_-18px_rgba(89,23,196,0.8)]">
                          {index + 1}
                        </span>
                        <span className="min-w-0 pt-0.5">
                          <span className="block font-display text-[1rem] font-bold tracking-[-0.02em] text-ink-900">{step.title}</span>
                          <span className="mt-1 block text-[12.5px] leading-[1.55] text-ink-600">{step.desc}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="hidden">
            {whyCards.map((card, index) => (
              <Reveal key={card.title} delay={Math.min(index * 0.06, 0.24)} y={20} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-[20px] border p-6 transition-all duration-300 ${
                    card.solution
                      ? 'border-violet-300/70 bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-[0_28px_56px_-30px_rgba(124,58,237,0.7)]'
                      : 'border-violet-200/70 bg-white shadow-[0_1px_2px_rgba(20,8,50,0.04)] hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-28px_rgba(89,23,196,0.4)]'
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-[14px] ${
                      card.solution ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-600'
                    }`}
                  >
                    <card.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <h3 className={`mt-4 font-display text-[1.1rem] font-bold tracking-[-0.02em] ${card.solution ? 'text-white' : 'text-ink-900'}`}>
                    {card.title}
                  </h3>
                  <p className={`mt-2 text-[13px] leading-[1.65] ${card.solution ? 'text-white/85' : 'text-ink-600'}`}>
                    {card.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ── 3. What You Can Do ───────────────────────────────────── */}
      <StorySection variant="waves">
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Capabilities"
            title="What You Can Do with Eventies"
            description="One marketplace that takes you from browsing to a reviewed, organized request."
            className="mb-8"
          />
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[30px] border border-white/60 bg-white/78 p-5 shadow-[0_24px_60px_-42px_rgba(89,23,196,0.5)] backdrop-blur-sm sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.16),transparent_30%),radial-gradient(circle_at_15%_82%,rgba(217,70,239,0.12),transparent_26%)]" />
              <div className="relative grid gap-4 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
                <div className="grid gap-3">
                  {doCards.slice(0, 3).map((card, index) => (
                    <div key={card.title} className={`group flex items-center gap-3 rounded-full border border-violet-200/70 bg-white/82 px-4 py-3 shadow-[0_12px_30px_-26px_rgba(89,23,196,0.45)] ${index === 1 ? 'lg:mr-8' : ''}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-violet-50 text-violet-700">
                        <card.icon className="h-4.5 w-4.5" strokeWidth={2.1} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-ink-900">{card.title}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[11.5px] text-ink-500">{card.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>

                <div className="relative mx-auto flex h-[220px] w-[220px] items-center justify-center">
                  <span className="absolute inset-0 rounded-full border border-violet-200/80" />
                  <span className="absolute inset-8 rounded-full border border-dashed border-fuchsia-300/80" />
                  <span className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 opacity-35 blur-2xl" />
                  <div className="relative flex h-[132px] w-[132px] flex-col items-center justify-center rounded-[34px] bg-gradient-to-br from-violet-700 to-fuchsia-500 text-center text-white shadow-[0_28px_58px_-28px_rgba(124,58,237,0.75)]">
                    <Sparkles className="h-8 w-8" strokeWidth={1.9} />
                    <span className="mt-2 text-[10px] font-black uppercase tracking-[0.2em]">Eventies</span>
                    <span className="mt-1 font-display text-[1rem] font-bold">control hub</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {doCards.slice(3).map((card, index) => (
                    <div key={card.title} className={`group flex items-center gap-3 rounded-full border border-violet-200/70 bg-white/82 px-4 py-3 shadow-[0_12px_30px_-26px_rgba(89,23,196,0.45)] ${index === 1 ? 'lg:ml-8' : ''}`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-fuchsia-50 text-fuchsia-700">
                        <card.icon className="h-4.5 w-4.5" strokeWidth={2.1} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[13px] font-bold text-ink-900">{card.title}</span>
                        <span className="mt-0.5 line-clamp-1 block text-[11.5px] text-ink-500">{card.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <div className="hidden">
            {doCards.map((card, index) => (
              <Reveal key={card.title} delay={Math.min(index * 0.05, 0.3)} y={20} className="h-full">
                <div className="flex h-full items-start gap-4 rounded-[20px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-28px_rgba(89,23,196,0.4)]">
                  <IconTile icon={card.icon} />
                  <div className="min-w-0">
                    <h3 className="font-display text-[1.1rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.65] text-ink-600">{card.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ── 4. Who Eventies Is For ───────────────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Audiences"
            title="Built for different event needs"
            description="Whether you're planning one event or offering services, Eventies is designed around your role."
            className="mb-12"
          />
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[30px] border border-violet-200/70 bg-white p-5 shadow-[0_26px_64px_-44px_rgba(89,23,196,0.46)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(124,58,237,0.06)_1px,transparent_1px),linear-gradient(180deg,rgba(217,70,239,0.06)_1px,transparent_1px)] bg-[length:56px_56px]" aria-hidden="true" />
              <div className="relative grid gap-4 lg:grid-cols-4">
                {audiences.map((card, index) => (
                  <div key={card.title} className="relative min-h-[280px] overflow-hidden rounded-[24px] border border-violet-200/70 bg-white/78 p-5">
                    <span className="absolute inset-x-5 top-20 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" aria-hidden="true" />
                    <span className="absolute bottom-6 left-1/2 h-[42%] w-px -translate-x-1/2 bg-gradient-to-b from-violet-200 to-transparent" aria-hidden="true" />
                    <div className="relative flex h-full flex-col items-center text-center">
                      <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-[0_20px_42px_-24px_rgba(124,58,237,0.8)]">
                        <card.icon className="h-7 w-7" strokeWidth={1.9} />
                      </span>
                      <span className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-violet-400">Lane {String(index + 1).padStart(2, '0')}</span>
                      <h3 className="mt-2 font-display text-[1.22rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</h3>
                      <p className="mt-3 text-[13px] leading-[1.65] text-ink-600">{card.desc}</p>
                      <span className="mt-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" />
                        event path
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          <div className="hidden">
            {audiences.map((card, index) => (
              <Reveal key={card.title} delay={Math.min(index * 0.06, 0.24)} y={20} className="h-full">
                <div className="group flex h-full flex-col rounded-[20px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-28px_rgba(89,23,196,0.4)]">
                  <IconTile icon={card.icon} />
                  <h3 className="mt-4 font-display text-[1.15rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-ink-600">{card.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ── 5. How Eventies Works ────────────────────────────────── */}
      <StorySection variant="ribbons">
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Process"
            title="How Eventies Works"
            description="From idea to reviewed request."
            className="mb-12"
          />
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/76 p-5 shadow-[0_24px_64px_-44px_rgba(89,23,196,0.52)] backdrop-blur-sm sm:p-7">
              <div className="pointer-events-none absolute inset-x-8 top-1/2 hidden h-2 -translate-y-1/2 rounded-full bg-violet-100 lg:block" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-x-8 top-1/2 hidden h-0.5 -translate-y-1/2 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500 lg:block" aria-hidden="true" />
              <div className="relative grid gap-5 lg:grid-cols-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="relative">
                    <div className="relative flex min-h-[260px] flex-col rounded-[24px] border border-violet-200/70 bg-white p-5 shadow-[0_18px_40px_-32px_rgba(89,23,196,0.45)]">
                      <div className="mb-5 flex items-center justify-between">
                        <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                          <step.icon className="h-6 w-6" strokeWidth={2} />
                        </span>
                        <span className="font-display text-[2.2rem] font-black tracking-[-0.06em] text-violet-100">{String(index + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className="font-display text-[1.18rem] font-bold tracking-[-0.02em] text-ink-900">{step.title}</h3>
                      <p className="mt-2 text-[13px] leading-[1.65] text-ink-600">{step.desc}</p>
                      <span className="mt-auto pt-5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">Reviewed flow</span>
                    </div>
                    {index < steps.length - 1 && (
                      <ArrowRight className="absolute -right-4 top-1/2 z-10 hidden h-8 w-8 -translate-y-1/2 rounded-full bg-white p-1.5 text-violet-500 shadow-[0_8px_20px_-12px_rgba(89,23,196,0.8)] lg:block" strokeWidth={2.2} />
                    )}
                  </div>
                ))}
              </div>

              <div className="relative mt-5 flex items-start gap-3.5 rounded-[18px] border border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-[0_6px_14px_-6px_rgba(124,58,237,0.5)]">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                </span>
                <p className="text-[13px] leading-[1.7] text-ink-700">
                  <span className="font-bold text-ink-900">A request is not an instant confirmation.</span>{' '}
                  It is reviewed first so availability, logistics, and pricing can be handled properly.
                </p>
              </div>
            </div>
          </Reveal>
          <div className="hidden">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={Math.min(index * 0.08, 0.3)} y={20} className="h-full">
                <div className="relative flex h-full flex-col rounded-[20px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)]">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-violet-50 text-violet-600">
                      <step.icon className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="font-display text-[1.9rem] font-black tracking-[-0.05em] text-violet-100">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-display text-[1.15rem] font-bold tracking-[-0.02em] text-ink-900">{step.title}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-ink-600">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Important note */}
          <Reveal y={16} delay={0.1} className="hidden">
            <div className="mt-6 flex items-start gap-3.5 rounded-[18px] border border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-[0_6px_14px_-6px_rgba(124,58,237,0.5)]">
                <ShieldCheck className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-[13px] leading-[1.7] text-ink-700">
                <span className="font-bold text-ink-900">A request is not an instant confirmation.</span>{' '}
                It is reviewed first so availability, logistics, and pricing can be handled properly.
              </p>
            </div>
          </Reveal>
        </div>
      </StorySection>

      {/* ── 6. What Makes Eventies Different ─────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Why Eventies"
            title="What Makes Eventies Different"
            description="A marketplace shaped around how events are actually planned and delivered in Jordan."
            className="mb-12"
          />
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[30px] border border-violet-200/70 bg-white p-5 shadow-[0_26px_64px_-44px_rgba(89,23,196,0.46)] sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_28%,rgba(124,58,237,0.12),transparent_32%),radial-gradient(circle_at_84%_72%,rgba(217,70,239,0.11),transparent_30%)]" aria-hidden="true" />
              <div className="relative grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="relative min-h-[360px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#18054a] via-[#4b12a3] to-[#a126c9] p-6 text-white">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-white/16 blur-3xl" aria-hidden="true" />
                  <div className="pointer-events-none absolute -bottom-20 left-8 h-56 w-56 rounded-full bg-fuchsia-300/22 blur-3xl" aria-hidden="true" />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/[0.1] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2.2} />
                      {translateText('Built for events')}
                    </span>
                    <h3 className="mt-6 max-w-sm font-display text-3xl font-extrabold leading-tight tracking-normal text-white sm:text-4xl lg:text-[2.6rem]">
                      {translateText('Not a generic catalog with event items inside.')}
                    </h3>
                    <p className="mt-4 max-w-md text-[14px] leading-[1.75] text-white/76">
                      {translateText('Eventies is shaped around rental timing, request review, local behavior, and provider coordination from the start.')}
                    </p>
                    <div className="mt-auto grid grid-cols-3 gap-2 pt-8">
                      {['Requests', 'Review', 'Providers'].map(label => (
                        <span key={label} className="rounded-[14px] border border-white/14 bg-white/[0.08] px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-white/72">
                          {translateText(label)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  {differentiators.map((card, index) => (
                    <div key={card.title} className="group grid gap-3 rounded-[18px] border border-violet-200/70 bg-white/82 p-4 shadow-[0_16px_34px_-30px_rgba(89,23,196,0.45)] sm:grid-cols-[auto_1fr] sm:items-start">
                      <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-violet-50 text-violet-700 transition-colors group-hover:bg-gradient-to-br group-hover:from-violet-600 group-hover:to-fuchsia-500 group-hover:text-white">
                        <card.icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span>
                        <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">Difference {String(index + 1).padStart(2, '0')}</span>
                        <span className="mt-0.5 block font-display text-[1.02rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</span>
                        <span className="mt-1 block text-[12.5px] leading-[1.55] text-ink-600">{card.desc}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <div className="hidden">
            {differentiators.map((card, index) => (
              <Reveal key={card.title} delay={Math.min(index * 0.05, 0.3)} y={20} className="h-full">
                <div className="flex h-full items-start gap-4 rounded-[20px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-28px_rgba(89,23,196,0.4)]">
                  <IconTile icon={card.icon} />
                  <div className="min-w-0">
                    <h3 className="font-display text-[1.08rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</h3>
                    <p className="mt-2 text-[13px] leading-[1.65] text-ink-600">{card.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ── 7. Contact Channels ──────────────────────────────────── */}
      <StorySection variant="signals">
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Contact"
            title="Talk to the right Eventies team"
            description="Reach the channel that fits your need so we can help you faster."
            className="mb-12"
          />
          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-white/76 p-5 shadow-[0_24px_64px_-44px_rgba(89,23,196,0.52)] backdrop-blur-sm sm:p-7">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(124,58,237,0.13),transparent_30%),radial-gradient(circle_at_84%_84%,rgba(217,70,239,0.12),transparent_28%)]" aria-hidden="true" />
              <div className="relative grid gap-5 lg:grid-cols-[320px_1fr] lg:items-center">
                <div className="relative min-h-[300px] overflow-hidden rounded-[26px] bg-gradient-to-br from-[#190453] via-[#5717b8] to-[#c026d3] p-6 text-white">
                  <div className="pointer-events-none absolute inset-0 opacity-35" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.22) 1px, transparent 1px)', backgroundSize: '22px 22px' }} aria-hidden="true" />
                  <div className="relative flex h-full flex-col">
                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/18 bg-white/[0.1] px-3.5 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-violet-100">
                      <MessagesSquare className="h-3.5 w-3.5" strokeWidth={2.2} />
                      Routing
                    </span>
                    <h3 className="mt-6 font-display text-[2rem] font-extrabold leading-tight tracking-normal text-white">One message, right inbox.</h3>
                    <p className="mt-4 text-[14px] leading-[1.75] text-white/76">
                      Pick the channel that matches your request so the right Eventies team sees it first.
                    </p>
                    <span className="mt-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white text-violet-700 shadow-[0_20px_44px_-24px_rgba(0,0,0,0.8)]">
                      <Mail className="h-7 w-7" strokeWidth={2} />
                    </span>
                  </div>
                </div>

                <div className="relative grid gap-3 sm:grid-cols-2">
                  {contacts.map((card, index) => (
                    <a key={card.title} href={`mailto:${card.email}`} className="group relative overflow-hidden rounded-[20px] border border-violet-200/70 bg-white/84 p-4 shadow-[0_16px_34px_-30px_rgba(89,23,196,0.45)] transition-all hover:-translate-y-1 hover:border-violet-300 hover:bg-white">
                      <span className="absolute inset-x-4 top-0 h-1 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                      <span className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-violet-50 text-violet-700">
                          <card.icon className="h-5 w-5" strokeWidth={2} />
                        </span>
                        <span className="min-w-0">
                          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">Inbox {String(index + 1).padStart(2, '0')}</span>
                          <span className="mt-0.5 block font-display text-[1.05rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</span>
                          <span className="mt-1.5 block text-[12.5px] leading-[1.55] text-ink-600">{card.desc}</span>
                          <span className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-[12px] font-bold text-violet-700">
                            <span className="truncate">{card.email}</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2.4} />
                          </span>
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          <div className="hidden">
            {contacts.map((card, index) => (
              <Reveal key={card.title} delay={Math.min(index * 0.07, 0.24)} y={20} className="h-full">
                <div className="group flex h-full flex-col rounded-[22px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-28px_rgba(89,23,196,0.4)]">
                  <IconTile icon={card.icon} />
                  <h3 className="mt-4 font-display text-[1.2rem] font-bold tracking-[-0.02em] text-ink-900">{card.title}</h3>
                  <p className="mt-2 flex-1 text-[13px] leading-[1.65] text-ink-600">{card.desc}</p>
                  <a
                    href={`mailto:${card.email}`}
                    className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2.5 text-[12.5px] font-bold text-violet-700 transition-all hover:border-violet-300 hover:bg-gradient-to-r hover:from-violet-600 hover:to-fuchsia-500 hover:text-white"
                  >
                    {card.email}
                    <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.4} />
                  </a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </StorySection>

      {/* ── 8. FAQ ───────────────────────────────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="FAQ"
            title="Questions worth answering before you request"
            description="How requests, pricing, availability, and review work on Eventies."
            className="mb-8"
          />
          <FaqAccordion items={faqs} />
        </div>
      </StorySection>

      {/* ── 9. Final CTA ─────────────────────────────────────────── */}
      <StorySection variant="waves">
        <div className="site-container-wide">
          <Reveal y={24}>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#190453] via-[#4912a0] to-[#7126e3] px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/40 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl" aria-hidden="true" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="font-display text-[clamp(1.8rem,4.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
                  Ready to explore your next event setup?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-[1.7] text-white/80">
                  Browse event rentals and services, or submit a request so the Eventies team
                  can review your event needs.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link
                    to="/products"
                    onMouseEnter={() => preloadRoute('/products')}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-bold text-violet-800 transition-all hover:-translate-y-0.5 sm:w-auto"
                  >
                    Explore Services
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
                  </Link>
                  <Link
                    to="/contact"
                    onMouseEnter={() => preloadRoute('/contact')}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                  >
                    Contact Eventies
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </StorySection>
      </div>
    </div>
  )
}
