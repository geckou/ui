'use client'

import type { CSSProperties } from 'react'
import type { FormValidationStore } from '@geckou/ui-core'
import { formatDateValue, MESSAGES } from '@geckou/ui-core'
import { DatePicker } from './DatePicker'
import { ErrorMessage } from './ErrorMessage'
import { useRegisterValidation } from '../hooks/useFormValidation'
import { COLOR } from '../constants'

export type DateRange = {
  start: string
  end: string
}

type Props = {
  /** 各入力の name は `<name>Start` / `<name>End` になる */
  name: string
  /** 制御コンポーネントとして使う。省略時は空の範囲から始まる */
  value?: DateRange
  onChange?: (newValue: DateRange) => void
  isDisabled?: boolean
  isRequired?: boolean
  /** useFormValidation() が返す store。渡すとフォーム全体の検証状態に参加する */
  formValidationStore?: FormValidationStore | null
  minDate?: string
  maxDate?: string
  size?: 'small' | 'medium'
  type?: 'date' | 'month'
}

const EMPTY_RANGE: DateRange = { start: '', end: '' }

// props は Vue 版（DateRangePicker.vue）と揃えている。
// 同じフォームを Vue / React で書き換えられるようにするため、
// フィールド名（start / end）と min/max の連動も合わせる。
export function DateRangePicker({
  name,
  value = EMPTY_RANGE,
  onChange,
  isDisabled,
  isRequired,
  formValidationStore,
  minDate = '',
  maxDate = '',
  size = 'medium',
  type = 'date',
}: Props) {
  // min / max はネイティブの入力にしか効かないので、年月日欄から
  // 開始 > 終了 を入力しても弾かれない。ここで範囲そのものを検証する。
  // 比較の前に正規化する（'2024-1-5' のような値をそのまま文字列比較すると
  // '2024-1-5' > '2024-01-06' が真になり、判定が狂う）
  const normalizedStart = formatDateValue(value.start, type)
  const normalizedEnd = formatDateValue(value.end, type)
  const isRangeValid = !(
    normalizedStart &&
    normalizedEnd &&
    normalizedStart > normalizedEnd
  )

  useRegisterValidation(formValidationStore, `${name}Range`, isRangeValid)

  const handleStartChange = (newValue: string) =>
    onChange?.({ start: newValue, end: value.end })

  const handleEndChange = (newValue: string) =>
    onChange?.({ start: value.start, end: newValue })

  const style = {
    '--range-background-color': COLOR.white,
    '--range-border-color': COLOR.gray,
  } as CSSProperties

  return (
    // 角丸・区切り線は :first-child / :last-child で割り当てるため、
    // ErrorMessage を同じ階層に置くとエラー表示時だけ枠の見た目が変わる。
    // 入力群を内側にまとめ、ErrorMessage は外側（relative）に置く
    <div style={style} className="relative">
      <div className="flex bg-(--range-background-color) [&>*]:flex-auto [&>*]:rounded-none! [&>*:first-child]:rounded-s-[calc(var(--bv,0.375rem)/2)]! [&>*:last-child]:rounded-e-[calc(var(--bv,0.375rem)/2)]! [&>*:not(:last-child)]:border-e [&>*:not(:last-child)]:border-(--range-border-color)">
        <DatePicker
          name={`${name}Start`}
          value={value.start}
          isDisabled={isDisabled}
          isRequired={isRequired}
          formValidationStore={formValidationStore}
          minDate={minDate}
          // 終了日より後は選べない
          maxDate={normalizedEnd || maxDate}
          size={size}
          type={type}
          onChange={handleStartChange}
        />
        <div className="flex flex-none! items-center px-[var(--bv,0.375rem)]">
          〜
        </div>
        <DatePicker
          name={`${name}End`}
          value={value.end}
          isDisabled={isDisabled}
          isRequired={isRequired}
          formValidationStore={formValidationStore}
          // 開始日より前は選べない
          minDate={normalizedStart || minDate}
          maxDate={maxDate}
          size={size}
          type={type}
          onChange={handleEndChange}
        />
      </div>
      <ErrorMessage
        errorMessages={isRangeValid ? undefined : [MESSAGES.startAfterEnd]}
      />
    </div>
  )
}
