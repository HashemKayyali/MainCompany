import { motion } from 'framer-motion'
import { Phone, Mail, MapPin } from 'lucide-react'
import ContactForm from '../components/contact/ContactForm'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'

const ease = [0.16, 1, 0.3, 1]

const contactCards = [
  {
    icon: Phone,
    label: 'Phone',
    value: social.phoneFormatted,
    href: `tel:${social.phone}`,
    accent: 'violet',
  },
  {
    icon: Mail,
    label: 'Email',
    value: social.email,
    href: `mailto:${social.email}`,
    accent: 'cyan',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Amman, Jordan',
    href: '',
    accent: 'pink',
  },
]

const accentClasses: Record<string, string> = {
  violet: 'from-violet-500 to-purple-600',
  cyan: 'from-cyan-500 to-blue-500',
  pink: 'from-pink-500 to-fuchsia-600',
}

export default function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description: 'Talk with Bike Land about rental requests, purchase quotes, and event planning support.',
  })

  const { isDark } = useTheme()

  return (
    <section className="site-section">
      <div className="site-container max-w-5xl">

        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mb-9"
        >
          <span className="section-label">// Get in Touch</span>
          <h1 className={`section-title !text-left mt-2.5 ${!isDark ? 'text-gray-900' : ''}`}>
            Plan Your <span className="text-glow">Experience</span>
          </h1>
          <p className={`mt-4 max-w-xl text-[0.97rem] leading-relaxed ${isDark ? 'text-slate-300/72' : 'text-slate-500'}`}>
            Have an event in mind? Reach out for rental inquiries, purchase quotes, or general questions. Our team responds within one business day.
          </p>
        </motion.div>

        {/* ── Contact Info Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease }}
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          {contactCards.map((card, index) => {
            const Wrapper = card.href ? 'a' : 'div'
            const Icon = card.icon

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + index * 0.07, ease }}
              >
                <Wrapper
                  {...(card.href ? { href: card.href } : {})}
                  className={`flex items-center gap-4 rounded-[20px] border p-4 transition-all duration-300 ${
                    card.href ? 'cursor-pointer hover:-translate-y-0.5' : ''
                  } ${
                    isDark
                      ? 'border-white/[0.08] bg-[linear-gradient(180deg,rgba(16,13,32,0.96),rgba(10,9,24,0.98))] hover:border-violet-400/[0.18]'
                      : 'border-violet-100/70 bg-white shadow-[0_4px_20px_rgba(124,58,237,0.05)] hover:border-violet-300/50'
                  }`}
                  style={{ willChange: 'transform' }}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br ${accentClasses[card.accent]} shadow-[0_6px_18px_rgba(0,0,0,0.2)]`}
                  >
                    <Icon size={18} className="text-white" strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      {card.label}
                    </p>
                    <p className={`mt-1 break-all text-[13.5px] font-semibold leading-snug ${isDark ? 'text-white/90' : 'text-slate-700'}`}>
                      {card.value}
                    </p>
                  </div>
                </Wrapper>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Contact Form ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.15, ease }}
        >
          <ContactForm />
        </motion.div>
      </div>
    </section>
  )
}
