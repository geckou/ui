import { resolve } from 'path'
import { defineConfig, type Plugin } from 'vite'
import dts from 'vite-plugin-dts'

// 'use client' を出力にも残す。
//
// esbuild / rollup はモジュール先頭のディレクティブを変換の途中で落とすため、
// 何もしないと Next.js の Server Component から使えないパッケージになる
// （useState を持つコンポーネントが「Client Component ではない」と判定される）。
// 変換前のソースで印を付けておき、そのモジュールを含むチャンクの先頭に書き戻す。
function preserveUseClient(): Plugin {
  const clientModules = new Set<string>()

  return {
    name: 'preserve-use-client',
    enforce: 'pre',

    transform(code, id) {
      const directive = /^\s*(['"])use client\1;?[ \t]*\r?\n?/

      if (!directive.test(code)) return null

      clientModules.add(id)

      // ディレクティブはここで落とす。残したまま渡すと rollup が
      // 「バンドル時にエラーになるので無視した」と 1 モジュールずつ警告し、
      // 本物の警告が埋もれる。renderChunk でチャンクの先頭に書き戻す
      return { code: code.replace(directive, ''), map: null }
    },

    renderChunk(code, chunk) {
      const ids = Object.keys(chunk.modules)

      if (!ids.some((id) => clientModules.has(id))) return null

      return { code: `'use client'\n${code}`, map: null }
    },
  }
}

// ライブラリビルド。dist に実体（index.js / index.d.ts）を出す。
//
// 以前はソースをそのまま配布し、利用側に transpilePackages での変換を要求していた。
// 利用側の構成に依存するうえ、ui-core / ui-vue と方針が揃っていなかったため、
// 3 パッケージとも dist を配る形に統一した（#8）。
export default defineConfig({
  plugins: [
    preserveUseClient(),
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      entryRoot: resolve(__dirname, 'src'),
      insertTypesEntry: true,
    }),
  ],

  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      // 'use client' は preserveUseClient で意図的に残しているので、
      // それを「無視した」と言う警告（約 25 件）は出さない。
      // 埋もれると本物の警告に気付けなくなる
      // 利用側が持つものはバンドルしない
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        /^@geckou\/ui-core/,
      ],
      output: {
        // ファイル構造を保つ。1 ファイルにまとめると 'use client' が落ちて、
        // Next.js の Server Component から使えなくなる（22 ファイルが持っている）。
        // 分けておけば、ディレクティブを持たないアイコン等はサーバー側で描画できる
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
