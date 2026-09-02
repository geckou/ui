import type { Category, ListSettings } from '@/types'

const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path}`.replace(/\/{2,}/g, '/')

export const CATEGORIES: Category[] = [
  { id: '1', name: 'デザイン' },
  { id: '2', name: 'エンジニアリング' },
  { id: '3', name: 'カルチャー' },
  { id: '4', name: 'お知らせ' },
]

export const SETTINGS: ListSettings = {
  domainToUse: 'example.com',
  postConfig: {
    article_page_path: '/article/',
    query_key_name: 'article',
    useAuthor: true,
    useCategory: true,
    useTag: true,
  },
  isEnabledPickUp: true,
}

type Seed = {
  title: string
  excerpt: string
  categories: string[]
  tags: string[]
  author: string
  date: string
}

const SEEDS: Seed[] = [
  {
    title: '余白から考えるコンポーネント設計',
    excerpt:
      '同じ部品を別のプロダクトで使い回すとき、最初に壊れるのは色ではなく余白でした。スペーシングをトークン化して破綻を防ぐまでの記録。',
    categories: ['1'],
    tags: ['デザインシステム', 'CSS'],
    author: '野島 省吾',
    date: '2026-07-28T10:00:00',
  },
  {
    title: 'Vue 3 の script setup で props をどう設計するか',
    excerpt:
      'defineProps の型定義だけで済ませるか、withDefaults まで踏み込むか。再利用されるコンポーネントの API を決めるときの判断基準をまとめました。',
    categories: ['2'],
    tags: ['Vue', 'TypeScript'],
    author: '佐藤 みなみ',
    date: '2026-07-14T09:30:00',
  },
  {
    title: '記事一覧に「らしさ」を持たせる 10 のレイアウト',
    excerpt:
      'ニュースサイト、ギャラリー、ブログ。同じ記事データでも並べ方ひとつで受け取られ方は変わります。用途別のレイアウトを比較しました。',
    categories: ['1', '3'],
    tags: ['レイアウト', 'UI'],
    author: '田中 陽一',
    date: '2026-06-30T18:45:00',
  },
  {
    title: 'Container Queries でようやく解けた問題',
    excerpt:
      'ビューポート幅ではなく置かれた場所の幅で切り替える。サイドバーとメインで同じカードを使い回すための実装メモ。',
    categories: ['2'],
    tags: ['CSS', 'レスポンシブ'],
    author: '鈴木 かおり',
    date: '2026-06-12T12:00:00',
  },
  {
    title: 'WordPress REST API から一覧を組み立てる',
    excerpt:
      '_embed を付けるだけでアイキャッチも著者もタームも取得できます。フロント側で扱いやすい形に整えるときの落とし穴も併せて。',
    categories: ['2', '4'],
    tags: ['WordPress', 'API'],
    author: '野島 省吾',
    date: '2026-05-22T08:15:00',
  },
  {
    title: 'フォーム UI のバリデーションは誰のためにあるのか',
    excerpt:
      'エラーを出すタイミング、文言、色。入力を止めないバリデーションを目指して実装を見直した過程を書きました。',
    categories: ['1', '2'],
    tags: ['フォーム', 'アクセシビリティ'],
    author: '佐藤 みなみ',
    date: '2026-05-08T16:20:00',
  },
  {
    title: '写真が主役のページで文字をどう置くか',
    excerpt:
      '画像の上に文字を重ねると、だいたい読みにくくなります。コントラストを確保しながら雰囲気を殺さない方法をいくつか。',
    categories: ['3'],
    tags: ['タイポグラフィ', '写真'],
    author: '田中 陽一',
    date: '2026-04-19T11:05:00',
  },
  {
    title: 'コンポーネントライブラリを社内に定着させる',
    excerpt:
      '作るより難しいのは使ってもらうこと。ドキュメントとデモサイトを整備してから相談の質が変わった話。',
    categories: ['3', '4'],
    tags: ['チーム', 'ドキュメント'],
    author: '鈴木 かおり',
    date: '2026-04-02T14:40:00',
  },
]

const TAG_ID_BASE = 100

const createArticle = (seed: Seed, index: number) => {
  const imageNumber = index + 1
  const image = asset(`images/sample-${imageNumber}.svg`)
  const avatar = asset(`images/avatar-${imageNumber}.svg`)

  return {
    id: String(index + 1),
    date: seed.date,
    link: `https://example.com/article/?article=${index + 1}`,
    slug: `sample-post-${index + 1}`,
    title: { rendered: seed.title },
    excerpt: { rendered: `<p>${seed.excerpt}</p>` },
    content: { rendered: `<p>${seed.excerpt}</p>` },
    categories: seed.categories,
    _embedded: {
      author: [
        {
          name: seed.author,
          avatar_urls: { 24: avatar, 48: avatar, 96: avatar },
        },
      ],
      'wp:featuredmedia': [
        {
          alt_text: seed.title,
          media_details: {
            sizes: {
              full: { source_url: image },
              thumbnail: { source_url: image },
            },
          },
        },
      ],
      'wp:term': [
        seed.categories.map((id) => ({
          id,
          name: CATEGORIES.find((category) => category.id === id)?.name ?? '',
          taxonomy: 'category',
        })),
        seed.tags.map((name, tagIndex) => ({
          id: TAG_ID_BASE + index * 10 + tagIndex,
          name,
          taxonomy: 'post_tag',
        })),
      ],
    },
  }
}

export const ARTICLES = SEEDS.map(createArticle)

/** アイキャッチ無しの表示確認用 */
export const ARTICLES_WITHOUT_IMAGE = ARTICLES.map((article) => ({
  ...article,
  _embedded: { ...article._embedded, 'wp:featuredmedia': [] },
}))
