import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
export default function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0); const { isDark } = useTheme()
  return (<div><div className={`rounded-2xl overflow-hidden aspect-video ${isDark ? 'bg-void-800' : 'bg-gray-100'}`}><img src={images[active]} alt={name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} /></div>{images.length > 1 && <div className="flex gap-2 mt-3">{images.map((img, i) => (<button key={i} onClick={() => setActive(i)} className={`w-16 h-12 rounded-xl overflow-hidden border-2 transition-all ${i === active ? 'border-prism-violet/50' : isDark ? 'border-purple-500/25 opacity-70' : 'border-gray-200 opacity-80'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>))}</div>}</div>)
}
