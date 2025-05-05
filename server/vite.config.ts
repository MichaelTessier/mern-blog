import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['**/**.test.{js,ts}'],
    coverage: {
      provider: 'v8',
      reporter: ['html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
  },
})