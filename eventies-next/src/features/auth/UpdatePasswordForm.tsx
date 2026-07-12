'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

export function UpdatePasswordForm() {
  const t = useTranslations('auth')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (!error) await supabase.auth.signOut({ scope: 'others' })
    setStatus(error ? t('uniform') : t('passwordUpdated'))
    setBusy(false)
  }

  return <div className="site-container max-w-lg py-16"><form onSubmit={submit} className="premium-card grid gap-4 p-7"><h1 className="text-3xl font-black">{t('updateTitle')}</h1><label htmlFor="new-password" className="text-sm font-bold">{t('password')}</label><input id="new-password" type="password" minLength={8} maxLength={128} required autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="form-field" /><button disabled={busy} className="rounded-full bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? t('working') : t('update')}</button><p role="status" aria-live="polite">{status}</p></form></div>
}
