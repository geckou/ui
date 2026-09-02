import { describe, expect, it } from 'vitest'
import {
  composeDateValue,
  daysInMonth,
  formatDateValue,
  splitDate,
  validateDateObject,
} from '../src/date.js'
import { MESSAGES } from '../src/constants.js'

describe('formatDateValue', () => {
  // 回帰: React 側は new Date(v).toISOString() を使っており、
  // JST のようなプラス方向のタイムゾーンで日付が前日へずれていた
  it('YYYY-MM-DD をタイムゾーンに関係なくそのまま返す', () => {
    expect(formatDateValue('2026-08-25')).toBe('2026-08-25')
    expect(formatDateValue('2026-01-01')).toBe('2026-01-01')
    expect(formatDateValue('2026-12-31')).toBe('2026-12-31')
  })

  it('1 桁の月日をゼロ埋めする', () => {
    expect(formatDateValue('2026-8-5')).toBe('2026-08-05')
  })

  it('type="month" なら YYYY-MM を返す', () => {
    expect(formatDateValue('2026-08-25', 'month')).toBe('2026-08')
  })

  // 回帰: 不正な日付文字列で toISOString() が throw していた
  it('不正な文字列では空文字を返す', () => {
    expect(formatDateValue('not-a-date')).toBe('')
    expect(formatDateValue('')).toBe('')
  })

  it("type='date' で日が欠けていれば空文字を返す", () => {
    expect(formatDateValue('2026-08')).toBe('')
  })

  it("type='month' なら日が無くても YYYY-MM を返す", () => {
    expect(formatDateValue('2026-08', 'month')).toBe('2026-08')
  })
})

describe('splitDate / composeDateValue', () => {
  it('分解と組み立てが往復する', () => {
    expect(splitDate('2026-08-25')).toEqual({
      year: '2026',
      month: '08',
      day: '25',
    })
    expect(composeDateValue({ year: '2026', month: '08', day: '25' })).toBe(
      '2026-08-25'
    )
  })

  it('欠けた要素は空文字になる', () => {
    expect(splitDate('2026-08')).toEqual({ year: '2026', month: '08', day: '' })
    expect(composeDateValue({ year: '2026', month: '08', day: '' })).toBe('')
  })

  it('type="month" なら日が無くても組み立てられる', () => {
    expect(
      composeDateValue({ year: '2026', month: '08', day: '' }, 'month')
    ).toBe('2026-08')
  })
})

describe('daysInMonth', () => {
  it('うるう年の 2 月は 29 日', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2026, 2)).toBe(28)
  })
})

describe('validateDateObject', () => {
  const valid = { isValid: true, message: '' }

  it('全部空で任意なら通す', () => {
    expect(validateDateObject({ year: '', month: '', day: '' })).toEqual(valid)
  })

  it('全部空で必須なら必須エラー', () => {
    expect(
      validateDateObject({ year: '', month: '', day: '' }, { isRequired: true })
    ).toEqual({ isValid: false, message: MESSAGES.required })
  })

  it('正しい日付を通す', () => {
    expect(
      validateDateObject({ year: '2026', month: '08', day: '25' })
    ).toEqual(valid)
  })

  it('桁数が違う年を弾く', () => {
    expect(validateDateObject({ year: '26', month: '08', day: '25' })).toEqual({
      isValid: false,
      message: MESSAGES.invalidYear,
    })
  })

  it('範囲外の月を弾く', () => {
    expect(
      validateDateObject({ year: '2026', month: '13', day: '01' })
    ).toEqual({
      isValid: false,
      message: MESSAGES.monthOutOfRange,
    })
  })

  it('その月に存在しない日を弾く', () => {
    expect(
      validateDateObject({ year: '2026', month: '02', day: '30' })
    ).toEqual({
      isValid: false,
      message: MESSAGES.dayOutOfRange(28),
    })
  })

  it('type="month" では日を見ない', () => {
    expect(
      validateDateObject(
        { year: '2026', month: '02', day: '99' },
        { type: 'month' }
      )
    ).toEqual(valid)
  })
})
