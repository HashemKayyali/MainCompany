import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import RequestStatusBadge from '../components/requests/RequestStatusBadge'
import { useTheme } from '../contexts/ThemeContext'
import { useUser } from '../contexts/UserContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { getRentalRequestByNumber } from '../services/rental-requests.service'
import type { RentalRequestDetails } from '../types/commerce'
import { getCommerceErrorMessage } from '../utils/commerce'
import { cn } from '../utils/cn'

export default function OrderSummaryPage() {
  const { requestNumber = '' } = useParams<{ requestNumber: string }>()
  const { isDark } = useTheme()
  const { currentUser, isLoggedIn } = useUser()
  const [request, setRequest] = useState<RentalRequestDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  usePageMeta({
    title: requestNumber ? `Order Summary ${requestNumber}` : 'Order Summary',
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

  if (!isLoggedIn) {
    return (
      <section className="site-section">
        <div className="site-container max-w-3xl">
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-center', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h1 className={cn('font-display text-3xl font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Sign in to View This Request
            </h1>
            <p className={cn('mt-4 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              This order summary belongs to your account.
            </p>
            <div className="mt-6">
              <Link to={`/login?redirect=${encodeURIComponent(`/order-summary/${requestNumber}`)}`} className="btn-primary !rounded-xl !px-5 !py-3 !text-sm">
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
        <div className="mb-6">
          <span className="section-label">// Order Summary</span>
          <h1 className={cn('section-title !text-left', !isDark && 'text-gray-900')}>Rental Request Submitted</h1>
          <p className={cn('mt-3 text-[0.96rem] leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
            Your request was saved successfully and is waiting for admin review.
          </p>
        </div>

        {loading ? (
          <div className={cn('rounded-[24px] border p-6 sm:p-7 text-[0.95rem]', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
            Loading order summary...
          </div>
        ) : loadError ? (
          <div className={cn('rounded-[28px] border p-6 sm:p-7', isDark ? 'border-rose-400/14 bg-[linear-gradient(180deg,rgba(22,10,25,0.84),rgba(10,10,22,0.92))]' : 'border-rose-200 bg-white')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-rose-200/70' : 'text-rose-600/80')}>
              Order Summary
            </div>
            <h2 className={cn('mt-3 font-display text-[1.35rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              We couldn&apos;t load this request
            </h2>
            <p className={cn('mt-3 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              {loadError}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/my-requests" className="btn-primary !w-full !rounded-xl !px-4 !py-2 !text-sm sm:!w-auto">
                Go to My Requests
              </Link>
              <Link to="/products" className="btn-outline !w-full !rounded-xl !px-4 !py-2 !text-sm sm:!w-auto">
                Browse Products
              </Link>
            </div>
          </div>
        ) : !request ? (
          <div className={cn('rounded-[24px] border p-6 sm:p-7', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
            <h2 className={cn('font-display text-[1.3rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              We could not find this rental request
            </h2>
            <p className={cn('mt-3 text-sm leading-7', isDark ? 'text-purple-100/68' : 'text-gray-500')}>
              The request may have been removed, or this page may have been opened before the account session finished syncing.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/my-requests" className="btn-primary !w-full !rounded-xl !px-4 !py-2 !text-sm sm:!w-auto">
                Go to My Requests
              </Link>
              <Link to="/products" className="btn-outline !w-full !rounded-xl !px-4 !py-2 !text-sm sm:!w-auto">
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={cn('text-[12px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
                    {request.requestNumber}
                  </div>
                  <div className={cn('mt-2 text-[1.9rem] font-display font-black leading-tight sm:text-[2rem]', isDark ? 'text-white' : 'text-gray-900')}>
                    {request.customerName}
                  </div>
                </div>
                <RequestStatusBadge status={request.status} />
              </div>

              <div className={cn('mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3', isDark ? 'text-purple-100/72' : 'text-gray-600')}>
                <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Created</div>
                  <div className="mt-1.5 text-[0.95rem] leading-6">{new Date(request.createdAt).toLocaleString()}</div>
                </div>
                <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Email</div>
                  <div className="mt-1.5 break-words text-[0.95rem] leading-6">{request.email}</div>
                </div>
                <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Phone</div>
                  <div className="mt-1.5 text-[0.95rem] leading-6">{request.phone}</div>
                </div>
              </div>
            </div>

            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-[1.08rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Items</div>
              <div className="mt-4 space-y-3.5">
                {request.items.map(item => (
                  <div key={item.id} className={cn('rounded-[18px] border px-4.5 py-4 sm:px-5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                    <div className={cn('text-[1rem] font-semibold leading-6', isDark ? 'text-white' : 'text-gray-900')}>{item.productTitleSnapshot}</div>
                    <div className={cn('mt-1.5 text-[0.95rem]', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      {item.quantity} x {item.unitPrice} JOD/day
                    </div>
                    <div className={cn('mt-1.5 text-[0.95rem] leading-6', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                      {item.rentalStartDate}
                      {' -> '}
                      {item.rentalEndDate}
                      {' | '}
                      {item.rentalDays} day(s)
                    </div>
                    <div className={cn('mt-2.5 text-[0.95rem] font-semibold', isDark ? 'text-cyan-200' : 'text-violet-700')}>
                      {item.lineTotal.toFixed(2)} JOD
                    </div>
                  </div>
                ))}
              </div>

              <div className={cn('mt-4 rounded-[18px] px-4.5 py-4 text-[0.95rem] font-semibold', isDark ? 'bg-[#0d1430]/88 text-cyan-100' : 'bg-violet-50 text-violet-700')}>
                Grand total: {request.grandTotal.toFixed(2)} JOD
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/my-requests" className="btn-primary !w-full !rounded-xl !px-5 !py-3 !text-sm sm:!w-auto">
                Go to My Requests
              </Link>
              <Link to="/products" className="btn-outline !w-full !rounded-xl !px-5 !py-3 !text-sm sm:!w-auto">
                Continue Browsing
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

