// ?_embed を付けないレスポンスでは _embedded が存在しないため、
// 著者の参照でクラッシュしないこと・空の著者ブロックを描画しないことを保証する
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StandardCard from '@/components/ArticleList/Card/Standard.vue'
import CardHeading from '@/components/ArticleList/Parts/CardHeading.vue'
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
