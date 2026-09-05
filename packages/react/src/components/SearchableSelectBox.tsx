'use client'

import type { InputBoxStyleForEachStatus, Option } from '../types'
import type { KeyboardEvent } from 'react'
import { useEffect, useId, useRef, useState } from 'react'
import { TextBox } from './TextBox'

type Props = {
  options: Option[]
  value: string
  onChange?: (newValue: string) => void
  onSelect?: (newValue: string) => void
  name: string
  placeholder?: string
  isDisabled?: boolean
  searchTarget?: 'label' | 'value'
  cssStyle?: InputBoxStyleForEachStatus
  /** combobox のアクセシブル名。可視ラベルがあるならそちらを ariaLabelledBy で指すこと */
  ariaLabel?: string
  ariaLabelledBy?: string
}

export function SearchableSelectBox({
  options,
  value,
  onChange,
  onSelect,
  name,
  placeholder = '入力してください',
  isDisabled,
  searchTarget = 'label',
  cssStyle,
  ariaLabel,
  ariaLabelledBy,
}: Props) {
  /**
   * 入力欄に出す文字列。value が選択肢の value と一致するならラベルを引き当てる。
   * 一致しなければ入力中の語なのでそのまま出す（確定後に ID が出てしまう問題）
   */
  const toDisplayValue = (raw: string) =>
    options.find((option) => String(option.value) === raw)?.label ?? raw

  const [searchWord, setSearchWord] = useState(() => toDisplayValue(value))
  const [isOpened, setIsOpened] = useState(false)
  // ↑↓ で移動している候補。-1 は「どれも指していない」
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const listboxId = useId()
  const optionId = (index: number) => `${listboxId}-option-${index}`

  // 親からの value 更新に追従（正本の watch(modelValue, immediate) 相当）
  const lastValueProp = useRef(value)

  useEffect(() => {
    if (lastValueProp.current === value) {
      return
    }
    lastValueProp.current = value
    setSearchWord(toDisplayValue(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 外部からの値変更時のみ同期する
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: PointerEvent) => {
      const root = rootRef.current
      if (root && !root.contains(event.target as Node)) {
        setIsOpened(false)
      }
    }

    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [])

  // isDisabled の選択肢は候補に出さない。出したまま選べてしまっていた
  const selectableOptions = options.filter((option) => !option.isDisabled)

  const filteredOptions = searchWord
    ? selectableOptions.filter((option) =>
        String(option[searchTarget])
          .toLowerCase()
          .includes(searchWord.toLowerCase())
      )
    : selectableOptions

  const handleInputChange = (newValue: string | number) => {
    const word = String(newValue)
    setSearchWord(word)

    // 空にしたときも通知する。早期 return していたため、値を消しても
    // 親が古い値を持ったままだった
    setIsOpened(Boolean(word))
    // 候補が絞り込まれたら、前の位置は意味を失う
    setActiveIndex(-1)
    onChange?.(word)
  }

  const selectOption = (option: Option) => {
    if (option.isDisabled) {
      return
    }

    const newValue = option.value.toString()
    // 入力欄には可視ラベルを出し、通知は value で行う
    setSearchWord(option.label)
    setIsOpened(false)
    setActiveIndex(-1)
    onChange?.(newValue)
    onSelect?.(newValue)
  }

  const isListShown = isOpened && filteredOptions.length > 0

  // WAI-ARIA の Combobox パターン。↑↓ で候補を辿り、Enter で確定、Escape で閉じる
  // （Tab で 1 件ずつ辿るしかなく、候補が多いと実用にならなかった）
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()

      // 閉じているときは開いて端へ移る。↑ は末尾（候補が無ければ -1 = 未選択）
      if (!isOpened) {
        setIsOpened(true)
        setActiveIndex(
          event.key === 'ArrowDown' ? 0 : filteredOptions.length - 1
        )

        return
      }

      if (filteredOptions.length === 0) {
        return
      }

      setActiveIndex((current) => {
        const last = filteredOptions.length - 1

        if (event.key === 'ArrowDown') {
          return current >= last ? 0 : current + 1
        }

        return current <= 0 ? last : current - 1
      })

      return
    }

    if (event.key === 'Enter') {
      const option = isListShown ? filteredOptions[activeIndex] : undefined

      if (option) {
        // 候補を選んでいる間はフォームを送信させない
        event.preventDefault()
        selectOption(option)
      }

      return
    }

    // 候補リストが見えているときだけ握る。isOpened で判定していたため、
    // 何にもマッチしない語を入れた状態（リストは出ていないが isOpened は true）で
    // Escape を押すと preventDefault だけが走り、画面上は何も起きなかった
    // （ModalBox の中では、閉じるのに Escape を 2 回押すことになっていた）
    if (event.key === 'Escape' && isListShown) {
      event.preventDefault()
      setIsOpened(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <TextBox
        name={name}
        value={searchWord}
        onChange={handleInputChange}
        isDisabled={isDisabled}
        placeholder={placeholder}
        cssStyle={cssStyle}
        role="combobox"
        ariaLabel={ariaLabel}
        ariaLabelledBy={ariaLabelledBy}
        ariaAutocomplete="list"
        ariaExpanded={isListShown}
        ariaControls={listboxId}
        ariaActivedescendant={
          isListShown && activeIndex >= 0 ? optionId(activeIndex) : undefined
        }
        onKeyDown={handleKeyDown}
      />
      {isListShown && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute top-[calc(100%-var(--sp-min,0.1875rem))] left-0 z-[2] max-h-[calc(var(--bv,0.375rem)*56)] min-w-full overflow-auto rounded-[var(--radius-small,0.1875rem)] bg-white py-[var(--sp-small,0.375rem)] shadow-[0_0_6px_#33333333]"
        >
          {filteredOptions.map((option, index) => (
            <div
              key={option.value}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              // フォーカスは combobox の input に残す（aria-activedescendant 方式）
              className={`block w-full cursor-pointer p-[var(--sp-medium,0.75rem)] text-left text-[length:var(--fs-small,0.6875rem)] text-[var(--link-color,#1c4ac9)] hover:bg-[var(--hover-color,#EEF7FB)] hover:transition-all hover:duration-100 ${index === activeIndex ? 'bg-[var(--hover-color,#EEF7FB)]' : ''}`}
              onPointerDown={(event) => {
                // input の blur より先に選択を確定させる
                event.preventDefault()
                selectOption(option)
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
