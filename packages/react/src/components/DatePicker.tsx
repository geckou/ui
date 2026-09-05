'use client'

import type { CSSProperties } from 'react'
import type { FormValidationStore } from '@geckou/ui-core'
import type { DateObject, InputBoxStyleForEachStatus } from '../types'
import {
  MESSAGES,
  composeDateValue,
  formatDateValue,
  splitDate,
  validateDateObject,
} from '@geckou/ui-core'
import { useEffect, useId, useRef, useState } from 'react'
import { InputBox } from './InputBox'
import { ErrorMessage } from './ErrorMessage'
import { CalendarIcon } from './icons/CalendarIcon'
import { useRegisterValidation } from '../hooks/useFormValidation'
import { COLOR } from '../constants'

type Props = {
  name: string
  value?: string
  onChange?: (newValue: string) => void
  cssStyle?: InputBoxStyleForEachStatus
  isDisabled?: boolean
  isRequired?: boolean
  /** useFormValidation() が返す store。渡すとフォーム全体の検証状態に参加する */
  formValidationStore?: FormValidationStore | null
  minDate?: string
  maxDate?: string
  size?: 'small' | 'medium'
  type?: 'date' | 'month'
  /**
   * 年月日それぞれの読み上げ名の土台。「の年」「の月」「の日」を後ろに繋げる。
   * 可視ラベルがあるなら ariaLabelledBy でその要素を指すこと。
   * どちらも無いときだけ name を使う（機械名でも無いよりはマシ）
   */
  ariaLabel?: string
  ariaLabelledBy?: string
}

