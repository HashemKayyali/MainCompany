import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { buildMetadata } from '@/server/metadata/builders'

/** CAT-016 — /about shell (RSC). Full narrative parity is a CAT-024 visual pass. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return buildMetadata({
    locale,
    path: '/about',
    title: 'About Eventies | Jordan Event Services Marketplace',
    description:
      'Learn how Eventies helps clients, organizers, companies, and providers discover rentals, activations, production support, custom builds, and trusted event services across Jordan.',
  })
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  const t = await getTranslations('catalog.about')
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-ink-900">{t('heading')}</h1>
      <p className="mt-4 text-lg text-ink-600">{t('intro')}</p>
    </div>
  )
}
