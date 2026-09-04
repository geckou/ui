/**
 * ダイアログ内にフォーカスを閉じ込める（フォーカストラップ）。
 *
 * `aria-modal="true"` を出していても、背景を `inert` にしていない限り
 * Tab / Shift+Tab はダイアログの外の要素へ抜けていく。モーダルの必須要件なので、
 * Vue / React どちらの ModalBox からも同じロジックを使う（scroll-lock と同じ配置）。
 *
 * 使い方は `keydown` を受けて `handleTabKey(container, event, document.activeElement)`
 * に渡すだけ。Tab 以外のキーと、コンテナが無い場合は何もしない。
 */

/** フォーカス可能な要素のセレクタ。`tabindex="-1"` はプログラム用なので除く */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

/**
 * DOM の型を要求しない（core をフレームワーク・実行環境から独立に保つため。
 * lib に DOM を足さない）。実体は HTMLElement だが、必要な部分だけを構造的に受ける
 */
export type FocusableLike = {
  focus: () => void
  hasAttribute?: (name: string) => boolean
  closest?: (selectors: string) => unknown
  matches?: (selectors: string) => boolean
  checkVisibility?: () => boolean
}

export type FocusTrapContainer = FocusableLike & {
  querySelectorAll: (selectors: string) => ArrayLike<FocusableLike>
}

export type FocusTrapEvent = {
  key: string
  shiftKey: boolean
  preventDefault: () => void
}

/**
 * コンテナ内のフォーカス可能な要素を、DOM 順（= Tab 順）で返す。
 *
 * セレクタだけでは「実際にはフォーカスできない要素」が混ざる。
 * 混ざると端の要素が no-op になって Tab が止まるか、preventDefault を挟んだ後に
 * ブラウザ既定の移動が起きてダイアログの外へ抜けるため、ここで落とす。
 *
 * - `inert` 配下（閉じた SlideDownUi / DropdownUi の中身）。自身の属性だけでは足りない
 * - `<fieldset disabled>` 配下（`:disabled` は継承する。`:not([disabled])` では消せない）
 * - `display: none` で描画されていないもの（`hidden` な TabUI のパネルの中身など）。
 *   引数なしの `checkVisibility()` は `visibility: hidden` / `opacity: 0` は落とさない
 *
 * `closest` / `matches` / `checkVisibility` は任意（`FocusableLike` は DOM 型を
 * 要求しない）。持たない実装では従来どおりの結果になる
 */
export function getFocusableElements(
  container: FocusTrapContainer | null
): FocusableLike[] {
  if (!container) return []

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      // closest を持たない実装のために、自身の inert も見る（DOM では冗長）
      !element.hasAttribute?.('inert') &&
      !element.closest?.('[inert]') &&
      !element.matches?.(':disabled') &&
      (element.checkVisibility?.() ?? true)
  )
}

/**
 * Tab / Shift+Tab を受けて、コンテナの端で折り返す。
 *
 * @param container ダイアログ本体（`role="dialog"` の要素）
 * @param event `keydown` のイベント
 * @param activeElement 現在フォーカスされている要素（`document.activeElement`）
 * @returns フォーカスを移動して既定動作を止めたなら `true`
 */
export function handleTabKey(
  container: FocusTrapContainer | null,
  event: FocusTrapEvent,
  activeElement?: unknown
): boolean {
  if (event.key !== 'Tab' || !container) return false

  const focusable = getFocusableElements(container)

  if (focusable.length === 0) {
    // フォーカスできる要素が無いなら、外へ抜けさせないために Tab ごと止める
    event.preventDefault()
    container.focus()

    return true
  }

  const first = focusable[0]!
  const last = focusable[focusable.length - 1]!
  const active = activeElement as FocusableLike | null | undefined
  const index = active ? focusable.indexOf(active) : -1
  // 開いた直後はダイアログ自身にフォーカスがある（tabindex="-1"）
  const isContainerItself = active === container

  if (event.shiftKey) {
    // 先頭・ダイアログ自身・トラップの外にいるなら末尾へ回す
    if (index === 0 || isContainerItself || index === -1) {
      event.preventDefault()
      last.focus()

      return true
    }

    return false
  }

  // ダイアログ自身からの Tab はブラウザ既定で先頭へ進むので触らない
  if (isContainerItself) return false

  // 末尾・トラップの外にいるなら先頭へ回す
  if (index === -1 || index === focusable.length - 1) {
    event.preventDefault()
    first.focus()

    return true
  }

  return false
}
