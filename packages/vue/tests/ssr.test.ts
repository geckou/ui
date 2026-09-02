// @vitest-environment node
//
// SSR（Nuxt など）でサーバー側の描画が通ることを確認する。
// jsdom 環境だと document が存在してしまい再現しないため、この 1 ファイルだけ node で走らせる。
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ModalBox from '@/components/ModalBox.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'

describe('SSR', () => {
  it('document を持たない環境でも ModalBox を描画できる', async () => {
    expect(typeof document).toBe('undefined')

    const html = await renderToString(
      createSSRApp({ render: () => h(ModalBox, { isShown: false }) })
    )

    expect(html).toContain('<div')
  })

  it('DropdownUi / SlideDownUi も描画できる', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => [h(DropdownUi), h(SlideDownUi)],
      })
    )

    expect(html).toContain('<div')
  })
})
