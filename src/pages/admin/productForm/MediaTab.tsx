import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { AdminEditorSection } from '../../../components/admin/AdminEditorWorkspace'
import FramedImage from '../../../components/ui/FramedImage'
import ImageUploader from '../../../components/ui/ImageUploader'
import VideoUploader from '../../../components/ui/VideoUploader'
import type { Product } from '../../../data/products/types'

interface MediaTabProps {
  form: any
  setForm: Dispatch<SetStateAction<any>>
  setActiveGalleryIndex: Dispatch<SetStateAction<number | null>>
  moveGalleryImage: (idx: number, dir: -1 | 1) => void
  removeGalleryImage: (idx: number) => void
  addGalleryImage: (url: string) => void
  renderProductPreview: (overrides?: Partial<Product>) => ReactNode
  previewProduct: Product
  isDark: boolean
  sub: string
}

export default function MediaTab({
  form,
  setForm,
  setActiveGalleryIndex,
  moveGalleryImage,
  removeGalleryImage,
  addGalleryImage,
  renderProductPreview,
  previewProduct,
  isDark,
  sub,
}: MediaTabProps) {
  return (
    <>
      <AdminEditorSection title="Gallery" hint="The first image becomes the hero automatically. Keep the strongest framed image in slot one.">
        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-4">
          {(form.gallery || []).map((url: string, idx: number) => (
            <div key={idx} className="group relative">
              <div className={`aspect-video overflow-hidden rounded-[14px] border ${isDark ? 'border-purple-500/20' : 'border-gray-200'}`}>
                <FramedImage media={url} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
              </div>
              {idx === 0 ? <span className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[8px] font-bold ${isDark ? 'bg-cyan-400/25 text-cyan-200' : 'bg-violet-100 text-violet-700'}`}>HERO</span> : null}
              <div className={`absolute inset-0 flex flex-wrap content-start items-start justify-start gap-1.5 rounded-[14px] p-1.5 opacity-0 transition-opacity group-hover:opacity-100 ${isDark ? 'bg-black/60' : 'bg-white/70'}`}>
                <button type="button" onClick={() => setActiveGalleryIndex(idx)} className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold ${isDark ? 'bg-cyan-500/25 text-white' : 'bg-violet-100 text-violet-700'}`}>Frame</button>
                {idx > 0 ? <button type="button" onClick={() => moveGalleryImage(idx, -1)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>{'<'}</button> : null}
                {idx < (form.gallery || []).length - 1 ? <button type="button" onClick={() => moveGalleryImage(idx, 1)} className={`flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-bold ${isDark ? 'bg-purple-500/30 text-white' : 'bg-violet-100 text-violet-700'}`}>{'>'}</button> : null}
                <button type="button" onClick={() => removeGalleryImage(idx)} className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/75 text-[11px] font-bold text-white">x</button>
              </div>
            </div>
          ))}

          <ImageUploader
            compact
            onChange={addGalleryImage}
            folder="products"
            frameAspect={16 / 10}
            defaultFit="cover"
            frameTitle="Adjust Product Image"
            frameHint="Choose what stays visible inside product cards and previews."
            previewAspectClass="aspect-video"
            renderFrameContextPreview={media =>
              renderProductPreview({
                heroImage: media,
                gallery: media ? [media, ...(previewProduct.gallery || []).filter(item => item !== media)] : previewProduct.gallery,
              })
            }
            frameContextTitle="Product Card Result"
            frameContextHint="Inspect the real storefront card result while you adjust the frame."
          />
        </div>
      </AdminEditorSection>

      <AdminEditorSection title="Video" hint="Upload the optional hover-preview video and frame it against the actual product card output.">
        <VideoUploader
          label="Product Video"
          value={form.videoUrl || ''}
          onChange={url => setForm((f: any) => ({ ...f, videoUrl: url }))}
          onRemove={() => setForm((f: any) => ({ ...f, videoUrl: '' }))}
          folder="products"
          frameAspect={16 / 10}
          defaultFit="cover"
          frameTitle="Adjust Product Video"
          frameHint="Choose what stays visible inside product previews."
          renderFrameContextPreview={media => renderProductPreview({ videoUrl: media })}
          frameContextTitle="Product Card Result"
          frameContextHint="Inspect the real storefront card result while you adjust the frame."
        />
      </AdminEditorSection>
    </>
  )
}
