// CSS は JS から import していない（利用側が @geckou/ui-react/styles/tokens.css として
// 読み込む）ため、Vite のバンドル対象に入らない。dist へそのままコピーする。
import { cp, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const from = resolve(root, 'src/styles/tokens.css')
const to = resolve(root, 'dist/styles/tokens.css')

await mkdir(dirname(to), { recursive: true })
await cp(from, to)

console.log('copied styles/tokens.css -> dist/styles/tokens.css')
