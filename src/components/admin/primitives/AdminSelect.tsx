import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react'
import AdminField from './AdminField'
import { cn } from '../../../utils/cn'

export type AdminSelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode
  hint?: ReactNode
  error?: ReactNode
  /** Extra classes for the outer field wrapper (label + control + hint). */
  fieldClassName?: string
}

const AdminSelect = forwardRef<HTMLSelectElement, AdminSelectProps>(function AdminSelect(
  { label, hint, error, fieldClassName, className, id, required, children, ...props },
  ref
) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <AdminField
      label={label}
      htmlFor={selectId}
      required={required}
      hint={hint}
      error={error}
      className={fieldClassName}
    >
      <select
        ref={ref}
        id={selectId}
        required={required}
        aria-invalid={error != null || undefined}
        className={cn('admin-input', error != null && 'admin-input--error', className)}
        {...props}
      >
        {children}
      </select>
    </AdminField>
  )
})

export default AdminSelect
