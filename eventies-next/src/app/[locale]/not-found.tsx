'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

/**
 * FOUND-015 / I18N-018 groundwork: localized 404 (fixes the SPA soft-404 class).
 * Client component on purpose: under cacheComponents, server-side
 * useTranslations here is a dynamic API outside a Suspense boundary
 * (DYNAMIC_SERVER_USAGE); the client provider supplies messages instead.
 */
export default function NotFoundPage() {
  const t = useTranslations('common.notFound')

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <Link href="/">{t('backHome')}</Link>
    </main>
  )
}
