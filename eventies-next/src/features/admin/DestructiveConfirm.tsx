'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

export function DestructiveConfirm({
  label,
  confirmation,
  onConfirm,
}: {
  label: string
  confirmation: string
  onConfirm: () => Promise<void>
}) {
  const t = useTranslations('admin')
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const nodes = dialog.current?.querySelectorAll<HTMLElement>('button,input')
    nodes?.[0]?.focus()
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
      if (event.key !== 'Tab' || !nodes?.length) return
      const first = nodes[0]!,
        last = nodes[nodes.length - 1]!
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => document.removeEventListener('keydown', keydown)
  }, [open])
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-rose-700 px-4 py-2 text-sm font-bold text-white"
      >
        {label}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/60 p-4"
          role="presentation"
        >
          <div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="destructive-title"
            aria-describedby="destructive-description"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
          >
            <h2 id="destructive-title" className="text-xl font-bold">
              {t('confirmTitle')}
            </h2>
            <p id="destructive-description" className="mt-2 text-sm text-slate-600">
              {t('confirmDescription', { confirmation })}
            </p>
            <label htmlFor="destructive-confirm" className="mt-5 block text-sm font-semibold">
              {t('typeConfirmation')}
            </label>
            <input
              id="destructive-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
            />
            {error && (
              <p role="alert" className="mt-2 text-sm text-rose-700">
                {t('destructiveFailed')}
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border px-4 py-2"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                disabled={typed !== confirmation || busy}
                onClick={() => {
                  setBusy(true)
                  setError(false)
                  void onConfirm()
                    .then(() => {
                      setOpen(false)
                      setTyped('')
                    })
                    .catch(() => setError(true))
                    .finally(() => setBusy(false))
                }}
                className="rounded-full bg-rose-700 px-4 py-2 font-bold text-white disabled:opacity-40"
              >
                {busy ? t('saving') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
