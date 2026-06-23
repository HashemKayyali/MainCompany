import type { Dispatch, SetStateAction } from 'react'
import { AdminEditorSection } from '../../../components/admin/AdminEditorWorkspace'

interface OptionsTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  addOption: () => void
  updateOption: (idx: number, field: 'label' | 'values', value: string) => void
  removeOption: (idx: number) => void
  isDark: boolean
  sub: string
  soft2: string
}

export default function OptionsTab({ form, setForm, addOption, updateOption, removeOption, isDark, sub, soft2 }: OptionsTabProps) {
  return (
    <>
      <AdminEditorSection title="Quick Options" hint="Keep short labels and comma-separated values so the setup remains compact and scannable.">
        <div className="mb-1 flex items-center justify-between">
          <label className={`text-[12px] font-medium ${sub}`}>Quick Options</label>
          <button
            onClick={addOption}
            className={`rounded-lg border px-3 py-1 text-[11px] font-semibold ${isDark ? 'border-prism-violet/30 bg-prism-violet/15 text-prism-violet' : 'border-violet-200 bg-violet-50 text-violet-700'}`}
          >
            + Add Option
          </button>
        </div>
        <div className="space-y-2">
          {(form.quickOptions || []).map((option: any, idx: number) => (
            <div key={idx} className={`flex flex-col gap-2 rounded-[16px] p-2.5 sm:flex-row sm:items-center ${soft2}`}>
              <input value={option.label} onChange={e => updateOption(idx, 'label', e.target.value)} className="form-field !py-2 !text-xs flex-1" placeholder="Label (e.g. Bikes)" />
              <input value={option.values?.join(', ') || ''} onChange={e => updateOption(idx, 'values', e.target.value)} className="form-field !py-2 !text-xs flex-[2]" placeholder="Values: 1, 2, 3, 4" />
              <button onClick={() => removeOption(idx)} className={`rounded-lg border px-3 py-2 text-[11px] font-semibold ${isDark ? 'border-red-400/20 bg-red-400/10 text-red-200/90' : 'border-red-200 bg-red-50 text-red-700'}`}>
                Remove
              </button>
            </div>
          ))}
        </div>
      </AdminEditorSection>

      <AdminEditorSection title="Feature Columns" hint="These feed the detailed product view. Keep each line focused so both columns scan well.">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Features - Left Column (one per line)</label>
            <textarea value={typeof form.featuresLeft === 'string' ? form.featuresLeft : (form.features?.left || []).join('\n')} onChange={e => setForm({ ...form, featuresLeft: e.target.value })} className="form-field resize-none" rows={6} />
          </div>

          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Features - Right Column (one per line)</label>
            <textarea value={typeof form.featuresRight === 'string' ? form.featuresRight : (form.features?.right || []).join('\n')} onChange={e => setForm({ ...form, featuresRight: e.target.value })} className="form-field resize-none" rows={6} />
          </div>
        </div>
      </AdminEditorSection>
    </>
  )
}
