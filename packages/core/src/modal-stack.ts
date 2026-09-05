/**
 * 開いているモーダルの重なり順。
 *
 * ModalBox は Escape / Tab のハンドラを `document` に bubble で登録するため、
 * モーダルを重ねると全部のハンドラが同じイベントを受け取る。実行順は DOM の
 * 深さではなく登録順で決まる（React は onClose の同一性が変わると再登録されて
 * 順序が入れ替わり、React の effect は子から先に走る）ので、順序には頼れない。
 *
 * そこで「誰が最前面か」をここで判定する。決め手は DOM の包含関係。
 * 入れ子のモーダルは内側が外側の中に描画されるので、他のレイヤーを内包している
 * ものは外側だと分かる。互いに内包しない（入れ子でない）モーダルが並んだときだけ、
 * 後から開いたものを最前面とする。
 *
 * 呼び出し側は 1 コンポーネント 1 ハンドルを持ち、表示状態と自分の要素を
 * `toggle()` に渡して、アンマウント時に `release()` する。
 */

/**
 * 包含判定しか使わないので、DOM の型は要求しない
 * （core をフレームワーク・実行環境から独立に保つため。lib に DOM を足さない）。
 * メソッド記法なので引数は双変になり、`HTMLElement` をそのまま渡せる
 */
type ElementLike = {
  contains(other: ElementLike | null): boolean
}

type Layer = { element: ElementLike | null }

const layers: Layer[] = []

function contains(layer: Layer, other: Layer): boolean {
  return Boolean(
    layer.element && other.element && layer.element.contains(other.element)
  )
}

export type ModalLayer = {
  /**
   * 引数の真偽で登録・解除を切り替える。
   * `element` には最前面判定に使う要素（ダイアログ本体）を渡す。
   * 省略可にすると `toggle(true)` だけで要素の無いレイヤーが積まれ、
   * 包含判定が効かなくなるので必須にしている（未取得なら明示的に null）
   */
  toggle: (shouldBeActive: boolean, element: ElementLike | null) => void
  /** このレイヤーが最前面か。キーイベントを処理してよいのは true のときだけ */
  isTopmost: () => boolean
  /** アンマウント時に呼ぶ。登録中なら解除する */
  release: () => void
}

export function createModalLayer(): ModalLayer {
  const layer: Layer = { element: null }
  let isActive = false

  const toggle = (shouldBeActive: boolean, element: ElementLike | null) => {
    // 要素は再描画で差し替わりうるので、状態が変わらなくても取り直す
    layer.element = shouldBeActive ? element : null

    if (isActive === shouldBeActive) return

    isActive = shouldBeActive

    if (shouldBeActive) {
      layers.push(layer)

      return
    }

    const index = layers.lastIndexOf(layer)

    if (index >= 0) layers.splice(index, 1)
  }

  const isTopmost = () => {
    if (!isActive) return false

    // 他のレイヤーを内包しているものは「外側」なので候補から外す
    const innermost = layers.filter(
      (candidate) =>
        !layers.some(
          (other) => other !== candidate && contains(candidate, other)
        )
    )

    return innermost[innermost.length - 1] === layer
  }

  return { toggle, isTopmost, release: () => toggle(false, null) }
}
