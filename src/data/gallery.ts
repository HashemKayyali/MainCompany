export interface GalleryAlbum { slug: string; title: string; cover: string; images: string[]; category: string }
export const galleryAlbums: GalleryAlbum[] = [
  { slug: 'events-2025', title: 'Events 2025', cover: '/assets/gallery/events/1.webp', images: ['/assets/gallery/events/1.webp','/assets/gallery/events/2.webp','/assets/gallery/events/3.webp'], category: 'Events' },
  { slug: 'bts', title: 'Behind the Scenes', cover: '/assets/gallery/bts/1.webp', images: ['/assets/gallery/bts/1.webp','/assets/gallery/bts/2.webp'], category: 'BTS' },
  { slug: 'products', title: 'Product Shots', cover: '/assets/gallery/products/1.webp', images: ['/assets/gallery/products/1.webp','/assets/gallery/products/2.webp'], category: 'Products' },
]
export const galleryCategories = ['All','Events','Products','BTS']
