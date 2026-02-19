import { useTheme } from '../../contexts/ThemeContext'
import { type SelectHTMLAttributes } from 'react'
export default function Select({ label, error, options, placeholder, className = '', id, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string; error?: string; options: { value: string; label: string }[]; placeholder?: string }) {
  const { isDark } = useTheme()
  return <div>{label && <label htmlFor={id} className={`block text-[13px] mb-2 font-medium ${isDark ? 'text-purple-200/80' : 'text-gray-600'}`}>{label}</label>}<select id={id} className={`form-field appearance-none ${error ? '!border-red-400/40' : ''} ${className}`} {...props}>{placeholder && <option value="" className={isDark ? 'bg-void-800' : ''}>{placeholder}</option>}{options.map(o => <option key={o.value} value={o.value} className={isDark ? 'bg-void-800' : ''}>{o.label}</option>)}</select>{error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}</div>
}
