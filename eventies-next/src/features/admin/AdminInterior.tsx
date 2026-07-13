'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { DestructiveConfirm } from './DestructiveConfirm'

export type AdminSection =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'parts'
  | 'requests'
  | 'quotes'
  | 'customers'
  | 'providers'
  | 'custom-builds'
  | 'gallery'
  | 'chats'
  | 'notifications'
  | 'admins'
  | 'users'
  | 'logs'
  | 'contact-submissions'

export function AdminInterior({
  section,
  fixture = false,
}: {
  section: AdminSection
  fixture?: boolean
}) {
  const t = useTranslations('admin')
  const [mode, setMode] = useState<'ready' | 'empty' | 'error'>('ready')
  return (
    <section aria-labelledby="admin-page-title">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-600">
            {t('console')}
          </p>
          <h1 id="admin-page-title" className="mt-1 font-display text-3xl font-bold">
            {t(`sections.${section}`)}
          </h1>
        </div>
        <button
          type="button"
          className="rounded-full bg-violet-700 px-5 py-2.5 font-bold text-white"
        >
          {t('create')}
        </button>
      </header>
      {fixture && (
        <div className="mt-5 flex gap-2">
          <button onClick={() => setMode('ready')} className="rounded-full border px-3 py-1">
            {t('ready')}
          </button>
          <button onClick={() => setMode('empty')} className="rounded-full border px-3 py-1">
            {t('empty')}
          </button>
          <button onClick={() => setMode('error')} className="rounded-full border px-3 py-1">
            {t('error')}
          </button>
        </div>
      )}
      {mode === 'error' ? (
        <div role="alert" className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-6">
          <p>{t('loadError')}</p>
          <button className="mt-3 rounded-full border border-rose-300 px-4 py-2">
            {t('retry')}
          </button>
        </div>
      ) : mode === 'empty' ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          {t('emptyState')}
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full">
            <caption className="sr-only">{t(`sections.${section}`)}</caption>
            <thead className="bg-slate-100 text-start text-xs uppercase">
              <tr>
                <th className="p-4 text-start">{t('name')}</th>
                <th className="p-4 text-start">{t('status')}</th>
                <th className="p-4 text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-4 font-semibold">
                  {fixture ? 'Fixture item — عنصر تجريبي' : t('awaitingStaging')}
                </td>
                <td className="p-4">{t('active')}</td>
                <td className="p-4 text-end">
                  <DestructiveConfirm
                    label={t('delete')}
                    confirmation="DELETE"
                    onConfirm={async () => {}}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
