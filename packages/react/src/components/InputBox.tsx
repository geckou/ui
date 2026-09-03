'use client'

import type { CSSProperties, ReactNode } from 'react'
import type {
  StateVariation,
  InputBoxStyle,
  InputBoxStyleForEachStatus,
} from '../types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { INPUT_BOX_DEFAULT_STYLES } from '../constants'

type Props = {
  cssStyle?: InputBoxStyleForEachStatus
  isErrored?: boolean
  isDisabled?: boolean
  className?: string
  children: ReactNode
}

export function InputBox({
  cssStyle,
  isErrored,
  isDisabled,
  className,
  children,
}: Props) {
  const inputBoxRef = useRef<HTMLDivElement>(null)
  const [currentState, setCurrentState] = useState<StateVariation>('default')

  const isErroredRef = useRef(isErrored)
  isErroredRef.current = isErrored

  // 最初の 1 要素だけで判定すると、複数のコントロールを持つ入力
  // （DatePicker の隠し date input + 年月日欄、DateSelector の 3 つの select）で
  // 配色が誤る。全てのコントロールを集めて判定する
  const updateState = useCallback(() => {
    const controls = Array.from(
      inputBoxRef.current?.querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >('input, textarea, select') ?? []
    )

    if (controls.length === 0) {
      return setCurrentState('default')
    }
    if (controls.every((control) => control.matches(':disabled'))) {
      return setCurrentState('disabled')
    }
    if (controls.some((control) => control.matches(':focus'))) {
      return setCurrentState('focus')
    }
    if (
      isErroredRef.current ||
      controls.some((control) => control.matches(':invalid'))
    ) {
      return setCurrentState('error')
    }

    // 充足の判定に :placeholder-shown は使えない（date / select は
    // placeholder を持たないため、空でも「入力済み」と見なされる）
    if (controls.every((control) => control.value !== '')) {
      return setCurrentState('valid')
    }

    setCurrentState('default')
  }, [])

  useEffect(() => {
    const inputBox = inputBoxRef.current
    if (!inputBox) {
      return
    }

    const observer = new MutationObserver(updateState)
    observer.observe(inputBox, { childList: true, subtree: true })
    inputBox.addEventListener('focusin', updateState, true)
    inputBox.addEventListener('blur', updateState, true)

    return () => {
      observer.disconnect()
      inputBox.removeEventListener('focusin', updateState, true)
      inputBox.removeEventListener('blur', updateState, true)
    }
  }, [updateState])

  // Vue 版（@geckou/ui-vue）はマウント時に状態判定せず、初回の focus / blur まで default を維持する
  const isFirstRender = useRef(true)
  const prevDisabled = useRef(isDisabled)

  useEffect(() => {
    const isDisabledChanged = prevDisabled.current !== isDisabled
    prevDisabled.current = isDisabled

    if (isFirstRender.current) {
      isFirstRender.current = false
      if (isDisabled) {
        setCurrentState('disabled')
      }
      return
    }

    if (isDisabledChanged) {
      return setCurrentState(isDisabled ? 'disabled' : 'default')
    }

    updateState()
  }, [isDisabled, isErrored, updateState])

  const cssStylesUsed = { ...INPUT_BOX_DEFAULT_STYLES, ...cssStyle }
  const currentCssStyle: InputBoxStyle =
    cssStylesUsed[currentState] ?? cssStylesUsed.default

  const style = {
    '--text-color': currentCssStyle.textColor,
    '--placeholder-color': currentCssStyle.placeholderColor,
    '--background-color': currentCssStyle.backgroundColor,
    '--radius-size': currentCssStyle.border?.radius || '.25rem',
    '--input-box-shadow': `0 0 0 ${currentCssStyle.border?.size || '1px'} ${currentCssStyle.border?.color} inset, ${currentCssStyle.boxShadow || '0 0 0 0 rgba(0, 0, 0, 0)'}`,
  } as CSSProperties

  return (
    <div
      ref={inputBoxRef}
      className={`relative inline-flex max-w-full rounded-(--radius-size) bg-(--background-color) text-(--text-color) shadow-(--input-box-shadow) has-[:disabled]:pointer-events-none has-[:disabled]:before:pointer-events-auto has-[:disabled]:before:absolute has-[:disabled]:before:inset-0 has-[:disabled]:before:cursor-not-allowed has-[:disabled]:before:content-[''] [&_*::placeholder]:font-normal [&_*::placeholder]:text-(--placeholder-color) [&_*:focus]:outline-none [&_:is(input,textarea,select)]:w-full [&_:is(input,textarea,select)]:appearance-none [&_:is(input,textarea,select)]:border-none [&_:is(input,textarea,select)]:bg-transparent [&_:is(input,textarea,select)]:p-4 [&_:is(input,textarea,select)]:outline-none ${className || ''}`}
      style={style}
    >
      {children}
    </div>
  )
}
