import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useReveal } from '../../hooks/useReveal'
import SectionHeader from './SectionHeader'

const QUESTIONS = [
  {
    key: 'immediate',
    q: 'Is my request confirmed immediately?',
    a: 'Requests are reviewed first. You will receive confirmation after availability and details are checked, usually within a short response window.',
  },
  {
    key: 'difference',
    q: 'What is the difference between rental and quote request?',
    a: 'A rental request is for booking available items with set pricing. A quote request is for custom packages, multiple items, or services that need pricing review.',
  },
  {
    key: 'multiple',
    q: 'Can I request multiple items together?',
    a: 'Yes. You can add several products and services to one request so everything is organized under a single review.',
  },
  {
    key: 'account',
    q: 'Do I need an account?',
    a: 'Browsing is open to everyone. An account is needed to track requests, save details, and manage your event setup.',
  },
  {
    key: 'companies',
    q: 'Do you support companies and activations?',
    a: 'Yes. Eventies is built for corporate activations, exhibitions, university events, private parties, and brand launches.',
  },
  {
    key: 'providers',
    q: 'Can providers list their services?',
    a: 'Providers can join the marketplace by applying through the provider inquiry flow. Approved providers receive qualified requests through the platform.',
  },
]

function FAQItem({ item, open, onToggle }: { item: typeof QUESTIONS[0]; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-slate-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2"
        aria-expanded={open}
      >
        <span className="font-display text-[1.05rem] font-bold tracking-[-0.01em] text-slate-900">
          {item.q}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all ${
            open ? 'rotate-180 border-brand-300 text-brand-600' : ''
          }`}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-[14px] leading-[1.7] text-slate-600">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openKey, setOpenKey] = useState<string | null>(null)
  const reveal = useReveal({ distance: 14, duration: 0.4 })

  return (
    <section className="site-section">
      <div className="site-container">
        <div className="mx-auto max-w-3xl">
          <motion.div {...reveal} className="text-center">
            <SectionHeader eyebrow="Support" title="Frequently Asked Questions" align="center" />
          </motion.div>

          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-white px-5 py-2 shadow-sm sm:px-8">
            {QUESTIONS.map(item => (
              <FAQItem
                key={item.key}
                item={item}
                open={openKey === item.key}
                onToggle={() => setOpenKey(prev => (prev === item.key ? null : item.key))}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
