import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { preloadRoute } from '../../utils/route-preload'
import FaqFlipGrid from '../ui/FaqFlipGrid'
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

export default function FAQ() {
  const { translateText } = useI18n()

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

          {/* Right: flip-card grid */}
          <FaqFlipGrid items={FAQS} />
        </div>
      </div>
    </section>
  )
}
