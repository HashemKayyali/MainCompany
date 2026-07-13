'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import type { AdminGridRow, AdminSection } from '@/shared/contracts/admin'
import { DestructiveConfirm } from './DestructiveConfirm'
import { requestAdminDelete, type DestructiveEntity } from './destructive-client'

export function AdminInterior({
  section,
  fixture = false,
  rows = [],
  count = 0,
}: {
  section: AdminSection
  fixture?: boolean
  rows?: AdminGridRow[]
  count?: number
}) {
  const t = useTranslations('admin')
  const [mode, setMode] = useState<'ready' | 'empty' | 'error'>('ready')
  const displayedRows = fixture
    ? [
        {
          id: 'fixture',
          label: 'Fixture item — عنصر تجريبي',
          secondary: null,
          status: 'active',
          createdAt: null,
        },
      ]
    : rows
  const destructiveEntity: DestructiveEntity | null =
    section === 'products'
      ? 'product'
      : section === 'categories'
        ? 'category'
        : section === 'gallery'
          ? 'gallery'
          : section === 'custom-builds'
            ? 'custom_build'
            : null
  const destructiveEnabled = process.env.NEXT_PUBLIC_ADMIN_DESTRUCTIVE_ENABLED === '1'

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
        <p
          role="status"
          className="rounded-full bg-violet-100 px-4 py-2 text-sm font-bold text-violet-800"
        >
          {t('recordCount', { count: fixture ? 1 : count })}
        </p>
      </header>

      {!fixture && section !== 'dashboard' && (
        <form method="get" className="mt-5 flex flex-wrap gap-2" role="search">
          <label htmlFor="admin-search" className="sr-only">
            {t('search')}
          </label>
          <input
            id="admin-search"
            name="search"
            maxLength={120}
            className="min-w-56 rounded-xl border border-slate-300 bg-white px-4 py-2.5"
            placeholder={t('search')}
          />
          <button className="rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white">
            {t('filter')}
          </button>
        </form>
      )}

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
      ) : mode === 'empty' || displayedRows.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          {t('emptyState')}
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
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
              {displayedRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="p-4 font-semibold">
                    <bdi dir="auto">{row.label}</bdi>
                    {row.secondary && (
                      <small className="mt-1 block font-normal text-slate-500">
                        <bdi dir="auto">{row.secondary}</bdi>
                      </small>
                    )}
                  </td>
                  <td className="p-4">
                    <bdi dir="auto">{row.status}</bdi>
                  </td>
                  <td className="p-4 text-end">
                    {fixture ? (
                      <DestructiveConfirm
                        label={t('delete')}
                        confirmation="DELETE"
                        onConfirm={async () => {}}
                      />
                    ) : destructiveEntity && destructiveEnabled ? (
                      <DestructiveConfirm
                        label={t('delete')}
                        confirmation="DELETE"
                        onConfirm={async () => {
                          await requestAdminDelete(destructiveEntity, row.id)
                          window.location.reload()
                        }}
                      />
                    ) : section === 'requests' || section === 'quotes' ? (
                      <Link
                        href={`/admin/${section}/${row.id}`}
                        className="rounded-full border border-violet-300 px-4 py-2 text-sm font-bold text-violet-800"
                      >
                        {t('view')}
                      </Link>
                    ) : (
                      <span className="text-xs text-slate-500">{t('mutationsAwaitStaging')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
