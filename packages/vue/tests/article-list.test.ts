// ?_embed を付けないレスポンスでは _embedded が存在しないため、
// 著者の参照でクラッシュしないこと・空の著者ブロックを描画しないことを保証する
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StandardCard from '@/components/ArticleList/Card/Standard.vue'
import NewsCard from '@/components/ArticleList/Card/News.vue'
import GenericArticleList from '@/components/ArticleList/GenericArticleList.vue'
import MetadataList from '@/components/ArticleList/Parts/MetadataList.vue'
import CardHeading from '@/components/ArticleList/Parts/CardHeading.vue'
import CategoryList from '@/components/ArticleList/Parts/CategoryList.vue'
import ThumbnailImage from '@/components/ArticleList/Parts/ThumbnailImage.vue'
import { returnAuthor } from '@/scripts/utils'
import type { Article, PostConfig } from '@/types'

const postConfig: PostConfig = {
  article_page_path: '/article/',
  query_key_name: 'article',
  author: true,
  category: true,
  tag: true,
}

const baseArticle = {
  id: 1,
  date: '2026-08-25T00:00:00',
  title: { rendered: '記事タイトル' },
  excerpt: { rendered: '<p>抜粋</p>' },
  categories: [],
}

const mountCard = (article: Article) =>
  mount(StandardCard, {
    props: {
      article,
      path: 'https://example.com/article/?article=1',
      isPickUpItem: false,
      postConfig,
      categories: [],
    },
  })

describe('returnAuthor', () => {
  it('_embedded が無くても undefined を返す', () => {
    expect(returnAuthor(baseArticle as Article)).toBeUndefined()
  })

  it('author が空配列でも undefined を返す', () => {
    expect(
      returnAuthor({ ...baseArticle, _embedded: { author: [] } } as Article)
    ).toBeUndefined()
  })

  it('著者があれば取り出す', () => {
    const article = {
      ...baseArticle,
      _embedded: {
        author: [
          {
            name: '執筆者',
            avatar_urls: { '96': 'https://example.com/a.png' },
          },
        ],
      },
    } as Article

    expect(returnAuthor(article)?.name).toBe('執筆者')
  })
})

