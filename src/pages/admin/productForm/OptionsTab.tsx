import type { Dispatch, SetStateAction } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import AdminButton from '../../../components/admin/primitives/AdminButton'
import AdminTextarea from '../../../components/admin/primitives/AdminTextarea'

interface OptionsTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  addOption: () => void
  updateOption: (idx: number, field: 'label' | 'values', value: string) => void
  removeOption: (idx: number) => void
}

export default function OptionsTab({ form, addOption, updateOption, removeOption, setForm }: OptionsTabProps) {
  const options: any[] = form.quickOptions || []

  return (
    <div className="space-y-3.5">
      <section className="admin-card space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="admin-section-title">Quick options</h3>
            <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">Short label + comma-separated values.</p>
          </div>
          <AdminButton size="sm" variant="outline" onClick={addOption}>
            <Plus className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
            Add
          </AdminButton>
        </div>

        {options.length === 0 ? (
          <div className="rounded-[var(--admin-radius-sm)] border border-dashed border-[var(--admin-border)] px-3 py-5 text-center text-[12px] text-[var(--admin-text-muted)]">
            No quick options yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {options.map((option, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-2 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] p-2.5 sm:flex-row sm:items-center"
              >
                <input
                  value={option.label}
                  onChange={e => updateOption(idx, 'label', e.target.value)}
                  className="admin-input flex-1"
                  placeholder="Label (e.g. Bikes)"
                  aria-label="Option label"
                />
                <input
                  value={option.values?.join(', ') || ''}
                  onChange={e => updateOption(idx, 'values', e.target.value)}
                  className="admin-input flex-[2]"
                  placeholder="Values: 1, 2, 3, 4"
                  aria-label="Option values"
                />
                <button
                  type="button"
                  onClick={() => removeOption(idx)}
                  aria-label="Remove option"
                  className="admin-icon-btn shrink-0 !text-[var(--admin-danger)] hover:!border-[var(--admin-danger)]"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={2.1} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="admin-card space-y-3 p-4">
        <div>
          <h3 className="admin-section-title">Feature columns</h3>
          <p className="mt-1 text-[12px] text-[var(--admin-text-muted)]">One feature per line; these feed the detailed product view.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <AdminTextarea
            label="Left column"
            value={typeof form.featuresLeft === 'string' ? form.featuresLeft : (form.features?.left || []).join('\n')}
            onChange={e => setForm({ ...form, featuresLeft: e.target.value })}
            rows={6}
          />
          <AdminTextarea
            label="Right column"
            value={typeof form.featuresRight === 'string' ? form.featuresRight : (form.features?.right || []).join('\n')}
            onChange={e => setForm({ ...form, featuresRight: e.target.value })}
            rows={6}
          />
        </div>
      </section>
    </div>
  )
}
