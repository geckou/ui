import { describe, expect, it } from 'vitest'
import {
  isEmptyValue,
  runValidates,
  validateInputValue,
} from '../src/validation.js'
import { MESSAGES } from '../src/constants.js'

describe('isEmptyValue', () => {
  // 回帰: Vue 側の `!value` 判定では 0 が必須エラーになっていた
  it('数値 0 と文字列 "0" は空とみなさない', () => {
    expect(isEmptyValue(0)).toBe(false)
    expect(isEmptyValue('0')).toBe(false)
  })

  it('空文字・null・undefined は空とみなす', () => {
    expect(isEmptyValue('')).toBe(true)
    expect(isEmptyValue(null)).toBe(true)
    expect(isEmptyValue(undefined)).toBe(true)
  })
})

describe('validateInputValue', () => {
  it('必須かつ 0 のときエラーにしない', () => {
    expect(validateInputValue(0, { isRequired: true })).toEqual([])
  })

  it('必須かつ空文字のとき必須エラー', () => {
    expect(validateInputValue('', { isRequired: true })).toEqual([
      MESSAGES.required,
    ])
  })

  it('未入力かつ任意なら validates を走らせない', () => {
    const validates = [{ regex: /^\d+$/, message: '数字のみ' }]
    expect(validateInputValue('', { validates })).toEqual([])
  })
})

describe('runValidates', () => {
  // 回帰: g / y フラグ付き RegExp は .test() で lastIndex が変異し、
  // 2 回目以降の判定結果が変わっていた
  it('g フラグ付きでも繰り返し同じ結果を返す', () => {
    const validates = [{ regex: /\d+/g, message: '数字を含めてください' }]

    expect(runValidates('abc123', validates)).toEqual([])
    expect(runValidates('abc123', validates)).toEqual([])
    expect(runValidates('abc123', validates)).toEqual([])
  })

  it('呼び出し側の RegExp の lastIndex を変異させない', () => {
    const regex = /\d+/g
    runValidates('abc123', [{ regex, message: 'x' }])

    expect(regex.lastIndex).toBe(0)
  })

  it('y フラグの sticky な意味を保つ', () => {
    const validates = [{ regex: /^abc/y, message: '先頭が abc ではない' }]

    expect(runValidates('abcdef', validates)).toEqual([])
    expect(runValidates('xabc', validates)).toEqual(['先頭が abc ではない'])
  })

  it('一致しなかった validates の message をすべて返す', () => {
    const validates = [
      { regex: /^\d+$/, message: '数字のみ' },
      { regex: /^.{8,}$/, message: '8文字以上' },
    ]

    expect(runValidates('abc', validates)).toEqual(['数字のみ', '8文字以上'])
  })
})
