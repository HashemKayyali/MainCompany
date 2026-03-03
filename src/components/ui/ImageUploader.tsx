import { useState, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import { uploadImageVariants } from '../../services/storage.service'

const toThumbUrl = (url: string) => {
  // If we stored variants as -hero.webp, use -thumb.webp for lists/grids
  if (!url) return url
  return url.includes('-hero.webp') ? url.replace('-hero.webp', '-thumb.webp') : url
}


interface Props {
  /** Current image URL */
  value?: string
  /** Called with the new URL after upload */
  onChange: (url: string) => void
  /** Folder in storage bucket */
  folder?: string
  /** Label text */
  label?: string
  /** Show remove button */
  removable?: boolean
  /** Called when remove is clicked */
  onRemove?: () => void
  /** Compact mode for gallery thumbnails */
  compact?: boolean
}

export default function ImageUploader({ value, onChange, folder = 'general', label, removable = false, onRemove, compact = false }: Props) {
  const { isDark } = useTheme()
  const dialog = useDialog()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    setUploading(true)
    try {
      const { heroUrl } = await uploadImageVariants(file, folder)
      onChange(heroUrl)
    } catch (err) {
      console.error('Upload failed:', err)
      dialog.alert({ title: 'Upload Failed', message: 'Failed to upload image. Please try again.', variant: 'danger' })
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = '' // reset so same file can be re-selected
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const sub = isDark ? 'text-purple-300/80' : 'text-gray-500'

  if (compact) {
    return (
      <div className="relative group">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
        {value ? (
          <div className="relative aspect-video rounded-xl overflow-hidden">
            <img src={toThumbUrl(value)} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <div className={`absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
              <button type="button" onClick={() => inputRef.current?.click()} className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>
                {uploading ? '⏳' : '🔄'}
              </button>
              {removable && onRemove && (
                <button type="button" onClick={onRemove} className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-red-500/30 text-white">✕</button>
              )}
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all ${isDark ? 'border-purple-500/20 hover:border-purple-500/40 bg-purple-500/[0.04]' : 'border-violet-200 hover:border-violet-400 bg-violet-50/50'}`}>
            <span className="text-lg">{uploading ? '⏳' : '📎'}</span>
            <span className={`text-[9px] font-medium ${sub}`}>{uploading ? 'Uploading...' : 'Add Image'}</span>
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      {label && <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>{label}</label>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} className="hidden" />
      
      {value ? (
        <div className="relative group rounded-xl overflow-hidden">
          <img src={toThumbUrl(value)} alt="Uploaded" className="w-full aspect-video object-cover rounded-xl" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className={`absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
            <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDark ? 'bg-purple-500/40 text-white' : 'bg-violet-100 text-violet-700'}`}>
              {uploading ? '⏳ Uploading...' : '🔄 Replace'}
            </button>
            {removable && onRemove && (
              <button type="button" onClick={onRemove} className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/40 text-white">✕ Remove</button>
            )}
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full py-10 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
            dragOver 
              ? isDark ? 'border-prism-violet bg-prism-violet/10' : 'border-violet-500 bg-violet-50' 
              : isDark ? 'border-purple-500/20 hover:border-purple-500/40 bg-purple-500/[0.04]' : 'border-violet-200 hover:border-violet-400 bg-violet-50/50'
          }`}>
          <span className="text-3xl">{uploading ? '⏳' : '📎'}</span>
          <span className={`text-sm font-semibold ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>
            {uploading ? 'Uploading...' : 'Click or drop image here'}
          </span>
          <span className={`text-[11px] ${sub}`}>Supports JPG, PNG, WebP</span>
        </button>
      )}
    </div>
  )
}
