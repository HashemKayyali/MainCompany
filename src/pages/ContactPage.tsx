import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock,
  LifeBuoy,
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Phone,
  Plus,
  Search,
  Store,
  type LucideIcon,
} from 'lucide-react'
import ContactForm from '../components/contact/ContactForm'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'
import { useMotionEnabled } from '../hooks/useMotionEnabled'
import SectionHeading from '../components/home/SectionHeading'
import Reveal from '../components/home/Reveal'
import EventiesHero from '../components/layout/EventiesHero'
import { useI18n } from '../contexts/LanguageContext'

// ── Data ─────────────────────────────────────────────────────────────────────

const paths: {
  title: string
  subtitle: string
  email: string
  cta: string
  icon: LucideIcon
  uses: string[]
  featured?: boolean
}[] = [
  {
    title: 'General Inquiries',
    subtitle: 'For anything that does not fit a specific team, start with the main Eventies inbox.',
    email: social.email,
    cta: 'Email Main Team',
    icon: Mail,
    uses: ['General questions', 'Company inquiries', 'New opportunities', 'Request routing help', 'Anything unsure'],
    featured: true,
  },
  {
    title: 'Event Requests',
    subtitle: 'For rental requests, purchase quote requests, custom builds, and event setup questions, contact booking@eventiesjo.com.',
    email: 'booking@eventiesjo.com',
    cta: 'Email Eventies Team',
    icon: CalendarCheck,
    uses: ['Rental requests', 'Purchase quote requests', 'Custom builds', 'Event setup questions', 'Service or category questions'],
  },
  {
    title: 'Support & Request Follow-up',
    subtitle: 'For account help, request status, and platform questions.',
    email: 'support@eventiesjo.com',
    cta: 'Email Support',
    icon: LifeBuoy,
    uses: ['Account questions', 'Request follow-up', 'Website support', 'General help', 'Profile or tracking issues'],
  },
  {
    title: 'Providers & Partnerships',
    subtitle: 'For service providers who want to showcase services or discuss partnership opportunities.',
    email: 'vendors@eventiesjo.com',
    cta: 'Contact Provider Team',
    icon: Store,
    uses: ['Provider onboarding', 'Vendor inquiries', 'Service listing interest', 'Partnerships', 'Marketplace growth'],
  },
]

const includeItems = [
  'Event date or expected date range',
  'City and venue if available',
  'Event type and audience size',
  'Services, rentals, or custom builds you are interested in',
  'Rental duration or setup time',
  'Delivery / setup notes',
  'Budget range if you want quote guidance',
  'Any special requirements or custom ideas',
]

const nextSteps: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: 'We review your message', desc: 'The team checks your inquiry type, event details, and requested services, rentals, or custom builds.', icon: Search },
  { title: 'We clarify requirements', desc: 'If needed, we follow up for missing details like date, quantity, location, or setup needs.', icon: MessagesSquare },
  { title: 'We check availability or request needs', desc: 'Rental services may require availability review, while custom builds may require pricing and scope review.', icon: CalendarClock },
  { title: 'We confirm next steps', desc: 'You receive follow-up with the available options, request guidance, or provider onboarding direction.', icon: CheckCircle2 },
]

