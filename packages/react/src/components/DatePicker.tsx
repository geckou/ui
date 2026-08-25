'use client'

import type { CSSProperties } from 'react'
import type { DateObject, InputBoxStyleForEachStatus } from '../types'
import {
  MESSAGES,
  composeDateValue,
  formatDateValue,
  splitDate,
  validateDateObject,
} from '@geckou/ui-core'
import { useEffect, useRef, useState } from 'react'
import { InputBox } from './InputBox'
import { ErrorMessage } from './ErrorMessage'
import { CalendarIcon } from './icons/CalendarIcon'
import { COLOR } from '../constants'

type Props = {
  name: string
  value?: string
  onChange?: (newValue: string) => void
  cssStyle?: InputBoxStyleForEachStatus
  isDisabled?: boolean
  isRequired?: boolean
  minDate?: string
  maxDate?: string
  size?: 'small' | 'medium'
  type?: 'date' | 'month'
}

export function DatePicker({
  name,
  value,
  onChange,
  cssStyle,
  isDisabled,
  isRequired,
  minDate = '',
  maxDate = '',
  size = 'medium',
  type = 'date',
}: Props) {
  const [dateValue, setDateValue] = useState(() =>
    value ? formatDateValue(value, type) : '',
  )
  const [dateObject, setDateObject] = useState<DateObject>(() =>
    value ? splitDate(formatDateValue(value, type)) : { year: '', month: '', day: '' },
  )
  const [errorMessage, setErrorMessage] = useState('')

  // 元実装（vue-ui）はマウント時にしか value を読まず、親からの更新に追従しなかった。
  // prop が実際に変わったときだけ同期する（内部編集を上書きしないため）
  const lastValueProp = useRef(value)

  useEffect(() => {
    if (lastValueProp.current === value) return
    lastValueProp.current = value

    const normalized = value ? formatDateValue(value, type) : ''
    setDateValue(normalized)
    setDateObject(splitDate(normalized))
  }, [value, type])

  const validateInput = (newValue: string) => {
    if (!newValue && isRequired)
      {return { isValid: false, message: MESSAGES.required }}
    return { isValid: true, message: '' }
  }

  const validateObject = (object: DateObject) =>
    validateDateObject(object, { type, isRequired })

  const handleDateValueChange = (newValue: string) => {
    setDateValue(newValue)
    setDateObject(splitDate(newValue))
    const { message } = validateInput(newValue)
    setErrorMessage(message)
    onChange?.(newValue)
  }

  const handleObjectChange = (key: keyof DateObject, newValue: string) => {
    const next = { ...dateObject, [key]: newValue }
    setDateObject(next)
    const { isValid, message } = validateObject(next)
    setErrorMessage(message)

    if (isValid) {
      const joined = composeDateValue(next, type)
      setDateValue(joined)
      onChange?.(joined)
    }
  }

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
      <div className="relative flex-none" style={iconStyle}>
        <CalendarIcon
          className={`pointer-events-none absolute inset-y-0 left-[var(--sp-small,0.375rem)] m-auto fill-(--icon-color) ${isSmall ? 'size-[var(--icon-small,0.9375rem)]' : 'size-[var(--icon-medium,1.125rem)]'}`}
        />
        <input
          type={type}
          name={name}
          value={dateValue}
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
          maxLength={2}
          type="text"
          disabled={isDisabled}
          onChange={(event) => handleObjectChange('day', event.target.value)}
          className={`w-[calc(var(--sp-medium,0.75rem)*2+3ch)]! ${textInputClass}`}
        />
      )}
      <ErrorMessage errorMessages={errorMessage ? [errorMessage] : undefined} />
    </InputBox>
  )
}
