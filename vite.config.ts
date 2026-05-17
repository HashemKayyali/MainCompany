import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
  },
  esbuild: {
    pure: ['console.log', 'console.debug', 'console.trace'],
    drop: ['debugger'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined

          if (
            id.includes('react-dom') ||
            id.includes('react-router-dom') ||
            id.includes('react-router') ||
            id.includes('@remix-run') ||
            id.includes('scheduler') ||
            id.includes('history') ||
            id.includes('use-sync-external-store') ||
            id.includes('react/') ||
            id.includes('\\react\\') ||
            id.includes('/react/')
          ) {
            return 'vendor-react'
          }

          if (id.includes('framer-motion') || id.includes('lenis')) {
            return 'vendor-motion'
          }

          if (id.includes('@supabase')) {
            return 'vendor-supabase'
          }

          if (id.includes('lucide-react')) {
            return 'vendor-icons'
          }

          if (id.includes('@dicebear')) {
            return 'vendor-avatar'
          }

          return 'vendor-misc'
        },
      },
    },
  },
})
