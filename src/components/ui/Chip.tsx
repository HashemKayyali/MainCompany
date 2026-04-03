import { useTheme } from '../../contexts/ThemeContext'
export default function Chip({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  const { isDark } = useTheme()
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-[0.55rem] text-[10.75px] font-semibold tracking-[0.01em] transition-all duration-300 sm:min-h-[40px] sm:px-3.5 sm:text-[11px] ${
        active
          ? isDark
            ? 'border border-violet-300/30 bg-[linear-gradient(135deg,rgba(124,58,237,0.20),rgba(236,72,153,0.14),rgba(6,182,212,0.10))] text-white shadow-[0_14px_32px_rgba(76,29,149,0.20)]'
            : 'border border-violet-200 bg-violet-50 text-violet-700'
          : isDark
            ? 'border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] text-purple-100/72 hover:border-violet-300/20 hover:text-white hover:bg-white/[0.06]'
            : 'border border-gray-200 bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {children}
    </button>
  )
}
