import { motion } from 'framer-motion'
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react'
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
    gradient: 'from-violet-500 to-purple-600',
    glow: 'rgba(124,58,237,0.4)',
  },
  {
    icon: Mail,
    label: 'Email',
    value: social.email,
    href: `mailto:${social.email}`,
    accent: 'cyan',
    gradient: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6,182,212,0.4)',
  },
  {
    icon: MapPin,
    label: 'Location',
    value: 'Amman, Jordan',
    href: '',
    accent: 'pink',
    gradient: 'from-pink-500 to-fuchsia-600',
    glow: 'rgba(236,72,153,0.4)',
  },
]

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
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.62, ease }}
          className="mb-11"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <span className="section-label">// Get in Touch</span>
            <div className={`h-px w-8 ${isDark ? 'bg-violet-500/30' : 'bg-violet-300/50'}`} />
          </div>
          <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
            Plan Your <span className="text-glow">Experience</span>
          </h1>
          <p className={`mt-4 max-w-xl text-[1rem] leading-[1.75] ${isDark ? 'text-slate-300/70' : 'text-slate-500'}`}>
            Have an event in mind? Reach out for rental inquiries, purchase quotes, or general questions. Our team responds within one business day.
          </p>
        </motion.div>

        {/* ── Contact Info Cards ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, delay: 0.08, ease }}
          className="mb-9 grid grid-cols-1 gap-3.5 sm:grid-cols-3"
        >
          {contactCards.map((card, index) => {
            const Wrapper = card.href ? 'a' : 'div'
            const Icon = card.icon

            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.48, delay: 0.1 + index * 0.08, ease }}
              >
                <Wrapper
                  {...(card.href ? { href: card.href } : {})}
                  className={`group contact-info-card flex items-center gap-4 p-5 ${
                    card.href ? 'cursor-pointer' : ''
                  }`}
                >
                  {/* Icon */}
                  <span
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-gradient-to-br ${card.gradient}`}
                    style={{
                      boxShadow: `0 8px 24px ${card.glow}`,
                    }}
                  >
                    <Icon size={20} className="text-white" strokeWidth={1.8} />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className={`text-[9.5px] font-bold uppercase tracking-[0.18em] ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                      {card.label}
                    </p>
                    <p className={`mt-1 break-all text-[13.5px] font-semibold leading-snug ${isDark ? 'text-white/90' : 'text-slate-700'}`}>
                      {card.value}
                    </p>
                  </div>

                  {card.href && (
                    <ArrowUpRight
                      size={15}
                      className={`shrink-0 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                        isDark ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    />
                  )}
                </Wrapper>
              </motion.div>
            )
          })}
        </motion.div>

        {/* ── Contact Form Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.56, delay: 0.16, ease }}
        >
          {/* Form header */}
          <div className="mb-6">
            <h2 className={`font-display text-[1.3rem] font-bold tracking-[-0.03em] ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Send a Message
            </h2>
            <p className={`mt-1.5 text-[13.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Fill out the form and we'll reach out to discuss your event requirements.
            </p>
          </div>

          <ContactForm />
        </motion.div>

      </div>
    </section>
  )
}