describe('ArticleList のカード', () => {
  // 修正前は article._embedded.author[0] を直接辿っており、ここで throw していた
  it('_embedded が無くてもクラッシュしない', () => {
    expect(() => mountCard(baseArticle as Article)).not.toThrow()
  })

  it('著者が無いときは著者ブロックを描画しない', () => {
    const wrapper = mountCard(baseArticle as Article)

    expect(wrapper.find('img[alt$="thumbnail"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('執筆者')
  })

  it('著者があれば描画する', () => {
    const article = {
      ...baseArticle,
      _embedded: {
        author: [
          {
            name: '執筆者',
            avatar_urls: { '96': 'https://example.com/a.png' },
          },
        ],
      },
    } as Article
    const wrapper = mountCard(article)

    expect(wrapper.text()).toContain('執筆者')
  })

  it('postConfig.author が false なら著者があっても描画しない', () => {
    const article = {
      ...baseArticle,
      _embedded: { author: [{ name: '執筆者' }] },
    } as Article
    const wrapper = mount(StandardCard, {
      props: {
        article,
        path: '',
        isPickUpItem: false,
        postConfig: { ...postConfig, author: false },
        categories: [],
      },
    })

    expect(wrapper.text()).not.toContain('執筆者')
  })
})

describe('ThumbnailImage', () => {
  const withMedia = (sizes: Record<string, { source_url: string }>) =>
    ({
      ...baseArticle,
      _embedded: {
        'wp:featuredmedia': [{ alt_text: '', media_details: { sizes } }],
      },
    }) as unknown as Article

  // 修正前は sizes?.[type].source_url で、指定サイズが無いと
  // TypeError になり一覧全体が描画されなくなっていた
  it('thumbnail が無くても throw せず full を使う', () => {
    const wrapper = mount(ThumbnailImage, {
      props: {
        article: withMedia({
          full: { source_url: 'https://example.com/f.jpg' },
        }),
      },
    })

    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('srcset')).toBe(
      'https://example.com/f.jpg 1024w, https://example.com/f.jpg 640w'
    )
  })

  it('サイズが 1 つも無ければ NoImage を出す', () => {
    const wrapper = mount(ThumbnailImage, {
      props: { article: withMedia({}) },
    })

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('thumbnail があればそれを使う', () => {
    const wrapper = mount(ThumbnailImage, {
      props: {
        article: withMedia({
          full: { source_url: 'https://example.com/f.jpg' },
          thumbnail: { source_url: 'https://example.com/t.jpg' },
        }),
      },
    })

    expect(wrapper.find('img').attributes('srcset')).toBe(
      'https://example.com/f.jpg 1024w, https://example.com/t.jpg 640w'
    )
  })
})

describe('CardHeading', () => {
  // 回帰(#57): WP REST の title.rendered は HTML エンコード済みで返るため、
  // テキスト描画すると &amp; や &#8217; がそのまま画面に出ていた
  it('HTML エンティティをデコードして表示する', () => {
    const wrapper = mount(CardHeading, {
      props: { heading: 'A &amp; B &#8217;24' },
    })

    expect(wrapper.find('h2').text()).toBe('A & B \u201924')
  })

  it('title.rendered の HTML を描画する（excerpt と同じ扱い）', () => {
    const wrapper = mount(CardHeading, {
      props: { heading: '<em>強調</em>つきの見出し' },
    })

    expect(wrapper.find('h2 em').text()).toBe('強調')
  })
})

describe('CategoryList', () => {
  const categoryData = [
    { id: '1', name: 'デザイン' },
    { id: '2', name: '技術' },
  ]

  // 回帰: 厳密等価で比べていたため、WP REST の数値 ID をそのまま渡すと
  // 例外も出さずに黙って空になっていた
  it('数値の categoryIds でもカテゴリ名を描画する', () => {
    const wrapper = mount(CategoryList, {
      props: { categoryIds: [1, 2], categoryData },
    })

    expect(wrapper.text()).toContain('デザイン')
    expect(wrapper.text()).toContain('技術')
  })

  it('数値の Category.id でも文字列の categoryIds と一致する', () => {
    const wrapper = mount(CategoryList, {
      props: {
        categoryIds: ['1'],
        categoryData: [{ id: 1, name: 'デザイン' }],
      },
    })

    expect(wrapper.text()).toContain('デザイン')
  })
})

// 全体レビューで見つかったバグのリグレッションテスト
describe('MetadataList / CategoryList の空要素', () => {
  it('引き当てられない categoryIds では空の li を描かない', () => {
    const wrapper = mount(CategoryList, {
      props: { categoryIds: [1, 2, 3], categoryData: [] },
    })

    // categoryData を渡し忘れると、ID の数だけ空の li が出ていた
    expect(wrapper.findAll('li')).toHaveLength(0)
    expect(wrapper.find('ul').exists()).toBe(false)
  })

  it('MetadataList は空文字を除外する', () => {
    const wrapper = mount(MetadataList, {
      props: { metadata: ['', 'デザイン', ''] },
    })

    expect(wrapper.findAll('li').map((li) => li.text())).toEqual(['デザイン'])
  })

  it('MetadataList のアイコンは icon.name の変更に追従する', async () => {
    const wrapper = mount(MetadataList, {
      props: { metadata: ['デザイン'], icon: { name: 'FolderIcon' } },
    })

    const first = wrapper.find('svg').html()

    await wrapper.setProps({ icon: { name: 'TagIcon' } })

    expect(wrapper.find('svg').html()).not.toBe(first)
  })
})

describe('カードの属性と theme', () => {
  const article = {
    ...baseArticle,
    title: { rendered: '記事タイトル' },
  } as Article

  it('News カードは isPickUpItem を DOM 属性として落とさない', () => {
    const wrapper = mount(NewsCard, {
      props: {
        article,
        path: '/article/1',
        isPickUpItem: true,
        postConfig,
        categories: [],
      },
    })

    expect(wrapper.find('a').attributes('ispickupitem')).toBeUndefined()
  })

  it("theme='grid' で Grid カードを描く", () => {
    const wrapper = mount(GenericArticleList, {
      props: {
        articles: [article],
        theme: 'grid' as const,
        categories: [],
        columnNumber: 4,
        settings: {
          domainToUse: '',
          isEnabledPickUp: false,
          postConfig,
        },
      },
    })

    // switch に grid が無く、黙って Standard になっていた
    expect(wrapper.findComponent({ name: 'Grid' }).exists()).toBe(true)
  })
})
