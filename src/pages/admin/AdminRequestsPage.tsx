import { useEffect, useMemo, useState } from 'react'
import RequestListCard from '../../components/requests/RequestListCard'
import AdminActionButton from '../../components/admin/AdminActionButton'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import { useTheme } from '../../contexts/ThemeContext'
import { useToast } from '../../contexts/ToastContext'
import { approveRentalRequest, listAdminRequests, updateRequestStatus } from '../../services/admin-requests.service'
import type { AdminRequestListItem, RequestType } from '../../types/commerce'
import { getCommerceErrorMessage } from '../../utils/commerce'

type RequestFilter = 'all' | RequestType

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export default function AdminRequestsPage() {
  const { isDark } = useTheme()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [requests, setRequests] = useState<AdminRequestListItem[]>([])
  const [typeFilter, setTypeFilter] = useState<RequestFilter>('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [workingRequestId, setWorkingRequestId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      setLoadError('')
      setRequests(await listAdminRequests())
    } catch (error) {
      const message = getCommerceErrorMessage(error, 'Could not load admin requests.')
      setLoadError(message)
      setRequests([])
      toast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return requests.filter(request => {
      const matchesType = typeFilter === 'all' || request.type === typeFilter
      const matchesStatus = statusFilter === 'all' || request.status === statusFilter
      const matchesQuery =
        !query ||
        request.requestNumber.toLowerCase().includes(query) ||
        request.customerName.toLowerCase().includes(query) ||
        request.email.toLowerCase().includes(query)

      return matchesType && matchesStatus && matchesQuery
    })
  }, [requests, search, statusFilter, typeFilter])

  const quickApprove = async (request: AdminRequestListItem) => {
    setWorkingRequestId(request.id)
    try {
      await approveRentalRequest(request.id, 'Approved from requests list')
      toast(`Approved ${request.requestNumber}.`, 'success')
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not approve request.'), 'error')
    } finally {
      setWorkingRequestId(null)
    }
  }

  const quickReject = async (request: AdminRequestListItem) => {
    setWorkingRequestId(request.id)
    try {
      await updateRequestStatus(request.type, request.id, 'rejected', 'Rejected from requests list')
      toast(`Rejected ${request.requestNumber}.`, 'success')
      await load()
    } catch (error) {
      toast(getCommerceErrorMessage(error, 'Could not reject request.'), 'error')
    } finally {
      setWorkingRequestId(null)
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <AdminPageHeader
        title="Requests"
        actions={
          <AdminActionButton tone="primary" onClick={() => void load()}>
            Refresh
          </AdminActionButton>
        }
      />

      <div className="flex flex-wrap gap-1.5">
        {(['all', 'rental', 'purchase_quote'] as RequestFilter[]).map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setTypeFilter(value)}
            className={cn(
              'rounded-[14px] px-3.5 py-1.5 text-[12px] font-semibold',
              typeFilter === value
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

      <div className={cn('rounded-[18px] p-3.5', isDark ? 'bg-[#0c1430]/88 ring-1 ring-inset ring-cyan-400/10' : 'bg-white ring-1 ring-inset ring-gray-200')}>
        <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1fr)_180px]">
          <input
            className="form-field"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search by request number, customer, or email..."
          />
          <select className="form-field" value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="contacted">Contacted</option>
            <option value="quoted">Quoted</option>
          </select>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto space-y-3.5 pr-0.5">
        {loading ? (
          <div className={cn('rounded-[18px] border p-5 text-sm', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
            Loading requests...
          </div>
        ) : loadError ? (
          <div className={cn('rounded-[26px] border p-6 text-sm', isDark ? 'border-rose-400/14 bg-[linear-gradient(180deg,rgba(22,10,25,0.84),rgba(10,10,22,0.92))] text-purple-100/72' : 'border-rose-200 bg-white text-gray-600')}>
            <div className={cn('text-[10px] font-mono uppercase tracking-[0.22em]', isDark ? 'text-rose-200/70' : 'text-rose-600/80')}>
              Request Center
            </div>
            <div className={cn('mt-3 font-display text-[1.25rem] font-black', isDark ? 'text-white' : 'text-gray-900')}>
              Requests are not ready on this environment
            </div>
            <p className="mt-3 max-w-2xl leading-7">{loadError}</p>
          </div>
        ) : !filtered.length ? (
          <div className={cn('rounded-[18px] border p-6 text-center text-sm', isDark ? 'border-white/10 bg-white/[0.03] text-purple-100/68' : 'border-gray-200 bg-white text-gray-500')}>
            No requests match this filter.
          </div>
        ) : (
          filtered.map(request => (
            <RequestListCard
              key={request.id}
              request={request}
              showCustomerEmail
              to={`/admin/requests/${request.type}/${request.id}`}
              actions={
                request.type === 'rental' && request.status === 'pending_review' ? (
                  <>
                    <AdminActionButton
                      tone="primary"
                      disabled={workingRequestId === request.id}
                      onClick={() => void quickApprove(request)}
                    >
                      {workingRequestId === request.id ? 'Working...' : 'Approve'}
                    </AdminActionButton>
                    <AdminActionButton
                      tone="danger"
                      disabled={workingRequestId === request.id}
                      onClick={() => void quickReject(request)}
                    >
                      {workingRequestId === request.id ? 'Working...' : 'Reject'}
                    </AdminActionButton>
                  </>
                ) : null
              }
            />
          ))
        )}
      </div>
    </div>
  )
}
