import type { MetadataRoute } from 'next'

/**
 * SEO-015 — web app manifest + icon metadata. The Vite app had no real
 * manifest (the SPA catch-all served index.html for /site.webmanifest); this
 * is an additive, non-parity-breaking improvement using the existing favicon
 * set and brand theme color (#7c3aed).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Eventies — Event Services Marketplace in Jordan',
    short_name: 'Eventies',
    description:
      'Explore event rentals, interactive activations, screens, booths, production support, and custom setups across Jordan.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    icons: [
      { src: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { src: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { src: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
