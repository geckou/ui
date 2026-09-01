export const REPOSITORY_URL = 'https://github.com/geckou/ui'

export const NPM_URL = 'https://www.npmjs.com/package/@geckou/ui-vue'
export const NPM_CORE_URL = 'https://www.npmjs.com/package/@geckou/ui-core'
export const NPM_REACT_URL = 'https://www.npmjs.com/package/@geckou/ui-react'

/** リポジトリ内のファイルへのリンクを作る */
export const sourceUrl = (path: string) => `${REPOSITORY_URL}/blob/production/${path}`

/** フォーム系コンポーネントのソースパス */
export const componentSource = (name: string) =>
  `packages/vue/src/components/${name}.vue`

/** 記事一覧コンポーネントのソースパス（テーマ名は Standard / Gallery など） */
export const listSource = (name: string) =>
  `packages/vue/src/components/ArticleList/List/${name}.vue`
