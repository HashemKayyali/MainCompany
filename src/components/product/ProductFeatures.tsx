import { useTheme } from '../../contexts/ThemeContext'
export default function ProductFeatures({ features }: { features: { left: string[]; right: string[] } }) {
  const { isDark } = useTheme()
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">{[...features.left, ...features.right].map((f, i) => (<div key={i} className="flex items-start gap-2.5"><div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-prism-violet/15 flex items-center justify-center"><svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="text-prism-violet"><path d="M2.5 6.5l2.5 2.5 4.5-5" /></svg></div><span className={`text-sm leading-relaxed ${isDark ? 'text-cyan-200/90' : 'text-gray-600'}`}>{f}</span></div>))}</div>
}
