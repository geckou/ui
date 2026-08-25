import { describe, expect, it } from 'vitest'
import { convertFullWidthToHalfWidth } from '../src/text.js'

describe('convertFullWidthToHalfWidth', () => {
  it('全角の英数字を半角へ変換する', () => {
    expect(convertFullWidthToHalfWidth('ＡＢＣ１２３ａｂｃ')).toBe('ABC123abc')
  })

  it('全角以外はそのまま残す', () => {
    expect(convertFullWidthToHalfWidth('住所１−２')).toBe('住所1−2')
  })

  it('半角のみの入力は変わらない', () => {
    expect(convertFullWidthToHalfWidth('abc123')).toBe('abc123')
  })
})
