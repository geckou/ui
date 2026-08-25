import { computed, reactive } from 'vue'
import type { ComputedRef } from 'vue'

/**
 * フォーム内の各入力コンポーネントのバリデーション状態をまとめて管理する。
 *
 * ```ts
 * const manager = new FormValidationManager()
 * // <DatePicker name="startedOn" :formValidationManager="manager" />
 * const canSubmit = manager.isAllValid
 * ```
 */
export class FormValidationManager {
  private readonly states: Record<string, boolean>

  /** 登録済みの入力がすべて有効かどうか */
  readonly isAllValid: ComputedRef<boolean>

  /** 無効になっている入力の name 一覧 */
  readonly invalidNames: ComputedRef<string[]>

  constructor() {
    this.states = reactive<Record<string, boolean>>({})
    this.isAllValid = computed(() => Object.values(this.states).every(Boolean))
    this.invalidNames = computed(() => Object.entries(this.states)
      .filter(([, isValid]) => !isValid)
      .map(([name]) => name))
  }

  /** 入力の状態を登録・更新する */
  setValid(name: string, isValid: boolean): void {
    this.states[name] = isValid
  }

  /** 個別の入力が有効かどうか（未登録なら true） */
  isValid(name: string): boolean {
    return this.states[name] ?? true
  }

  /** 管理対象から外す（コンポーネントのアンマウント時など） */
  remove(name: string): void {
    delete this.states[name]
  }

  /** すべての状態を破棄する */
  reset(): void {
    Object.keys(this.states).forEach(name => delete this.states[name])
  }
}
