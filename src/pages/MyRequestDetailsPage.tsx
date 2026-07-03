import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  History,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from 'lucide-react'
import RequestStatusBadge from '../components/requests/RequestStatusBadge'
import {
  RequestJourneyTracker,
  isTerminalStatus,
} from '../components/requests/RequestJourney'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getPurchaseQuoteByNumber } from '../services/purchase-quotes.service'
import { getRentalRequestByNumber } from '../services/rental-requests.service'
import type { PurchaseQuoteRequestDetails, RentalRequestDetails } from '../types/commerce'
import { cn } from '../utils/cn'
import {
  formatRequestStatusLabel,
  formatRequestTypeLabel,
  getCommerceErrorMessage,
  isRentalRequestNumber,
} from '../utils/commerce'

const cardShell =
  'rounded-[22px] border border-violet-200/70 bg-white shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)]'

function statusDotTone(status: string) {
  if (status === 'pending_review') return 'bg-amber-400'
  if (status === 'confirmed' || status === 'won' || status === 'completed') return 'bg-emerald-500'
  if (status === 'contacted' || status === 'quoted' || status === 'in_preparation') return 'bg-cyan-500'
  return 'bg-rose-500'
}

export default function MyRequestDetailsPage() {
  const { requestNumber = '' } = useParams<{ requestNumber: string }>()
  const { currentUser, isLoggedIn } = useUser()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [request, setRequest] = useState<RentalRequestDetails | PurchaseQuoteRequestDetails | null>(null)
  const isRental = isRentalRequestNumber(requestNumber)
  const requestType = isRental ? ('rental' as const) : ('purchase_quote' as const)

  usePageMeta({
    title: requestNumber ? `Request ${requestNumber}` : 'Request Details',
    description: 'View request details and status history.',
    noIndex: true,
  })

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!currentUser?.id || !requestNumber) {
        setLoading(false)
        return
      }

      try {
        setLoadError('')
        const data = isRental
          ? await getRentalRequestByNumber(currentUser.id, requestNumber)
          : await getPurchaseQuoteByNumber(currentUser.id, requestNumber)

        if (mounted) setRequest(data)
      } catch (error) {
        if (mounted) {
          setRequest(null)
          setLoadError(getCommerceErrorMessage(error, 'We could not load this request right now.'))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [currentUser?.id, isRental, requestNumber])

  // Chronological history (oldest first) + first-reached date for each status,
  // feeding both the journey tracker and the activity feed.
  const sortedHistory = useMemo(
    () => (request ? [...request.history].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : []),
    [request]
  )
  const stepDates = useMemo(() => {
    const dates: Record<string, string> = {}
    if (request) dates.pending_review = request.createdAt
    for (const entry of sortedHistory) {
      if (!dates[entry.newStatus]) dates[entry.newStatus] = entry.createdAt
    }
    return dates
  }, [request, sortedHistory])

  const terminal = request ? isTerminalStatus(request.status) : false
  const terminalEntry = terminal
    ? [...sortedHistory].reverse().find(entry => entry.newStatus === request?.status)
    : undefined

  if (!isLoggedIn) {
    return (
      <section className="site-section">
        <div className="site-container">
          <div className={cn(cardShell, 'mx-auto max-w-2xl p-7 text-center sm:p-9')}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/80">
              <LockKeyhole size={20} strokeWidth={2.2} />
            </span>
            <h1 className="mt-4 font-display text-[1.7rem] font-black tracking-[-0.03em] text-ink-900">
              Sign in to view this request
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-[1.7] text-ink-600">
              Request details are only visible to the owner account.
            </p>
            <div className="mt-6">
              <Link
                to={`/login?redirect=${encodeURIComponent(`/my-requests/${requestNumber}`)}`}
                className="btn-primary !rounded-[14px] !px-6 !py-3 !text-[13px]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="site-section">
      <div className="site-container">
        <Link
          to="/my-requests"
          className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-ink-500 shadow-sm transition-all duration-300 hover:border-violet-300/70 hover:text-violet-700"
        >
          <ArrowLeft size={11} strokeWidth={2.5} />
          My Requests
        </Link>

        {loading ? (
          <div className={cn(cardShell, 'animate-pulse p-6 sm:p-8')} aria-busy="true">
            <div className="h-3 w-32 rounded-full bg-violet-50" />
            <div className="mt-3 h-7 w-72 max-w-full rounded-full bg-violet-100/80" />
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[0, 1, 2, 3].map(index => (
                <div key={index} className="flex flex-col items-center gap-2.5">
                  <div className="h-11 w-11 rounded-full bg-violet-100/70" />
                  <div className="h-2.5 w-20 rounded-full bg-violet-50" />
                </div>
              ))}
            </div>
          </div>
        ) : loadError ? (
          <div className={cn(cardShell, '!border-rose-200 p-6 sm:p-7')}>
            <h2 className="font-display text-[1.35rem] font-black text-ink-900">We couldn&apos;t load this request</h2>
            <p className="mt-2.5 text-[13px] leading-[1.7] text-ink-600">{loadError}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/my-requests" className="btn-primary !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Back to My Requests
              </Link>
              <Link to="/products" className="btn-outline !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Browse Services
              </Link>
            </div>
          </div>
        ) : !request ? (
          <div className={cn(cardShell, 'p-6 sm:p-7')}>
            <h2 className="font-display text-[1.35rem] font-black text-ink-900">We could not find this request</h2>
            <p className="mt-2.5 text-[13px] leading-[1.7] text-ink-600">
              It may not belong to this account, or the request number may no longer be available.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/my-requests" className="btn-primary !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Back to My Requests
              </Link>
              <Link to="/products" className="btn-outline !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Browse Services
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Header: identity + meta + total ── */}
            <div className={cn(cardShell, 'overflow-hidden !p-0')}>
              <div className="border-b border-violet-100 bg-[linear-gradient(135deg,#faf6ff,#ffffff_55%,#fdf4ff)] p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100/80 px-3 py-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-violet-700 ring-1 ring-violet-200/70">
                        {isRental ? <ClipboardList size={10} /> : <FileText size={10} />}
                        {formatRequestTypeLabel(requestType)}
                      </span>
                      <RequestStatusBadge status={request.status} />
                    </div>
                    <h1 className="mt-2.5 break-all font-display text-[1.6rem] font-black leading-[1.05] tracking-[-0.03em] text-ink-900 sm:text-[2rem]">
                      {requestNumber}
                    </h1>
                    <div className="mt-1.5 text-[13px] font-bold text-ink-500">{request.customerName}</div>
                  </div>

                  {'grandTotal' in request && (
                    <div className="rounded-[16px] bg-[linear-gradient(135deg,#7c3aed,#a855f7,#d946ef)] px-5 py-3.5 text-right shadow-[0_16px_36px_-18px_rgba(124,58,237,0.6)]">
                      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/70">Estimated Total</div>
                      <div className="mt-0.5 font-display text-[1.5rem] font-black leading-none text-white">
                        {request.grandTotal.toFixed(2)} <span className="text-[0.9rem] font-bold text-white/80">JOD</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2.5 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
                {[
                  { icon: CalendarDays, label: 'Created', value: new Date(request.createdAt).toLocaleString() },
                  { icon: Mail, label: 'Email', value: request.email },
                  { icon: Phone, label: 'Phone', value: request.phone },
                  { icon: MapPin, label: 'City', value: request.city || '—' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3 rounded-[14px] border border-violet-100 bg-violet-50/40 px-3.5 py-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-violet-600 ring-1 ring-violet-200/70">
                      <Icon size={14} strokeWidth={2.2} />
                    </span>
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-violet-600/80">{label}</div>
                      <div className="truncate text-[12.5px] font-bold text-ink-800">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Journey tracker: where the order is right now ── */}
            <div className={cn(cardShell, 'p-5 sm:p-6')}>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-display text-[1.1rem] font-black tracking-[-0.02em] text-ink-900">Order Journey</h2>
                <span className="text-[11px] font-semibold text-ink-400">
                  Last update{' '}
                  {new Date(sortedHistory[sortedHistory.length - 1]?.createdAt || request.createdAt).toLocaleString()}
                </span>
              </div>

              <RequestJourneyTracker type={requestType} status={request.status} stepDates={stepDates} />

              {terminal && (
                <div className="mt-6 flex items-start gap-3 rounded-[16px] border border-rose-200/80 bg-rose-50/70 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                    <XCircle size={17} strokeWidth={2.2} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-black text-rose-700">
                      This request was {formatRequestStatusLabel(request.status).toLowerCase()}
                      {terminalEntry && (
                        <span className="font-semibold text-rose-500">
                          {' · '}
                          {new Date(terminalEntry.createdAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] leading-[1.6] text-rose-600/90">
                      {terminalEntry?.note || 'You can contact the Eventies team for more details, or start a new request any time.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.44fr)]">
              {/* ── Services ── */}
              <div className={cn(cardShell, 'p-5 sm:p-6')}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-[1.1rem] font-black tracking-[-0.02em] text-ink-900">Services</h2>
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10.5px] font-black text-violet-700">
                    {request.items.length} item{request.items.length === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {request.items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3.5 rounded-[16px] border border-violet-100 bg-violet-50/40 px-4 py-3.5 transition-colors hover:border-violet-200"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11.5px] font-black text-violet-700 ring-1 ring-inset ring-violet-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[14.5px] font-bold text-ink-900">{item.productTitleSnapshot}</div>
                        {'rentalStartDate' in item && (
                          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] font-semibold text-ink-500">
                            <CalendarDays size={11} className="text-violet-400" />
                            {item.rentalStartDate} → {item.rentalEndDate}
                            <span className="text-ink-300">·</span>
                            {item.rentalDays} day{item.rentalDays === 1 ? '' : 's'}
                          </div>
                        )}
                        {'lineTotal' in item && (
                          <div className="mt-1.5 text-[12.5px] font-black text-violet-700">{item.lineTotal.toFixed(2)} JOD</div>
                        )}
                      </div>
                      <span className="shrink-0 self-center rounded-full bg-white px-2.5 py-1 text-[11.5px] font-black text-ink-800 ring-1 ring-inset ring-violet-200">
                        ×{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Activity feed: everything that happened ── */}
              <div className={cn(cardShell, 'h-fit p-5 sm:p-6')}>
                <div className="mb-5 flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/70">
                    <History size={14} strokeWidth={2.2} />
                  </span>
                  <h2 className="font-display text-[1.1rem] font-black tracking-[-0.02em] text-ink-900">Activity</h2>
                </div>

                {sortedHistory.length === 0 ? (
                  <p className="text-[12.5px] leading-[1.7] text-ink-500">
                    No status changes yet — your request is waiting for team review.
                  </p>
                ) : (
                  <ol className="relative space-y-5 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-[2px] before:rounded-full before:bg-gradient-to-b before:from-violet-200 before:via-violet-100 before:to-transparent">
                    {[...sortedHistory].reverse().map((entry, index) => (
                      <li key={entry.id} className="relative pl-7">
                        <span
                          aria-hidden="true"
                          className={cn(
                            'absolute left-0 top-1 h-4 w-4 rounded-full ring-4 ring-white',
                            statusDotTone(entry.newStatus),
                            index === 0 && 'shadow-[0_0_0_4px_rgba(124,58,237,0.12)]'
                          )}
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <RequestStatusBadge status={entry.newStatus} />
                          {index === 0 && (
                            <span className="rounded-full bg-violet-100 px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700">
                              Latest
                            </span>
                          )}
                        </div>
                        <time className="mt-1.5 block text-[11px] font-semibold text-ink-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </time>
                        {entry.note && (
                          <p className="mt-2 rounded-[12px] border border-violet-100 bg-violet-50/50 px-3 py-2 text-[12px] leading-[1.6] text-ink-600">
                            {entry.note}
                          </p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
