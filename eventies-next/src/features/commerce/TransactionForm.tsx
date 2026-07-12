'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { localizedPath } from '@/lib/auth-routing'
import type { ProfileRow } from '@/shared/types/database.types'
import type { PurchaseQuoteInput, RentalRequestInput } from '@/shared/schemas/transactions'
import { useQuoteDraft, useRentalDraft } from './CommerceProviders'
import { createIdempotentSubmitter, TransactionError } from './idempotent-submit'
import { submitPurchaseQuote, submitRentalRequest } from './transactions'

type Contact = {
  customerName: string
  email: string
  phone: string
  companyName: string
  city: string
  address: string
  eventName: string
  notes: string
}
const initial = (profile: ProfileRow): Contact => ({
  customerName: profile.name ?? '',
  email: profile.email ?? '',
  phone: profile.phone ?? '',
  companyName: '',
  city: '',
  address: '',
  eventName: '',
  notes: '',
})

export function RentalCheckoutForm({ profile }: { profile: ProfileRow }) {
  const rental = useRentalDraft()
  const submitter = useMemo(
    () =>
      createIdempotentSubmitter<Omit<RentalRequestInput, 'idempotencyKey'>>(submitRentalRequest),
    []
  )
  return (
    <TransactionForm
      mode="rental"
      profile={profile}
      empty={rental.items.length === 0}
      submit={async (contact) =>
        submitter.submit({
          ...contact,
          items: rental.items.map((item) => ({
            ...item,
            startDate: rental.mode === 'shared' ? rental.sharedStartDate : item.startDate,
            endDate: rental.mode === 'shared' ? rental.sharedEndDate : item.endDate,
          })),
        })
      }
      onSuccess={() => {
        submitter.complete()
        rental.clear()
      }}
    />
  )
}

export function PurchaseQuoteForm({ profile }: { profile: ProfileRow }) {
  const quote = useQuoteDraft()
  const submitter = useMemo(
    () =>
      createIdempotentSubmitter<Omit<PurchaseQuoteInput, 'idempotencyKey'>>(submitPurchaseQuote),
    []
  )
  return (
    <TransactionForm
      mode="quote"
      profile={profile}
      empty={quote.items.length === 0}
      submit={(contact) => submitter.submit({ ...contact, items: quote.items })}
      onSuccess={() => {
        submitter.complete()
        quote.clear()
      }}
    />
  )
}

function TransactionForm({
  mode,
  profile,
  empty,
  submit,
  onSuccess,
}: {
  mode: 'rental' | 'quote'
  profile: ProfileRow
  empty: boolean
  submit: (contact: Contact) => Promise<{ requestNumber: string }>
  onSuccess: () => void
}) {
  const t = useTranslations('account')
  const locale = useLocale()
  const router = useRouter()
  const [contact, setContact] = useState(() => initial(profile))
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  useEffect(() => {
    const refresh = (event: PageTransitionEvent) => {
      if (event.persisted) router.refresh()
    }
    window.addEventListener('pageshow', refresh)
    return () => window.removeEventListener('pageshow', refresh)
  }, [router])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (empty) return
    setBusy(true)
    setStatus('')
    try {
      const result = await submit(contact)
      onSuccess()
      setStatus(t('requestCreated'))
      router.push(`/my-requests/${result.requestNumber}`)
    } catch (error) {
      const code = error instanceof TransactionError ? error.code : 'UNAVAILABLE'
      if (code === 'AUTH_EXPIRED') {
        setStatus(t('authExpired'))
        const path = mode === 'rental' ? '/checkout' : '/purchase-quote'
        router.push(
          `${localizedPath(locale, '/login')}?redirect=${encodeURIComponent(localizedPath(locale, path))}`
        )
      } else setStatus(t(code === 'TIMEOUT' ? 'timeout' : 'unavailable'))
    } finally {
      setBusy(false)
    }
  }

  const update = (key: keyof Contact, value: string) =>
    setContact((current) => ({ ...current, [key]: value }))
  return (
    <div className="site-container max-w-3xl py-12">
      <h1 className="text-4xl font-black">{t(mode === 'rental' ? 'checkout' : 'submitQuote')}</h1>
      {empty ? (
        <div className="premium-card mt-8 p-10 text-center">{t('draftEmpty')}</div>
      ) : (
        <form onSubmit={handleSubmit} className="premium-card mt-8 grid gap-4 p-6">
          <h2 className="text-xl font-black">{t('contactDetails')}</h2>
          <Field
            label={t('name')}
            name="customerName"
            value={contact.customerName}
            update={update}
            autoComplete="name"
          />
          <Field
            label={t('email')}
            name="email"
            type="email"
            value={contact.email}
            update={update}
            autoComplete="email"
          />
          <Field
            label={t('phone')}
            name="phone"
            value={contact.phone}
            update={update}
            autoComplete="tel"
          />
          <Field
            label={t('company')}
            name="companyName"
            value={contact.companyName}
            update={update}
          />
          <Field label={t('city')} name="city" value={contact.city} update={update} required />
          <Field
            label={t('address')}
            name="address"
            value={contact.address}
            update={update}
            required
          />
          {mode === 'rental' && (
            <Field
              label={t('eventName')}
              name="eventName"
              value={contact.eventName}
              update={update}
            />
          )}
          <label htmlFor="transaction-notes" className="font-bold">
            {t('notes')}
          </label>
          <textarea
            id="transaction-notes"
            dir="auto"
            className="form-field"
            maxLength={4000}
            value={contact.notes}
            onChange={(event) => update('notes', event.target.value)}
          />
          <button
            disabled={busy}
            className="rounded-full bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-50"
          >
            {t(busy ? 'submitting' : 'submit')}
          </button>
          <p role="status" aria-live="polite" className="min-h-6 text-sm font-semibold">
            {status}
          </p>
        </form>
      )}
    </div>
  )
}

function Field({
  label,
  name,
  value,
  update,
  type = 'text',
  autoComplete,
  required = true,
}: {
  label: string
  name: keyof Contact
  value: string
  update: (name: keyof Contact, value: string) => void
  type?: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <div>
      <label htmlFor={`transaction-${name}`} className="mb-2 block font-bold">
        {label}
      </label>
      <input
        id={`transaction-${name}`}
        dir="auto"
        className="form-field"
        type={type}
        value={value}
        onChange={(event) => update(name, event.target.value)}
        autoComplete={autoComplete}
        required={required}
      />
    </div>
  )
}
