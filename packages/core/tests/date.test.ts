import { describe, expect, it } from 'vitest'
import {
  composeDateValue,
  daysInMonth,
  formatDateValue,
  normalizeDateObject,
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

  // 回帰: 正規表現に $ が無く、範囲検査も無かった
  it('範囲外の月日は空文字を返す', () => {
    expect(formatDateValue('2024-13-45')).toBe('')
    expect(formatDateValue('2024-00-10')).toBe('')
    expect(formatDateValue('2026-02-30')).toBe('')
    expect(formatDateValue('2024-02-29')).toBe('2024-02-29')
  })

  it('日付の後ろにゴミが付いた文字列は空文字を返す', () => {
    expect(formatDateValue('2024-01-15abc')).toBe('')
  })

  // 回帰: 先頭 10 文字を字面で採っており、UTC 日付のまま返していた
  it('ISO 8601 の文字列はローカル時刻の日付として読む', () => {
    const iso = '2024-01-14T23:00:00.000Z'
    const local = new Date(iso)
    const expected = `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`

    expect(formatDateValue(iso)).toBe(expected)
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

  it('1 桁の月日はゼロ埋めして組み立てる', () => {
    expect(composeDateValue({ year: '2024', month: '1', day: '5' })).toBe(
      '2024-01-05'
    )
    expect(
      composeDateValue({ year: '2024', month: '1', day: '' }, 'month')
    ).toBe('2024-01')
  })
})

describe('daysInMonth', () => {
  it('うるう年の 2 月は 29 日', () => {
    expect(daysInMonth(2024, 2)).toBe(29)
    expect(daysInMonth(2026, 2)).toBe(28)
  })

  // 回帰: new Date(year, ...) が年 0〜99 を 1900 年代として扱っていた
  it('年 0〜99 を西暦そのままで扱う', () => {
    expect(daysInMonth(0, 2)).toBe(29)
    expect(daysInMonth(4, 2)).toBe(29)
    expect(daysInMonth(1900, 2)).toBe(28)
  })

  // 月の端。setFullYear(year, month, 0) は前月の末日を返す仕様なので、
  // 0 は前年 12 月、13 は同年 12 月になる
  it('月の範囲外でも隣の月の末日を返す', () => {
    expect(daysInMonth(2024, 0)).toBe(31)
    expect(daysInMonth(2024, 13)).toBe(31)
  })
})

describe('composeDateValue の端', () => {
  // 回帰: pad(Number(part)) に数字でない入力を通すと '2024-NaN-01' ができていた
  it('数字でない入力なら空文字を返す', () => {
    expect(composeDateValue({ year: '2024', month: 'ab', day: '1' })).toBe('')
    expect(composeDateValue({ year: 'yyyy', month: '01', day: '1' })).toBe('')
    expect(composeDateValue({ year: '2024', month: '01', day: '--' })).toBe('')
  })

  // Number.isFinite だとこれらを通してしまい、'2024-1.5-01' や
  // '0x0a' の 10 進化のような日付でない値ができる
  it('小数・16 進・空白混じりも通さない', () => {
    expect(composeDateValue({ year: '2024', month: '1.5', day: '01' })).toBe('')
    expect(composeDateValue({ year: '2024', month: '0x0a', day: '01' })).toBe(
      ''
    )
    expect(composeDateValue({ year: '2024', month: ' 1', day: '01' })).toBe('')
    expect(composeDateValue({ year: '2024', month: '-1', day: '01' })).toBe('')
  })

  it("type='month' でも日は見ない", () => {
    expect(
      composeDateValue({ year: '2024', month: '01', day: 'ab' }, 'month')
    ).toBe('2024-01')
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

  // 回帰: parseInt('00') が 0（falsy）で、日の範囲検査が飛んでいた
  it("日 '00' を弾く", () => {
    expect(
      validateDateObject({ year: '2024', month: '01', day: '00' })
    ).toEqual({
      isValid: false,
      message: MESSAGES.dayOutOfRange(31),
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

describe('normalizeDateObject', () => {
  it('1 桁の月・日を 2 桁へゼロ埋めする', () => {
    expect(normalizeDateObject({ year: '2024', month: '1', day: '5' })).toEqual(
      {
        year: '2024',
        month: '01',
        day: '05',
      }
    )
  })

  it('空や数字でない値、2 桁の値はそのまま返す', () => {
    expect(normalizeDateObject({ year: '24', month: '', day: 'a' })).toEqual({
      year: '24',
      month: '',
      day: 'a',
    })
    expect(
      normalizeDateObject({ year: '2024', month: '12', day: '31' })
    ).toEqual({ year: '2024', month: '12', day: '31' })
  })
})
