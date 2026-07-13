'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'

const SECTIONS = [
  'dashboard',
  'products',
  'categories',
  'parts',
  'requests',
  'quotes',
  'customers',
  'providers',
  'custom-builds',
  'gallery',
  'chats',
  'notifications',
  'admins',
  'users',
  'logs',
  'contact-submissions',
] as const

export function AdminShell({
  children,
  role,
}: {
  children: React.ReactNode
  role: 'admin' | 'superadmin'
}) {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  return (
    <div className="min-h-[calc(100vh-74px)] bg-slate-50 text-slate-950">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed start-3 top-20 z-40 rounded-xl bg-slate-950 p-3 text-white lg:hidden"
        aria-label={t('menu')}
      >
        {open ? <X /> : <Menu />}
      </button>
      <div className="mx-auto flex max-w-[1600px]">
        <aside
          className={`${open ? 'block' : 'hidden'} fixed inset-y-0 start-0 z-30 w-72 overflow-y-auto bg-slate-950 px-4 pb-6 pt-24 text-white lg:sticky lg:top-0 lg:block lg:h-screen`}
        >
          <Link href="/admin" className="mb-5 block px-3 font-display text-xl font-bold">
            {t('console')}
          </Link>
          <nav aria-label={t('navigation')} className="space-y-1">
            {SECTIONS.filter(
              (s) => role === 'superadmin' || !['admins', 'users', 'logs'].includes(s)
            ).map((section) => {
              const href = section === 'dashboard' ? '/admin' : `/admin/${section}`
              const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
              return (
                <Link
                  key={section}
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`block rounded-xl px-3 py-2 text-sm font-semibold ${active ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                >
                  {t(`sections.${section}`)}
                </Link>
              )
            })}
          </nav>
        </aside>
        <main className="min-w-0 flex-1 p-5 pt-16 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
