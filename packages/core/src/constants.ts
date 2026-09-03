import type { InputBoxStyleForEachStatus, BorderStyle } from './types.js'

export const COLOR = {
  white: '#fff',
  black: '#333',
  darkGray: '#999',
  gray: '#ccc',
  lightGray: '#f9f9f9',
  red: '#aa0000',
  green: '#28a745',
  blue: '#1c4ac9',
}

const {
  black: TEXT_COLOR,
  darkGray: PLACEHOLDER_COLOR,
  gray: BORDER_COLOR,
  lightGray: DISABLED_COLOR,
  red: CAUTION_COLOR,
  green: VALID_COLOR,
  blue: FOCUS_COLOR,
} = COLOR

export const BORDER: BorderStyle = {
  color: BORDER_COLOR,
  size: '1px',
  radius: '.25rem',
}

const NO_SHADOW = '0 0 0 0 rgba(0, 0, 0, 0)'

export const INPUT_BOX_DEFAULT_STYLES: InputBoxStyleForEachStatus = {
  default: {
    textColor: TEXT_COLOR,
    placeholderColor: PLACEHOLDER_COLOR,
    backgroundColor: 'inherit',
    border: BORDER,
    boxShadow: NO_SHADOW,
  },
  disabled: {
    textColor: PLACEHOLDER_COLOR,
    placeholderColor: PLACEHOLDER_COLOR,
    backgroundColor: DISABLED_COLOR,
    border: BORDER,
    boxShadow: NO_SHADOW,
  },
  focus: {
    textColor: TEXT_COLOR,
    placeholderColor: PLACEHOLDER_COLOR,
    backgroundColor: 'inherit',
    border: { ...BORDER, color: FOCUS_COLOR },
    boxShadow: `0 0 .1rem .1rem ${FOCUS_COLOR}55`,
  },
  error: {
    textColor: TEXT_COLOR,
    placeholderColor: PLACEHOLDER_COLOR,
    backgroundColor: `${CAUTION_COLOR}11`,
    border: { ...BORDER, color: CAUTION_COLOR },
    boxShadow: `0 0 .1rem .1rem ${CAUTION_COLOR}55`,
  },
  valid: {
    textColor: TEXT_COLOR,
    placeholderColor: PLACEHOLDER_COLOR,
    backgroundColor: `${VALID_COLOR}11`,
    border: { ...BORDER, color: VALID_COLOR },
    boxShadow: NO_SHADOW,
  },
}

/**
 * エラーメッセージ。将来 i18n へ差し替えるための単一の入口。
 * Vue / React で文言がずれないよう、必ずここを参照する。
 */
export const MESSAGES = {
  required: '必須項目です',
  invalidYear: '年は4桁の数字で入力してください',
  invalidMonth: '月は2桁の数字で入力してください',
  invalidDay: '日は2桁の数字で入力してください',
  monthOutOfRange: '月は01から12の間で入力してください',
  dayOutOfRange: (maxDay: number) =>
    `日は01から${maxDay}の間で入力してください`,
  startAfterEnd: '開始日は終了日より前にしてください',
}
