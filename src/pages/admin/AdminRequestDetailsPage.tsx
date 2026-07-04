import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, RefreshCw } from 'lucide-react'
import AdminConfirmDialog from '../../components/admin/AdminConfirmDialog'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AdminBadge, { type AdminBadgeTone } from '../../components/admin/primitives/AdminBadge'
import AdminButton from '../../components/admin/primitives/AdminButton'
import AdminEmptyState from '../../components/admin/primitives/AdminEmptyState'
import AdminSkeleton from '../../components/admin/primitives/AdminSkeleton'
import { useToast } from '../../contexts/ToastContext'
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
  PurchaseQuoteItem,
  PurchaseQuoteRequestDetails,
  RentalAvailability,
  RentalRequestDetails,
  RentalRequestItem,
  RequestType,
} from '../../types/commerce'
import { formatRequestStatusLabel, formatRequestTypeLabel, getCommerceErrorMessage } from '../../utils/commerce'
import { cn } from '../../utils/cn'

type StatusAction = { label: string; status: string; tone?: 'primary' | 'danger' | 'neutral' }

const RENTAL_ACTIONS: Record<string, StatusAction[]> = {
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

const PURCHASE_ACTIONS: Record<string, StatusAction[]> = {
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

function statusTone(status: string): AdminBadgeTone {
  if (status === 'pending_review') return 'warning'
  if (status === 'confirmed' || status === 'completed' || status === 'won') return 'success'
  if (status === 'contacted' || status === 'quoted' || status === 'in_preparation') return 'accent'
  if (status === 'rejected' || status === 'cancelled' || status === 'lost') return 'danger'
  return 'neutral'
}

function actionVariant(action: StatusAction): 'primary' | 'danger' | 'outline' {
  if (action.tone === 'danger') return 'danger'
  if (action.tone === 'primary') return 'primary'
  return 'outline'
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function money(value?: number | null, suffix = 'JOD') {
  if (value == null) return 'Review pending'
  return `${value.toFixed(2)} ${suffix}`
}

function requestTotal(request: RentalRequestDetails | PurchaseQuoteRequestDetails) {
  return 'grandTotal' in request ? request.grandTotal : null
}

function isRentalItem(item: RentalRequestItem | PurchaseQuoteItem): item is RentalRequestItem {
  return 'rentalStartDate' in item
}

function Section({ title, children, className = '' }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('admin-card p-4 sm:p-5', className)}>
      <h2 className="admin-section-title">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Fact({ label, value, valueClassName = '' }: { label: string; value: ReactNode; valueClassName?: string }) {
  return (
    <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2.5">
      <div className="text-[9.5px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">{label}</div>
      <div className={cn('mt-1 text-[13px] font-bold leading-5 text-[var(--admin-text)]', valueClassName)}>{value}</div>
    </div>
  )
}

function ItemMark({ title }: { title: string }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-accent-soft)] text-[13px] font-black text-[var(--admin-accent)]">
      {title.trim().charAt(0).toUpperCase() || 'I'}
    </div>
  )
}

