import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// デモサイト（GitHub Pages）用の設定
// 独自ドメイン（https://ui.geckou.net/）のルート公開なので base は / 。
// リポジトリ配下（geckou.github.io/ui/）へ出す場合は BASE_PATH=/ui/ を指定
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  root: resolve(__dirname, 'demo'),
  base,
  plugins: [vue()],

  server: {
    host: '0.0.0.0',
    port: 5555,
  },

  optimizeDeps: {
    include: ['vue'],
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'packages/vue/src'),
      '~demo': resolve(__dirname, 'demo'),
      // core は dist を参照するため、ビルド前だと解決できない。
      // デモはワークスペースのソースを直接使う（yarn dev / build:demo の双方に効く）
      '@geckou/ui-core': resolve(__dirname, 'packages/core/src/index.ts'),
    },
  },

  build: {
    outDir: resolve(__dirname, 'demo-dist'),
    emptyOutDir: true,
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
})
