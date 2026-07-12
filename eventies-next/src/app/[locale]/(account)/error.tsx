'use client'
import { useTranslations } from 'next-intl'
export default function AccountError({ reset }: { reset: () => void }) {
  const t = useTranslations('common.error')
  return (
    <div className="site-container py-12 text-center">
      <h1 className="text-3xl font-black">{t('title')}</h1>
      <p className="mt-3">{t('description')}</p>
      <button
        onClick={reset}
        className="mt-5 rounded-full bg-violet-700 px-5 py-3 font-bold text-white"
      >
        {t('retry')}
      </button>
    </div>
  )
}