export default function AdminRequestDetailsPage() {
  const { type, id } = useParams<{ type: RequestType; id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [request, setRequest] = useState<RentalRequestDetails | PurchaseQuoteRequestDetails | null>(null)
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, RentalAvailability | null>>({})
  const [statusNote, setStatusNote] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [submittingAction, setSubmittingAction] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [confirmAction, setConfirmAction] = useState<StatusAction | null>(null)

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

  const rentalDateRange = useMemo(() => {
    if (!isRental || !request) return null
    const items = (request as RentalRequestDetails).items
    const starts = items.map(item => item.rentalStartDate).filter(Boolean).sort()
    const ends = items.map(item => item.rentalEndDate).filter(Boolean).sort()
    if (!starts.length || !ends.length) return null
    return `${formatDate(starts[0])} - ${formatDate(ends[ends.length - 1])}`
  }, [isRental, request])

  const isDestructiveStatus = (nextStatus: string) =>
    ['rejected', 'cancelled', 'lost'].includes(nextStatus)

  const executeStatusChange = async (action: StatusAction, noteOverride = '') => {
    if (!request || !type) return

    setSubmittingAction(true)
    try {
      const note = noteOverride.trim() || statusNote.trim() || `${action.label} from admin request details`

      if (isRental && action.status === 'confirmed') {
        await approveRentalRequest(request.id, note)
      } else {
        await updateRequestStatus(type, request.id, action.status, note)
      }

      toast(`Updated ${request.requestNumber} to ${action.status.replace(/_/g, ' ')}.`, 'success')
      setStatusNote('')
      setConfirmAction(null)
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not update request status.'), 'error')
    } finally {
      setSubmittingAction(false)
    }
  }

  const handleStatusAction = (action: StatusAction) => {
    if (isDestructiveStatus(action.status)) {
      setConfirmAction(action)
      return
    }

    void executeStatusChange(action)
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

  const renderStatusActions = (compact = false) => {
    if (!availableActions.length) {
      return (
        <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-3 text-[12px] font-semibold text-[var(--admin-text-muted)]">
          No direct actions for the current status.
        </div>
      )
    }

    return (
      <div className={cn('grid gap-2', compact ? 'grid-cols-2' : 'grid-cols-1')}>
        {availableActions.map(action => (
          <AdminButton
            key={action.label}
            variant={actionVariant(action)}
            disabled={submittingAction}
            loading={submittingAction}
            onClick={() => handleStatusAction(action)}
          >
            {action.label}
          </AdminButton>
        ))}
      </div>
    )
  }

  if (!isRental && !isPurchaseQuote) {
    return (
      <div className="space-y-4">
        <AdminPageHeader title="Request Details" />
        <AdminEmptyState title="Unknown request type" description="The request URL does not match a supported request type." />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title={pageTitle}
        actions={
          <>
            <AdminButton size="sm" variant="outline" onClick={() => navigate('/admin/requests')}>
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" strokeWidth={2.2} aria-hidden="true" />
              Back
            </AdminButton>
            <AdminButton size="sm" variant="outline" onClick={() => void load()} loading={loading}>
              <RefreshCw className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
              Refresh
            </AdminButton>
          </>
        }
      />

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="admin-card p-4">
                <AdminSkeleton lines={5} />
              </div>
            ))}
          </div>
          <div className="admin-card p-4">
            <AdminSkeleton lines={8} />
          </div>
        </div>
      ) : loadError ? (
        <AdminEmptyState
          title="We could not load this request"
          description={loadError}
          action={
            <AdminButton size="sm" variant="outline" onClick={() => void load()}>
              Retry
            </AdminButton>
          }
        />
      ) : !request ? (
        <AdminEmptyState title="Request not found" description="This request may have been removed or is no longer available." />
      ) : (
        <div className="min-h-0 flex-1 overflow-y-auto pb-[calc(var(--admin-bottombar-h)+5.5rem)] md:pb-0">
          <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <main className="min-w-0 space-y-4">
              <Section title="Request Summary">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <AdminBadge tone={isRental ? 'accent' : 'neutral'}>{formatRequestTypeLabel(type as RequestType)}</AdminBadge>
                      <AdminBadge tone={statusTone(request.status)}>{formatRequestStatusLabel(request.status)}</AdminBadge>
                    </div>
                    <div className="mt-3 break-all font-mono text-[1.35rem] font-black tracking-[-0.03em] text-[var(--admin-text)] sm:text-[1.55rem]">
                      {request.requestNumber}
                    </div>
                    <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[var(--admin-text-muted)]">
                      {request.customerName} submitted this {formatRequestTypeLabel(type as RequestType).toLowerCase()} on {formatDateTime(request.createdAt)}.
                    </p>
                  </div>
                  <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-4 py-3">
                    <div className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">Total</div>
                    <div className="mt-1 font-sans text-[1.18rem] font-black text-[var(--admin-text)]">{money(requestTotal(request))}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Fact label="Created" value={formatDateTime(request.createdAt)} />
                  <Fact label="Updated" value={formatDateTime(request.updatedAt)} />
                  <Fact label={isRental ? 'Rental dates' : 'Request type'} value={isRental ? rentalDateRange || '-' : 'Purchase quote'} />
                  <Fact label="Items" value={request.items.length} />
                </div>
              </Section>

              <Section title="Customer / Contact">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <Fact label="Name" value={request.customerName} />
                  <Fact
                    label="Email"
                    value={
                      <a className="break-all text-[var(--admin-accent)] hover:underline" href={`mailto:${request.email}`}>
                        {request.email}
                      </a>
                    }
                  />
                  <Fact
                    label="Phone"
                    value={
                      request.phone ? (
                        <a className="text-[var(--admin-accent)] hover:underline" href={`tel:${request.phone}`}>
                          {request.phone}
                        </a>
                      ) : (
                        '-'
                      )
                    }
                  />
                  <Fact label="Company" value={request.companyName || '-'} />
                  <Fact label="City" value={request.city || '-'} />
                  <Fact label="Address" value={request.address || '-'} />
                  {isRental && <Fact label="Event" value={(request as RentalRequestDetails).eventName || '-'} />}
                </div>

                {request.notes ? (
                  <div className="mt-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-3 text-[13px] leading-6 text-[var(--admin-text-muted)]">
                    <span className="font-bold text-[var(--admin-text)]">Customer note:</span> {request.notes}
                  </div>
                ) : null}
              </Section>

              <Section title="Items / Services">
                <div className="hidden md:block">
                  <div className="admin-table-wrap">
                    <table className="min-w-[820px] w-full border-collapse text-start">
                      <thead className="bg-[var(--admin-surface-2)]">
                        <tr className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--admin-text-muted)]">
                          <th className="px-3 py-2.5 text-start">Item</th>
                          <th className="px-3 py-2.5 text-start">Qty</th>
                          <th className="px-3 py-2.5 text-start">Dates</th>
                          <th className="px-3 py-2.5 text-start">Unit</th>
                          <th className="px-3 py-2.5 text-start">Line total</th>
                          <th className="px-3 py-2.5 text-start">Availability</th>
                        </tr>
                      </thead>
                      <tbody>
                        {request.items.map(item => {
                          const availability = isRentalItem(item) ? availabilityMap[item.id] : null
                          return (
                            <tr key={item.id} className="border-t border-[var(--admin-border)] align-middle">
                              <td className="px-3 py-2.5">
                                <div className="flex min-w-[220px] items-center gap-2.5">
                                  <ItemMark title={item.productTitleSnapshot} />
                                  <div className="min-w-0">
                                    <div className="truncate text-[13px] font-bold text-[var(--admin-text)]">{item.productTitleSnapshot}</div>
                                    <div className="truncate text-[11px] text-[var(--admin-text-muted)]">{item.productSlug}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-2.5 text-[13px] font-semibold tabular-nums text-[var(--admin-text)]">{item.quantity}</td>
                              <td className="px-3 py-2.5 text-[12px] font-semibold text-[var(--admin-text-muted)]">
                                {isRentalItem(item) ? `${formatDate(item.rentalStartDate)} - ${formatDate(item.rentalEndDate)}` : '-'}
                              </td>
                              <td className="px-3 py-2.5 text-[12px] font-semibold tabular-nums text-[var(--admin-text)]">
                                {isRentalItem(item) ? `${item.unitPrice.toFixed(2)} JOD/day` : 'Review'}
                              </td>
                              <td className="px-3 py-2.5 text-[12px] font-bold tabular-nums text-[var(--admin-text)]">
                                {isRentalItem(item) ? money(item.lineTotal) : 'Review pending'}
                              </td>
                              <td className="px-3 py-2.5">
                                {isRentalItem(item) ? (
                                  availability ? (
                                    <AdminBadge tone={availability.availableQuantity >= item.quantity ? 'success' : 'danger'}>
                                      {availability.availableQuantity} available
                                    </AdminBadge>
                                  ) : (
                                    <AdminBadge>Unavailable</AdminBadge>
                                  )
                                ) : (
                                  <AdminBadge>Quote item</AdminBadge>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="space-y-2.5 md:hidden">
                  {request.items.map(item => {
                    const availability = isRentalItem(item) ? availabilityMap[item.id] : null
                    return (
                      <article key={item.id} className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-3">
                        <div className="flex items-start gap-2.5">
                          <ItemMark title={item.productTitleSnapshot} />
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-[var(--admin-text)]">{item.productTitleSnapshot}</div>
                            <div className="mt-0.5 text-[11px] text-[var(--admin-text-muted)]">Qty {item.quantity}</div>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Fact label="Dates" value={isRentalItem(item) ? `${formatDate(item.rentalStartDate)} - ${formatDate(item.rentalEndDate)}` : '-'} />
                          <Fact label="Unit" value={isRentalItem(item) ? `${item.unitPrice.toFixed(2)} JOD/day` : 'Review'} />
                          <Fact label="Line" value={isRentalItem(item) ? money(item.lineTotal) : 'Review pending'} />
                          <Fact
                            label="Availability"
                            value={
                              isRentalItem(item)
                                ? availability
                                  ? `${availability.availableQuantity} available`
                                  : 'Unavailable'
                                : 'Quote item'
                            }
                          />
                        </div>
                      </article>
                    )
                  })}
                </div>
              </Section>

              <Section title="Totals Summary">
                {'grandTotal' in request ? (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <Fact label="Subtotal" value={money(request.subtotal)} />
                    <Fact label="Extra fees" value={money(request.extraFees)} />
                    <Fact label="Grand total" value={money(request.grandTotal)} valueClassName="text-[var(--admin-accent)]" />
                  </div>
                ) : (
                  <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-3 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                    Purchase quote totals are reviewed manually after the customer is contacted.
                  </div>
                )}
              </Section>

              <Section title="Internal Notes">
                <div className="space-y-3">
                  <textarea
                    rows={6}
                    className="admin-input resize-y"
                    value={internalNotes}
                    onChange={event => setInternalNotes(event.target.value)}
                    placeholder="Private notes for the admin team..."
                  />
                  <div className="flex justify-end">
                    <AdminButton loading={savingNotes} disabled={savingNotes} onClick={() => void handleSaveInternalNotes()}>
                      Save Internal Notes
                    </AdminButton>
                  </div>
                </div>
              </Section>

              <Section title="Status History">
                {request.history.length ? (
                  <div className="space-y-3">
                    {request.history.map(entry => (
                      <div key={entry.id} className="relative ps-6">
                        <span className="absolute start-0 top-1.5 h-3 w-3 rounded-full bg-[var(--admin-accent)] ring-4 ring-[var(--admin-accent-soft)]" aria-hidden="true" />
                        <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-2.5">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <AdminBadge tone={statusTone(entry.newStatus)}>{formatRequestStatusLabel(entry.newStatus)}</AdminBadge>
                            <span className="text-[11px] font-semibold text-[var(--admin-text-muted)]">{formatDateTime(entry.createdAt)}</span>
                          </div>
                          {entry.note ? <p className="mt-2 text-[12px] leading-5 text-[var(--admin-text-muted)]">{entry.note}</p> : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3 py-3 text-[13px] font-semibold text-[var(--admin-text-muted)]">
                    No timeline entries yet.
                  </div>
                )}
              </Section>
            </main>

            <aside className="min-w-0 space-y-4 xl:sticky xl:top-4 xl:self-start">
              <Section title="Operational Summary">
                <div className="space-y-2">
                  <Fact label="Status" value={<AdminBadge tone={statusTone(request.status)}>{formatRequestStatusLabel(request.status)}</AdminBadge>} />
                  <Fact label="Total" value={money(requestTotal(request))} valueClassName="text-[var(--admin-accent)]" />
                  <Fact label="Customer" value={request.customerName} />
                  <Fact label="Created" value={formatDateTime(request.createdAt)} />
                </div>
              </Section>

              <Section title="Status Actions">
                <div className="space-y-3">
                  <label className="block">
                    <span className="admin-label">Status note</span>
                    <textarea
                      rows={4}
                      className="admin-input mt-1.5 resize-y"
                      value={statusNote}
                      onChange={event => setStatusNote(event.target.value)}
                      placeholder="Optional note for the status timeline..."
                    />
                  </label>
                  {renderStatusActions()}
                </div>
              </Section>
            </aside>
          </div>

          {availableActions.length > 0 && (
            <div className="fixed inset-x-3 z-30 rounded-[var(--admin-radius)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-2 shadow-[0_18px_48px_-22px_rgba(46,10,114,0.38)] md:hidden" style={{ bottom: 'calc(var(--admin-bottombar-h) + 0.75rem)' }}>
              {renderStatusActions(true)}
            </div>
          )}
        </div>
      )}

      <AdminConfirmDialog
        open={!!confirmAction}
        title={confirmAction ? `${confirmAction.label}?` : 'Confirm Status Change'}
        description={
          request && confirmAction
            ? `This will permanently set ${request.requestNumber} to ${confirmAction.status.replace(/_/g, ' ')}.`
            : undefined
        }
        tone="danger"
        confirmLabel={confirmAction?.label}
        withNote
        noteLabel="Status note"
        notePlaceholder="Optional note for the status timeline..."
        loading={submittingAction}
        onCancel={() => setConfirmAction(null)}
        onConfirm={note => {
          if (confirmAction) void executeStatusChange(confirmAction, note)
        }}
      />
    </div>
  )
}
