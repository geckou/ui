'use client'

import { useEffect, useMemo, useSyncExternalStore } from 'react'
import { createFormValidationStore } from '@geckou/ui-core'
import type { FormValidationStore } from '@geckou/ui-core'

export type UseFormValidationResult = {
  /** 登録済みの入力がすべて有効かどうか */
  isAllValid: boolean
  /** 無効になっている入力の name 一覧 */
  invalidNames: string[]
  /** 入力の状態を登録・更新する */
  setValid: FormValidationStore['setValid']
  /** 管理対象から外す */
  remove: FormValidationStore['remove']
  /** すべての状態を破棄する */
  reset: FormValidationStore['reset']
  /** 子コンポーネントへ直接渡すためのストア本体 */
  store: FormValidationStore
}

/**
 * フォーム内の各入力のバリデーション状態をまとめて管理する。
 *
 * 状態そのものは @geckou/ui-core の createFormValidationStore が持つため、
 * 判定ロジックは Vue 実装（@geckou/ui-vue の FormValidationManager）と共有される。
 *
 * ```tsx
 * const { isAllValid, store } = useFormValidation()
 * // <DatePicker name="startedOn" formValidationStore={store} />
 * <button disabled={!isAllValid}>送信</button>
 * ```
 */
export function useFormValidation(): UseFormValidationResult {
  const store = useMemo(() => createFormValidationStore(), [])
  const snapshot = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    // SSR 時は登録がまだ無いので、すべて有効なスナップショットを返す
    store.getSnapshot,
  )

  return {
    isAllValid: snapshot.isAllValid,
    invalidNames: snapshot.invalidNames,
    setValid: store.setValid,
    remove: store.remove,
    reset: store.reset,
    store,
  }
}

/**
 * 入力コンポーネント側から検証結果をストアへ通知する。
 * アンマウント時には登録を解除し、無効判定が残らないようにする。
 */
export function useRegisterValidation(
  store: FormValidationStore | null | undefined,
  name: string,
  isValid: boolean,
): void {
  useEffect(() => {
    store?.setValid(name, isValid)
  }, [store, name, isValid])

  useEffect(() => {
    return () => store?.remove(name)
  }, [store, name])
}
