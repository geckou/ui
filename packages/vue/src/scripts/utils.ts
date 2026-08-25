import type { Article, PostConfig, WpAuthor, WpTerm } from '@/types'

export const generateQueryObject = (url: string): Record<string, string> => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g
  const queryObject: Record<string, string> = {}

  for (let match; (match = regex.exec(url)) !== null; ) {
    queryObject[match[1]] = match[2]
  }

  return queryObject
}

/**
 * 投稿の著者を取り出す。
 * _embedded は ?_embed を付けていないレスポンスでは存在しないため、
 * 各カードで直接辿らずここを通す
 */
export const returnAuthor = (articleObject: Article): WpAuthor | undefined =>
  articleObject?._embedded?.author?.[0]

export const returnTagList = (articleObject: Article): string[] => {
  const terms = articleObject?.['_embedded']?.['wp:term']?.[1] ?? []
  return terms.map((tag: WpTerm) => tag.name)
}

export const returnArticlePath = (postConfig: PostConfig, domain: string, articleId: string | number) => {
  // ドメイン末尾とパス先頭のスラッシュが重ならないようにする
  const base = String(domain).replace(/\/+$/, '')
  const path = String(postConfig.article_page_path ?? '').replace(/^\/+/, '')

  return `https://${base}/${path}?${postConfig.query_key_name}=${articleId}`
}

/**
 * 各カードは postConfig.author / category / tag を参照するが、
 * 設定側では useAuthor / useCategory / useTag で渡すこともできるため両対応させる
 */
export const normalizePostConfig = (postConfig: PostConfig): PostConfig => ({
  ...postConfig,
  author  : postConfig?.author ?? postConfig?.useAuthor ?? false,
  category: postConfig?.category ?? postConfig?.useCategory ?? false,
  tag     : postConfig?.tag ?? postConfig?.useTag ?? false,
})
