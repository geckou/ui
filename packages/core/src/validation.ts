import type { InputValue, Validates } from './types'
import { MESSAGES } from './constants'

/**
 * 入力が空かどうか。
 *
 * 数値 0 や文字列 '0' は正当な入力なので空とみなさない。
 * truthy 判定（`!value`）を使うと 0 が必須エラーになる。
 */
export function isEmptyValue(value: InputValue): boolean {
  return value === '' || value === null || value === undefined
}

/**
 * validates の各 RegExp を値に適用し、一致しなかったものの message を返す。
 *
 * `g` / `y` フラグ付きの RegExp は `.test()` の呼び出しで `lastIndex` が変異し、
 * 2 回目以降の判定結果が変わる。呼び出し側が渡したオブジェクトを変異させないよう、
 * 毎回同じ source / flags のクローンを作って判定する。
 * 新規インスタンスは lastIndex = 0 なので、sticky の意味を保ったまま結果が安定する。
 */
export function runValidates(value: InputValue, validates: Validates): string[] {
  if (isEmptyValue(value)) return []

  return validates
    .filter((validate) => {
      const regex = new RegExp(validate.regex.source, validate.regex.flags)
      return !regex.test(String(value))
    })
    .map((validate) => validate.message)
}

/**
 * 必須チェックと validates をまとめて適用する。
 * TextBox / TextArea 等の入力部品はこれを呼ぶだけでよい。
 */
export function validateInputValue(
  value: InputValue,
  options: { isRequired?: boolean; validates?: Validates } = {}
): string[] {
  const { isRequired = false, validates = [] } = options

  if (isEmptyValue(value)) return isRequired ? [MESSAGES.required] : []

  return runValidates(value, validates)
}
