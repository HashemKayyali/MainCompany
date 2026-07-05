/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/__tests__/**/*.test.ts', 'src/**/__tests__/**/*.test.tsx'],
    // The prerender script and Supabase edge functions are not part
    // of the client test surface.
    exclude: ['node_modules', 'dist', 'supabase/functions', 'scripts'],
    css: false,
  },
})
