import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  CheckCheck,
  ClipboardList,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Sparkles,
} from 'lucide-react'
import RequestStatusBadge from '../components/requests/RequestStatusBadge'
import { RequestJourneyTracker } from '../components/requests/RequestJourney'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getRentalRequestByNumber } from '../services/rental-requests.service'
import type { RentalRequestDetails } from '../types/commerce'
import { getCommerceErrorMessage } from '../utils/commerce'
import { cn } from '../utils/cn'

const cardShell =
  'rounded-[22px] border border-violet-200/70 bg-white shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)]'

export default function OrderSummaryPage() {
  const { requestNumber = '' } = useParams<{ requestNumber: string }>()
  const { currentUser, isLoggedIn } = useUser()
  const [request, setRequest] = useState<RentalRequestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  usePageMeta({
    title: requestNumber ? `Request Summary ${requestNumber}` : 'Request Summary',
    description: 'Review the rental request you just submitted.',
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
        const data = await getRentalRequestByNumber(currentUser.id, requestNumber)
        if (mounted) setRequest(data)
      } catch (error) {
        if (mounted) {
          setRequest(null)
          setLoadError(
            getCommerceErrorMessage(error, 'We could not load this rental request right now.')
          )
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [currentUser?.id, requestNumber])

  const stepDates = useMemo(() => {
    const dates: Record<string, string> = {}
    if (request) dates.pending_review = request.createdAt
    return dates
  }, [request])

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
              This request summary belongs to your account.
            </p>
            <div className="mt-6">
              <Link
                to={`/login?redirect=${encodeURIComponent(`/order-summary/${requestNumber}`)}`}
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
        {loading ? (
          <div className={cn(cardShell, 'animate-pulse p-6 sm:p-8')} aria-busy="true">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-100/70" />
            <div className="mx-auto mt-4 h-6 w-64 max-w-full rounded-full bg-violet-100/80" />
            <div className="mx-auto mt-3 h-3.5 w-44 rounded-full bg-violet-50" />
          </div>
        ) : loadError ? (
          <div className={cn(cardShell, '!border-rose-200 p-6 sm:p-7')}>
            <h2 className="font-display text-[1.35rem] font-black text-ink-900">
              We couldn&apos;t load this request
            </h2>
            <p className="mt-2.5 text-[13px] leading-[1.7] text-ink-600">{loadError}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/my-requests" className="btn-primary !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Go to My Requests
              </Link>
              <Link to="/products" className="btn-outline !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Browse Services
              </Link>
            </div>
          </div>
        ) : !request ? (
          <div className={cn(cardShell, 'p-6 sm:p-7')}>
            <h2 className="font-display text-[1.35rem] font-black text-ink-900">
              We could not find this rental request
            </h2>
            <p className="mt-2.5 text-[13px] leading-[1.7] text-ink-600">
              The request may have been removed, or this page may have been opened before the account session finished
              syncing.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/my-requests" className="btn-primary !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Go to My Requests
              </Link>
              <Link to="/products" className="btn-outline !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Browse Services
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* ── Success hero ── */}
            <div className={cn(cardShell, 'relative overflow-hidden p-6 text-center sm:p-9')}>
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_-10%,rgba(16,185,129,0.10),transparent_60%),radial-gradient(ellipse_45%_55%_at_85%_110%,rgba(124,58,237,0.08),transparent_60%)]"
                aria-hidden="true"
              />

              <div className="relative">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-[0_18px_40px_-16px_rgba(16,185,129,0.65)]">
                  <CheckCheck size={28} strokeWidth={2.4} />
                </span>

                <h1 className="mt-5 font-display text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
                  Request{' '}
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                    submitted!
                  </span>
                </h1>
                <p className="mx-auto mt-3 max-w-lg text-[13.5px] leading-[1.7] text-ink-600">
                  Your rental request was saved and is now waiting for Eventies review. We&apos;ll confirm availability,
                  pricing, and delivery details with you.
                </p>

                <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-2.5">
                  <span className="rounded-full border border-violet-200/70 bg-violet-50/80 px-4 py-1.5 font-display text-[14px] font-black tracking-[-0.01em] text-violet-800">
                    {request.requestNumber}
                  </span>
                  <RequestStatusBadge status={request.status} />
                </div>
              </div>
            </div>

            {/* ── What happens next: journey tracker ── */}
            <div className={cn(cardShell, 'p-5 sm:p-6')}>
              <div className="mb-6 flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/70">
                  <Sparkles size={14} strokeWidth={2.2} />
                </span>
                <h2 className="font-display text-[1.1rem] font-black tracking-[-0.02em] text-ink-900">
                  What happens next
                </h2>
              </div>
              <RequestJourneyTracker type="rental" status={request.status} stepDates={stepDates} />
            </div>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
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
                      className="flex items-start gap-3.5 rounded-[16px] border border-violet-100 bg-violet-50/40 px-4 py-3.5"
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[11.5px] font-black text-violet-700 ring-1 ring-inset ring-violet-200">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display text-[14.5px] font-bold text-ink-900">
                          {item.productTitleSnapshot}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11.5px] font-semibold text-ink-500">
                          <CalendarDays size={11} className="text-violet-400" />
                          {item.rentalStartDate} → {item.rentalEndDate}
                          <span className="text-ink-300">·</span>
                          {item.rentalDays} day{item.rentalDays === 1 ? '' : 's'}
                          <span className="text-ink-300">·</span>
                          {item.quantity} × {item.unitPrice} JOD/day
                        </div>
                        <div className="mt-1.5 text-[12.5px] font-black text-violet-700">
                          {item.lineTotal.toFixed(2)} JOD
                        </div>
                      </div>
                      <span className="shrink-0 self-center rounded-full bg-white px-2.5 py-1 text-[11.5px] font-black text-ink-800 ring-1 ring-inset ring-violet-200">
                        ×{item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[15px] bg-[linear-gradient(135deg,#7c3aed,#a855f7,#d946ef)] px-4 py-3.5 shadow-[0_14px_32px_-18px_rgba(124,58,237,0.6)]">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/75">
                    Estimated Total
                  </span>
                  <span className="font-display text-[1.2rem] font-black text-white">
                    {request.grandTotal.toFixed(2)} <span className="text-[0.8rem] font-bold text-white/80">JOD</span>
                  </span>
                </div>
              </div>

              {/* ── Contact + actions ── */}
              <div className="space-y-5">
                <div className={cn(cardShell, 'p-5')}>
                  <h2 className="mb-3.5 font-display text-[1.05rem] font-black tracking-[-0.02em] text-ink-900">
                    Request details
                  </h2>
                  <div className="space-y-2.5">
                    {[
                      { icon: ClipboardList, label: 'Created', value: new Date(request.createdAt).toLocaleString() },
                      { icon: Mail, label: 'Email', value: request.email },
                      { icon: Phone, label: 'Phone', value: request.phone },
                      { icon: MapPin, label: 'City', value: request.city || '—' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-[13px] border border-violet-100 bg-violet-50/40 px-3.5 py-2.5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white text-violet-600 ring-1 ring-violet-200/70">
                          <Icon size={14} strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[9px] font-bold uppercase tracking-[0.16em] text-violet-600/80">
                            {label}
                          </div>
                          <div className="truncate text-[12.5px] font-bold text-ink-800">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cn(cardShell, 'p-5')}>
                  <p className="text-[12px] leading-[1.7] text-ink-500">
                    You can follow every status update for this request — including confirmation, preparation, and
                    completion — from My Requests.
                  </p>
                  <div className="mt-4 flex flex-col gap-2.5">
                    <Link
                      to={`/my-requests/${request.requestNumber}`}
                      className="btn-primary !w-full !rounded-[14px] !px-5 !py-3 !text-[13px]"
                    >
                      Track This Request
                      <ArrowRight size={14} className="ml-1.5 inline" />
                    </Link>
                    <Link to="/products" className="btn-outline !w-full !rounded-[14px] !px-5 !py-3 !text-[13px]">
                      Continue Browsing
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
