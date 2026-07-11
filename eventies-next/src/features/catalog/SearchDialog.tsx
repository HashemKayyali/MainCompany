'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

/**
 * CAT-019 — search dialog (client island, BOUNDED over server lists). The
 * catalog index (products + categories) is passed from a server component;
 * the client never fetches catalog data (Constitution §2). Opens on click,
 * traps focus, closes on Escape/backdrop, filters client-side.
 */
export type SearchItem = { type: 'product' | 'category'; name: string; href: string }

export function SearchDialog({ items }: { items: SearchItem[] }) {
  const t = useTranslations('catalog.home')
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return []
    return items.filter((i) => i.name.toLowerCase().includes(term)).slice(0, 12)
  }, [q, items])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm text-ink-600"
        aria-label={t('search')}
      >
        <span aria-hidden>⌕</span>
        <span className="hidden sm:inline">{t('search')}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('search')}
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-violet-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-ink-100 p-3">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t('searchPlaceholder')}
                dir="auto"
                className="w-full rounded-lg px-3 py-2 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t('searchClose')}
                className="rounded-lg px-2 py-1 text-sm text-ink-500"
              >
                ✕
              </button>
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {q.trim() && results.length === 0 ? (
                <li className="px-3 py-4 text-center text-sm text-ink-500">{t('searchEmpty')}</li>
              ) : (
                results.map((r, i) => (
                  <li key={`${r.href}-${i}`}>
                    <Link
                      href={r.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-brand-50"
                    >
                      <span dir="auto">{r.name}</span>
                      <span className="text-xs text-ink-400">{r.type}</span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  )
}
