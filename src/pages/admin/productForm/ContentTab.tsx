import type { Dispatch, SetStateAction } from 'react'
import { Lock } from 'lucide-react'
import AdminTextarea from '../../../components/admin/primitives/AdminTextarea'

interface ContentTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
}

export default function ContentTab({ form, setForm }: ContentTabProps) {
  return (
    <div className="space-y-3.5">
      <section className="admin-card space-y-4 p-4">
        <div>
          <h3 className="admin-section-title">Descriptions</h3>
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">
            Short copy drives the product card; the full description supports the detail page.
          </p>
        </div>
        <AdminTextarea
          label="Short description"
          value={form.shortDescription || ''}
          onChange={e => setForm({ ...form, shortDescription: e.target.value })}
          rows={3}
          hint="Shown on the storefront card; keep it to a line or two."
        />
        <AdminTextarea
          label="Full description"
          value={form.description || ''}
          onChange={e => setForm({ ...form, description: e.target.value })}
          rows={6}
        />
      </section>

      <section className="admin-card space-y-3 p-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[var(--admin-accent-soft)] px-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--admin-accent)]">
            <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden="true" />
            Internal
          </span>
          <h3 className="admin-section-title">Notes</h3>
        </div>
        <AdminTextarea
          label="Internal notes (one per line)"
          value={typeof form.notes === 'string' ? form.notes : (form.notes || []).join('\n')}
          onChange={e => setForm({ ...form, notes: e.target.value })}
          rows={5}
          hint="Never shown to customers; setup and sales context only."
        />
      </section>
    </div>
  )
}
