'use client'

import { useTranslations } from 'next-intl'

/** FOUND-015: segment error boundary — typed error UI, localized. */
export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('common.error')

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {error.digest ? <p data-testid="error-digest">{error.digest}</p> : null}
      <button type="button" onClick={reset}>
        {t('retry')}
      </button>
    </main>
  )
}
