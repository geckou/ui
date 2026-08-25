// フォーム部品の型は @geckou/ui-core が正。Vue / React で共通のため、ここでは再エクスポートのみ行う
export type {
  StateVariation,
  BorderStyle,
  BaseStyle,
  StyleForEachStatus,
  InputBoxStyle,
  InputBoxStyleForEachStatus,
  ButtonStyle,
  ButtonStyleForEachStatus,
  CheckBoxStyle,
  CheckBoxStyleForEachStatus,
  RadioButtonStyle,
  RadioButtonStyleForEachStatus,
  SelectValue,
  Option,
  Validate,
  Validates,
  InputValue,
  DateObject,
  DateType,
  ValidationResult,
} from '@geckou/ui-core'

// ArticleList は Vue のみの機能のため、型もこのパッケージで持つ
export type Category = {
  id: string
  name: string
}

export type PostConfig = {
  article_page_path: string
  query_key_name: string
  useAuthor?: boolean
  useCategory?: boolean
  useTag?: boolean
  /** useAuthor のエイリアス（カード内部で参照される） */
  author?: boolean
  /** useCategory のエイリアス（カード内部で参照される） */
  category?: boolean
  /** useTag のエイリアス（カード内部で参照される） */
  tag?: boolean
}

export type ListSettings = {
  domainToUse: string
  postConfig: PostConfig
  isEnabledPickUp: boolean
}

/** WordPress REST API のレンダリング済みフィールド */
export type RenderedField = {
  rendered: string
}

/** _embedded['wp:term'] の要素 */
export type WpTerm = {
  id: string | number
  name: string
  taxonomy?: string
}

/** _embedded['author'] の要素 */
export type WpAuthor = {
  name: string
  avatar_urls?: Record<string, string>
}

/** _embedded['wp:featuredmedia'] の要素 */
export type WpMedia = {
  alt_text?: string
  media_details?: {
    sizes?: Record<string, { source_url?: string }>
  }
}

/**
 * WordPress REST API（?_embed 付き）の投稿。
 * 実際のレスポンスは環境ごとにフィールドが増減するため、既知のフィールドのみ定義する
 */
export type Article = {
  id: string | number
  date: string
  title: RenderedField
  excerpt: RenderedField
  categories?: string[]
  _embedded?: {
    author?: WpAuthor[]
    'wp:featuredmedia'?: WpMedia[]
    'wp:term'?: WpTerm[][]
  }
  [key: string]: unknown
}
