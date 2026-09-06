// keyframes の hoist だけを見るテスト。
//
// React が <head> へ hoist した <style> は root.unmount() では消えず、
// 同じ href を一度挿入した記録も残るため、手で取り除いても再挿入されない。
// 「描画前は 0 件」から確かめるには、まだ何も描画していないドキュメントが要る。
// vitest はファイルごとに環境を分けるので、この検証だけ別ファイルにしている
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { CheckBox, CheckButton, RadioButtons } from '../src'

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean
}

globalThis.IS_REACT_ACT_ENVIRONMENT = true

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

const stylesFor = (keyframe: string) =>
  [...document.querySelectorAll('style')].filter((style) =>
    style.textContent?.includes(keyframe)
  )

// 回帰: コンポーネントごとに素の <style> を描いていたため、
// N 個置くと N 個の <style> が DOM に入っていた
describe('keyframes の hoist', () => {
  it('描画前は 0 件、CheckBox / CheckButton を何個置いても 1 つ', () => {
    expect(stylesFor('uiCheckPop')).toHaveLength(0)

    act(() => {
      root.render(
        <>
          <CheckBox name="a" checked onChange={() => {}} />
          <CheckBox name="b" checked onChange={() => {}} />
          <CheckBox name="c" checked onChange={() => {}} />
          <CheckButton name="d" checked onChange={() => {}} />
        </>
      )
    })

    expect(stylesFor('uiCheckPop')).toHaveLength(1)
    // hoist 先は <head>。コンポーネントの隣には描かれない
    expect(document.head.contains(stylesFor('uiCheckPop')[0]!)).toBe(true)
    expect(container.querySelector('style')).toBeNull()
  })

  it('描画前は 0 件、RadioButtons を複数置いても 1 つ', () => {
    expect(stylesFor('uiRadioPop')).toHaveLength(0)

    const options = [{ label: 'a', value: 'a' }]

    act(() => {
      root.render(
        <>
          <RadioButtons name="r1" options={options} value="a" />
          <RadioButtons name="r2" options={options} value="a" />
        </>
      )
    })

    expect(stylesFor('uiRadioPop')).toHaveLength(1)
    expect(document.head.contains(stylesFor('uiRadioPop')[0]!)).toBe(true)
    expect(container.querySelector('style')).toBeNull()
  })
})
