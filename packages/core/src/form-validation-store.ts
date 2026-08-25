export type FormValidationSnapshot = {
  /** 登録済みの入力がすべて有効か */
  isAllValid: boolean
  /** 無効になっている入力の name 一覧 */
  invalidNames: string[]
}

export type FormValidationStore = {
  /** 入力の状態を登録・更新する */
  setValid: (name: string, isValid: boolean) => void
  /** 個別の入力が有効か（未登録なら true） */
  isValid: (name: string) => boolean
  /** 管理対象から外す（アンマウント時など） */
  remove: (name: string) => void
  /** すべての状態を破棄する */
  reset: () => void
  /**
   * 現在のスナップショット。
   * 状態が変わらない限り同一参照を返すため、React の useSyncExternalStore に
   * そのまま渡せる（参照が変わり続けると無限再描画になる）。
   */
  getSnapshot: () => FormValidationSnapshot
  /** 変更通知を購読する。戻り値を呼ぶと解除される */
  subscribe: (listener: () => void) => () => void
}

/**
 * フォーム内の各入力のバリデーション状態をまとめて管理する。
 *
 * フレームワークに依存しない。
 * Vue は `subscribe` を `onMounted` / `onUnmounted` で、
 * React は `useSyncExternalStore(store.subscribe, store.getSnapshot)` で繋ぐ。
 *
 * ```ts
 * const store = createFormValidationStore()
 * store.setValid('startedOn', false)
 * store.getSnapshot() // { isAllValid: false, invalidNames: ['startedOn'] }
 * ```
 */
export function createFormValidationStore(): FormValidationStore {
  const states = new Map<string, boolean>()
  const listeners = new Set<() => void>()

  let snapshot: FormValidationSnapshot = { isAllValid: true, invalidNames: [] }

  const buildSnapshot = (): FormValidationSnapshot => {
    const invalidNames: string[] = []

    states.forEach((isValid, name) => {
      if (!isValid) invalidNames.push(name)
    })

    return { isAllValid: invalidNames.length === 0, invalidNames }
  }

  const notify = () => {
    const next = buildSnapshot()

    // 内容が同じなら参照を据え置き、不要な再描画を起こさない
    const isSame =
      next.isAllValid === snapshot.isAllValid &&
      next.invalidNames.length === snapshot.invalidNames.length &&
      next.invalidNames.every((name, index) => name === snapshot.invalidNames[index])

    if (isSame) return

    snapshot = next
    listeners.forEach(listener => listener())
  }

  return {
    setValid(name, isValid) {
      if (states.get(name) === isValid) return

      states.set(name, isValid)
      notify()
    },

    isValid(name) {
      return states.get(name) ?? true
    },

    remove(name) {
      if (!states.delete(name)) return

      notify()
    },

    reset() {
      if (states.size === 0) return

      states.clear()
      notify()
    },

    getSnapshot() {
      return snapshot
    },

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
