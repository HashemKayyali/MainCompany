'use client'

import Script from 'next/script'
import { useLocale, useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { getPostAuthRedirect } from '@/lib/auth-routing'

type Mode = 'login' | 'register' | 'reset'

export function AuthForm({ mode, redirectTo }: { mode: Mode; redirectTo?: string }) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [fields, setFields] = useState({ name: '', email: '', password: '', rememberMe: true })
  const [token, setToken] = useState('')
  const [challenge, setChallenge] = useState(mode !== 'login')
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  useEffect(() => {
    const listener = ((event: CustomEvent<string>) => setToken(event.detail)) as EventListener
    window.addEventListener('eventies-turnstile', listener)
    return () => window.removeEventListener('eventies-turnstile', listener)
  }, [])

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setStatus('')
    const endpoint = mode === 'login' ? 'login' : mode === 'register' ? 'signup' : 'reset'
    const response = await fetch(`/api/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...fields, locale, turnstileToken: token }),
    }).catch(() => null)
    const body = response ? (await response.json()) as { ok?: boolean; code?: string } : null
    if (body?.code === 'CHALLENGE_REQUIRED') {
      setChallenge(true)
      setStatus(t('challenge'))
    } else if (body?.ok && mode === 'login') {
      router.replace(getPostAuthRedirect(redirectTo, '/'))
      router.refresh()
    } else {
      setStatus(t('uniform'))
    }
    setBusy(false)
  }

  const title = mode === 'login' ? t('loginTitle') : mode === 'register' ? t('registerTitle') : t('resetTitle')
  const action = mode === 'login' ? t('login') : mode === 'register' ? t('register') : t('reset')

  return (
    <div className="site-container max-w-lg py-16">
      <form onSubmit={submit} className="premium-card grid gap-4 p-7" aria-labelledby="auth-title">
        <h1 id="auth-title" className="text-3xl font-black text-ink-900">{title}</h1>
        {mode === 'register' && <AuthField label={t('name')} name="name" value={fields.name} onChange={(name) => setFields({ ...fields, name })} autoComplete="name" />}
        <AuthField label={t('email')} name="email" type="email" value={fields.email} onChange={(email) => setFields({ ...fields, email })} autoComplete="email" />
        {mode !== 'reset' && <AuthField label={t('password')} name="password" type="password" value={fields.password} onChange={(password) => setFields({ ...fields, password })} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />}
        {mode === 'login' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={fields.rememberMe} onChange={(event) => setFields({ ...fields, rememberMe: event.target.checked })} />{t('remember')}</label>}
        {challenge && siteKey && <><Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="lazyOnload" /><div className="cf-turnstile" data-sitekey={siteKey} data-callback="eventiesTurnstileDone" /><Script id="auth-turnstile-callback" strategy="afterInteractive">{`window.eventiesTurnstileDone=function(token){window.dispatchEvent(new CustomEvent('eventies-turnstile',{detail:token}))}`}</Script></>}
        {challenge && !siteKey && <p role="alert" className="text-sm text-red-700">{t('challenge')}</p>}
        <button disabled={busy || (challenge && !token)} className="rounded-full bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? t('working') : action}</button>
        <p role="status" aria-live="polite" className="min-h-6 text-sm text-ink-700">{status}</p>
        <AuthLinks mode={mode} />
      </form>
    </div>
  )
}

function AuthField({ label, name, type = 'text', value, onChange, autoComplete }: { label: string; name: string; type?: string; value: string; onChange: (value: string) => void; autoComplete: string }) {
  return <div><label htmlFor={`auth-${name}`} className="mb-2 block text-sm font-bold">{label}</label><input id={`auth-${name}`} name={name} type={type} required value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} className="form-field" /></div>
}

function AuthLinks({ mode }: { mode: Mode }) {
  const t = useTranslations('auth')
  if (mode === 'login') return <div className="flex justify-between text-sm"><Link href="/reset-password">{t('forgot')}</Link><Link href="/register">{t('needAccount')}</Link></div>
  return <Link className="text-sm" href="/login">{t('haveAccount')}</Link>
}
