import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import RequestStatusBadge from '../../components/requests/RequestStatusBadge'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { useDialog } from '../../contexts/DialogContext'
import { getRentalAvailability } from '../../services/availability.service'
import {
  approveRentalRequest,
  getAdminPurchaseQuoteDetails,
  getAdminRentalRequestDetails,
  updateRequestStatus,
} from '../../services/admin-requests.service'
import { updatePurchaseQuoteAdminNotes } from '../../services/purchase-quotes.service'
import { updateRentalAdminNotes } from '../../services/rental-requests.service'
import type {
  PurchaseQuoteRequestDetails,
  RentalAvailability,
  RentalRequestDetails,
  RequestType,
} from '../../types/commerce'
import { formatRequestTypeLabel, getCommerceErrorMessage } from '../../utils/commerce'
import { cn } from '../../utils/cn'

const RENTAL_ACTIONS: Record<string, Array<{ label: string; status: string; tone?: 'primary' | 'danger' | 'neutral' }>> = {
  pending_review: [
    { label: 'Approve', status: 'confirmed', tone: 'primary' },
    { label: 'Reject', status: 'rejected', tone: 'danger' },
  ],
  confirmed: [
    { label: 'Move to Preparation', status: 'in_preparation', tone: 'primary' },
    { label: 'Cancel', status: 'cancelled', tone: 'danger' },
  ],
  in_preparation: [
    { label: 'Complete', status: 'completed', tone: 'primary' },
    { label: 'Cancel', status: 'cancelled', tone: 'danger' },
  ],
}

const PURCHASE_ACTIONS: Record<string, Array<{ label: string; status: string; tone?: 'primary' | 'danger' | 'neutral' }>> = {
  pending_review: [
    { label: 'Mark Contacted', status: 'contacted', tone: 'primary' },
    { label: 'Reject', status: 'rejected', tone: 'danger' },
  ],
  contacted: [
    { label: 'Mark Quoted', status: 'quoted', tone: 'primary' },
    { label: 'Reject', status: 'rejected', tone: 'danger' },
  ],
  quoted: [
    { label: 'Mark Won', status: 'won', tone: 'primary' },
    { label: 'Mark Lost', status: 'lost', tone: 'danger' },
  ],
}

