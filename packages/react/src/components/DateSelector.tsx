'use client'

import type { CSSProperties, MouseEvent } from 'react'
import type { FormValidationStore } from '@geckou/ui-core'
import { useEffect, useId, useState } from 'react'
import { daysInMonth, splitDate } from '@geckou/ui-core'
import { InputBox } from './InputBox'
import { KeyboardArrowDownIcon } from './icons/KeyboardArrowDownIcon'
import { useRegisterValidation } from '../hooks/useFormValidation'
import { COLOR } from '../constants'

type Birthday = {
  year: string
  month: string
  day: string
}

type Props = {
  name: string
  value?: string
  onChange?: (newValue: string) => void
  isRequired?: boolean
  /** useFormValidation() が返す store。渡すとフォーム全体の検証状態に参加する */
  formValidationStore?: FormValidationStore | null
  /** 'month' なら日の選択を出さない（Vue 版と揃える） */
  type?: 'date' | 'month'
  /** 選べる年の下限・上限。既定は「今年 -100 〜 今年 -14」（生年月日向け） */
  minYear?: number
  maxYear?: number
  /**
   * 年月日それぞれの読み上げ名の土台。「の年」「の月」「の日」を後ろに繋げる。
   * 可視ラベルがあるなら ariaLabelledBy でその要素を指すこと。
   * どちらも無いときだけ name を使う（機械名でも無いよりはマシ）
   */
  ariaLabel?: string
  ariaLabelledBy?: string
}

const EMPTY_BIRTHDAY: Birthday = { year: '', month: '', day: '' }

