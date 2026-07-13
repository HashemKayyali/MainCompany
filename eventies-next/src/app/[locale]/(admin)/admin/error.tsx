'use client'

import { useTranslations } from 'next-intl'

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('admin')
  return (
    <section role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <h1 className="font-display text-2xl font-bold">{t('loadError')}</h1>
      <button onClick={reset} className="mt-4 rounded-full bg-rose-800 px-5 py-2 text-white">
        {t('retry')}
      </button>
    </section>
  )
}
