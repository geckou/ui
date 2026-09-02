import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// __dirname の代替
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// dist フォルダ
const targetDir = path.resolve(__dirname, '../dist')
// エイリアスの定義
const alias = '@/'

// 再帰的にファイルを処理する関数
function processDirectory(dir) {
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      processDirectory(fullPath)
    } else if (
      file.endsWith('.vue') ||
      file.endsWith('.ts') ||
      file.endsWith('.js')
    ) {
      replaceAlias(fullPath)
    }
  }
}

// ファイル内のエイリアスを相対パスに変換する関数
function replaceAlias(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const updatedContent = content.replace(
    new RegExp(`(['"])${alias}`, 'g'),
    (match, quote) => {
      const relativePath =
        path.relative(path.dirname(filePath), targetDir) || '.'
      return `${quote}${relativePath}/`
    }
  )

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf-8')
    console.log(`Updated: ${filePath}`)
  } else {
    console.log(`No changes: ${filePath}`)
  }
}

// 実行
processDirectory(targetDir)
console.log('dist 内のエイリアスを相対パスに変換しました！')
