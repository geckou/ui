'use client'

/**
 * チェック / ラジオの選択アニメーション用 keyframes。
 *
 * コンポーネントごとに素の <style> を描くと、N 個置いたときに N 個の
 * <style> が DOM に入る。React 19 は href を持つ <style> を <head> へ
 * hoist し、同じ href なら 1 つにまとめるので、何個描いても DOM 上は 1 つになる。
 *
 * tokens.css へ移さないのは、あれが「読み込まなくても動く」既定値の
 * ファイルであり、読み込まない利用側でアニメーションが消えるため
 */

export function CheckPopKeyframes() {
  return (
    <style href="geckou-ui-check-pop" precedence="default">
      {
        '@keyframes uiCheckPop{0%{scale:1}10%{scale:.8}50%{scale:1.1}100%{scale:1}}'
      }
    </style>
  )
}

export function RadioPopKeyframes() {
  return (
    <style href="geckou-ui-radio-pop" precedence="default">
      {
        '@keyframes uiRadioPop{0%{scale:1}10%{scale:.8}50%{scale:1.2}100%{scale:1}}'
      }
    </style>
  )
}
