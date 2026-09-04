// @vitest-environment node
//
// SSR（Nuxt など）でサーバー側の描画が通ることを確認する。
// jsdom 環境だと document が存在してしまい再現しないため、この 1 ファイルだけ node で走らせる。
import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import RadioButtons from '@/components/RadioButtons.vue'
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

  // 回帰: id をモジュールスコープの連番で振っていたため、サーバーはプロセス内で
  // 増え続け、クライアントは 1 から始まって hydration 不一致になっていた。
  // useId() は同じアプリ構成なら SSR と client で同じ値を返す
  it('同じ描画なら id が毎回同じになる（hydration 不一致を作らない）', async () => {
    const render = () =>
      renderToString(
        createSSRApp({
          render: () =>
            h(RadioButtons, {
              modelValue: '',
              options: [{ label: '個人', value: 'personal' }],
            }),
        })
      )

    const [first, second] = await Promise.all([render(), render()])
    const nameOf = (html: string) => /name="([^"]+)"/.exec(html)?.[1]

    expect(nameOf(first)).toBeTruthy()
    expect(nameOf(first)).toBe(nameOf(second))
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
