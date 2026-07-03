import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  ClipboardList,
  FileText,
  Inbox,
  LockKeyhole,
  RefreshCw,
  ShoppingCart,
} from 'lucide-react'
import RequestStatusBadge from '../components/requests/RequestStatusBadge'
import { RequestProgressStrip, isTerminalStatus } from '../components/requests/RequestJourney'
import { usePurchaseQuote } from '../contexts/PurchaseQuoteContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { listMyPurchaseQuotes } from '../services/purchase-quotes.service'
import { listMyRentalRequests } from '../services/rental-requests.service'
import type { CustomerRequestListItem, RequestType } from '../types/commerce'
import { formatRequestTypeLabel, getCommerceErrorMessage } from '../utils/commerce'
import { cn } from '../utils/cn'

type RequestTab = 'all' | RequestType

const cardShell =
  'rounded-[22px] border border-violet-200/70 bg-white shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)]'

function PageHeading() {
  return (
    <div className="mb-7">
      <div className="mb-3 inline-flex items-center gap-2.5">
        <span className="h-px w-7 bg-gradient-to-r from-transparent to-violet-400" aria-hidden="true" />
        <span className="text-[10.5px] font-bold uppercase tracking-[0.22em] text-violet-600">My Requests</span>
      </div>
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.7rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-ink-900">
        Track every{' '}
        <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent">request</span>
      </h1>
      <p className="mt-3 max-w-2xl text-[14px] leading-[1.7] text-ink-600">
        Follow your rental requests and purchase quote requests, see exactly where each one is, and what happened at
        every step.
      </p>
    </div>
  )
}

function CenteredCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="site-section">
      <div className="site-container">
        <div className={cn(cardShell, 'mx-auto max-w-2xl p-7 text-center sm:p-9')}>{children}</div>
      </div>
    </section>
  )
}

