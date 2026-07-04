import type { Dispatch, SetStateAction } from 'react'
import { Store } from 'lucide-react'
import AdminInput from '../../../components/admin/primitives/AdminInput'

interface SettingsTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
}

function StorefrontTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--admin-accent-soft)] px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.1em] text-[var(--admin-accent)]">
      <Store className="h-3 w-3" strokeWidth={2.2} aria-hidden="true" />
      Storefront
    </span>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="h-4 w-4 rounded accent-[var(--admin-accent)]"
      />
      <span className="text-[12.5px] font-semibold text-[var(--admin-text)]">{label}</span>
    </label>
  )
}

export default function SettingsTab({ form, setForm }: SettingsTabProps) {
  return (
    <div className="space-y-3.5">
      <section className="admin-card space-y-4 p-4">
        <div className="flex items-center gap-2">
          <h3 className="admin-section-title">Pricing &amp; visibility</h3>
          <StorefrontTag />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label="Day price"
            type="number"
            value={form.rentalPricePerDay ?? 0}
            onChange={e => setForm({ ...form, rentalPricePerDay: e.target.value })}
          />
          <AdminInput
            label="Currency"
            dir="ltr"
            className="!text-start"
            value={form.currency || 'JOD'}
            onChange={e => setForm({ ...form, currency: e.target.value.toUpperCase() })}
            placeholder="JOD"
            maxLength={6}
          />
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <Toggle label="Show pricing publicly" checked={form.showPrice !== false} onChange={v => setForm({ ...form, showPrice: v })} />
          <Toggle label="Available for rental" checked={form.rentalEnabled !== false} onChange={v => setForm({ ...form, rentalEnabled: v })} />
          <Toggle label="Available for purchase quote" checked={form.saleEnabled !== false} onChange={v => setForm({ ...form, saleEnabled: v })} />
        </div>
      </section>

      <section className="admin-card space-y-4 p-4">
        <div>
          <h3 className="admin-section-title">Rental &amp; inventory</h3>
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
            Stock and buffer windows keep availability checks and request approvals aligned.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AdminInput label="Total stock" type="number" min={0} value={form.stockTotal ?? 0} onChange={e => setForm({ ...form, stockTotal: e.target.value })} />
          <AdminInput
            label="Active stock"
            type="number"
            min={0}
            value={form.stockActive ?? 0}
            onChange={e => setForm({ ...form, stockActive: e.target.value })}
            hint="Must be less than or equal to total stock."
          />
          <AdminInput label="Minimum rental days" type="number" min={1} value={form.minimumRentalDays ?? 1} onChange={e => setForm({ ...form, minimumRentalDays: e.target.value })} />
          <AdminInput label="Buffer before (days)" type="number" min={0} value={form.bufferBeforeDays ?? 0} onChange={e => setForm({ ...form, bufferBeforeDays: e.target.value })} />
          <AdminInput label="Buffer after (days)" type="number" min={0} value={form.bufferAfterDays ?? 0} onChange={e => setForm({ ...form, bufferAfterDays: e.target.value })} />
        </div>
      </section>
    </div>
  )
}
