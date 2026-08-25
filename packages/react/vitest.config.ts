import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

// ルートの vite.config.mts（デモサイト用）を拾わないよう、この階層で完結させる
export default defineConfig({
  resolve: {
    alias: {
      // core は dist を参照するため、ビルド前だと解決できない。
      // 同一リポジトリなのでソースを直接使う
      '@geckou/ui-core': resolve(__dirname, '../core/src/index.ts'),
    },
  },
  test: {
    root: __dirname,
    include: ['tests/**/*.test.tsx'],
    environment: 'jsdom',
  },
})
