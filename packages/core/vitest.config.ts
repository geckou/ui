import { defineConfig } from 'vitest/config'

// ルートの vite.config.mts（デモサイト用）を拾わないよう、この階層で完結させる
export default defineConfig({
  test: {
    root: __dirname,
    include: ['tests/**/*.test.ts'],
    environment: 'node',
  },
})
