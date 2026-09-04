/**
 * ページ全体のスクロールロック。
 *
 * モーダルを重ねても解除順で壊れないよう、ロック数をカウントする。
 * 最初のロックで元の `overflow` と `padding-right` を控え、最後の解除で戻す
 * （無条件に `''` にすると、アプリ側が持っていたインラインの値が消える）。
 *
 * スクロールバーが常時表示される環境（デスクトップの Windows / Linux など）では、
 * `overflow: hidden` にした瞬間にバーの幅ぶんページが広がって内容が横へずれる。
 * 最初のロックでその幅を `padding-right` として足し、最後の解除で元へ戻す。
 * 利用側の CSS で `html { scrollbar-gutter: stable }` を使っているならこの補正は
 * 0px になる（`window.innerWidth` と `clientWidth` が一致するため）。
 *
 * 呼び出し側は 1 コンポーネント 1 ハンドルを持ち、表示状態を `toggle()` に渡して、
 * アンマウント時に `release()` する。同じハンドルから同じ状態を二度要求しても
 * 数え間違えない。
 */
let lockCount = 0
let previousOverflow = ''
let previousPaddingRight = ''

/**
 * 触るのは body の overflow / padding-right と、スクロールバー幅の算出だけなので、
 * DOM の型は要求しない
 * （core をフレームワーク・実行環境から独立に保つため。lib に DOM を足さない）
 */
type BodyLike = { style: { overflow: string; paddingRight: string } }

type GlobalLike = {
  document?: { body?: BodyLike; documentElement?: { clientWidth?: number } }
  innerWidth?: number
}

function getGlobal(): GlobalLike {
  return globalThis as GlobalLike
}

function getBody(): BodyLike | null {
  // SSR では document が無い（Nuxt / Next.js のサーバー側）
  return getGlobal().document?.body ?? null
}

/**
 * 常時表示のスクロールバーが占めている幅。
 * オーバーレイ表示（macOS の既定・モバイル）や `scrollbar-gutter: stable` では 0 になる。
 */
function getScrollbarWidth(): number {
  const global = getGlobal()
  const innerWidth = global.innerWidth
  const clientWidth = global.document?.documentElement?.clientWidth

  if (typeof innerWidth !== 'number' || typeof clientWidth !== 'number')
    return 0

  const width = innerWidth - clientWidth

  return width > 0 ? width : 0
}

export type ScrollLock = {
  /** 引数の真偽でロック・解除を切り替える。同じ状態の連続呼び出しは無視される */
  toggle: (shouldLock: boolean) => void
  /** アンマウント時に呼ぶ。ロック中なら解除する */
  release: () => void
}

export function createScrollLock(): ScrollLock {
  let isLocked = false

  const toggle = (shouldLock: boolean) => {
    const body = getBody()

    if (!body || isLocked === shouldLock) return

    isLocked = shouldLock
    lockCount += shouldLock ? 1 : -1

    if (lockCount === 1 && shouldLock) {
      previousOverflow = body.style.overflow
      previousPaddingRight = body.style.paddingRight
      body.style.overflow = 'hidden'

      const scrollbarWidth = getScrollbarWidth()

      if (scrollbarWidth > 0) {
        // 既にインラインの padding-right があれば単位が分からないので calc で足す
        body.style.paddingRight = previousPaddingRight
          ? `calc(${previousPaddingRight} + ${scrollbarWidth}px)`
          : `${scrollbarWidth}px`
      }
    } else if (lockCount <= 0) {
      lockCount = 0
      body.style.overflow = previousOverflow
      body.style.paddingRight = previousPaddingRight
    }
  }

  return { toggle, release: () => toggle(false) }
}
