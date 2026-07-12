'use client'

import Script from 'next/script'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { fieldErrorKeys, contactSchema } from '@/shared/schemas/contact'
import type { PublicFormResponse } from '@/shared/contracts/public-forms'
import { social } from '@/shared/data/social'

type Fields = { name: string; email: string; phone: string; message: string }

export function ContactForm() {
  const t = useTranslations('forms')
  const [fields, setFields] = useState<Fields>({ name: '', email: '', phone: '', message: '' })
  const [token, setToken] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const errorText = (key: string) => t(key.replace('forms.', '') as Parameters<typeof t>[0])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = contactSchema.safeParse(fields)
    if (!parsed.success) {
      setErrors(fieldErrorKeys(parsed.error))
      return
    }
    if (!token) {
      setStatus(t('challenge'))
      return
    }
    setBusy(true)
    setErrors({})
    setStatus('')
    try {
      const result = await fetch('/api/forms/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...fields, turnstileToken: token }),
      })
      const body = (await result.json()) as PublicFormResponse
      if (body.ok) {
        setStatus(t('success'))
        setFields({ name: '', email: '', phone: '', message: '' })
      } else if (body.code === 'RATE_LIMITED') setStatus(t('rateLimited'))
      else if (body.code === 'DUPLICATE') setStatus(t('duplicate'))
      else if (body.code === 'CHALLENGE') setStatus(t('challenge'))
      else setStatus(t('fallback'))
    } catch {
      setStatus(t('fallback'))
    } finally {
      setBusy(false)
    }
  }

  const input = (name: keyof Fields) => ({
    id: `contact-${name}`,
    name,
    value: fields[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields((current) => ({ ...current, [name]: event.target.value })),
    'aria-invalid': Boolean(errors[name]),
    'aria-describedby': errors[name] ? `contact-${name}-error` : undefined,
  })

  return (
    <section className="premium-card mt-10 p-6 sm:p-8" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title" className="text-2xl font-black text-ink-900">
        {t('title')}
      </h2>
      <p className="mt-2 text-sm text-ink-600">{t('description')}</p>
      <form className="mt-6 grid gap-4" onSubmit={submit} noValidate>
        {(['name', 'email', 'phone'] as const).map((name) => (
          <div key={name}>
            <label
              htmlFor={`contact-${name}`}
              className="mb-2 block text-sm font-bold text-ink-800"
            >
              {t(name)}
            </label>
            <input
              {...input(name)}
              type={name === 'email' ? 'email' : name === 'phone' ? 'tel' : 'text'}
              className="form-field"
              autoComplete={name === 'name' ? 'name' : name}
            />
            {errors[name] && (
              <p id={`contact-${name}-error`} className="mt-1 text-sm text-red-700">
                {errorText(errors[name])}
              </p>
            )}
          </div>
        ))}
        <div>
          <label htmlFor="contact-message" className="mb-2 block text-sm font-bold text-ink-800">
            {t('message')}
          </label>
          <textarea {...input('message')} rows={5} className="form-field" />
          {errors.message && (
            <p id="contact-message-error" className="mt-1 text-sm text-red-700">
              {errorText(errors.message)}
            </p>
          )}
        </div>
        {siteKey ? (
          <>
            <Script
              src="https://challenges.cloudflare.com/turnstile/v0/api.js"
              strategy="lazyOnload"
            />
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-callback="eventiesTurnstileDone"
            />
            <Script
              id="eventies-turnstile-callback"
              strategy="afterInteractive"
            >{`window.eventiesTurnstileDone=function(token){window.dispatchEvent(new CustomEvent('eventies-turnstile',{detail:token}))}`}</Script>
            <TurnstileListener onToken={setToken} />
          </>
        ) : (
          <p role="alert" className="text-sm text-red-700">
            {t('challenge')}
          </p>
        )}
        <button
          disabled={busy || !siteKey}
          className="rounded-full bg-violet-700 px-6 py-3 font-bold text-white disabled:opacity-50"
        >
          {t(busy ? 'submitting' : 'submit')}
        </button>
        <p aria-live="polite" role="status" className="min-h-6 text-sm font-semibold text-ink-700">
          {status}
        </p>
      </form>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href={social.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border px-4 py-2 text-sm font-bold"
        >
          {t('whatsapp')}
        </a>
        <a
          href={`mailto:${social.email}`}
          className="rounded-full border px-4 py-2 text-sm font-bold"
        >
          {t('emailUs')}
        </a>
      </div>
    </section>
  )
}

function TurnstileListener({ onToken }: { onToken: (token: string) => void }) {
  useEffect(() => {
    const listener = ((event: CustomEvent<string>) => onToken(event.detail)) as EventListener
    window.addEventListener('eventies-turnstile', listener)
    return () => window.removeEventListener('eventies-turnstile', listener)
  }, [onToken])
  return null
}
