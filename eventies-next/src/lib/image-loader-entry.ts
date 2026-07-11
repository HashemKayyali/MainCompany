'use client'

// next/image custom loader entry (ADR-08). Must be a default-exported function
// with the ({src,width,quality}) signature; it delegates to the ported,
// URL-parity builder in image-loader.ts. Marked 'use client' because next/image
// imports the loader into client bundles.
import eventiesImageLoader from './image-loader'

export default eventiesImageLoader
