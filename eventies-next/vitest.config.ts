import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node', // jsdom per-file via // @vitest-environment jsdom
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
    css: false,
    server: {
      deps: {
        // next-intl's dist imports bare 'next/server' (exports-map form) that
        // Node ESM can't resolve when externalized — process it through Vite.
        inline: ['next-intl', 'use-intl'],
      },
    },
  },
  resolve: {
    alias: {
      // 'server-only' throws outside RSC; tests exercise server modules directly.
      'server-only': path.resolve(__dirname, 'test/mocks/server-only.ts'),
      // next-intl's dist imports bare 'next/server'; node ESM needs the .js form.
      'next/server': path.resolve(__dirname, 'node_modules/next/server.js'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
