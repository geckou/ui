'use client'

import type { CSSProperties } from 'react'
import { useId } from 'react'
import type { CheckBoxStyleForEachStatus } from '../types'
import { CheckBox } from './CheckBox'
import { COLOR } from '../constants'

type Props = {
  name: string
  label: string
  /** ネイティブ送信時の値（→ CheckBox の value） */
  value?: string | number
  checked?: boolean
  onChange?: (newValue: boolean) => void
  isDisabled?: boolean
  cssStyle?: CheckBoxStyleForEachStatus
  isDisableAnimation?: boolean
}

export function LabeledCheckbox({
  name,
  label,
  value,
  checked,
  onChange,
  isDisabled,
  cssStyle,
  isDisableAnimation,
}: Props) {
  const isChecked = checked ?? false
  // <label> は <button> をラベル付けしないので、可視ラベルを明示的に指す。
  // これをしないと CheckBox のアクセシブル名が name（機械名）になり、
  // 画面の文言と読み上げが食い違う（WCAG 2.5.3 Label in Name）
  const labelId = useId()
  const baseStyle = isDisabled ? cssStyle?.disabled : cssStyle?.default

  const currentCssStyle = {
    textColor: isDisabled ? COLOR.darkGray : COLOR.black,
    backgroundColor: isDisabled ? COLOR.darkGray : COLOR.blue,
    ...(baseStyle ?? {}),
  }

  const style = {
    '--text-color': currentCssStyle.textColor,
    '--checked-color': currentCssStyle.backgroundColor,
  } as CSSProperties

  return (
    <label className="inline-flex cursor-pointer items-center gap-[.5em] has-[button:disabled]:cursor-auto">
      <span className="pointer-events-none">
        <CheckBox
          name={name}
          value={value}
          checked={isChecked}
          onChange={onChange}
          isDisabled={isDisabled}
          cssStyle={cssStyle}
          isDisableAnimation={isDisableAnimation}
          ariaLabelledBy={labelId}
        />
      </span>
      <span
        id={labelId}
        style={style}
        className={isChecked ? 'text-(--text-color)' : 'text-(--checked-color)'}
      >
        {label}
      </span>
    </label>
  )
}
