// 修正前は srcset を `${['48']} 640w` と組み立てており、配列リテラルを
// 文字列化していた（640w の候補が「48 640w」になっていた）
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthorInfo from '@/components/ArticleList/Parts/AuthorInfo.vue'

const mountAuthorInfo = (avatarUrls: Record<string, string> | null) =>
  mount(AuthorInfo, { props: { avatarUrls, name: '執筆者' } })

describe('AuthorInfo', () => {
  it('96 / 48 の URL から srcset を組み立てる', () => {
    const wrapper = mountAuthorInfo({
      '48': 'https://example.com/48.png',
      '96': 'https://example.com/96.png',
    })
    const img = wrapper.find('img')

    expect(img.attributes('src')).toBe('https://example.com/96.png')
    expect(img.attributes('srcset')).toBe(
      'https://example.com/96.png 1024w, https://example.com/48.png 640w'
    )
  })

  it('48 しか無ければ src も 48 にフォールバックする', () => {
    const wrapper = mountAuthorInfo({ '48': 'https://example.com/48.png' })
    const img = wrapper.find('img')

    expect(img.attributes('src')).toBe('https://example.com/48.png')
    expect(img.attributes('srcset')).toBe('https://example.com/48.png 640w')
  })

  it('URL が 1 つも無ければ img を描画しない', () => {
    expect(mountAuthorInfo({}).find('img').exists()).toBe(false)
    expect(mountAuthorInfo(null).find('img').exists()).toBe(false)
  })
})
