'use client'

import type { CSSProperties } from 'react'
import type { FormValidationStore } from '@geckou/ui-core'
import { MESSAGES } from '@geckou/ui-core'
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
  // 開始 > 終了 を入力しても弾かれない。ここで範囲そのものを検証する
  const isRangeValid = !(value.start && value.end && value.start > value.end)

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
    <div
      style={style}
      className="relative flex bg-(--range-background-color) [&>*]:flex-auto [&>*]:rounded-none! [&>*:first-child]:rounded-s-[calc(var(--bv,0.375rem)/2)]! [&>*:last-child]:rounded-e-[calc(var(--bv,0.375rem)/2)]! [&>*:not(:last-child)]:border-e [&>*:not(:last-child)]:border-(--range-border-color)"
    >
      <DatePicker
        name={`${name}Start`}
        value={value.start}
        isDisabled={isDisabled}
        isRequired={isRequired}
        formValidationStore={formValidationStore}
        minDate={minDate}
        // 終了日より後は選べない
        maxDate={value.end || maxDate}
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
        minDate={value.start || minDate}
        maxDate={maxDate}
        size={size}
        type={type}
        onChange={handleEndChange}
      />
      <ErrorMessage
        errorMessages={isRangeValid ? undefined : [MESSAGES.startAfterEnd]}
      />
    </div>
  )
}
