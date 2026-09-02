'use client'

import type { CSSProperties } from 'react'
import type { FormValidationStore } from '@geckou/ui-core'
import { useState } from 'react'
import { DatePicker } from './DatePicker'
import { COLOR } from '../constants'

type DateRange = {
  startDate: string
  endDate: string
}

type Props = {
  /** 入力の名前。`<name>Start` / `<name>End` として使う（省略時は startDate / endDate） */
  name?: string
  isDisabled?: boolean
  isRequired?: boolean
  /** useFormValidation() が返す store。渡すとフォーム全体の検証状態に参加する */
  formValidationStore?: FormValidationStore | null
  onChange?: (newValue: DateRange) => void
}

export function DateRangePicker({
  name,
  isDisabled,
  isRequired,
  formValidationStore,
  onChange,
}: Props) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // 既定の名前は従来と同じ startDate / endDate のままにする（input の name が変わるため）
  const startName = name ? `${name}Start` : 'startDate'
  const endName = name ? `${name}End` : 'endDate'

  const handleStartChange = (newValue: string) => {
    setStartDate(newValue)
    onChange?.({ startDate: newValue, endDate })
  }

  const handleEndChange = (newValue: string) => {
    setEndDate(newValue)
    onChange?.({ startDate, endDate: newValue })
  }

  const style = {
    '--range-background-color': COLOR.white,
    '--range-border-color': COLOR.gray,
  } as CSSProperties

  return (
    <div
      style={style}
      className="flex bg-(--range-background-color) [&>*]:flex-auto [&>*]:rounded-none! [&>*:first-child]:rounded-s-[calc(var(--bv,0.375rem)/2)]! [&>*:last-child]:rounded-e-[calc(var(--bv,0.375rem)/2)]! [&>*:not(:last-child)]:border-e [&>*:not(:last-child)]:border-(--range-border-color)"
    >
      <DatePicker
        value={startDate}
        name={startName}
        isDisabled={isDisabled}
        isRequired={isRequired}
        formValidationStore={formValidationStore}
        maxDate={endDate}
        onChange={handleStartChange}
      />
      <div className="flex flex-none! items-center px-[var(--bv,0.375rem)]">
        〜
      </div>
      <DatePicker
        value={endDate}
        name={endName}
        isDisabled={isDisabled}
        isRequired={isRequired}
        formValidationStore={formValidationStore}
        minDate={startDate}
        onChange={handleEndChange}
      />
    </div>
  )
}
