// ?_embed を付けないレスポンスでは _embedded が存在しないため、
// 著者の参照でクラッシュしないこと・空の著者ブロックを描画しないことを保証する
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import StandardCard from '@/components/ArticleList/Card/Standard.vue'
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
    expect(returnAuthor({ ...baseArticle, _embedded: { author: [] } } as Article)).toBeUndefined()
  })

  it('著者があれば取り出す', () => {
    const article = {
      ...baseArticle,
      _embedded: { author: [{ name: '執筆者', avatar_urls: { '96': 'https://example.com/a.png' } }] },
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
      _embedded: { author: [{ name: '執筆者', avatar_urls: { '96': 'https://example.com/a.png' } }] },
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