export default function AdminRequestDetailsPage() {
  const { type, id } = useParams<{ type: RequestType; id: string }>()
  const { isDark } = useTheme()
  const { toast } = useToast()
  const dialog = useDialog()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [request, setRequest] = useState<RentalRequestDetails | PurchaseQuoteRequestDetails | null>(null)
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, RentalAvailability | null>>({})
  const [statusNote, setStatusNote] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)

  const isRental = type === 'rental'
  const isPurchaseQuote = type === 'purchase_quote'

  const load = async () => {
    if (!id || (!isRental && !isPurchaseQuote)) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      setLoadError('')
      const nextRequest = isRental
        ? await getAdminRentalRequestDetails(id)
        : await getAdminPurchaseQuoteDetails(id)

      setRequest(nextRequest)
      setInternalNotes(nextRequest?.adminInternalNotes ?? '')
    } catch (error) {
      const message = getCommerceErrorMessage(error, 'Could not load request details.')
      toast(message, 'error')
      setLoadError(message)
      setRequest(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [id, isPurchaseQuote, isRental])

  useEffect(() => {
    let mounted = true

    async function loadAvailability() {
      if (!isRental || !request) {
        setAvailabilityMap({})
        return
      }

      const rentalRequest = request as RentalRequestDetails
      const entries = await Promise.all(
        rentalRequest.items.map(async item => {
          try {
            const availability = await getRentalAvailability(item.productId, item.rentalStartDate, item.rentalEndDate)
            return [item.id, availability] as const
          } catch {
            return [item.id, null] as const
          }
        })
      )

      if (mounted) {
        setAvailabilityMap(Object.fromEntries(entries))
      }
    }

    void loadAvailability()
    return () => {
      mounted = false
    }
  }, [isRental, request])

  const pageTitle = useMemo(() => {
    if (!type) return 'Request Details'
    return request?.requestNumber || `${formatRequestTypeLabel(type)} Details`
  }, [request?.requestNumber, type])

  const availableActions = useMemo(() => {
    if (!request) return []
    return isRental ? RENTAL_ACTIONS[request.status] || [] : PURCHASE_ACTIONS[request.status] || []
  }, [isRental, request])

  const isDestructiveStatus = (nextStatus: string) =>
    ['rejected', 'cancelled', 'lost'].includes(nextStatus)

  const handleStatusChange = async (nextStatus: string, fallbackNote: string, label: string) => {
    if (!request || !type) return

    if (isDestructiveStatus(nextStatus)) {
      const ok = await dialog.confirm({
        title: `${label}?`,
        message: `This will permanently set ${request.requestNumber} to ${nextStatus.replace(/_/g, ' ')}.`,
        confirmLabel: label,
        variant: 'danger',
      })
      if (!ok) return
    }

    setSubmittingAction(true)
    try {
      const note = statusNote.trim() || fallbackNote

      if (isRental && nextStatus === 'confirmed') {
        await approveRentalRequest(request.id, note)
      } else {
        await updateRequestStatus(type, request.id, nextStatus, note)
      }

      toast(`Updated ${request.requestNumber} to ${nextStatus.replace(/_/g, ' ')}.`, 'success')
      setStatusNote('')
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not update request status.'), 'error')
    } finally {
      setSubmittingAction(false)
    }
  }

  const handleSaveInternalNotes = async () => {
    if (!request) return

    setSavingNotes(true)
    try {
      if (isRental) {
        await updateRentalAdminNotes(request.id, internalNotes)
      } else {
        await updatePurchaseQuoteAdminNotes(request.id, internalNotes)
      }

      toast('Internal notes saved.', 'success')
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not save internal notes.'), 'error')
    } finally {
      setSavingNotes(false)
    }
  }

  if (!isRental && !isPurchaseQuote) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Request Details" />
        <div className={cn('rounded-2xl border p-6 text-sm', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
          Unknown request type.
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-5">
      <AdminPageHeader
        title={pageTitle}
        actions={
          <>
            <Link to="/admin/requests">
              <AdminActionButton>Back to Requests</AdminActionButton>
            </Link>
            <AdminActionButton tone="primary" onClick={() => void load()}>
              Refresh
            </AdminActionButton>
          </>
        }
      />

      {loading ? (
        <div className={cn('rounded-[24px] border p-6 sm:p-7 text-[0.95rem]', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
          Loading request details...
        </div>
      ) : loadError ? (
        <div className={cn('rounded-[26px] border p-6 text-sm', isDark ? 'border-rose-400/14 bg-[linear-gradient(180deg,rgba(22,10,25,0.84),rgba(10,10,22,0.92))] text-purple-100/72' : 'border-rose-200 bg-white text-gray-600')}>
          <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-rose-200/70' : 'text-rose-600/80')}>
            Request Details
          </div>
          <div className={cn('mt-3 font-sans text-[1.25rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
            We couldn&apos;t load this request
          </div>
          <p className="mt-3 max-w-2xl leading-7">{loadError}</p>
        </div>
      ) : !request ? (
        <div className={cn('rounded-[24px] border p-6 sm:p-7 text-[0.95rem]', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
          We could not find this request.
        </div>
      ) : (
        <div className="grid min-h-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-6">
            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className={cn('text-[12px] font-mono uppercase tracking-[0.18em]', isDark ? 'text-purple-100/50' : 'text-gray-400')}>
                    {formatRequestTypeLabel(type as RequestType)}
                  </div>
                  <div className={cn('mt-2 text-[1.85rem] font-sans font-black leading-tight sm:text-[2rem]', isDark ? 'text-white' : 'text-gray-900')}>
                    {request.requestNumber}
                  </div>
                  <div className={cn('mt-2 break-words text-[0.95rem] leading-7', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                    {request.customerName} | {request.email}
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
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Phone</div>
                  <div className="mt-1.5 text-[0.95rem] leading-6">{request.phone || '-'}</div>
                </div>
                <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Company</div>
                  <div className="mt-1.5 text-[0.95rem] leading-6">{request.companyName || '-'}</div>
                </div>
                <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>City</div>
                  <div className="mt-1.5 text-[0.95rem] leading-6">{request.city || '-'}</div>
                </div>
                <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                  <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Address</div>
                  <div className="mt-1.5 text-[0.95rem] leading-6">{request.address || '-'}</div>
                </div>
                {isRental && (
                  <div className={cn('rounded-[18px] px-4 py-3', isDark ? 'bg-white/[0.03] ring-1 ring-inset ring-white/[0.05]' : 'bg-gray-50 ring-1 ring-inset ring-gray-100')}>
                    <div className={cn('text-[11px] font-mono uppercase tracking-[0.16em]', isDark ? 'text-purple-100/42' : 'text-gray-400')}>Event</div>
                    <div className="mt-1.5 text-[0.95rem] leading-6">{(request as RentalRequestDetails).eventName || '-'}</div>
                  </div>
                )}
              </div>

              {request.notes ? (
                <div className={cn('mt-4 rounded-[18px] px-4 py-3.5 text-[0.95rem] leading-7', isDark ? 'bg-white/[0.03] text-purple-100/72' : 'bg-gray-50 text-gray-600')}>
                  <strong className={isDark ? 'text-white' : 'text-gray-900'}>Customer note:</strong> {request.notes}
                </div>
              ) : null}

              {'grandTotal' in request && (
                <div className={cn('mt-4 rounded-[18px] px-4 py-3.5 text-[0.95rem] font-semibold', isDark ? 'bg-[#0d1430]/88 text-cyan-100' : 'bg-violet-50 text-violet-700')}>
                  Grand total: {request.grandTotal.toFixed(2)} JOD
                </div>
              )}
            </div>

            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-[1.08rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Items</div>
              <div className="mt-4 space-y-3.5">
                {request.items.map(item => {
                  const availability = isRental ? availabilityMap[item.id] : null
                  return (
                    <div key={item.id} className={cn('rounded-[18px] border px-4.5 py-4 sm:px-5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                      <div className={cn('text-[1rem] font-semibold leading-6', isDark ? 'text-white' : 'text-gray-900')}>
                        {item.productTitleSnapshot}
                      </div>
                      <div className={cn('mt-1.5 text-[0.95rem]', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                        Quantity: {item.quantity}
                      </div>

                      {'rentalStartDate' in item && (
                        <>
                          <div className={cn('mt-1.5 text-[0.95rem] leading-6', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                            {item.rentalStartDate}
                            {' -> '}
                            {item.rentalEndDate}
                            {' | '}
                            {item.rentalDays} day(s)
                          </div>
                          <div className={cn('mt-1.5 text-[0.95rem] leading-6', isDark ? 'text-purple-100/66' : 'text-gray-500')}>
                            Unit price: {item.unitPrice.toFixed(2)} JOD/day
                          </div>
                          <div className={cn('mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2', isDark ? 'text-purple-100/72' : 'text-gray-600')}>
                            <span className={cn('rounded-[16px] px-3.5 py-3 text-[0.95rem] font-semibold', isDark ? 'bg-[#0d1430]/88 text-cyan-200' : 'bg-violet-50 text-violet-700')}>
                              Line total: {item.lineTotal.toFixed(2)} JOD
                            </span>
                            {availability ? (
                              <span className={cn('rounded-[16px] px-3.5 py-3 text-[0.95rem]', availability.availableQuantity >= item.quantity ? (isDark ? 'bg-emerald-400/10 text-emerald-300' : 'bg-emerald-50 text-emerald-700') : (isDark ? 'bg-rose-400/10 text-rose-300' : 'bg-rose-50 text-rose-700'))}>
                                Available now: {availability.availableQuantity}
                              </span>
                            ) : (
                              <span className={cn('rounded-[16px] px-3.5 py-3 text-[0.95rem]', isDark ? 'bg-white/[0.03] text-purple-100/55' : 'bg-gray-100 text-gray-500')}>
                                Availability unavailable
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-[1.08rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Status Timeline</div>
              <div className="mt-4 space-y-3.5">
                {request.history.length ? (
                  request.history.map(entry => (
                    <div key={entry.id} className={cn('rounded-[18px] border px-4.5 py-4 sm:px-5', isDark ? 'border-white/8 bg-white/[0.02]' : 'border-gray-100 bg-gray-50')}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <RequestStatusBadge status={entry.newStatus} />
                        <div className={cn('text-[0.95rem]', isDark ? 'text-purple-100/60' : 'text-gray-500')}>
                          {new Date(entry.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {entry.note ? (
                        <div className={cn('mt-2.5 text-[0.95rem] leading-7', isDark ? 'text-purple-100/72' : 'text-gray-600')}>
                          {entry.note}
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className={cn('rounded-xl border px-4 py-3 text-sm', isDark ? 'border-white/8 bg-white/[0.02] text-purple-100/60' : 'border-gray-100 bg-gray-50 text-gray-500')}>
                    No timeline entries yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="order-first space-y-5 xl:order-none xl:sticky xl:top-28 xl:self-start">
            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-[1.08rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Actions</div>
              <div className="mt-4 space-y-3">
                <div>
                  <label className={cn('mb-1.5 block text-[13px] font-medium sm:text-[13.5px]', isDark ? 'text-purple-200/80' : 'text-gray-600')}>
                    Status Note
                  </label>
                  <textarea
                    rows={4}
                    className="form-field resize-none"
                    value={statusNote}
                    onChange={event => setStatusNote(event.target.value)}
                    placeholder="Optional note for the status timeline..."
                  />
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                  {availableActions.length ? (
                    availableActions.map(action => (
                      <AdminActionButton
                        key={action.label}
                        tone={action.tone || 'neutral'}
                        disabled={submittingAction}
                        onClick={() => void handleStatusChange(action.status, `${action.label} from admin request details`, action.label)}
                      >
                        {submittingAction ? 'Working...' : action.label}
                      </AdminActionButton>
                    ))
                  ) : (
                    <div className={cn('rounded-xl px-3 py-2 text-sm', isDark ? 'bg-white/[0.03] text-purple-100/60' : 'bg-gray-50 text-gray-500')}>
                      No direct actions for the current status.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={cn('rounded-[24px] border p-5 sm:p-6', isDark ? 'border-white/10 bg-white/[0.03]' : 'border-gray-200 bg-white')}>
              <div className={cn('text-[1.08rem] font-semibold', isDark ? 'text-white' : 'text-gray-900')}>Internal Notes</div>
              <div className="mt-4 space-y-3">
                <textarea
                  rows={8}
                  className="form-field resize-none"
                  value={internalNotes}
                  onChange={event => setInternalNotes(event.target.value)}
                  placeholder="Private notes for the admin team..."
                />
                <AdminActionButton tone="primary" className="w-full" disabled={savingNotes} onClick={() => void handleSaveInternalNotes()}>
                  {savingNotes ? 'Saving...' : 'Save Internal Notes'}
                </AdminActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
