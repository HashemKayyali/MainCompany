import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import RequestStatusBadge from '../components/requests/RequestStatusBadge'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getPurchaseQuoteByNumber } from '../services/purchase-quotes.service'
import { getRentalRequestByNumber } from '../services/rental-requests.service'
import type { PurchaseQuoteRequestDetails, RentalRequestDetails } from '../types/commerce'
import {
  formatRequestTypeLabel,
  getCommerceErrorMessage,
  isRentalRequestNumber,
} from '../utils/commerce'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function MyRequestDetailsPage() {
  const { requestNumber = '' } = useParams<{ requestNumber: string }>()
  const { isDark } = useTheme()
  const { currentUser, isLoggedIn } = useUser()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [request, setRequest] = useState<RentalRequestDetails | PurchaseQuoteRequestDetails | null>(null)
  const isRental = isRentalRequestNumber(requestNumber)

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

  if (!isLoggedIn) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Sign in to View This Request
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              Request details are only visible to the owner account.
            </p>
            <div className="mt-6">
              <Link to={`/login?redirect=${encodeURIComponent(`/my-requests/${requestNumber}`)}`} className="btn-primary !rounded-xl !px-5 !py-3 !text-sm">
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
      <div className="site-container max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="section-label">// Request Details</span>
            <h1 className={cn('section-title !text-left', !isDark && 'text-gray-900')}>
              {requestNumber}
            </h1>
          </div>
          <Link to="/my-requests" className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
            Back to My Requests
          </Link>
        </div>

        {loading ? (
          <div className={cn('rounded-2xl border p-6 text-sm', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
            Loading request details...
          </div>
        ) : loadError ? (
          <div className={cn('rounded-[28px] border p-6 sm:p-7', isDark ? 'border-rose-400/14 bg-[linear-gradient(180deg,rgba(22,10,25,0.84),rgba(10,10,22,0.92))]' : 'border-rose-200 bg-white')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-rose-200/70' : 'text-rose-600/80')}>
              Request Details
            </div>
            <h2 className={cn('mt-3 font-display text-[1.35rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              We couldn&apos;t load this request
            </h2>
            <p className={cn('mt-3 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              {loadError}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/my-requests" className="btn-primary !rounded-xl !px-4 !py-2 !text-sm">
                Back to My Requests
              </Link>
              <Link to="/products" className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
                Browse Products
              </Link>
            </div>
          </div>
        ) : !request ? (
          <div className={cn('rounded-[24px] border p-6 sm:p-7', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h2 className={cn('font-display text-[1.3rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              We could not find this request
            </h2>
            <p className={cn('mt-3 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              It may not belong to this account, or the request number may no longer be available in this environment.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link to="/my-requests" className="btn-primary !rounded-xl !px-4 !py-2 !text-sm">
                Back to My Requests
              </Link>
              <Link to="/products" className="btn-outline !rounded-xl !px-4 !py-2 !text-sm">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className={cn('rounded-[20px] border p-4', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
                    {formatRequestTypeLabel(isRental ? 'rental' : 'purchase_quote')}
                  </div>
                  <div className={cn('mt-2 text-2xl font-display font-black', isDark ? 'text-white' : 'text-gray-900')}>
                    {request.customerName}
                  </div>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>

              <div className={cn('mt-5 grid grid-cols-1 gap-4 md:grid-cols-3', isDark ? 'text-purple-100/72' : 'text-gray-600')}>
                <div>
                  <div className={cn('text-[10px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Created</div>
                  <div className="mt-1">{new Date(request.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className={cn('text-[10px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Email</div>
                  <div className="mt-1">{request.email}</div>
                </div>
                <div>
                  <div className={cn('text-[10px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Phone</div>
                  <div className="mt-1">{request.phone}</div>
                </div>
              </div>

              {'grandTotal' in request && (
                <div className={cn('mt-4 rounded-xl px-4 py-3 text-sm', isDark ? 'bg-[#0d1430]/88 text-cyan-100' : 'bg-violet-50 text-violet-700')}>
                  Grand total: {request.grandTotal.toFixed(2)} JOD
                </div>
              )}
            </div>

            <div className={cn('rounded-[20px] border p-4', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Items</div>
              <div className="mt-4 space-y-3">
                {request.items.map(item => (
                  <div key={item.id} className={cn('rounded-[16px] border px-3.5 py-2.5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                    <div className={cn('font-semibold', isDark ? 'text-white' : 'text-gray-900')}>{item.productTitleSnapshot}</div>
                    <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      Quantity: {item.quantity}
                    </div>
                    {'rentalStartDate' in item && (
                      <div className={cn('mt-1 text-sm', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                        {item.rentalStartDate}
                        {' -> '}
                        {item.rentalEndDate}
                        {' | '}
                        {item.rentalDays} day(s)
                      </div>
                    )}
                    {'lineTotal' in item && (
                      <div className={cn('mt-2 text-sm font-semibold', isDark ? 'text-cyan-200' : 'text-violet-700')}>
                        {item.lineTotal.toFixed(2)} JOD
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className={cn('rounded-[20px] border p-4', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-lg font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Status Timeline</div>
              <div className="mt-4 space-y-3">
                {request.history.map(entry => (
                  <div key={entry.id} className={cn('rounded-[16px] border px-3.5 py-2.5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <RequestStatusBadge status={entry.newStatus} />
                      <div className={cn('text-sm', isDark ? 'text-purple-100/60' : 'text-gray-500')}>
                        {new Date(entry.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {entry.note && (
                      <div className={cn('mt-2 text-sm leading-6', isDark ? 'text-purple-100/72' : 'text-gray-600')}>
                        {entry.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

