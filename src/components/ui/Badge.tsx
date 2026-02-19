export default function Badge({ children, className = '' }: { children: string; className?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white ${className}`}>{children}</span>
}
