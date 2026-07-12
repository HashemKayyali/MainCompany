'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { useQuoteDraft, useRentalDraft } from './CommerceProviders'

export function RentalDraftView() {
  const t = useTranslations('account')
  const draft = useRentalDraft()
  if (!draft.hydrated) return <DraftLoading />
  return (
    <DraftShell title={t('rentalCart')} empty={draft.items.length === 0}>
      {draft.items.map((item) => (
        <li
          key={item.productSlug}
          className="premium-card flex flex-wrap items-center justify-between gap-4 p-4"
        >
          <div>
            <h2 className="font-black">{item.productTitle}</h2>
            <label className="mt-2 flex items-center gap-2 text-sm">
              {t('quantity')}
              <input
                aria-label={`${t('quantity')} ${item.productTitle}`}
                type="number"
                min={1}
                max={100}
                value={item.quantity}
                onChange={(event) =>
                  draft.setQuantity(item.productSlug, Number(event.target.value))
                }
                className="w-20 rounded-lg border p-2"
              />
            </label>
          </div>
          <button
            onClick={() => draft.remove(item.productSlug)}
            className="text-sm font-bold text-red-700"
          >
            {t('remove')}
          </button>
        </li>
      ))}
      {draft.items.length > 0 && (
        <Link
          href="/checkout"
          className="inline-flex rounded-full bg-violet-700 px-5 py-3 font-bold text-white"
        >
          {t('checkout')}
        </Link>
      )}
    </DraftShell>
  )
}

export function QuoteDraftView() {
  const t = useTranslations('account')
  const draft = useQuoteDraft()
  if (!draft.hydrated) return <DraftLoading />
  return (
    <DraftShell title={t('quoteDraft')} empty={draft.items.length === 0}>
      {draft.items.map((item) => (
        <li
          key={item.productSlug}
          className="premium-card flex items-center justify-between gap-4 p-4"
        >
          <h2 className="font-black">{item.productTitle}</h2>
          <button
            onClick={() => draft.remove(item.productSlug)}
            className="text-sm font-bold text-red-700"
          >
            {t('remove')}
          </button>
        </li>
      ))}
    </DraftShell>
  )
}

function DraftShell({
  title,
  empty,
  children,
}: {
  title: string
  empty: boolean
  children: React.ReactNode
}) {
  const t = useTranslations('account')
  return (
    <div className="site-container max-w-4xl py-12">
      <h1 className="text-4xl font-black">{title}</h1>
      <p className="mt-3 text-ink-600">{t('draftSaved')}</p>
      {empty ? (
        <div className="premium-card mt-8 p-10 text-center">{t('draftEmpty')}</div>
      ) : (
        <ul className="mt-8 grid gap-4">{children}</ul>
      )}
    </div>
  )
}
function DraftLoading() {
  return (
    <div className="site-container py-12">
      <div className="h-32 animate-pulse rounded-3xl bg-violet-100" aria-label="Loading" />
    </div>
  )
}
