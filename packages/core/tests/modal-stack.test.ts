import { describe, expect, it } from 'vitest'
import { createModalLayer } from '../src/modal-stack.js'

/**
 * node 環境なので DOM は使わない。包含判定だけを持つ最小の要素を用意する
 * （`children` に入れたものを子孫とみなす）
 */
type FakeElement = {
  children: FakeElement[]
  contains(other: FakeElement | null): boolean
}

function createElement(...children: FakeElement[]): FakeElement {
  return {
    children,
    contains(other) {
      if (!other) return false
      if (other === this) return true

      return this.children.some((child) => child.contains(other))
    },
  }
}

describe('createModalLayer', () => {
  it('登録していないレイヤーは最前面にならない', () => {
    const layer = createModalLayer()

    expect(layer.isTopmost()).toBe(false)

    layer.toggle(true, createElement())
    expect(layer.isTopmost()).toBe(true)

    layer.release()
    expect(layer.isTopmost()).toBe(false)
  })

  // 回帰: 入れ子のモーダルで内側の Escape が外側まで閉じていた
  it('入れ子では内側だけが最前面になる（登録順に依存しない）', () => {
    const inner = createElement()
    const outer = createElement(inner)

    // React は effect を子から先に走らせるため、内側が先に登録されることがある
    const innerLayer = createModalLayer()
    const outerLayer = createModalLayer()

    innerLayer.toggle(true, inner)
    outerLayer.toggle(true, outer)

    expect(innerLayer.isTopmost()).toBe(true)
    expect(outerLayer.isTopmost()).toBe(false)

    // 内側を閉じたら外側が最前面へ戻る
    innerLayer.release()
    expect(outerLayer.isTopmost()).toBe(true)

    outerLayer.release()
  })

  it('入れ子でないモーダルが並んだときは後から開いた方が最前面', () => {
    const first = createModalLayer()
    const second = createModalLayer()

    first.toggle(true, createElement())
    second.toggle(true, createElement())

    expect(second.isTopmost()).toBe(true)
    expect(first.isTopmost()).toBe(false)

    second.release()
    expect(first.isTopmost()).toBe(true)

    first.release()
  })

  it('同じ状態を二度渡しても数え間違えない', () => {
    const layer = createModalLayer()
    const element = createElement()

    layer.toggle(true, element)
    layer.toggle(true, element)
    layer.toggle(false)

    expect(layer.isTopmost()).toBe(false)

    // 一段しか積まれていないので、別のレイヤーがすぐ最前面になる
    const other = createModalLayer()
    other.toggle(true, createElement())
    expect(other.isTopmost()).toBe(true)

    other.release()
  })
})
