<script setup lang="ts">
import type { Ref } from 'vue'
import { onBeforeUnmount, ref, reactive, watch } from 'vue'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import InputBox from '@/components/InputBox.vue'
import CalendarIcon from '@/components/Icon/CalendarIcon.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: string | null): void }>()
const datePicker = ref<HTMLInputElement | null>(null)
const props = withDefaults(defineProps<{
  name: string
  modelValue: string
  isDisabled? : boolean
  isRequired?: boolean
  formValidationManager?: FormValidationManager | null
  minDate?: string
  maxDate?: string
  size?: 'small' | 'medium'
  type?: 'date' | 'month'
}>(), {
  isDisabled           : false,
  formValidationManager: null,
  minDate              : '',
  maxDate              : '',
  size                 : 'medium',
  type                 : 'date',
})

const dateObject = reactive({
  year : '',
  month: '',
  day  : '',
})

const dateValue: Ref<string> = ref('')
const errorMessage = ref('')

const setValid = (isValid: boolean): void => {
  if (props.formValidationManager) props.formValidationManager.setValid(props.name, isValid)
}

const validateInput = (value: string) => {
  if (!value && props.isRequired) return { isValid: false, message: '必須項目です' }
  return { isValid: true, message: '' }
}

const validateObject = (object: {
  year: string
  month: string
  day?: string
}) => {
  const { year, month } = object
  // 月選択のときは日を検証対象から外す（引数のオブジェクトは書き換えない）
  const day = props.type === 'month' ? '' : object.day ?? ''
  const requiredCheck = (value: string | undefined) => props.isRequired && !value
  const isNumeric = (value: string) => /^\d+$/.test(value)
  const required = props.type === 'month' ? [year, month] : [year, month, day]

  if (required.every(value => !value) && !props.isRequired) return { isValid: true, message: '' }
  if (required.some(requiredCheck)) return { isValid: false, message: '必須項目です' }
  if (year.length !== 4 || !isNumeric(year)) return { isValid: false, message: '年は4桁の数字で入力してください' }
  if (month.length !== 2 || !isNumeric(month)) return { isValid: false, message: '月は2桁の数字で入力してください' }
  if (day && (day.length !== 2 || !isNumeric(day))) return { isValid: false, message: '日は2桁の数字で入力してください' }

  const monthNum = parseInt(month, 10)
  if (monthNum < 1 || monthNum > 12) return { isValid: false, message: '月は01から12の間で入力してください' }

  const daysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate()
  const dayNum = day ? parseInt(day, 10) : null
  if (dayNum && (dayNum < 1 || dayNum > daysInMonth(parseInt(year, 10), monthNum))) return { isValid: false, message: `日は01から${daysInMonth(parseInt(year, 10), monthNum)}の間で入力してください` }

  return { isValid: true, message: '' }
}

const setDateObject = (value: string): void => {
  const [year = '', month = '', day = ''] = value.split('-')
  dateObject.year = year
  dateObject.month = month
  // 値に日が含まれない場合は前の入力を残さない
  dateObject.day = props.type === 'month' ? '' : day
}

/** 年月日から入力欄の値（YYYY-MM-DD / YYYY-MM）を組み立てる */
const composeDateValue = (): string => {
  const { year, month, day } = dateObject
  const parts = props.type === 'month' ? [year, month] : [year, month, day]
  return parts.every(Boolean) ? parts.join('-') : ''
}

watch(() => dateValue.value, newValue => {
  setDateObject(newValue)
  const { isValid, message } = validateInput(newValue)
  errorMessage.value = message
  emit('update:modelValue', newValue)
  setValid(isValid)
})

watch(() => dateObject, newValue => {
  const { isValid, message } = validateObject(newValue)
  errorMessage.value = message
  setValid(isValid)
  if (isValid) dateValue.value = composeDateValue()
}, { deep: true })

