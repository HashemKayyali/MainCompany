import { useState, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useDialog } from '../../contexts/DialogContext'
import { uploadVideo, deleteVideo } from '../../services/storage.service'

interface Props {
  /** Current video URL */
  value?: string
  /** Called with the new URL after upload */
  onChange: (url: string) => void
  /** Called when video is removed */
  onRemove?: () => void
  /** Folder in storage bucket */
  folder?: string
  /** Label text */
  label?: string
}

export default function VideoUploader({ value, onChange, onRemove, folder = 'products', label }: Props) {
  const { isDark } = useTheme()
  const dialog = useDialog()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const sub = isDark ? 'text-purple-300/80' : 'text-gray-500'

  const handleFile = async (file: File) => {
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|m4v)$/i)) {
      dialog.alert({ title: 'Invalid File', message: 'Please upload a video file (MP4, WebM, or MOV).', variant: 'warning' })
      return
    }

    if (file.size > 50 * 1024 * 1024) {
      dialog.alert({ title: 'File Too Large', message: 'Video is too large. Max size is 50MB.', variant: 'warning' })
      return
    }

    setUploading(true)
    setProgress(`Uploading ${(file.size / 1024 / 1024).toFixed(1)}MB...`)

    try {
      const url = await uploadVideo(file, folder)
      onChange(url)
      setProgress('')
    } catch (err: any) {
      console.error('Video upload failed:', err)
      dialog.alert({ title: 'Upload Failed', message: 'Failed to upload video: ' + (err.message || 'Unknown error'), variant: 'danger' })
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = async () => {
    if (value) {
      try {
        await deleteVideo(value)
      } catch {
        // ignore delete errors
      }
    }
    onRemove?.()
    onChange('')
  }

  return (
    <div>
      {label && <label className={`block text-[12px] mb-1.5 font-medium ${sub}`}>{label}</label>}
      <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov" onChange={handleChange} className="hidden" />

      {value ? (
        <div className="relative group rounded-xl overflow-hidden">
          <video
            src={value}
            className="w-full aspect-video object-cover rounded-xl"
            muted
            loop
            playsInline
            onMouseEnter={(e) => (e.target as HTMLVideoElement).play().catch(() => {})}
            onMouseLeave={(e) => { const v = e.target as HTMLVideoElement; v.pause(); v.currentTime = 0 }}
          />
          <div className={`absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'bg-black/60' : 'bg-white/60'}`}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className={`px-4 py-2 rounded-xl text-xs font-semibold ${isDark ? 'bg-purple-500/40 text-white' : 'bg-violet-100 text-violet-700'}`}
            >
              {uploading ? '⏳ Uploading...' : '🔄 Replace'}
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-red-500/40 text-white"
            >
              ✕ Remove
            </button>
          </div>

          {/* Play hint */}
          <div className="absolute bottom-2 right-2 pointer-events-none">
            <span className={`text-[9px] font-mono px-2 py-1 rounded-lg ${isDark ? 'bg-black/50 text-white/60' : 'bg-white/70 text-gray-500'}`}>
              Hover to preview
            </span>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
            dragOver
              ? isDark ? 'border-prism-violet bg-prism-violet/10' : 'border-violet-500 bg-violet-50'
              : isDark ? 'border-purple-500/20 hover:border-purple-500/40 bg-purple-500/[0.04]' : 'border-violet-200 hover:border-violet-400 bg-violet-50/50'
          }`}
        >
          <span className="text-2xl">{uploading ? '⏳' : '🎬'}</span>
          <span className={`text-sm font-semibold ${isDark ? 'text-purple-200/90' : 'text-gray-600'}`}>
            {uploading ? progress || 'Uploading...' : 'Click or drop video here'}
          </span>
          <span className={`text-[11px] ${sub}`}>MP4, WebM, MOV — max 50MB</span>
        </button>
      )}
    </div>
  )
}
