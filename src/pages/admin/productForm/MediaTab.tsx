import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { AdminEditorSection } from '../../../components/admin/AdminEditorWorkspace'
import FramedImage from '../../../components/ui/FramedImage'
import ImageUploader from '../../../components/ui/ImageUploader'
import VideoUploader from '../../../components/ui/VideoUploader'
import AdminBadge from '../../../components/admin/primitives/AdminBadge'
import AdminKebabMenu, { type AdminKebabItem } from '../../../components/admin/AdminKebabMenu'
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
}: MediaTabProps) {
  const gallery: string[] = form.gallery || []

  return (
    <div className="space-y-3.5">
      <AdminEditorSection
        title="Gallery"
        hint="The first image becomes the storefront hero automatically. Keep the strongest framed image in slot one."
      >
        <div className="grid grid-cols-3 gap-2.5 md:grid-cols-5">
          {gallery.map((url, idx) => {
            const items: AdminKebabItem[] = [
              { label: 'Adjust frame', onSelect: () => setActiveGalleryIndex(idx) },
              ...(idx > 0 ? [{ label: 'Move left', onSelect: () => moveGalleryImage(idx, -1) }] : []),
              ...(idx < gallery.length - 1 ? [{ label: 'Move right', onSelect: () => moveGalleryImage(idx, 1) }] : []),
              { label: 'Remove image', onSelect: () => removeGalleryImage(idx), tone: 'danger' as const },
            ]
            return (
              <div key={idx} className="relative min-w-[96px]">
                <div className="aspect-square overflow-hidden rounded-[12px] border border-[var(--admin-border)] bg-[var(--admin-surface-2)]">
                  <FramedImage media={url} alt="" className="h-full w-full" fallbackTransform={{ fit: 'cover' }} />
                </div>
                {idx === 0 && (
                  <AdminBadge tone="accent" className="absolute start-1.5 top-1.5 !px-1.5 !py-0.5 !text-[9px]">
                    Hero
                  </AdminBadge>
                )}
                <div className="absolute end-1.5 top-1.5">
                  <AdminKebabMenu items={items} label="Image actions" />
                </div>
              </div>
            )
          })}

          <ImageUploader
            compact
            onChange={addGalleryImage}
            folder="products"
            frameAspect={4 / 3}
            defaultFit="cover"
            previewAspectClass="aspect-square"
            frameTitle="Adjust Product Image"
            frameHint="Choose what stays visible inside product cards and previews."
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

      <AdminEditorSection
        title="Video"
        hint="Optional hover-preview video for the storefront card. Leave empty if the product has no video."
      >
        <VideoUploader
          label="Product video"
          value={form.videoUrl || ''}
          onChange={url => setForm((f: any) => ({ ...f, videoUrl: url }))}
          onRemove={() => setForm((f: any) => ({ ...f, videoUrl: '' }))}
          folder="products"
          frameAspect={4 / 3}
          defaultFit="cover"
          frameTitle="Adjust Product Video"
          frameHint="Choose what stays visible inside product previews."
          renderFrameContextPreview={media => renderProductPreview({ videoUrl: media })}
          frameContextTitle="Product Card Result"
          frameContextHint="Inspect the real storefront card result while you adjust the frame."
          compactPreview
        />
      </AdminEditorSection>
    </div>
  )
}
