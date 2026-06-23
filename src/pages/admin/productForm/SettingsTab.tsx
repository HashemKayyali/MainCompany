import type { Dispatch, SetStateAction } from 'react'
import { AdminEditorSection } from '../../../components/admin/AdminEditorWorkspace'
import { cn } from '../../../utils/cn'

interface SettingsTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  isDark: boolean
  sub: string
  soft2: string
  txt: string
}

export default function SettingsTab({ form, setForm, isDark, sub, soft2, txt }: SettingsTabProps) {
  return (
    <>
      <AdminEditorSection title="Pricing & Commerce">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Day Price</label>
            <input
              type="number"
              value={form.rentalPricePerDay || 0}
              onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })}
              className="form-field"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Currency</label>
            <input
              value={form.currency || 'JOD'}
              onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })}
              className="form-field"
              placeholder="JOD"
              maxLength={6}
            />
          <p className={`mt-1 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}></p>
          </div>

          <div className={`rounded-[18px] p-4 sm:col-span-2 xl:col-span-1 ${soft2}`}>
            <p className={`text-[11px] font-mono uppercase tracking-[0.2em] ${sub}`}>Pricing Behavior</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.showPrice !== false}
                  onChange={e => setForm({ ...form, showPrice: e.target.checked })}
                  className="h-4 w-4 rounded accent-violet-400"
                />
                <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Show pricing publicly</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.rentalEnabled !== false}
                  onChange={e => setForm({ ...form, rentalEnabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-violet-400"
                />
                <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Available for rental</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.saleEnabled !== false}
                  onChange={e => setForm({ ...form, saleEnabled: e.target.checked })}
                  className="h-4 w-4 rounded accent-violet-400"
                />
                <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Available for purchase quote</span>
              </label>
            </div>
          </div>
        </div>
      </AdminEditorSection>

      <AdminEditorSection
        title="Rental & Inventory"
        hint="Stock and buffer windows live here so availability checks and request approval stay aligned."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Total Stock</label>
            <input
              type="number"
              min={0}
              value={form.stockTotal ?? 0}
              onChange={e => setForm({ ...form, stockTotal: e.target.value })}
              className="form-field"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Active Stock</label>
            <input
              type="number"
              min={0}
              value={form.stockActive ?? 0}
              onChange={e => setForm({ ...form, stockActive: e.target.value })}
              className="form-field"
            />
            <p className={`mt-1 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>Must stay less than or equal to total stock.</p>
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Minimum Rental Days</label>
            <input
              type="number"
              min={1}
              value={form.minimumRentalDays ?? 1}
              onChange={e => setForm({ ...form, minimumRentalDays: e.target.value })}
              className="form-field"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Buffer Before (days)</label>
            <input
              type="number"
              min={0}
              value={form.bufferBeforeDays ?? 0}
              onChange={e => setForm({ ...form, bufferBeforeDays: e.target.value })}
              className="form-field"
            />
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Buffer After (days)</label>
            <input
              type="number"
              min={0}
              value={form.bufferAfterDays ?? 0}
              onChange={e => setForm({ ...form, bufferAfterDays: e.target.value })}
              className="form-field"
            />
          </div>
          <div className={`rounded-[18px] p-4 ${soft2}`}>
            <p className={`text-[11px] font-mono uppercase tracking-[0.2em] ${sub}`}>Availability Summary</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className={sub}>Storefront rental status</span>
                <span className={cn('font-semibold', form.rentalEnabled !== false ? txt : isDark ? 'text-red-200' : 'text-red-600')}>
                  {form.rentalEnabled !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={sub}>Quote request status</span>
                <span className={cn('font-semibold', form.saleEnabled !== false ? txt : isDark ? 'text-red-200' : 'text-red-600')}>
                  {form.saleEnabled !== false ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className={sub}>Available units today</span>
                <span className={txt}>{Math.max(0, Number(form.stockActive) || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </AdminEditorSection>
    </>
  )
}
