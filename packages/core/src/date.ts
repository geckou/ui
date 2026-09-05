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
  // new Date(year, ...) は年 0〜99 を 1900 年代として扱う（0 → 1900）。
  // setFullYear なら西暦そのままで解釈される
  const date = new Date(0)
  date.setFullYear(year, month, 0)

  return date.getDate()
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

  // 末尾を固定する。固定しないと '2024-01-15abc' のような値の頭だけを拾ってしまう。
  // ISO 8601（'2024-01-14T23:00:00.000Z'）もここでは一致せず、下の Date へ回して
  // ローカル時刻の日付に直す（字面の先頭 10 文字を採ると UTC 日付になり、
  // JST では前日にずれる）
  const matched = value.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?$/)

  if (matched) {
    const [, year, month, day] = matched
    const monthNumber = Number(month)

    if (monthNumber < 1 || monthNumber > 12) {
      return ''
    }

    const yearMonth = `${year}-${pad(monthNumber)}`

    if (type === 'month') {
      return yearMonth
    }

    // type='date' は完全な日付を要求する。日が欠けていれば入力欄には反映しない
    if (!day) {
      return ''
    }

    const dayNumber = Number(day)

    if (dayNumber < 1 || dayNumber > daysInMonth(Number(year), monthNumber)) {
      return ''
    }

    return `${yearMonth}-${pad(dayNumber)}`
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

/**
 * 年・月・日から日付文字列を組み立てる。要素が欠けていれば空文字。
 * 月・日は 2 桁へゼロ埋めする（'2024-1-5' ではなく '2024-01-05'）
 */
export function composeDateValue(
  dateObject: DateObject,
  type: DateType = 'date'
): string {
  const { year, month, day } = dateObject
  const parts = type === 'month' ? [year, month] : [year, month, day]

  if (parts.some((part) => !part)) {
    return ''
  }

  // 数字でない入力（'ab' 等）を pad(Number(part)) に通すと '2024-NaN-01' のような
  // 日付でない文字列ができる。Number.isFinite だと '1.5' / '0x0a' / ' 1' を通して
  // しまうので、validateDateObject と同じ isNumeric で判定する
  if (parts.some((part) => !isNumeric(part))) {
    return ''
  }

  const [yearPart, ...rest] = parts

  return [yearPart, ...rest.map((part) => pad(Number(part)))].join('-')
}

/**
 * 月・日を 2 桁へゼロ埋めする（'1' → '01'）。年はそのまま。
 *
 * 入力途中の値をそのまま検証すると「月は2桁の数字で入力してください」になるため、
 * 欄を離れた時点でこれを通してから検証する
 */
export function normalizeDateObject(dateObject: DateObject): DateObject {
  const padPart = (value: string) =>
    value.length === 1 && isNumeric(value) ? pad(Number(value)) : value

  return {
    year: dateObject.year,
    month: padPart(dateObject.month),
    day: padPart(dateObject.day),
  }
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

  // parseInt('00') は 0（falsy）。null との比較にしないと日 '00' の検査が飛ぶ
  const dayNumber = day ? parseInt(day, 10) : null
  const maxDay = daysInMonth(parseInt(year, 10), monthNumber)

  if (dayNumber !== null && (dayNumber < 1 || dayNumber > maxDay)) {
    return { isValid: false, message: MESSAGES.dayOutOfRange(maxDay) }
  }

  return valid
}