const faqs: { q: string; a: string }[] = [
  {
    q: 'Which email should I use?',
    a: 'Use info@eventiesjo.com for general questions. Use booking@eventiesjo.com for rental requests, purchase quote requests, custom builds, and event setup questions. Use support@eventiesjo.com for account help, request follow-up, or platform support. Use vendors@eventiesjo.com for providers and partnerships.',
  },
  {
    q: 'Is sending the contact form the same as confirming a request?',
    a: 'No. Sending the form starts the review process. The Eventies team checks your event details, requested services, availability, logistics, and pricing requirements before final confirmation.',
  },
  {
    q: 'What details help you respond faster?',
    a: 'Include your event date, city, venue, event type, expected audience size, services, rentals, or custom builds you are interested in, rental duration, and any setup notes. Clear details help the team review your request more accurately.',
  },
  {
    q: 'Can I ask about a service even if I am not ready to request it?',
    a: 'Yes. You can ask about service details, availability, event suitability, or pricing requirements before submitting a full request.',
  },
  {
    q: 'Can I request a custom event setup?',
    a: 'Yes. If your event needs a custom combination of rentals, services, booths, screens, games, or production support, submit a request with your event details and the team will review the available options.',
  },
  {
    q: 'Why do some services need quote review?',
    a: 'Some services depend on event size, location, setup complexity, staffing, transport, duration, and technical requirements. Quote review helps avoid inaccurate pricing and gives you a more realistic response.',
  },
  {
    q: 'Can companies contact Eventies for activations or exhibitions?',
    a: 'Yes. Companies can contact Eventies for activations, exhibition booths, branded experiences, entertainment zones, LED screens, games, and event equipment.',
  },
  {
    q: 'Can providers join Eventies?',
    a: 'Eventies is building a marketplace for event service providers. Providers can contact vendors@eventiesjo.com to discuss service listings, onboarding, or partnership opportunities.',
  },
  {
    q: 'Do you support events outside Amman?',
    a: 'Eventies is based in Jordan and can review requests based on event location, provider availability, logistics, and setup requirements. Include your city and venue in the inquiry so the team can check the best next step.',
  },
  {
    q: 'How fast will the team respond?',
    a: 'The team aims to review inquiries within one business day. Response time may vary depending on request details, availability checks, and quote complexity.',
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

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
  const backgroundClass = variant === 'plain' ? 'bg-transparent' : `story-section story-section--${variant}`

  return (
    <section id={id} className={`site-section ${backgroundClass}${className ? ` ${className}` : ''}`}>
      {children}
    </section>
  )
}

function ContactSignalNode({
  icon: Icon,
  label,
  href,
  className,
  tone,
}: {
  icon: LucideIcon
  label: string
  href?: string
  className: string
  tone: 'violet' | 'fuchsia' | 'emerald' | 'amber' | 'sky'
}) {
  const toneClass = {
    violet: 'from-violet-600 to-indigo-500 shadow-violet-900/40',
    fuchsia: 'from-fuchsia-500 to-rose-400 shadow-fuchsia-900/35',
    emerald: 'from-emerald-400 to-teal-500 shadow-emerald-900/35',
    amber: 'from-amber-300 to-orange-400 shadow-amber-900/30',
    sky: 'from-sky-300 to-cyan-500 shadow-sky-900/30',
  }[tone]

  const node = (
    <span
      className={`hero-signal-node absolute flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${toneClass} text-white shadow-2xl ring-1 ring-white/35 sm:h-[72px] sm:w-[72px] ${className}`}
      aria-label={label}
    >
      <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={2} />
    </span>
  )

  if (href) {
    return (
      <a
        href={href}
        aria-label={label}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        {node}
      </a>
    )
  }

  return node
}

function ContactHeroShowcase() {
  return (
    <div className="hero-symbol-stage relative mx-auto aspect-square w-full max-w-[520px]" aria-label="Contact channels visual">
      <div className="absolute inset-[4%] rounded-full border border-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]" />
      <div className="hero-orbit-spin absolute inset-[12%] rounded-full border border-dashed border-fuchsia-200/22" />
      <div className="hero-orbit-spin-reverse absolute inset-[24%] rounded-full border border-dashed border-violet-100/20" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(217,70,239,0.2),transparent_35%),radial-gradient(circle_at_25%_20%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_80%_74%,rgba(16,185,129,0.15),transparent_26%)] blur-sm" />

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 520 520" fill="none" aria-hidden="true">
        <path className="hero-signal-dash" d="M260 260 C184 210 150 130 88 86" stroke="rgba(255,255,255,0.34)" strokeWidth="2" strokeLinecap="round" />
        <path className="hero-signal-dash hero-signal-dash--slow" d="M260 260 C345 194 374 126 438 94" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" />
        <path className="hero-signal-dash" d="M260 260 C165 300 128 370 96 442" stroke="rgba(255,255,255,0.27)" strokeWidth="2" strokeLinecap="round" />
        <path className="hero-signal-dash hero-signal-dash--slow" d="M260 260 C340 318 392 372 430 438" stroke="rgba(255,255,255,0.32)" strokeWidth="2" strokeLinecap="round" />
        <path d="M138 260 C184 228 215 220 260 260 C304 301 345 292 386 260" stroke="rgba(240,171,252,0.28)" strokeWidth="10" strokeLinecap="round" />
      </svg>

      <div className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-white to-violet-100 text-violet-800 shadow-[0_34px_70px_-28px_rgba(0,0,0,0.9),0_0_0_14px_rgba(255,255,255,0.06)] ring-1 ring-white/70 sm:h-40 sm:w-40">
        <span className="hero-center-pulse absolute inset-0 rounded-full bg-fuchsia-300/20" aria-hidden="true" />
        <MessagesSquare className="relative h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.8} />
      </div>

      <ContactSignalNode icon={Mail} label="Email Eventies" href={`mailto:${social.email}`} tone="violet" className="left-[7%] top-[10%]" />
      <ContactSignalNode icon={Phone} label="Call Eventies" href={`tel:${social.phone}`} tone="sky" className="right-[7%] top-[12%]" />
      <ContactSignalNode icon={MessageCircle} label="WhatsApp Eventies" href={social.whatsapp} tone="emerald" className="bottom-[12%] left-[10%]" />
      <ContactSignalNode icon={MapPin} label="Amman Jordan" tone="fuchsia" className="bottom-[9%] right-[12%]" />
      <ContactSignalNode icon={Clock} label="Response time" tone="amber" className="left-1/2 top-[3%] -translate-x-1/2" />

      <div className="hero-flow-dot absolute left-[28%] top-[32%] h-3 w-3 rounded-full bg-white shadow-[0_0_22px_rgba(255,255,255,0.9)]" />
      <div className="hero-flow-dot hero-flow-dot--late absolute bottom-[30%] right-[27%] h-2.5 w-2.5 rounded-full bg-fuchsia-200 shadow-[0_0_22px_rgba(240,171,252,0.85)]" />
    </div>
  )
}

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

