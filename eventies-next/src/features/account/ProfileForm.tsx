'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'
import { profileUpdateSchema } from '@/shared/schemas/transactions'

export function ProfileForm({
  profile,
}: {
  profile: { id: string; name: string | null; email: string | null; phone: string | null }
}) {
  const t = useTranslations('account')
  const [form, setForm] = useState({
    name: profile.name ?? '',
    phone: profile.phone ?? '',
  })
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = profileUpdateSchema.safeParse(form)
    if (!parsed.success) {
      setStatus(t('saveFailed'))
      return
    }
    setBusy(true)
    const { error } = await getSupabaseBrowserClient()
      .from('profiles')
      .update({
        name: parsed.data.name,
        phone: parsed.data.phone || null,
      })
      .eq('id', profile.id)
    setStatus(error ? t('saveFailed') : t('saved'))
    setBusy(false)
  }
  return (
    <form onSubmit={submit} className="premium-card mt-8 grid gap-4 p-6">
      <label htmlFor="profile-name" className="font-bold">
        {t('name')}
      </label>
      <input
        id="profile-name"
        className="form-field"
        value={form.name}
        onChange={(event) => setForm({ ...form, name: event.target.value })}
        required
        autoComplete="name"
      />
      <label htmlFor="profile-email" className="font-bold">
        {t('email')}
      </label>
      <input id="profile-email" className="form-field" value={profile.email ?? ''} disabled />
      <label htmlFor="profile-phone" className="font-bold">
        {t('phone')}
      </label>
      <input
        id="profile-phone"
        className="form-field"
        dir="auto"
        value={form.phone}
        onChange={(event) => setForm({ ...form, phone: event.target.value })}
        autoComplete="tel"
      />
      <button
        disabled={busy}
        className="rounded-full bg-violet-700 px-5 py-3 font-bold text-white disabled:opacity-50"
      >
        {t(busy ? 'saving' : 'save')}
      </button>
      <p role="status" aria-live="polite" className="min-h-6 text-sm font-semibold">
        {status}
      </p>
    </form>
  )
}
