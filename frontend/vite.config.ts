import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/skimbleshanks/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        exclude: ['node_modules/', 'src/test/setup.ts'],
        thresholds: {
          lines: 80,
          functions: 75,
          branches: 80,
          statements: 80
        }
      },
  },
  server: {
    port: 3000,
  }
})
