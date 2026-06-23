import type { Dispatch, SetStateAction } from 'react'
import { AdminEditorSection } from '../../../components/admin/AdminEditorWorkspace'
import type { Category } from '../../../data/products/types'
import { cn } from '../../../utils/cn'
import { BADGE_OPTIONS, DEFAULT_FROM, DEFAULT_TO } from './constants'

interface BasicTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  categories: Category[]
  setBadgeGradient: (fromHex: string, toHex: string) => void
  isDark: boolean
  sub: string
  soft2: string
}

export default function BasicTab({ form, setForm, categories, setBadgeGradient, isDark, sub, soft2 }: BasicTabProps) {
  return (
    <>
      <AdminEditorSection
        title="Identity"
        hint="The storefront card pulls from these core fields first, so keep the name, slug, and badge setup together."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Product Name *</label>
            <input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="form-field" placeholder="Bike Blender" />
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Slug (URL)</label>
            <input value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} className="form-field" placeholder="auto-generated" />
            <p className={`mt-1 text-[11px] ${isDark ? 'text-purple-200/50' : 'text-gray-400'}`}>Leave empty to auto-generate.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Badge Text</label>
            <select value={form.badge || ''} onChange={e => setForm({ ...form, badge: e.target.value })} className="form-field">
              <option value="">No badge</option>
              {BADGE_OPTIONS.map(badge => (
                <option key={badge} value={badge}>
                  {badge}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Badge Gradient</label>
            <div className="grid grid-cols-2 gap-3">
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${soft2}`}>
                <span className={`text-[11px] ${sub}`}>From</span>
                <input type="color" value={form.badgeFromHex || DEFAULT_FROM} onChange={e => setBadgeGradient(e.target.value, form.badgeToHex || DEFAULT_TO)} className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
              </div>
              <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${soft2}`}>
                <span className={`text-[11px] ${sub}`}>To</span>
                <input type="color" value={form.badgeToHex || DEFAULT_TO} onChange={e => setBadgeGradient(form.badgeFromHex || DEFAULT_FROM, e.target.value)} className="h-7 w-8 cursor-pointer rounded border-0 bg-transparent p-0" />
              </div>
            </div>
          </div>
        </div>
      </AdminEditorSection>

      <AdminEditorSection title="Listing Setup">
        <div>
          <label className={`mb-1.5 block text-[12px] font-medium ${sub}`}>Category *</label>
          <select value={form.categoryId || ''} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="form-field">
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} className="h-4 w-4 rounded accent-violet-400" />
            <span className={cn('text-sm', isDark ? 'text-purple-100/90' : 'text-gray-700')}>Featured product</span>
          </label>
        </div>
      </AdminEditorSection>
    </>
  )
}