export function DatePicker({
  name,
  value,
  onChange,
  cssStyle,
  isDisabled,
  isRequired,
  formValidationStore,
  minDate = '',
  maxDate = '',
  size = 'medium',
  type = 'date',
  ariaLabel,
  ariaLabelledBy,
}: Props) {
  const [dateValue, setDateValue] = useState(() =>
    value ? formatDateValue(value, type) : ''
  )
  const [dateObject, setDateObject] = useState<DateObject>(() =>
    value
      ? splitDate(formatDateValue(value, type))
      : { year: '', month: '', day: '' }
  )
  const [errorMessage, setErrorMessage] = useState('')
  // 年月日欄（DateSelector）側の妥当性。カレンダー入力では常に true
  const [isObjectValid, setIsObjectValid] = useState(true)

  // prop が実際に変わったときだけ同期する（内部編集を上書きしないため）
  const lastValueProp = useRef(value)

  useEffect(() => {
    if (lastValueProp.current === value) {
      return
    }
    lastValueProp.current = value

    const normalized = value ? formatDateValue(value, type) : ''
    setDateValue(normalized)
    setDateObject(splitDate(normalized))
    // 親から値を入れ直したら、前の不正入力の判定を持ち越さない
    setIsObjectValid(true)
  }, [value, type])

  const validateInput = (newValue: string) => {
    if (!newValue && isRequired) {
      return { isValid: false, message: MESSAGES.required }
    }
    return { isValid: true, message: '' }
  }

  const validateObject = (object: DateObject) =>
    validateDateObject(object, { type, isRequired })

  const handleDateValueChange = (newValue: string) => {
    setDateValue(newValue)
    setDateObject(splitDate(newValue))
    const { message } = validateInput(newValue)
    setErrorMessage(message)
    // カレンダー入力は不正な日付を作れないので、年月日欄の判定は解除する
    setIsObjectValid(true)
    onChange?.(newValue)
  }

  const handleObjectChange = (key: keyof DateObject, newValue: string) => {
    const next = { ...dateObject, [key]: newValue }
    setDateObject(next)
    const { isValid, message } = validateObject(next)
    setErrorMessage(message)
    setIsObjectValid(isValid)

    if (isValid) {
      const joined = composeDateValue(next, type)
      setDateValue(joined)
      onChange?.(joined)
    }
  }

  // 年月日欄の不正値（月 13 等）はエラー文言を出すだけで、登録する validity は
  // 必須の空欄しか見ていなかったため isAllValid が true のままだった。
  // Vue 版（DatePicker.vue）は validateObject の結果を setValid している
  useRegisterValidation(
    formValidationStore,
    name,
    validateInput(dateValue).isValid && isObjectValid
  )

  // ariaLabelledBy を渡されたときは、その可視ラベルと「年 / 月 / 日」を並べて読ませる
  // （aria-labelledby は文字列を足せないので、単位だけを持つ要素を用意して連結する）
  const unitLabelId = useId()
  const fieldLabelProps = (unit: '年' | '月' | '日' | 'カレンダー') =>
    ariaLabelledBy
      ? { 'aria-labelledby': `${ariaLabelledBy} ${unitLabelId}-${unit}` }
      : { 'aria-label': `${ariaLabel ?? name}の${unit}` }

  const isSmall = size === 'small'
  const textInputClass = `flex-none! ${isSmall ? 'px-[var(--sp-small,0.375rem)]! py-[var(--sp-min,0.1875rem)]! text-[length:var(--fs-small,0.6875rem)]' : 'p-[var(--sp-medium,0.75rem)]!'}`
  const iconStyle = { '--icon-color': COLOR.blue } as CSSProperties

  return (
    <InputBox
      cssStyle={cssStyle}
      isDisabled={isDisabled}
      isErrored={!!errorMessage}
      className={`flex w-full items-center leading-none ${isSmall ? 'h-[calc(var(--bv,0.375rem)*5)] px-[var(--sp-min,0.1875rem)]' : 'h-[calc(var(--bv,0.375rem)*6)] px-[var(--sp-small,0.375rem)]'}`}
    >
      {/*
        カレンダー起動用の入力は opacity-0 で重ねている。アイコン側に
        フォーカスリングを出さないと、キーボード操作で「見えない・輪郭も出ない」
        タブ停止点になる（InputBox が *:focus の outline を消しているため）
      */}
      <div
        className="relative flex-none rounded-[var(--radius-small,0.1875rem)] has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-(--icon-color)"
        style={iconStyle}
      >
        <CalendarIcon
          className={`pointer-events-none absolute inset-y-0 left-[var(--sp-small,0.375rem)] m-auto fill-(--icon-color) ${isSmall ? 'size-[var(--icon-small,0.9375rem)]' : 'size-[var(--icon-medium,1.125rem)]'}`}
        />
        <input
          type={type}
          name={name}
          value={dateValue}
          {...fieldLabelProps('カレンダー')}
          max={maxDate}
          min={minDate}
          required={isRequired}
          disabled={isDisabled}
          onChange={(event) => handleDateValueChange(event.target.value)}
          className={`w-[calc(var(--icon-medium,1.125rem)+var(--sp-small,0.375rem)*2)]! cursor-pointer px-[var(--sp-small,0.375rem)]! opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:left-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 ${isSmall ? 'py-[var(--sp-min,0.1875rem)]!' : 'py-[var(--sp-medium,0.75rem)]!'}`}
        />
      </div>
      <input
        value={dateObject.year}
        placeholder="年"
        {...fieldLabelProps('年')}
        maxLength={4}
        type="text"
        disabled={isDisabled}
        onChange={(event) => handleObjectChange('year', event.target.value)}
        className={`w-[calc(var(--sp-medium,0.75rem)*2+5ch)]! ${textInputClass}`}
      />
      /
      <input
        value={dateObject.month}
        placeholder="月"
        {...fieldLabelProps('月')}
        maxLength={2}
        type="text"
        disabled={isDisabled}
        onChange={(event) => handleObjectChange('month', event.target.value)}
        className={`w-[calc(var(--sp-medium,0.75rem)*2+3ch)]! ${textInputClass}`}
      />
      {type === 'date' && <span>/</span>}
      {type === 'date' && (
        <input
          value={dateObject.day}
          placeholder="日"
          {...fieldLabelProps('日')}
          maxLength={2}
          type="text"
          disabled={isDisabled}
          onChange={(event) => handleObjectChange('day', event.target.value)}
          className={`w-[calc(var(--sp-medium,0.75rem)*2+3ch)]! ${textInputClass}`}
        />
      )}
      {ariaLabelledBy && (
        <span className="sr-only">
          <span id={`${unitLabelId}-カレンダー`}>のカレンダー</span>
          <span id={`${unitLabelId}-年`}>の年</span>
          <span id={`${unitLabelId}-月`}>の月</span>
          <span id={`${unitLabelId}-日`}>の日</span>
        </span>
      )}
      <ErrorMessage errorMessages={errorMessage ? [errorMessage] : undefined} />
    </InputBox>
  )
}