function RequestCard({ request }: { request: CustomerRequestListItem }) {
  const terminal = isTerminalStatus(request.status)

  return (
    <Link
      to={`/my-requests/${request.requestNumber}`}
      className={cn(
        cardShell,
        'group block p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-300/80 hover:shadow-[0_26px_54px_-34px_rgba(89,23,196,0.45)] sm:p-5'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px]',
              request.type === 'rental'
                ? 'bg-violet-50 text-violet-600 ring-1 ring-violet-200/80'
                : 'bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-200/70'
            )}
          >
            {request.type === 'rental' ? <ClipboardList size={17} strokeWidth={2.2} /> : <FileText size={17} strokeWidth={2.2} />}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate font-display text-[15.5px] font-black tracking-[-0.01em] text-ink-900">
                {request.requestNumber}
              </span>
              <span
                className={cn(
                  'rounded-full px-2 py-[2px] text-[9px] font-bold uppercase tracking-[0.12em]',
                  request.type === 'rental' ? 'bg-violet-50 text-violet-700' : 'bg-fuchsia-50 text-fuchsia-700'
                )}
              >
                {formatRequestTypeLabel(request.type)}
              </span>
            </div>
            <div className="mt-0.5 text-[11.5px] font-semibold text-ink-400">
              {new Date(request.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              {' · '}
              {request.itemCount} service{request.itemCount === 1 ? '' : 's'}
            </div>
          </div>
        </div>
        <RequestStatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <RequestProgressStrip type={request.type} status={request.status} />

        <div className="flex items-center justify-between gap-4 sm:justify-end">
          <div className="text-right">
            <div className="text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">Total</div>
            <div className={cn('text-[14px] font-black', terminal ? 'text-ink-400' : 'text-ink-900')}>
              {request.total == null ? 'After review' : `${request.total.toFixed(2)} JOD`}
            </div>
          </div>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-600 transition-transform duration-300 group-hover:translate-x-0.5">
            <ChevronRight size={15} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </Link>
  )
}

export default function MyRequestsPage() {
  usePageMeta({
    title: 'My Requests',
    description: 'Track rental requests and purchase quote requests in one place.',
    noIndex: true,
  })

  const { currentUser, isLoggedIn } = useUser()
  const purchaseQuote = usePurchaseQuote()
  const [tab, setTab] = useState<RequestTab>('all')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [requests, setRequests] = useState<CustomerRequestListItem[]>([])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!currentUser?.id) {
        setLoading(false)
        return
      }

      try {
        setLoadError('')
        const [rentals, purchaseQuotes] = await Promise.all([
          listMyRentalRequests(currentUser.id),
          listMyPurchaseQuotes(currentUser.id),
        ])

        if (mounted) {
          setRequests([...rentals, ...purchaseQuotes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        }
      } catch (error) {
        if (mounted) {
          setRequests([])
          setLoadError(getCommerceErrorMessage(error, 'We could not load your requests right now.'))
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()
    return () => {
      mounted = false
    }
  }, [currentUser?.id])

  const filtered = useMemo(
    () => (tab === 'all' ? requests : requests.filter(request => request.type === tab)),
    [requests, tab]
  )

  const stats = useMemo(() => {
    const active = requests.filter(
      request => !isTerminalStatus(request.status) && request.status !== 'completed' && request.status !== 'won'
    ).length
    const done = requests.filter(request => request.status === 'completed' || request.status === 'won').length
    return { total: requests.length, active, done }
  }, [requests])

  const tabCount = (value: RequestTab) =>
    value === 'all' ? requests.length : requests.filter(request => request.type === value).length

  if (!isLoggedIn) {
    return (
      <CenteredCard>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-violet-50 text-violet-600 ring-1 ring-violet-200/80">
          <LockKeyhole size={20} strokeWidth={2.2} />
        </span>
        <h1 className="mt-4 font-display text-[1.7rem] font-black tracking-[-0.03em] text-ink-900">
          Sign in to view your requests
        </h1>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-[1.7] text-ink-600">
          Rental requests and purchase quote requests are tied to your account, so you can track their progress any
          time.
        </p>
        <div className="mt-6">
          <Link
            to={`/login?redirect=${encodeURIComponent('/my-requests')}`}
            className="btn-primary !rounded-[14px] !px-6 !py-3 !text-[13px]"
          >
            Sign In
          </Link>
        </div>
      </CenteredCard>
    )
  }

  return (
    <section className="site-section">
      <div className="site-container">
        <PageHeading />

        {/* Stats + tabs */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(['all', 'rental', 'purchase_quote'] as RequestTab[]).map(value => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-[12px] font-bold transition-all duration-300',
                  tab === value
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-[0_10px_26px_-12px_rgba(124,58,237,0.55)]'
                    : 'border border-violet-200/70 bg-white text-ink-600 hover:border-violet-300 hover:text-violet-700'
                )}
              >
                {value === 'all' ? 'All' : value === 'rental' ? 'Rentals' : 'Purchase Quotes'}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-[1px] text-[10px] font-black',
                    tab === value ? 'bg-white/20 text-white' : 'bg-violet-50 text-violet-700'
                  )}
                >
                  {tabCount(value)}
                </span>
              </button>
            ))}
          </div>

          {requests.length > 0 && (
            <div className="flex gap-4">
              {[
                { label: 'Active', value: stats.active, tone: 'text-violet-700' },
                { label: 'Completed', value: stats.done, tone: 'text-emerald-600' },
              ].map(stat => (
                <div key={stat.label} className="text-right">
                  <div className={cn('font-display text-[1.35rem] font-black leading-none', stat.tone)}>{stat.value}</div>
                  <div className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.16em] text-ink-400">{stat.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Local draft banner */}
        {purchaseQuote.items.length > 0 && (
          <div className={cn(cardShell, 'mb-6 flex flex-wrap items-center justify-between gap-4 !border-fuchsia-200/80 p-4 sm:p-5')}>
            <div className="flex min-w-0 items-center gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-fuchsia-50 text-fuchsia-600 ring-1 ring-fuchsia-200/70">
                <ShoppingCart size={17} strokeWidth={2.2} />
              </span>
              <div className="min-w-0">
                <div className="text-[13.5px] font-black text-ink-900">You have an unsubmitted purchase quote draft</div>
                <p className="mt-0.5 text-[12px] leading-[1.6] text-ink-500">
                  {purchaseQuote.itemCount} unit(s) across {purchaseQuote.items.length} service(s), saved on this device.
                  Drafts appear here after you submit them.
                </p>
              </div>
            </div>
            <Link to="/purchase-quote" className="btn-outline !rounded-[13px] !px-4 !py-2 !text-[12px]">
              Open Draft
              <ArrowRight size={13} className="ml-1.5 inline" />
            </Link>
          </div>
        )}

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Loading requests">
            {[0, 1, 2].map(index => (
              <div key={index} className={cn(cardShell, 'animate-pulse p-5')}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-[13px] bg-violet-100/70" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-44 rounded-full bg-violet-100/80" />
                    <div className="h-2.5 w-28 rounded-full bg-violet-50" />
                  </div>
                </div>
                <div className="mt-5 h-1.5 w-full rounded-full bg-violet-50" />
              </div>
            ))}
          </div>
        ) : loadError ? (
          <div className={cn(cardShell, '!border-rose-200 p-6 sm:p-7')}>
            <h2 className="font-display text-[1.35rem] font-black text-ink-900">We couldn&apos;t load your requests</h2>
            <p className="mt-2.5 max-w-2xl text-[13px] leading-[1.7] text-ink-600">{loadError}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-primary !rounded-[13px] !px-4 !py-2 !text-[12.5px]"
              >
                <RefreshCw size={13} className="mr-1.5 inline" />
                Refresh
              </button>
              <Link to="/products" className="btn-outline !rounded-[13px] !px-4 !py-2 !text-[12.5px]">
                Browse Services
              </Link>
            </div>
          </div>
        ) : !filtered.length ? (
          <div className={cn(cardShell, 'p-8 text-center sm:p-10')}>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[15px] bg-violet-50 text-violet-500 ring-1 ring-violet-200/80">
              <Inbox size={20} strokeWidth={2} />
            </span>
            <h2 className="mt-4 font-display text-[1.45rem] font-black tracking-[-0.02em] text-ink-900">
              {requests.length ? 'No requests match this filter' : 'You have no requests yet'}
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-[13px] leading-[1.7] text-ink-600">
              {requests.length
                ? 'Try another tab to see the rest of your requests.'
                : 'Browse services, add what your event needs to a draft, and track every update from here.'}
            </p>
            {!requests.length && (
              <div className="mt-6">
                <Link to="/products" className="btn-primary !rounded-[14px] !px-6 !py-3 !text-[13px]">
                  Browse Services
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3.5">
            {filtered.map(request => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
