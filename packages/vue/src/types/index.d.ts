export type StateVariation = 'default' | 'error' | 'disabled' | 'valid' | 'focus' | 'hover'

export type BorderStyle = {
  color: string
  size: string
  radius: string
}

export type BaseStyle = {
  textColor?: string
  backgroundColor?: string
  border?: BorderStyle
  boxShadow?: string
}

export type StyleForEachStatus<T> = Partial<Record<StateVariation, T>> & {
  default: T
}

// InputBoxStyle
export type InputBoxStyle = BaseStyle & {
  placeholderColor?: string
}

export type InputBoxStyleForEachStatus = StyleForEachStatus<InputBoxStyle>

// ButtonStyle
export type ButtonStyle = BaseStyle & {
  backgroundImage?: string
}

export type ButtonStyleForEachStatus = StyleForEachStatus<ButtonStyle>

// CheckBoxStyle
export type CheckBoxStyle = Pick<BaseStyle, 'textColor' | 'border' | 'backgroundColor'>
export type CheckBoxStyleForEachStatus = StyleForEachStatus<CheckBoxStyle>

// RadioButtonStyle
export type RadioButtonStyle = {
  border?: Omit<BorderStyle, 'radius'>
  backgroundColor?: string
}

export type RadioButtonStyleForEachStatus = StyleForEachStatus<RadioButtonStyle>

// Option
export type Option = {
  label: string
  value: SelectValue
  order?: number
  isDisabled?: boolean
}

// Validate
type Validate = {
  regex: RegExp
  message: string
}

export type Validates = Validate[]
// ---------------------------------------------
// ArticleList
// ---------------------------------------------
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
