'use client'

import type { KeyboardEvent, ReactNode } from 'react'
import type { InputBoxStyleForEachStatus, Validates } from '../types'
import {
  convertFullWidthToHalfWidth,
  isEmptyValue,
  validateInputValue,
} from '@geckou/ui-core'
import { useEffect, useRef, useState } from 'react'
import { InputBox } from './InputBox'
import { ErrorMessage } from './ErrorMessage'

type InputValue = string | number

type Props = {
  name: string
  value?: InputValue
  onChange?: (newValue: InputValue) => void
  cssStyle?: InputBoxStyleForEachStatus
  inputType?: string
  placeholder?: string
  isDisabled?: boolean
  isRequired?: boolean
  maxLength?: number
  autocomplete?: string
  validates?: Validates
  before?: ReactNode
  after?: ReactNode
  /** input の id。combobox のように外から参照する必要があるときに渡す */
  id?: string
  /**
   * input へそのまま渡す ARIA 属性とキー操作。
   * SearchableSelectBox のような複合ウィジェットから使う（通常は指定しない）
   */
  role?: string
  ariaLabel?: string
  ariaExpanded?: boolean
  ariaControls?: string
  ariaActivedescendant?: string
  ariaAutocomplete?: 'none' | 'inline' | 'list' | 'both'
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
}

export function TextBox({
  name,
  value,
  onChange,
  cssStyle,
  inputType = 'text',
  placeholder = '入力してください',
  isDisabled,
  isRequired,
  maxLength = 30,
  autocomplete = 'off',
  validates = [],
  before,
  after,
  id,
  role,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  ariaActivedescendant,
  ariaAutocomplete,
  onKeyDown,
}: Props) {
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const inputValue = value ?? ''

  const validateValue = () => {
    setErrorMessages(validateInputValue(inputValue, { isRequired, validates }))
  }

  // Vue 版（@geckou/ui-vue）の watch(immediate: !!modelValue) と等価:
  // 初期値ありならマウント時にも検証、以後は値が変化したときのみ検証
  const initialValue = useRef(inputValue)
  const hasChanged = useRef(false)

  useEffect(() => {
    if (!hasChanged.current) {
      if (inputValue === initialValue.current) {
        if (!isEmptyValue(inputValue)) {
          validateValue()
        }
        return
      }
      hasChanged.current = true
    }

    validateValue()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Vue 版（@geckou/ui-vue）同様、値の変化時のみ検証する
  }, [inputValue])

  const isComposing = useRef(false)

  return (
    <InputBox
      cssStyle={cssStyle}
      className="inline-flex [&>input]:flex-auto"
      isErrored={!!errorMessages.length}
      isDisabled={isDisabled}
    >
      {before}
      <input
        type={inputType}
        id={id}
        name={name}
        role={role}
        aria-label={ariaLabel}
        aria-expanded={ariaExpanded}
        aria-controls={ariaControls}
        aria-activedescendant={ariaActivedescendant}
        aria-autocomplete={ariaAutocomplete}
        onKeyDown={onKeyDown}
        value={inputValue}
        required={isRequired}
        placeholder={placeholder}
        disabled={isDisabled}
        autoComplete={autocomplete}
        maxLength={maxLength}
        aria-invalid={errorMessages.length ? 'true' : undefined}
        onChange={(event) => {
          // IME 変換中に全角→半角変換すると未確定文字列が壊れるため、確定後に変換する
          const rawValue = event.target.value
          onChange?.(
            isComposing.current
              ? rawValue
              : convertFullWidthToHalfWidth(rawValue)
          )
        }}
        onCompositionStart={() => {
          isComposing.current = true
        }}
        onCompositionEnd={(event) => {
          isComposing.current = false
          onChange?.(convertFullWidthToHalfWidth(event.currentTarget.value))
        }}
        onBlur={() => validateValue()}
      />
      {after}
      <ErrorMessage
        errorMessages={errorMessages}
        cssStyle={{
          textColor: cssStyle?.error?.backgroundColor,
          backgroundColor: cssStyle?.error?.textColor,
        }}
      />
    </InputBox>
  )
}
