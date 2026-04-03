import { motion } from 'framer-motion'
import ContactForm from '../components/contact/ContactForm'
import { useTheme } from '../contexts/ThemeContext'
import { social } from '../data/social'
import { usePageMeta } from '../hooks/usePageMeta'

const contactCards = [
  { icon: 'P', label: 'Phone', value: social.phoneFormatted, href: `tel:${social.phone}` },
  { icon: 'E', label: 'Email', value: social.email, href: `mailto:${social.email}` },
  { icon: 'L', label: 'Location', value: 'Amman, Jordan', href: '' },
]

export default function ContactPage() {
  usePageMeta({
    title: 'Contact',
    description:
      'Talk with Bike Land about rental requests, purchase quotes, and event planning support.',
  })

  const { isDark } = useTheme()

  return (
    <section className="site-section">
      <div className="site-container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 max-w-2xl"
        >
          <span className="section-label">// Get in Touch</span>
          <h1 className={`section-title !text-left ${!isDark ? 'text-gray-900' : ''}`}>
            Plan Your <span className="text-glow">Experience</span>
          </h1>
        </motion.div>

        <ContactForm />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {contactCards.map((card) => {
            const Wrapper = card.href ? 'a' : 'div'

            return (
              <Wrapper
                key={card.label}
                {...(card.href ? { href: card.href } : {})}
                className="glass flex items-center gap-3.5 rounded-[20px] p-4 sm:p-4.5"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-prism-violet to-prism-pink text-[11px] font-bold font-mono text-white">
                  {card.icon}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-[11px] font-mono uppercase tracking-wider ${
                      isDark ? 'text-purple-300/70' : 'text-gray-400'
                    }`}
                  >
                    {card.label}
                  </p>
                  <p
                    className={`mt-1 break-words text-[14.5px] font-medium leading-6 ${
                      isDark ? 'text-purple-100' : 'text-gray-700'
                    }`}
                  >
                    {card.value}
                  </p>
                </div>
              </Wrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}
