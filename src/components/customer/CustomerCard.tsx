import { useTheme } from '../../contexts/ThemeContext'
import type { Customer } from '../../data/customers'

export default function CustomerCard({ customer }: { customer: Customer }) {
  const { isDark } = useTheme()
  return (
    <div className="group glass !rounded-xl p-5 flex flex-col items-center gap-4">
      <div className={`w-20 h-20 rounded-xl flex items-center justify-center overflow-hidden bg-white border ${isDark ? 'border-purple-500/25' : 'border-gray-100'}`}>
        <img
          src={customer.logo}
          alt={customer.name}
          loading="lazy"
          className="w-[70%] h-[70%] object-contain group-hover:scale-110 transition-transform duration-500"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      </div>
      <span className={`text-[13px] text-center font-semibold leading-tight ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>
        {customer.name}
      </span>
    </div>
  )
}
