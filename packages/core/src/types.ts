// フォーム部品の状態。Vue / React 双方の実装が共通で参照する
export type StateVariation =
  'default' | 'error' | 'disabled' | 'valid' | 'focus' | 'hover'

export type BorderStyle = {
  color: string
  size: string
  radius: string
}

export type BaseStyle = {
  textColor?: string
  backgroundColor?: string
  border?: BorderStyle
  boxShadow?: string
}

export type StyleForEachStatus<T> = Partial<Record<StateVariation, T>> & {
  default: T
}

export type InputBoxStyle = BaseStyle & {
  placeholderColor?: string
}

export type InputBoxStyleForEachStatus = StyleForEachStatus<InputBoxStyle>

export type ButtonStyle = BaseStyle & {
  backgroundImage?: string
}

export type ButtonStyleForEachStatus = StyleForEachStatus<ButtonStyle>

export type CheckBoxStyle = Pick<
  BaseStyle,
  'textColor' | 'border' | 'backgroundColor'
>

export type CheckBoxStyleForEachStatus = StyleForEachStatus<CheckBoxStyle>

export type RadioButtonStyle = {
  border?: Omit<BorderStyle, 'radius'>
  backgroundColor?: string
}

export type RadioButtonStyleForEachStatus = StyleForEachStatus<RadioButtonStyle>

export type SelectValue = string | number

export type Option = {
  label: string
  value: SelectValue
  order?: number
  isDisabled?: boolean
}

export type Validate = {
  regex: RegExp
  message: string
}

export type Validates = Validate[]

/** 入力値として受け付ける型。数値 0 も正当な値として扱う */
export type InputValue = string | number | null | undefined

/** DatePicker が扱う日付の分解表現 */
export type DateObject = {
  year: string
  month: string
  day: string
}

export type DateType = 'date' | 'month'

export type ValidationResult = {
  isValid: boolean
  message: string
}
