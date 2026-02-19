import { useTheme } from '../../contexts/ThemeContext'
const COLORS = ['text-purple-400', 'text-cyan-400', 'text-pink-400', 'text-amber-400', 'text-lime-400']
const DOT_COLORS = ['bg-purple-400', 'bg-cyan-400', 'bg-pink-400', 'bg-amber-400', 'bg-lime-400']
const ITEMS = ['20+ Partners','6 Products','50+ Events','100% Customizable','Amman','Aqaba','Irbid','LED Racing','VR Cycling','Smoothie Bikes','20+ Partners','6 Products','50+ Events','100% Customizable','Amman','Aqaba','Irbid','LED Racing','VR Cycling','Smoothie Bikes']
export default function StatsStrip() {
  const { isDark } = useTheme()
  return (
    <section className={`relative py-5 border-y overflow-hidden ${isDark ? 'border-purple-500/20' : 'border-violet-100/60'}`}>
      <div className="marquee-track">
        {ITEMS.map((item, i) => (
          <div key={i} className="flex items-center shrink-0 gap-5 px-5">
            <span className={`text-sm font-display font-semibold whitespace-nowrap tracking-wide uppercase ${isDark ? COLORS[i % COLORS.length] : 'text-violet-400'}`}>{item}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? DOT_COLORS[i % DOT_COLORS.length] : 'bg-violet-300'}`} />
          </div>
        ))}
      </div>
    </section>
  )
}
