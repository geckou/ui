import { computed, onScopeDispose, shallowRef } from 'vue'
import type { ComputedRef } from 'vue'
import { createFormValidationStore } from '@geckou/ui-core'
import type { FormValidationStore } from '@geckou/ui-core'

/**
 * フォーム内の各入力コンポーネントのバリデーション状態をまとめて管理する。
 *
 * 状態そのものは @geckou/ui-core の createFormValidationStore が持つ。
 * このクラスは Vue のリアクティビティへ繋ぐ薄いラッパーで、
 * 判定ロジックは React 実装（@geckou/ui-react）と共有される。
 *
 * ```ts
 * const manager = new FormValidationManager()
 * // <DatePicker name="startedOn" :formValidationManager="manager" />
 * const canSubmit = manager.isAllValid
 * ```
 */
export class FormValidationManager {
  private readonly store: FormValidationStore

  /** 登録済みの入力がすべて有効かどうか */
  readonly isAllValid: ComputedRef<boolean>

  /** 無効になっている入力の name 一覧 */
  readonly invalidNames: ComputedRef<string[]>

  constructor() {
    this.store = createFormValidationStore()

    const snapshot = shallowRef(this.store.getSnapshot())
    const unsubscribe = this.store.subscribe(() => {
      snapshot.value = this.store.getSnapshot()
    })

    // インスタンスを生成した effect scope の破棄時に購読を解除する
    // （scope の外で生成された場合は何もしない）
    onScopeDispose(unsubscribe, true)

    this.isAllValid = computed(() => snapshot.value.isAllValid)
    this.invalidNames = computed(() => snapshot.value.invalidNames)
  }

  /** 入力の状態を登録・更新する */
  setValid(name: string, isValid: boolean): void {
    this.store.setValid(name, isValid)
  }

  /** 個別の入力が有効かどうか（未登録なら true） */
  isValid(name: string): boolean {
    return this.store.isValid(name)
  }

  /** 管理対象から外す（コンポーネントのアンマウント時など） */
  remove(name: string): void {
    this.store.remove(name)
  }

  /** すべての状態を破棄する */
  reset(): void {
    this.store.reset()
  }
}
