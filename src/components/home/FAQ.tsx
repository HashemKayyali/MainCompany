import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Plus } from 'lucide-react'
import { useMotionEnabled } from '../../hooks/useMotionEnabled'
import { preloadRoute } from '../../utils/route-preload'
import Reveal from './Reveal'
import { useI18n } from '../../contexts/LanguageContext'

const FAQS = [
  {
    q: 'How does Eventies work?',
    a: 'Browse service categories, add what you need to a single request, and send it with your event dates. Providers respond with availability and pricing, all tracked from your account.',
  },
  {
    q: "What's the difference between rentals and quotes?",
    a: 'Rental services can be added to your request draft with event dates. Custom services and purchase options are request-based, so the Eventies team reviews details before pricing and next steps are confirmed.',
  },
  {
    q: 'How do I check availability for my event date?',
    a: 'Add the services you want and submit a request with your event dates. Availability is reviewed for those exact dates before anything is confirmed.',
  },
  {
    q: 'Do you cover all of Jordan?',
    a: 'Yes. Our network of providers operates across Jordan, from Amman to events nationwide. Categories and coverage grow as more providers join.',
  },
  {
    q: 'How can I list my services as a provider?',
    a: 'Use the provider request path, share your services, and start receiving qualified requests from event organizers. Listing is free and you manage your own availability.',
  },
  {
    q: 'How do I get help or support?',
    a: 'Reach our team anytime through the contact page or our support email. We can help with planning, requests, provider questions, and anything in between.',
  },
]

function FaqItem({
  index,
  question,
  answer,
  open,
  onToggle,
  motionEnabled,
}: {
  index: number
  question: string
  answer: string
  open: boolean
  onToggle: () => void
  motionEnabled: boolean
}) {
  const { translateText } = useI18n()

  return (
    <div
      className={`overflow-hidden rounded-[18px] border transition-colors duration-300 ${
        open
          ? 'border-violet-300/80 bg-gradient-to-br from-violet-50 to-fuchsia-50/60'
          : 'border-violet-200/70 bg-white hover:border-violet-300/70'
      }`}
      style={{
        boxShadow: open ? '0 22px 48px -28px rgba(124,58,237,0.5)' : '0 1px 2px rgba(20,8,50,0.04)',
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-4 px-4 py-3.5 text-left sm:px-5"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-sans text-[12px] font-black transition-all duration-300 ${
            open ? 'bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white' : 'bg-violet-100 text-violet-700'
          }`}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 font-sans text-[14.5px] font-bold tracking-[-0.01em] text-ink-900 sm:text-[15.5px]">
          {translateText(question)}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
            open ? 'rotate-45 border-violet-300 bg-white text-violet-700' : 'border-violet-200 bg-violet-50 text-violet-600'
          }`}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={motionEnabled ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={motionEnabled ? { height: 0, opacity: 0 } : undefined}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 pl-16 text-[13px] leading-[1.7] text-ink-600 sm:px-5 sm:pb-5 sm:pl-[4.25rem]">
              {translateText(answer)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const motionEnabled = useMotionEnabled()
  const { translateText } = useI18n()
  const [open, setOpen] = useState(0)

  return (
    <section className="site-section">
      <div className="site-container-wide">
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {/* Left: heading panel */}
          <Reveal y={24}>
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end">
              <div>
              <div className="mb-4 inline-flex items-center gap-2.5">
                <span className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400" aria-hidden="true" />
                <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">{translateText('FAQ')}</span>
              </div>
              <h2 className="font-display text-[clamp(1.95rem,4.3vw,2.95rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
                {translateText('Questions?')}{' '}
                <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                  {translateText('Answered.')}
                </span>
              </h2>
              <p className="mt-4 max-w-md text-[14.5px] leading-[1.72] text-ink-600">
                {translateText('Everything you need to know about planning, requesting, and providing event services on Eventies.')}
              </p>
              </div>

              <div
                className="overflow-hidden rounded-[20px] border border-white/10 p-6"
                style={{
                  background: 'linear-gradient(150deg, #2a0a63 0%, #4912a0 55%, #7126e3 100%)',
                  boxShadow: '0 30px 64px -34px rgba(89,23,196,0.6)',
                }}
              >
                <div className="text-[13px] font-semibold text-white">{translateText('Still have a question?')}</div>
                <p className="mt-1.5 text-[12px] leading-[1.6] text-white/75">
                  {translateText('Our team is happy to help you plan your next event.')}
                </p>
                <Link
                  to="/contact"
                  onMouseEnter={() => preloadRoute('/contact')}
                  onFocus={() => preloadRoute('/contact')}
                  className="group mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[12px] font-bold text-violet-800 transition-all hover:-translate-y-0.5"
                >
                  {translateText('Contact us')}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Right: accordion */}
          <Reveal y={24} delay={0.08}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {FAQS.map((faq, index) => (
                <FaqItem
                  key={faq.q}
                  index={index}
                  question={faq.q}
                  answer={faq.a}
                  open={open === index}
                  onToggle={() => setOpen(current => (current === index ? -1 : index))}
                  motionEnabled={motionEnabled}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
