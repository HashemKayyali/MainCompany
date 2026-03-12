import { useTheme } from '../../contexts/ThemeContext'

export function ProductSkeleton() {
  const { isDark } = useTheme()
  const bg = isDark ? 'bg-purple-500/10' : 'bg-violet-100/60'

  return (
    <div className={`rounded-[22px] overflow-hidden animate-pulse border ${isDark ? 'border-purple-500/10 bg-[#07061a]/60' : 'border-violet-100 bg-white/80'}`}>
      <div className={`aspect-[16/10] ${bg}`} />
      <div className="p-5 space-y-3">
        <div className={`h-4 ${bg} rounded-full w-2/3`} />
        <div className={`h-3 ${bg} rounded-full w-full`} />
        <div className={`h-3 ${bg} rounded-full w-4/5`} />
        <div className="flex gap-2 mt-4">
          <div className={`h-6 w-16 ${bg} rounded-full`} />
          <div className={`h-6 w-16 ${bg} rounded-full`} />
        </div>
      </div>
    </div>
  )
}

export default function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }, (_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  )
}
