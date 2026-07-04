import type { Dispatch, SetStateAction } from 'react'
import { Star } from 'lucide-react'
import AdminInput from '../../../components/admin/primitives/AdminInput'
import AdminSelect from '../../../components/admin/primitives/AdminSelect'
import type { Category } from '../../../data/products/types'
import { BADGE_OPTIONS } from './constants'

interface BasicTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  categories: Category[]
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-card space-y-4 p-4">
      <h3 className="admin-section-title">{title}</h3>
      {children}
    </section>
  )
}

export default function BasicTab({ form, setForm, categories }: BasicTabProps) {
  return (
    <div className="space-y-3.5">
      <Section title="Identity">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminInput
            label="Product name"
            required
            value={form.name || ''}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Bike Blender"
          />
          <AdminInput
            label="Slug (URL)"
            value={form.slug || ''}
            onChange={e => setForm({ ...form, slug: e.target.value })}
            placeholder="auto-generated"
            hint="Leave empty to auto-generate from the name."
          />
        </div>
      </Section>

      <Section title="Placement">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AdminSelect
            label="Category"
            required
            value={form.categoryId || ''}
            onChange={e => setForm({ ...form, categoryId: e.target.value })}
          >
            <option value="">Select category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </AdminSelect>

          <AdminSelect
            label="Badge"
            value={form.badge || ''}
            onChange={e => setForm({ ...form, badge: e.target.value })}
            hint="Optional label shown on the storefront card."
          >
            <option value="">No badge</option>
            {BADGE_OPTIONS.map(badge => (
              <option key={badge} value={badge}>
                {badge}
              </option>
            ))}
          </AdminSelect>
        </div>

        <label className="flex cursor-pointer items-center gap-3 rounded-[var(--admin-radius-sm)] border border-[var(--admin-border)] bg-[var(--admin-surface-2)] px-3.5 py-3">
          <input
            type="checkbox"
            checked={!!form.featured}
            onChange={e => setForm({ ...form, featured: e.target.checked })}
            className="h-4 w-4 rounded accent-[var(--admin-accent)]"
          />
          <span className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--admin-text)]">
            <Star className="h-4 w-4 text-[var(--admin-accent)]" fill="currentColor" strokeWidth={0} aria-hidden="true" />
            Featured product
          </span>
          <span className="ms-auto text-[11px] text-[var(--admin-text-muted)]">Highlights the card on the storefront</span>
        </label>
      </Section>
    </div>
  )
}
