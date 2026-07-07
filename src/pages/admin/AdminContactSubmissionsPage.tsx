import { useEffect, useMemo, useState } from 'react'
import { Mail, MapPin, Phone, RefreshCw, Search, UserRound } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useI18n } from '../../contexts/LanguageContext'
import { useToast } from '../../contexts/ToastContext'
import * as contactApi from '../../services/contact.service'
import { cn } from '../../utils/cn'

function formatDate(value: string, locale: 'en' | 'ar') {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-JO' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export default function AdminContactSubmissionsPage() {
  const { locale, translateText } = useI18n()
  const { toast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedId = searchParams.get('submission')
  const [rows, setRows] = useState<contactApi.ContactSubmission[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      setRows(await contactApi.getAll())
    } catch (error) {
      console.error('[AdminContactSubmissionsPage] load failed:', error)
      toast('Could not load contact inquiries.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return rows
    return rows.filter(row => [
      row.name,
      row.email,
      row.phone,
      row.productSlug,
      row.city,
      row.message,
    ].some(value => (value || '').toLowerCase().includes(query)))
  }, [rows, search])

  const selected = rows.find(row => row.id === selectedId) ?? null

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[1.55rem] font-black tracking-[-0.035em] text-[var(--admin-text)]">
            {translateText('Contact Inquiries')}
          </h1>
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
            {translateText('Review customer contact form submissions and open the exact inquiry from a notification.')}
          </p>
        </div>
        <button type="button" onClick={() => void load()} className="admin-icon-btn" aria-label={translateText('Refresh')}>
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="grid min-h-[620px] flex-1 overflow-hidden rounded-[22px] border border-[var(--admin-border)] bg-[var(--admin-surface)] md:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-[var(--admin-border)] md:border-b-0 md:border-e">
          <div className="border-b border-[var(--admin-border)] p-3">
            <div className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3">
              <Search className="h-4 w-4 text-[var(--admin-text-muted)]" />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder={translateText('Search inquiries...')}
                className="min-w-0 flex-1 bg-transparent text-[12px] text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-muted)]"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-3" aria-busy="true">
                {[0, 1, 2, 3].map(index => <div key={index} className="h-20 animate-pulse rounded-2xl bg-[var(--admin-surface-2)]" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-5 py-12 text-center text-[12px] text-[var(--admin-text-muted)]">
                {translateText('No contact inquiries found')}
              </div>
            ) : filtered.map(row => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSearchParams({ submission: row.id })}
                className={cn(
                  'w-full border-b border-[var(--admin-border)] px-4 py-3.5 text-start transition',
                  selectedId === row.id
                    ? 'bg-[var(--admin-accent-soft)]'
                    : 'hover:bg-[var(--admin-surface-2)]'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[12.5px] font-extrabold text-[var(--admin-text)]" data-i18n-skip dir="auto">{row.name}</span>
                  <span className="shrink-0 text-[9px] font-semibold text-[var(--admin-text-muted)]">{formatDate(row.createdAt, locale)}</span>
                </div>
                <div className="mt-1 truncate text-[10.5px] text-[var(--admin-text-muted)]" data-i18n-skip dir="auto">{row.email}</div>
                <div className="mt-1.5 line-clamp-1 text-[10.5px] text-[var(--admin-text-muted)]" data-i18n-skip dir="auto">{row.message || row.productSlug || translateText('General inquiry')}</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-h-0 overflow-y-auto bg-[var(--admin-surface-2)] p-4 sm:p-6">
          {!selected ? (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--admin-accent-soft)] text-[var(--admin-accent)]">
                <Mail className="h-7 w-7" />
              </span>
              <h2 className="mt-4 text-[15px] font-extrabold text-[var(--admin-text)]">{translateText('Select an inquiry')}</h2>
              <p className="mt-2 max-w-md text-[12px] leading-5 text-[var(--admin-text-muted)]">{translateText('Choose a contact submission from the list to review its details.')}</p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-4">
              <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-accent)]">{translateText('Contact Inquiry')}</div>
                    <h2 className="mt-1.5 text-[20px] font-black text-[var(--admin-text)]" data-i18n-skip dir="auto">{selected.name}</h2>
                    <p className="mt-1 text-[10.5px] text-[var(--admin-text-muted)]">{formatDate(selected.createdAt, locale)}</p>
                  </div>
                  <span className="rounded-full bg-[var(--admin-accent-soft)] px-3 py-1 text-[10px] font-extrabold text-[var(--admin-accent)]" data-i18n-skip>{selected.status}</span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Phone', value: selected.phone || '—' },
                  { icon: MapPin, label: 'Location', value: [selected.city, selected.address].filter(Boolean).join(', ') || '—' },
                  { icon: UserRound, label: 'Related service', value: selected.productSlug || 'General inquiry' },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-[18px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--admin-text-muted)]">
                        <Icon className="h-3.5 w-3.5 text-[var(--admin-accent)]" />
                        {translateText(item.label)}
                      </div>
                      <div className="mt-2 break-words text-[12px] font-bold text-[var(--admin-text)]" data-i18n-skip dir="auto">{item.value}</div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-[20px] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4 sm:p-5">
                <h3 className="text-[11px] font-extrabold text-[var(--admin-text)]">{translateText('Message')}</h3>
                <p className="mt-3 whitespace-pre-wrap break-words text-[13px] leading-6 text-[var(--admin-text-muted)]" data-i18n-skip dir="auto">{selected.message || translateText('No message provided.')}</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
