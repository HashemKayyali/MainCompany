import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import RequestStatusBadge from '../components/requests/RequestStatusBadge'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getPurchaseQuoteByNumber } from '../services/purchase-quotes.service'
import { getRentalRequestByNumber } from '../services/rental-requests.service'
import type { PurchaseQuoteRequestDetails, RentalRequestDetails } from '../types/commerce'
import { cn } from '../utils/cn'
import {
  formatRequestTypeLabel,
  getCommerceErrorMessage,
  isRentalRequestNumber,
} from '../utils/commerce'

export default function MyRequestDetailsPage() {
  const { requestNumber = '' } = useParams<{ requestNumber: string }>()
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
          <div className="rounded-[24px] border border-violet-200/70 bg-white p-6 text-center shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)] sm:p-7">
            <h1 className="font-display text-3xl font-black text-[#1a0b3d]">
              Sign in to View This Request
            </h1>
            <p className="mt-4 text-sm leading-7 text-[#4b3a63]">
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

  const sectionCard =
    'rounded-[22px] border border-violet-200/70 bg-white p-5 shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)] sm:p-6'

  return (
    <section className="site-section">
      <div className="site-container max-w-4xl">
        <Link
          to="/my-requests"
          className="mb-5 inline-flex items-center gap-1.5 rounded-[12px] border border-violet-200/70 bg-white px-3.5 py-2 text-[12.5px] font-bold text-[#4b3a63] transition hover:border-violet-400 hover:text-[#1a0b3d] active:translate-y-[1px]"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to My Requests
        </Link>

        {loading ? (
          <div className={cn(sectionCard, 'text-sm text-[#4b3a63]')}>Loading request details...</div>
        ) : loadError ? (
          <div className="rounded-[22px] border border-rose-200 bg-white p-6 shadow-[0_18px_44px_-34px_rgba(89,23,196,0.30)] sm:p-7">
            <div className="text-[10px] font-mono font-bold uppercase tracking-[0.22em] text-rose-600/80">
              Request Details
            </div>
            <h2 className="mt-3 font-display text-[1.35rem] font-black text-[#1a0b3d]">
              We couldn&apos;t load this request
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#4b3a63]">{loadError}</p>
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
          <div className={sectionCard}>
            <h2 className="font-display text-[1.3rem] font-black text-[#1a0b3d]">
              We could not find this request
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#4b3a63]">
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
            {/* Summary */}
            <div className={cn(sectionCard, 'overflow-hidden !p-0')}>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-violet-100 bg-[linear-gradient(180deg,#faf6ff,#ffffff)] p-5 sm:p-6">
                <div className="min-w-0">
                  <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#7126e3]">
                    {formatRequestTypeLabel(isRental ? 'rental' : 'purchase_quote')}
                  </div>
                  <h1 className="mt-1.5 break-all font-display text-[1.5rem] font-black tracking-[-0.02em] text-[#1a0b3d] sm:text-[1.85rem]">
                    {requestNumber}
                  </h1>
                  <div className="mt-1 text-[15px] font-bold text-[#4b3a63]">{request.customerName}</div>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>

              <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-3 sm:p-6">
                {[
                  { label: 'Created', value: new Date(request.createdAt).toLocaleString() },
                  { label: 'Email', value: request.email },
                  { label: 'Phone', value: request.phone },
                ].map(meta => (
                  <div
                    key={meta.label}
                    className="rounded-[14px] border border-violet-200/60 bg-violet-50/60 px-3.5 py-3"
                  >
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#7126e3]">
                      {meta.label}
                    </div>
                    <div className="mt-1.5 break-words text-[13.5px] font-semibold text-[#211049]">
                      {meta.value}
                    </div>
                  </div>
                ))}
              </div>

              {'grandTotal' in request && (
                <div className="mx-5 mb-5 flex items-center justify-between rounded-[14px] bg-[linear-gradient(135deg,#7c3aed,#9d6bff)] px-4 py-3.5 sm:mx-6 sm:mb-6">
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-white/80">
                    Grand Total
                  </span>
                  <span className="font-display text-[1.15rem] font-black text-white">
                    {request.grandTotal.toFixed(2)} JOD
                  </span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className={sectionCard}>
              <div className="mb-4 flex items-center justify-between border-b border-violet-100 pb-3">
                <h2 className="font-display text-[1.05rem] font-extrabold text-[#1a0b3d]">Items</h2>
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[11px] font-bold text-[#7126e3]">
                  {request.items.length} item{request.items.length === 1 ? '' : 's'}
                </span>
              </div>
              <div className="space-y-2.5">
                {request.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3.5 rounded-[16px] border border-violet-200/60 bg-violet-50/40 px-4 py-3.5"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[12px] font-black text-[#7126e3] ring-1 ring-inset ring-violet-200">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-[15px] font-bold text-[#1a0b3d]">
                        {item.productTitleSnapshot}
                      </div>
                      {'rentalStartDate' in item && (
                        <div className="mt-1 text-[12.5px] font-medium text-[#4b3a63]">
                          {item.rentalStartDate} → {item.rentalEndDate} · {item.rentalDays} day(s)
                        </div>
                      )}
                      {'lineTotal' in item && (
                        <div className="mt-1.5 text-[13px] font-bold text-[#7126e3]">
                          {item.lineTotal.toFixed(2)} JOD
                        </div>
                      )}
                    </div>
                    <span className="shrink-0 self-center rounded-full bg-white px-3 py-1 text-[12px] font-bold text-[#211049] ring-1 ring-inset ring-violet-200">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div className={sectionCard}>
              <h2 className="mb-4 border-b border-violet-100 pb-3 font-display text-[1.05rem] font-extrabold text-[#1a0b3d]">
                Status Timeline
              </h2>
              <ol className="relative ml-1 space-y-5 border-l-2 border-violet-200/70 pl-6">
                {request.history.map((entry, index) => (
                  <li key={entry.id} className="relative">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full ring-4 ring-white',
                        index === request.history.length - 1
                          ? 'bg-[linear-gradient(135deg,#7c3aed,#9d6bff)]'
                          : 'bg-violet-300'
                      )}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <RequestStatusBadge status={entry.newStatus} />
                      <time className="text-[12px] font-semibold text-[#6b5a82]">
                        {new Date(entry.createdAt).toLocaleString()}
                      </time>
                    </div>
                    {entry.note && (
                      <p className="mt-2 text-[13px] leading-6 text-[#4b3a63]">{entry.note}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

