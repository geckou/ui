import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// ルートの vite.config.mts（デモサイト用）を拾わないよう、この階層で完結させる
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      // core は dist を参照するため、ビルド前だと解決できない
      '@geckou/ui-core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern-compiler' },
    },
  },
  test: {
    root: __dirname,
    include: ['tests/**/*.test.ts'],
    environment: 'jsdom',
  },
})
