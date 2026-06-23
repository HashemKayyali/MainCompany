import type { Dispatch, SetStateAction } from 'react'
import { AdminEditorSection } from '../../../components/admin/AdminEditorWorkspace'

interface ContentTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  sub: string
}

export default function ContentTab({ form, setForm, sub }: ContentTabProps) {
  return (
    <>
      <AdminEditorSection title="Descriptions" hint="Short copy drives the product card; long copy supports the detail page.">
        <div>
          <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Short Description</label>
          <textarea value={form.shortDescription || ''} onChange={e => setForm({ ...form, shortDescription: e.target.value })} className="form-field resize-none" rows={3} />
        </div>
        <div>
          <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Full Description</label>
          <textarea value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="form-field resize-none" rows={6} />
        </div>
      </AdminEditorSection>

      <AdminEditorSection title="Internal Notes" hint="One note per line. These stay out of the storefront card but help with setup and sales context.">
        <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Notes (one per line)</label>
        <textarea value={typeof form.notes === 'string' ? form.notes : (form.notes || []).join('\n')} onChange={e => setForm({ ...form, notes: e.target.value })} className="form-field resize-none" rows={7} />
      </AdminEditorSection>
    </>
  )
}
