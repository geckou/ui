/**
 * ページ全体のスクロールロック。
 *
 * モーダルを重ねても解除順で壊れないよう、ロック数をカウントする。
 * 最初のロックで元の `overflow` を控え、最後の解除で戻す
 * （無条件に `''` にすると、アプリ側が持っていたインラインの `overflow` が消える）。
 *
 * 呼び出し側は 1 コンポーネント 1 ハンドルを持ち、表示状態を `toggle()` に渡して、
 * アンマウント時に `release()` する。同じハンドルから同じ状態を二度要求しても
 * 数え間違えない。
 */
let lockCount = 0
let previousOverflow = ''

/**
 * 触るのは body の overflow だけなので、DOM の型は要求しない
 * （core をフレームワーク・実行環境から独立に保つため。lib に DOM を足さない）
 */
type BodyLike = { style: { overflow: string } }

function getBody(): BodyLike | null {
  // SSR では document が無い（Nuxt / Next.js のサーバー側）
  const doc = (globalThis as { document?: { body?: BodyLike } }).document

  return doc?.body ?? null
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
      body.style.overflow = 'hidden'
    } else if (lockCount <= 0) {
      lockCount = 0
      body.style.overflow = previousOverflow
    }
  }

  return { toggle, release: () => toggle(false) }
}
