import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { Mail, Phone, MessageCircle } from 'lucide-react'
import { buildMetadata } from '@/server/metadata/builders'
import { EventiesHero } from '@/features/catalog/EventiesHero'
import { social, socialLinks } from '@/shared/data/social'
import { ContactForm } from '@/features/forms/ContactForm'

/**
 * CAT-016 — /contact (RSC). Real contact channels from the ported social data
 * (no placeholder numbers/text). The full contact FORM with server submission
 * is P3 (FORM group) — not shipped here, and NOT stubbed with placeholder UI.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/contact',
    title: 'Contact Eventies | Event Requests in Jordan',
    description:
      'Contact Eventies for event rentals, purchase requests, custom builds, support, provider inquiries, and event service partnerships in Jordan.',
  })
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.contact')

  const channels = [
    { icon: Mail, label: t('emailUs'), value: social.email, href: `mailto:${social.email}` },
    { icon: Phone, label: t('callUs'), value: social.phoneFormatted, href: `tel:${social.phone}` },
    {
      icon: MessageCircle,
      label: t('whatsapp'),
      value: social.phoneFormatted,
      href: social.whatsapp,
    },
  ]

  return (
    <div>
      <EventiesHero
        eyebrow={t('heroEyebrow')}
        title={t('heroTitle')}
        description={t('heroDescription')}
        primaryAction={{ label: t('browseServicesCta'), href: '/products' }}
      />

      <div className="bg-[#f8f3ff]">
        <section className="site-section">
          <div className="site-container mx-auto max-w-3xl">
            <h2 className="section-label">{t('reachUs')}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {channels.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="premium-card flex h-full flex-col gap-2 p-4 transition hover:-translate-y-0.5"
                  >
                    <c.icon className="h-5 w-5 text-brand-600" strokeWidth={2} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-ink-400">
                      {c.label}
                    </span>
                    <span dir="ltr" className="text-sm font-semibold text-ink-900">
                      {c.value}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <h2 className="section-label mt-10">{t('followUs')}</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {socialLinks.map((s) => (
                <a
                  key={s.platform}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-brand-300 hover:bg-brand-50"
                >
                  {s.platform} · {s.label}
                </a>
              ))}
            </div>
            <ContactForm />
          </div>
        </section>
      </div>
    </div>
  )
}
