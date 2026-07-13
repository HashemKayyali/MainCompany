'use client'

import { FormEvent, useState } from 'react'
import { useTranslations } from 'next-intl'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

export function MfaEnrollment() {
  const t = useTranslations('admin')
  const [factorId, setFactorId] = useState('')
  const [qr, setQr] = useState('')
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'enrolling' | 'challenging' | 'cancelling' | 'cancelled' | 'done' | 'error'
  >('idle')

  async function enroll() {
    setStatus('enrolling')
    const { data, error } = await getSupabaseBrowserClient().auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Eventies Admin',
    })
    if (error) {
      setStatus('error')
      return
    }
    setFactorId(data.id)
    setQr(data.totp.qr_code)
    setStatus('challenging')
  }

  async function verify(event: FormEvent) {
    event.preventDefault()
    const clean = code.replace(/\D/g, '').slice(0, 6)
    if (!factorId || clean.length !== 6) return
    const { data: challenge, error: challengeError } =
      await getSupabaseBrowserClient().auth.mfa.challenge({ factorId })
    if (challengeError) {
      setStatus('error')
      return
    }
    const { error } = await getSupabaseBrowserClient().auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: clean,
    })
    setStatus(error ? 'error' : 'done')
  }

  async function cancelEnrollment() {
    if (!factorId) {
      setStatus('idle')
      return
    }
    setStatus('cancelling')
    const { error } = await getSupabaseBrowserClient().auth.mfa.unenroll({ factorId })
    if (error) {
      setStatus('error')
      return
    }
    setFactorId('')
    setQr('')
    setCode('')
    setStatus('cancelled')
  }

  return (
    <section className="mx-auto max-w-lg rounded-3xl border border-violet-200 bg-white p-6 shadow-xl">
      <h1 className="font-display text-2xl font-bold">{t('mfaTitle')}</h1>
      <p className="mt-2 text-sm text-ink-600">{t('mfaDescription')}</p>
      {status === 'idle' && (
        <button
          type="button"
          onClick={() => void enroll()}
          className="mt-6 rounded-full bg-violet-700 px-5 py-2.5 font-semibold text-white"
        >
          {t('mfaEnroll')}
        </button>
      )}
      {qr && status === 'challenging' && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- short-lived provider QR data URI */}
          <img src={qr} alt={t('mfaQrAlt')} className="mt-6 h-56 w-56 rounded-2xl bg-white p-3" />
          <form onSubmit={verify} className="mt-4">
            <label htmlFor="totp" className="text-sm font-semibold">
              {t('mfaCode')}
            </label>
            <input
              id="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="mt-2 w-full rounded-xl border border-violet-200 px-4 py-3"
            />
            <button className="mt-3 rounded-full bg-violet-700 px-5 py-2.5 font-semibold text-white">
              {t('mfaVerify')}
            </button>
            <button
              type="button"
              onClick={() => void cancelEnrollment()}
              className="ms-2 mt-3 rounded-full border border-slate-300 px-5 py-2.5 font-semibold"
            >
              {t('mfaCancel')}
            </button>
          </form>
        </>
      )}
      {status === 'done' && (
        <p role="status" className="mt-6 rounded-xl bg-emerald-50 p-3 text-emerald-800">
          {t('mfaDone')}
        </p>
      )}
      {status === 'error' && (
        <div role="alert" className="mt-6 rounded-xl bg-rose-50 p-3 text-rose-800">
          <p>{t('mfaError')}</p>
          <button
            type="button"
            onClick={() => setStatus(factorId ? 'challenging' : 'idle')}
            className="mt-2 rounded-full border border-rose-300 px-4 py-2 font-semibold"
          >
            {t('retry')}
          </button>
          {factorId && (
            <button
              type="button"
              onClick={() => void cancelEnrollment()}
              className="ms-2 mt-2 rounded-full border border-rose-300 px-4 py-2 font-semibold"
            >
              {t('mfaCancel')}
            </button>
          )}
        </div>
      )}
      {status === 'cancelling' && (
        <p role="status" className="mt-6">
          {t('mfaCancelling')}
        </p>
      )}
      {status === 'cancelled' && (
        <div role="status" className="mt-6 rounded-xl bg-slate-100 p-3">
          <p>{t('mfaCancelled')}</p>
          <button type="button" onClick={() => setStatus('idle')} className="mt-2 underline">
            {t('mfaRestart')}
          </button>
        </div>
      )}
    </section>
  )
}
