import type { DateObject, DateType, ValidationResult } from './types.js'
import { MESSAGES } from './constants.js'

function pad(value: number): string {
  return String(value).padStart(2, '0')
}

function isNumeric(value: string): boolean {
  return /^\d+$/.test(value)
}

/** 指定した年月の日数。month は 1 始まり */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/**
 * 任意の日付文字列を YYYY-MM-DD（type='month' なら YYYY-MM）へ正規化する。
 *
 * YYYY-MM(-DD) 形式は正規表現で直接読む。`new Date()` + `toISOString()` を使うと
 * UTC へ変換されるため、JST のようなプラス方向のタイムゾーンでは日付が前日へずれる。
 * 正規表現で読めない形式のみ Date にフォールバックし、その場合もローカルの
 * getFullYear / getMonth / getDate を使って変換する。
 */
export function formatDateValue(
  value: string,
  type: DateType = 'date'
): string {
  if (!value) {
    return ''
  }

  const matched = value.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/)

  if (matched) {
    const [, year, month, day] = matched
    const yearMonth = `${year}-${pad(Number(month))}`

    if (type === 'month') {
      return yearMonth
    }

    // type='date' は完全な日付を要求する。日が欠けていれば入力欄には反映しない
    return day ? `${yearMonth}-${pad(Number(day))}` : ''
  }

  const parsed = new Date(value)

  // 不正な日付文字列で toISOString() が throw していたため、先に弾く
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }

  const yearMonth = `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}`

  if (type === 'month') {
    return yearMonth
  }

  return `${yearMonth}-${pad(parsed.getDate())}`
}

/** YYYY-MM-DD を年・月・日へ分解する。欠けている要素は空文字 */
export function splitDate(value: string): DateObject {
  const [year = '', month = '', day = ''] = value.split('-')
  return { year, month, day }
}

/** 年・月・日から日付文字列を組み立てる。要素が欠けていれば空文字 */
export function composeDateValue(
  dateObject: DateObject,
  type: DateType = 'date'
): string {
  const { year, month, day } = dateObject
  const parts = type === 'month' ? [year, month] : [year, month, day]

  if (parts.some((part) => !part)) {
    return ''
  }

  return parts.join('-')
}

/**
 * 年・月・日の入力内容を検証する。
 * type='month' のときは日を見ない。
 */
export function validateDateObject(
  dateObject: DateObject,
  options: { type?: DateType; isRequired?: boolean } = {}
): ValidationResult {
  const { type = 'date', isRequired = false } = options
  const { year, month } = dateObject
  const day = type === 'month' ? '' : dateObject.day
  const valid = { isValid: true, message: '' }

  // 全部空で必須でなければ未入力として通す
  if ([year, month, day].every((value) => !value) && !isRequired) {
    return valid
  }

  const requiredValues = type === 'month' ? [year, month] : [year, month, day]

  if (requiredValues.some((value) => isRequired && !value)) {
    return { isValid: false, message: MESSAGES.required }
  }

  if (year.length !== 4 || !isNumeric(year)) {
    return { isValid: false, message: MESSAGES.invalidYear }
  }

  if (month.length !== 2 || !isNumeric(month)) {
    return { isValid: false, message: MESSAGES.invalidMonth }
  }

  if (day && (day.length !== 2 || !isNumeric(day))) {
    return { isValid: false, message: MESSAGES.invalidDay }
  }

  const monthNumber = parseInt(month, 10)

  if (monthNumber < 1 || monthNumber > 12) {
    return { isValid: false, message: MESSAGES.monthOutOfRange }
  }

  const dayNumber = day ? parseInt(day, 10) : null
  const maxDay = daysInMonth(parseInt(year, 10), monthNumber)

  if (dayNumber && (dayNumber < 1 || dayNumber > maxDay)) {
    return { isValid: false, message: MESSAGES.dayOutOfRange(maxDay) }
  }

  return valid
}