/**
 * modelValue を入力欄の値に反映する。
 * new Date().toISOString() はタイムゾーン分ずれるため、
 * 日付部分を取り出せる文字列はそのまま使い、それ以外はローカル日付として整形する
 */
const formatDateValue = (value: string): string => {
  const matched = value.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/)
  const pad = (numberValue: number) => String(numberValue).padStart(2, '0')

  if (matched) {
    const [, year, month, day] = matched
    if (props.type === 'month') return `${year}-${month}`
    return day ? `${year}-${month}-${day}` : ''
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''

  const year = parsed.getFullYear()
  const month = pad(parsed.getMonth() + 1)
  const day = pad(parsed.getDate())

  return props.type === 'month' ? `${year}-${month}` : `${year}-${month}-${day}`
}

const applyModelValue = (value: string): void => {
  if (!value) {
    dateValue.value = ''
    setDateObject('')
    errorMessage.value = ''
    setValid(validateInput('').isValid)
    return
  }

  const formatted = formatDateValue(value)
  if (!formatted || formatted === dateValue.value) return

  dateValue.value = formatted
  setDateObject(formatted)
}

watch(() => props.modelValue, newValue => applyModelValue(newValue))

applyModelValue(props.modelValue)
setValid(validateInput(dateValue.value).isValid)

// アンマウント後も無効判定が残らないように登録を解除する
onBeforeUnmount(() => props.formValidationManager?.remove(props.name))
</script>

<template>
  <InputBox
    :isDisabled="isDisabled"
    :class="[
      $style.date_picker,
      $style[size],
      { [$style.is_disabled]: isDisabled },
    ]"
    :isErrored="!!errorMessage"
  >
    <div :class="$style.date_input">
      <CalendarIcon :class="$style.icon" />
      <input
        ref="datePicker"
        v-model="dateValue"
        :type="type"
        :name="name"
        :max="maxDate"
        :min="minDate"
        :required="isRequired"
        :disabled="isDisabled"
      >
    </div>
    <input
      v-model="dateObject.year"
      placeholder="年"
      maxlength="4"
      type="text"
      :disabled="isDisabled"
      :class="$style.year"
    >/
    <input
      v-model="dateObject.month"
      placeholder="月"
      maxlength="2"
      type="text"
      :disabled="isDisabled"
    >
    <span v-if="type === 'date'">/</span>
    <input
      v-if="type === 'date'"
      v-model="dateObject.day"
      placeholder="日"
      maxlength="2"
      type="text"
      :disabled="isDisabled"
    >
    <ErrorMessage :errorMessages="errorMessage ? [errorMessage] : []" />
  </InputBox>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.icon {
  @include icon($color: var(--link-color));
  margin  : auto;
  position: absolute;
  top     : 0;
  left    : var(--sp-small);
  bottom  : 0;
}

.date_input {
  flex    : 0 0 auto;
  position: relative;
  
  > input {
    width  : calc(var(--icon-medium) + var(--sp-small) * 2);
    padding: var(--sp-medium) var(--sp-small);

    &[type="date"],
    &[type="month"] {
      opacity: 0;

      &::-webkit-calendar-picker-indicator {
        position: absolute;
        left    : 0;
        width   : 100%;
        height  : 100%;
        opacity: 0;
        cursor  : pointer;
      }
    }
  }
}

.date_picker {
  display    : flex;
  align-items: center;
  width      : 100%;
  position   : relative;
  line-height: 1;

  > input {
    padding: var(--sp-medium);
    width  : calc( var(--sp-medium) * 2 + 3ch);

    &.year {
      width: calc( var(--sp-medium) * 2 + 5ch);
    }

    &[type="text"] {
      flex: 0 0 auto;
    }
  }

  &.small {
    .icon {
      @include icon($color: var(--link-color), $size: var(--icon-small));
      left: var(--sp-small);
    }

    input {
      padding  : var(--sp-min) var(--sp-small);
      font-size: var(--fs-small);
    }
  }
}
</style>