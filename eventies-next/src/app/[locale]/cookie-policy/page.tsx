import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { LegalDocView, legalMetaCopy } from '@/features/legal/LegalDocView'
import { buildMetadata } from '@/server/metadata/builders'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const { title, description } = legalMetaCopy('cookies', locale)
  return buildMetadata({ locale, path: '/cookie-policy', title, description })
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setRequestLocale(locale as 'en' | 'ar')
  return <LegalDocView docKey="cookies" locale={locale} />
}