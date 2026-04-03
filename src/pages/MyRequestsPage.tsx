import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import RequestListCard from '../components/requests/RequestListCard'
import { usePurchaseQuote } from '../contexts/PurchaseQuoteContext'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { listMyPurchaseQuotes } from '../services/purchase-quotes.service'
import { listMyRentalRequests } from '../services/rental-requests.service'
import type { CustomerRequestListItem, RequestType } from '../types/commerce'
import { getCommerceErrorMessage } from '../utils/commerce'

type RequestTab = 'all' | RequestType

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function MyRequestsPage() {
  usePageMeta({
    title: 'My Requests',
    description: 'Track rental requests and purchase quotes in one place.',
    noIndex: true,
  })

  const { isDark } = useTheme()
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

  if (!isLoggedIn) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Sign in to View Your Requests
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Rental requests and purchase quotes are tied to your account.
            </p>
            <div className="mt-6">
              <Link to={`/login?redirect=${encodeURIComponent('/my-requests')}`} className="btn-primary !rounded-xl !px-5 !py-3 !text-sm">
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
        <div className="mb-5">
          <span className="section-label">// My Requests</span>
          <h1 className={cn('section-title !text-left', !isDark && 'text-gray-900')}>Track Every Request</h1>
          <p className={cn('mt-2.5 max-w-2xl text-[0.96rem] leading-6.5', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
            Review rental requests, purchase quotes, and follow their latest status updates from one place.
          </p>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {(['all', 'rental', 'purchase_quote'] as RequestTab[]).map(value => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'shrink-0 min-h-[42px] rounded-[14px] px-4 py-2 text-[0.92rem] font-semibold transition-colors',
                tab === value
                  ? isDark
                    ? 'bg-cyan-500/12 text-cyan-200'
                    : 'bg-violet-100 text-violet-700'
                  : isDark
                    ? 'bg-white/[0.04] text-purple-100/72'
                    : 'bg-gray-100 text-gray-600'
              )}
            >
              {value === 'all' ? 'All' : value === 'rental' ? 'Rental Requests' : 'Purchase Quotes'}
            </button>
          ))}
        </div>

        {purchaseQuote.items.length > 0 && (
          <div className={cn('mb-5 rounded-[22px] border p-4.5', isDark ? 'border-fuchsia-400/14 bg-[linear-gradient(180deg,rgba(34,12,45,0.74),rgba(10,10,22,0.94))]' : 'border-fuchsia-200 bg-white shadow-[0_18px_42px_-34px_rgba(168,85,247,0.16)]')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-fuchsia-100/72' : 'text-fuchsia-700/80')}>
              Local Draft
            </div>
            <h2 className={cn('mt-3 font-display text-[1.2rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Your purchase quote draft is saved on this device
            </h2>
            <p className={cn('mt-2.5 text-[0.95rem] leading-6.5', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Drafts do not appear in My Requests until you submit them. You currently have {purchaseQuote.itemCount} unit(s) saved across {purchaseQuote.items.length} product(s).
            </p>
            <div className="mt-4">
              <Link to="/purchase-quote" className="btn-outline !rounded-[14px] !px-4 !py-2 !text-[0.92rem]">
                Open Quote Draft
              </Link>
            </div>
          </div>
        )}

        {loading ? (
          <div className={cn('rounded-[22px] border p-6', isDark ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,29,0.9),rgba(7,10,21,0.94))] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.2em]', isDark ? 'text-cyan-100/62' : 'text-violet-600/74')}>
              Request Center
            </div>
            <div className={cn('mt-3 text-[0.98rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>
              Loading your requests...
            </div>
            <div className={cn('mt-2 text-sm', isDark ? 'text-purple-100/60' : 'text-gray-500')}>
              Pulling your latest rental and quote activity.
            </div>
          </div>
        ) : loadError ? (
          <div className={cn('rounded-[28px] border p-6 sm:p-7', isDark ? 'border-rose-400/14 bg-[linear-gradient(180deg,rgba(22,10,25,0.84),rgba(10,10,22,0.92))]' : 'border-rose-200 bg-white')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-rose-200/70' : 'text-rose-600/80')}>
              Request Center
            </div>
            <h2 className={cn('mt-3 font-display text-[1.45rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              We couldn&apos;t load your requests
            </h2>
            <p className={cn('mt-3 max-w-2xl text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              {loadError}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button type="button" onClick={() => window.location.reload()} className="btn-primary !rounded-xl !px-4 !py-2 !text-[0.84rem]">
                Refresh
              </button>
              <Link to="/products" className="btn-outline !rounded-xl !px-4 !py-2 !text-[0.84rem]">
                Browse Products
              </Link>
            </div>
          </div>
        ) : !filtered.length ? (
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-[linear-gradient(180deg,rgba(10,13,29,0.92),rgba(7,10,21,0.96))]' : 'border-gray-200 bg-white')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-cyan-100/66' : 'text-violet-600/80')}>
              {requests.length ? 'Filter Result' : 'Ready When You Are'}
            </div>
            <h2 className={cn('mt-3 font-display text-[1.45rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              {requests.length ? 'No requests match this filter' : 'You have no requests yet'}
            </h2>
            <p className={cn('mt-3 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              {requests.length
                ? 'Try another tab to review the rest of your rental requests and purchase quotes.'
                : 'Add products to the rental cart or build a purchase quote draft, then track every update from here.'}
            </p>
            <div className="mt-5">
              <Link to="/products" className="btn-outline !rounded-xl !px-4 !py-2 !text-[0.84rem]">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(request => (
              <RequestListCard key={request.id} request={request} to={`/my-requests/${request.requestNumber}`} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
