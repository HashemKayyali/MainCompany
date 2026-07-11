import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/server/metadata/builders'

/**
 * CAT-016 — /contact shell (RSC). The form ISLAND with server submission is
 * P3 (FORM group); this phase ships the page + SEO + email/WhatsApp fallbacks
 * only (no session, no submission).
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
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
      <p className="mt-4 text-ink-600">{t('intro')}</p>
      <div className="mt-8 rounded-xl border border-dashed border-ink-200 p-6">
        <p className="text-sm text-ink-600">{t('formComingSoon')}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a
            href="mailto:support@eventiesjo.com"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white"
          >
            {t('emailUs')}
          </a>
          <a
            href="https://wa.me/962790000000"
            rel="noreferrer"
            className="rounded-lg border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700"
          >
            {t('whatsapp')}
          </a>
        </div>
      </div>
    </div>
  )
}