export function DateSelector({
  name,
  value,
  onChange,
  isRequired,
  formValidationStore,
  type = 'date',
  minYear,
  maxYear,
  ariaLabel,
  ariaLabelledBy,
}: Props) {
  const [birthday, setBirthday] = useState<Birthday>(EMPTY_BIRTHDAY)

  // Vue 版（DateSelector.vue）と同じ判定。任意項目は「全部空」か「全部埋まっている」
  // のどちらかであれば有効
  const isFilled = Boolean(
    birthday.year && birthday.month && (type === 'month' || birthday.day)
  )
  const isEmpty = !birthday.year && !birthday.month && !birthday.day

  useRegisterValidation(
    formValidationStore,
    name,
    isRequired ? isFilled : isFilled || isEmpty
  )

  // Vue 版（@geckou/ui-vue）は value が空に戻されたときリセットされなかった
  useEffect(() => {
    if (value) {
      setBirthday(splitDate(value))
    } else {
      setBirthday(EMPTY_BIRTHDAY)
    }
  }, [value])

  // 範囲を固定にすると、外れた value を渡されたとき select が空表示になる
  const thisYear = new Date().getFullYear()
  const yearFrom = minYear ?? thisYear - 100
  const yearTo = maxYear ?? thisYear - 14
  const yearsOptions = Array.from(
    { length: Math.max(yearTo - yearFrom + 1, 0) },
    (_, i) => (yearFrom + i).toString()
  ).map((year) => ({ label: year, value: year }))

  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString()
    return { label: month, value: month.padStart(2, '0') }
  })

  // 年が未選択のときは閏年を含む最大日数になるよう 2000 年を使う
  const getDaysInMonth = (year: string, month: string) =>
    daysInMonth(Number(year) || 2000, Number(month))

  const selectedMonthDays = getDaysInMonth(birthday.year, birthday.month)
  const dayOptions = Array.from({ length: selectedMonthDays }, (_, i) => {
    const day = (i + 1).toString()
    return { label: day, value: day.padStart(2, '0') }
  })

  const emitBirthday = (next: Birthday) => {
    setBirthday(next)

    const parts =
      type === 'month'
        ? [next.year, next.month]
        : [next.year, next.month, next.day]

    if (!next.year && !next.month && !next.day) {
      onChange?.('')
    } else if (parts.some((part) => !part)) {
      return
    } else {
      onChange?.(parts.join('-'))
    }
  }

  const selectItem = (key: keyof Birthday, newValue: string) => {
    const next = { ...birthday, [key]: newValue }

    // 月・年を変えて日が存在しなくなった場合は、その月の末日に丸める
    if (key !== 'day' && next.day && next.month) {
      const maxDay = getDaysInMonth(next.year, next.month)
      if (Number(next.day) > maxDay) {
        next.day = String(maxDay).padStart(2, '0')
      }
    }

    emitBirthday(next)
  }

  const openDropdown = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    const select = target.firstElementChild as HTMLSelectElement | null
    if (select) {
      select.click()
    }
  }

  // ariaLabelledBy を渡されたときは、その可視ラベルと「年 / 月 / 日」を並べて読ませる
  // （aria-labelledby は文字列を足せないので、単位だけを持つ要素を用意して連結する）
  const unitLabelId = useId()
  const fieldLabelProps = (unit: '年' | '月' | '日') =>
    ariaLabelledBy
      ? { 'aria-labelledby': `${ariaLabelledBy} ${unitLabelId}-${unit}` }
      : { 'aria-label': `${ariaLabel ?? name}の${unit}` }

  const wrapperClass = 'relative w-max [&:has(select:focus)>svg]:rotate-180'
  const iconClass =
    'pointer-events-none absolute inset-y-0 right-[var(--sp-small,0.375rem)] m-auto size-[var(--icon-medium,1.125rem)] fill-(--icon-color)'
  const selectClass =
    'w-[calc(3ch+var(--sp-medium,0.75rem)*2+var(--icon-medium,1.125rem))]! p-[var(--sp-medium,0.75rem)]! pe-[calc(var(--sp-small,0.375rem)*2+var(--icon-medium,1.125rem))]! cursor-pointer'
  const wrapperStyle = { '--icon-color': COLOR.blue } as CSSProperties
  const deleteButtonStyle = { '--caution-color': COLOR.red } as CSSProperties

  return (
    <InputBox className="flex w-max items-center [&>*:not(:last-of-type)]:after:content-['/']">
      <div className={wrapperClass} style={wrapperStyle} onClick={openDropdown}>
        <select
          value={birthday.year}
          name={`${name}-year`}
          {...fieldLabelProps('年')}
          required={isRequired}
          onChange={(event) => selectItem('year', event.target.value)}
          className="w-[calc(5ch+var(--sp-medium,0.75rem)*2+var(--icon-medium,1.125rem))]! cursor-pointer p-[var(--sp-medium,0.75rem)]! pe-[calc(var(--sp-small,0.375rem)*2+var(--icon-medium,1.125rem))]!"
        >
          <option disabled value="">
            年
          </option>
          {yearsOptions.map((year) => (
            <option key={year.value} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>
        <KeyboardArrowDownIcon className={iconClass} />
      </div>
      <div className={wrapperClass} style={wrapperStyle} onClick={openDropdown}>
        <select
          value={birthday.month}
          name={`${name}-month`}
          {...fieldLabelProps('月')}
          required={isRequired}
          onChange={(event) => selectItem('month', event.target.value)}
          className={selectClass}
        >
          <option disabled value="">
            月
          </option>
          {monthOptions.map((month) => (
            <option key={month.value} value={month.value}>
              {month.label}
            </option>
          ))}
        </select>
        <KeyboardArrowDownIcon className={iconClass} />
      </div>
      {type === 'date' && (
        <div
          className={wrapperClass}
          style={wrapperStyle}
          onClick={openDropdown}
        >
          <select
            value={birthday.day}
            name={`${name}-day`}
            {...fieldLabelProps('日')}
            required={isRequired}
            onChange={(event) => selectItem('day', event.target.value)}
            className={selectClass}
          >
            <option disabled value="">
              日
            </option>
            {dayOptions.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
          <KeyboardArrowDownIcon className={iconClass} />
        </div>
      )}
      {ariaLabelledBy && (
        <span className="sr-only">
          <span id={`${unitLabelId}-年`}>の年</span>
          <span id={`${unitLabelId}-月`}>の月</span>
          <span id={`${unitLabelId}-日`}>の日</span>
        </span>
      )}
      <button
        type="button"
        style={deleteButtonStyle}
        className="mx-[var(--sp-medium,0.75rem)] inline-flex cursor-pointer items-center gap-[var(--sp-min,0.1875rem)] text-[length:var(--fs-small,0.6875rem)] text-(--caution-color)"
        onClick={() => emitBirthday(EMPTY_BIRTHDAY)}
      >
        削除
      </button>
    </InputBox>
  )
}