export default function ContactPage() {
  usePageMeta({
    title: 'Contact Eventies | Event Requests in Jordan',
    description:
      'Contact Eventies for rental requests, purchase quote requests, custom builds, support, provider inquiries, and event service partnerships in Jordan.',
    canonical: 'https://www.eventiesjo.com/contact',
  })

  return (
    <div className="pb-4">
      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <EventiesHero
        eyebrow="Get in touch - Eventies"
        title={
          <>
            Plan your event with the right <span>Eventies team</span>.
          </>
        }
        description="Have a question about rental requests, purchase quote requests, custom builds, availability, or provider partnerships? Send the right inquiry and the Eventies team will review the details and follow up with you."
        primaryAction={{ label: 'Submit Request', href: '#contact-form' }}
        secondaryAction={{ label: 'Email Main Team', href: `mailto:${social.email}` }}
        chips={[
          { label: 'Event Requests', href: '#contact-form' },
          { label: 'Support', href: 'mailto:support@eventiesjo.com' },
          { label: 'Providers', href: 'mailto:vendors@eventiesjo.com' },
          { label: 'WhatsApp', href: social.whatsapp },
        ]}
        rightSlot={<ContactHeroShowcase />}
      />

      <div className="bg-[#f8f3ff]">
      {/* ── 2. Contact path cards ───────────────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="Contact paths"
            title="Choose the route that matches your request"
            description="The first step is not just sending a message. It is sending it to the team that can review your event, support, or provider request fastest."
            className="mb-10"
          />

          <Reveal y={22}>
            <div className="relative overflow-hidden rounded-[28px] border border-violet-200/70 bg-[linear-gradient(135deg,#ffffff_0%,#fbf7ff_42%,#f4edff_100%)] p-4 shadow-[0_28px_70px_-42px_rgba(89,23,196,0.45)] sm:p-6 lg:p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(184,92,255,0.18),transparent_30%),radial-gradient(circle_at_12%_88%,rgba(124,58,237,0.10),transparent_24%),radial-gradient(circle_at_90%_14%,rgba(217,70,239,0.10),transparent_24%)]" />
              <div className="pointer-events-none absolute inset-x-8 bottom-14 hidden h-px bg-gradient-to-r from-transparent via-violet-200/80 to-transparent lg:block" aria-hidden="true" />

              <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] lg:items-center">
                <div className="grid gap-4">
                  {paths.slice(0, 2).map((path, index) => (
                    <a
                      key={path.title}
                      href={`mailto:${path.email}`}
                      className={`group relative flex items-start gap-4 rounded-[22px] border p-5 transition-all duration-300 hover:-translate-y-1 ${
                        index === 0
                          ? 'border-violet-300/60 bg-gradient-to-br from-[#241056] to-[#5d18c4] text-white shadow-[0_26px_58px_-34px_rgba(89,23,196,0.8)]'
                          : 'border-violet-200/80 bg-white/88 text-ink-900 shadow-[0_1px_2px_rgba(20,8,50,0.04)] hover:border-violet-300'
                      }`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] ${index === 0 ? 'bg-white/15 text-white' : 'bg-violet-50 text-violet-600'}`}>
                        <path.icon className="h-5 w-5" strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0">
                        <span className={`block font-display text-[1.08rem] font-bold tracking-[-0.02em] ${index === 0 ? 'text-white' : 'text-ink-900'}`}>{path.title}</span>
                        <span className={`mt-1 block text-[12.5px] leading-[1.55] ${index === 0 ? 'text-white/78' : 'text-ink-600'}`}>{path.subtitle}</span>
                        <span className={`mt-3 inline-flex items-center gap-2 text-[11.5px] font-bold ${index === 0 ? 'text-fuchsia-100' : 'text-violet-700'}`}>
                          {path.uses.slice(0, 2).join(' / ')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                        </span>
                      </span>
                    </a>
                  ))}
                </div>

                <div className="relative flex min-h-[250px] items-center justify-center">
                  <div className="absolute h-[250px] w-[250px] rounded-full border border-violet-200/80 bg-violet-100/35" />
                  <div className="absolute h-[190px] w-[190px] rounded-full border border-dashed border-fuchsia-300/70" />
                  <div className="absolute h-[118px] w-[118px] rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 opacity-35 blur-2xl" />
                  <div className="relative flex h-[154px] w-[154px] flex-col items-center justify-center rounded-full border border-white/80 bg-white text-center shadow-[0_26px_58px_-30px_rgba(89,23,196,0.6)]">
                    <MessagesSquare className="h-9 w-9 text-violet-700" strokeWidth={2.1} />
                    <span className="mt-3 text-[10px] font-black uppercase tracking-[0.18em] text-violet-400">Eventies</span>
                    <span className="mt-1 font-display text-[1.05rem] font-bold tracking-[-0.02em] text-ink-900">Routing desk</span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {paths.slice(2).map(path => (
                    <a
                      key={path.title}
                      href={`mailto:${path.email}`}
                      className="group relative flex items-start gap-4 rounded-[22px] border border-violet-200/80 bg-white/88 p-5 text-ink-900 shadow-[0_1px_2px_rgba(20,8,50,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-violet-300"
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-violet-50 text-violet-600">
                        <path.icon className="h-5 w-5" strokeWidth={2.2} />
                      </span>
                      <span className="min-w-0">
                        <span className="block font-display text-[1.08rem] font-bold tracking-[-0.02em] text-ink-900">{path.title}</span>
                        <span className="mt-1 block text-[12.5px] leading-[1.55] text-ink-600">{path.subtitle}</span>
                        <span className="mt-3 inline-flex items-center gap-2 text-[11.5px] font-bold text-violet-700">
                          {path.uses.slice(0, 2).join(' / ')}
                          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.5} />
                        </span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="relative mt-6 flex flex-wrap items-center gap-3 border-t border-violet-100 pt-5">
                <a href={`tel:${social.phone}`} className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2.5 text-[12px] font-bold text-ink-800 transition-colors hover:border-violet-300 hover:bg-violet-50">
                  <Phone className="h-4 w-4 text-violet-600" strokeWidth={2} />
                  {social.phoneFormatted}
                </a>
                <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2.5 text-[12px] font-bold text-ink-800 transition-colors hover:border-violet-300 hover:bg-violet-50">
                  <MessageCircle className="h-4 w-4 text-violet-600" strokeWidth={2} />
                  WhatsApp
                </a>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2.5 text-[12px] font-bold text-ink-800">
                  <MapPin className="h-4 w-4 text-violet-600" strokeWidth={2} />
                  Amman, Jordan
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/85 px-4 py-2.5 text-[12px] font-bold text-ink-800">
                  <Clock className="h-4 w-4 text-violet-600" strokeWidth={2} />
                  Usually within 1 business day
                </span>
              </div>
            </div>
          </Reveal>

          <div className="hidden">
            {paths.map((path, index) => (
              <Reveal key={path.title} delay={Math.min(index * 0.07, 0.24)} y={20} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-[22px] border p-6 transition-all duration-300 ${
                    path.featured
                      ? 'border-violet-300/40 bg-gradient-to-br from-[#241056] to-[#5d18c4] text-white shadow-[0_30px_64px_-30px_rgba(124,58,237,0.7)]'
                      : 'border-violet-200/70 bg-white shadow-[0_1px_2px_rgba(20,8,50,0.04)] hover:-translate-y-1 hover:border-violet-300 hover:shadow-[0_24px_50px_-28px_rgba(89,23,196,0.4)]'
                  }`}
                >
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-[15px] ${
                      path.featured ? 'bg-white/15 text-white' : 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white'
                    }`}
                  >
                    <path.icon className="h-6 w-6" strokeWidth={2} />
                  </span>
                  <h2 className={`mt-4 font-display text-[1.25rem] font-bold tracking-[-0.02em] ${path.featured ? 'text-white' : 'text-ink-900'}`}>
                    {path.title}
                  </h2>
                  <p className={`mt-1.5 text-[13px] leading-[1.6] ${path.featured ? 'text-white/80' : 'text-ink-600'}`}>
                    {path.subtitle}
                  </p>

                  <ul className="mt-4 flex-1 space-y-2">
                    {path.uses.map(use => (
                      <li key={use} className="flex items-center gap-2.5 text-[12.5px] font-medium">
                        <Check className={`h-3.5 w-3.5 shrink-0 ${path.featured ? 'text-fuchsia-200' : 'text-violet-500'}`} strokeWidth={2.6} />
                        <span className={path.featured ? 'text-white/85' : 'text-ink-700'}>{use}</span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href={`mailto:${path.email}`}
                    className={`group mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-[12.5px] font-bold transition-all hover:-translate-y-0.5 ${
                      path.featured ? 'bg-white text-violet-800' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white'
                    }`}
                  >
                    {path.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                  </a>
                  <span className={`mt-3 break-all text-center text-[11.5px] font-semibold ${path.featured ? 'text-white/70' : 'text-violet-600'}`}>
                    {path.email}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          {/* ── 3. Quick contact info strip ── */}
          <Reveal y={18} delay={0.1}>
            <div className="hidden">
              <a href={`tel:${social.phone}`} className="flex items-center gap-3 bg-white px-5 py-4 transition-colors hover:bg-violet-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600">
                  <Phone className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Phone</span>
                  <span className="block truncate text-[13px] font-bold text-ink-900">{social.phoneFormatted}</span>
                </span>
              </a>
              <a href={`mailto:${social.email}`} className="flex items-center gap-3 bg-white px-5 py-4 transition-colors hover:bg-violet-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600">
                  <Mail className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Email</span>
                  <span className="block truncate text-[13px] font-bold text-ink-900">{social.email}</span>
                </span>
              </a>
              <a href={social.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-white px-5 py-4 transition-colors hover:bg-violet-50">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-emerald-50 text-emerald-600">
                  <MessageCircle className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">WhatsApp</span>
                  <span className="block truncate text-[13px] font-bold text-ink-900">Chat with the team</span>
                </span>
              </a>
              <div className="flex items-center gap-3 bg-white px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600">
                  <MapPin className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Location</span>
                  <span className="block truncate text-[13px] font-bold text-ink-900">Amman, Jordan</span>
                </span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-violet-50 text-violet-600">
                  <Clock className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-ink-400">Response</span>
                  <span className="block text-[13px] font-bold text-ink-900">Usually within 1 business day</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </StorySection>

      {/* ── 4 + 5. Form + What to include ──────────────────────── */}
      <StorySection id="contact-form" variant="waves" className="scroll-mt-[calc(var(--app-navbar-height)+1rem)]">
        <div className="site-container-wide">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.55fr_1fr] lg:gap-10">
            {/* Form */}
            <Reveal y={22}>
              <div>
                <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-extrabold tracking-[-0.03em] text-ink-900">
                  Send a detailed inquiry
                </h2>
                <p className="mt-2 max-w-xl text-[14px] leading-[1.7] text-ink-600">
                  Tell us what you are planning so we can route your message to the right team.
                </p>
                <div className="mt-6">
                  <ContactForm />
                </div>
              </div>
            </Reveal>

            {/* What to include */}
            <Reveal y={22} delay={0.08}>
              <div className="lg:sticky lg:top-28">
                <div className="rounded-[22px] border border-violet-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(20,8,50,0.04)]">
                  <h3 className="font-display text-[1.2rem] font-bold tracking-[-0.02em] text-ink-900">
                    What should I include in my message?
                  </h3>
                  <p className="mt-2 text-[12.5px] leading-[1.65] text-ink-600">
                    The more details you provide, the easier it is for the team to review your request accurately.
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {includeItems.map(item => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        <span className="text-[12.5px] font-medium leading-[1.5] text-ink-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-[18px] border border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-5">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" strokeWidth={2} />
                  <p className="text-[12.5px] leading-[1.6] text-ink-700">
                    Prefer email? Reach the main Eventies inbox directly at{' '}
                    <a href={`mailto:${social.email}`} className="font-bold text-violet-700 underline decoration-violet-300 underline-offset-2 hover:text-violet-900">
                      {social.email}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </StorySection>

      {/* ── 6. What happens next ────────────────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="After you reach out"
            title="What happens after you contact us?"
            description="A clear, reviewed path from your first message to confirmed next steps."
            className="mb-12"
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {nextSteps.map((step, index) => (
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
                  <h3 className="font-display text-[1.05rem] font-bold tracking-[-0.02em] text-ink-900">{step.title}</h3>
                  <p className="mt-2 flex-1 text-[12.5px] leading-[1.6] text-ink-600">{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal y={16} delay={0.1}>
            <div className="mt-6 flex items-start gap-3.5 rounded-[18px] border border-violet-200/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60 p-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-violet-600 shadow-[0_6px_14px_-6px_rgba(124,58,237,0.5)]">
                <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
              </span>
              <p className="text-[13px] leading-[1.7] text-ink-700">
                <span className="font-bold text-ink-900">A contact inquiry is not a confirmed request.</span>{' '}
                Final confirmation depends on availability, logistics, pricing, and team review.
              </p>
            </div>
          </Reveal>
        </div>
      </StorySection>

      {/* ── 7. FAQ ──────────────────────────────────────────────── */}
      <StorySection variant="ribbons">
        <div className="site-container-wide">
          <SectionHeading
            eyebrow="FAQ"
            title="Useful questions before you contact us"
            description="Which channel to use, what to include, and what to expect after you send a message."
            className="mb-8"
          />
          <FaqAccordion items={faqs} />
        </div>
      </StorySection>

      {/* ── 8. Final CTA ────────────────────────────────────────── */}
      <StorySection>
        <div className="site-container-wide">
          <Reveal y={24}>
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-[#190453] via-[#4912a0] to-[#7126e3] px-6 py-12 text-center sm:px-10 sm:py-16">
              <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/40 blur-3xl" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-violet-400/30 blur-3xl" aria-hidden="true" />
              <div className="relative mx-auto max-w-2xl">
                <h2 className="font-display text-[clamp(1.8rem,4.4vw,2.8rem)] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
                  Ready to send your event details?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-[14.5px] leading-[1.7] text-white/80">
                  Choose the right contact path or send one clear inquiry with your event date,
                  location, and setup needs.
                </p>
                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
                  <a
                    href="#contact-form"
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-bold text-violet-800 transition-all hover:-translate-y-0.5 sm:w-auto"
                  >
                    Submit Request
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={2.4} />
                  </a>
                  <a
                    href={`mailto:${social.email}`}
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                  >
                    Email Main Team
                  </a>
                  <a
                    href="mailto:vendors@eventiesjo.com"
                    className="inline-flex w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/20 sm:w-auto"
                  >
                    Provider Inquiry
                  </a>
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
