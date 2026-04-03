import { useTheme } from '../../contexts/ThemeContext'
import { type SelectHTMLAttributes } from 'react'

export default function Select({
  label,
  error,
  options,
  placeholder,
  className = '',
  id,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}) {
  const { isDark } = useTheme()

  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className={`mb-2 block text-[13.5px] font-medium sm:text-[14px] ${
            isDark ? 'text-purple-200/80' : 'text-gray-600'
          }`}
        >
          {label}
        </label>
      )}

      <select
        id={id}
        className={`form-field appearance-none ${error ? '!border-red-400/40' : ''} ${className}`}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1.5 text-[12px] text-red-400">{error}</p>}
    </div>
  )
}
