import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// ライブラリビルド。dist に実体（index.js / index.d.ts / style.css）を出す。
//
// 以前は src をそのまま dist へコピーしていたが、package.json の main が指す
// dist/index.js が存在せず、パッケージ名での import が解決できなかった（#8）。
export default defineConfig({
  plugins: [
    vue(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      // src の構造を保ったまま .d.ts を出す（エイリアスは相対パスへ書き換えられる）
      entryRoot: resolve(__dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      // 利用側が持つものはバンドルしない
      external: ['vue', 'date-fns', /^@geckou\/ui-core/],
      output: {
        // 単一バンドルだと、名前付き import でも全コンポーネントが利用側の
        // バンドルに入る。ファイル構造を保って tree-shaking を効かせる
        // （React 版と同じ方針）
        preserveModules: true,
        preserveModulesRoot: resolve(__dirname, 'src'),
        entryFileNames: '[name].js',
        assetFileNames: 'style.css',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
