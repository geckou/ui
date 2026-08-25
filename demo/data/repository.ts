export const REPOSITORY_URL = 'https://github.com/geckou/ui'
export const NPM_URL = 'https://www.npmjs.com/package/@geckou/ui-vue'

/** リポジトリ内のファイルへのリンクを作る */
export const sourceUrl = (path: string) => `${REPOSITORY_URL}/blob/main/${path}`

/** フォーム系コンポーネントのソースパス */
export const componentSource = (name: string) => `src/components/${name}.vue`

/** 記事一覧コンポーネントのソースパス（テーマ名は Standard / Gallery など） */
export const listSource = (name: string) => `src/components/ArticleList/List/${name}.vue`
