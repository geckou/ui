<script setup lang="ts">
import type { Ref } from 'vue'
import { onBeforeUnmount, ref, reactive, watch } from 'vue'
import {
  MESSAGES,
  composeDateValue as composeDate,
  formatDateValue,
  splitDate,
  validateDateObject,
} from '@geckou/ui-core'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import InputBox from '@/components/InputBox.vue'
import CalendarIcon from '@/components/Icon/CalendarIcon.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: string | null): void
}>()
const datePicker = ref<HTMLInputElement | null>(null)
const props = withDefaults(
  defineProps<{
    name: string
    modelValue: string
    isDisabled?: boolean
    isRequired?: boolean
    formValidationManager?: FormValidationManager | null
    minDate?: string
    maxDate?: string
    size?: 'small' | 'medium'
    type?: 'date' | 'month'
  }>(),
  {
    isDisabled: false,
    formValidationManager: null,
    minDate: '',
    maxDate: '',
    size: 'medium',
    type: 'date',
  }
)

const dateObject = reactive({
  year: '',
  month: '',
  day: '',
})

const dateValue: Ref<string> = ref('')
const errorMessage = ref('')

const setValid = (isValid: boolean): void => {
  if (props.formValidationManager) {
    props.formValidationManager.setValid(props.name, isValid)
  }
}

const validateInput = (value: string) => {
  if (!value && props.isRequired) {
    return { isValid: false, message: MESSAGES.required }
  }
  return { isValid: true, message: '' }
}

const validateObject = (object: {
  year: string
  month: string
  day?: string
}) =>
  validateDateObject(
    { year: object.year, month: object.month, day: object.day ?? '' },
    { type: props.type, isRequired: props.isRequired }
  )

const setDateObject = (value: string): void => {
  const { year, month, day } = splitDate(value)
  dateObject.year = year
  dateObject.month = month
  // 値に日が含まれない場合は前の入力を残さない
  dateObject.day = props.type === 'month' ? '' : day
}

/** 年月日から入力欄の値（YYYY-MM-DD / YYYY-MM）を組み立てる */
const composeDateValue = (): string =>
  composeDate({ ...dateObject }, props.type)

watch(
  () => dateValue.value,
  (newValue) => {
    setDateObject(newValue)
    const { isValid, message } = validateInput(newValue)
    errorMessage.value = message
    emit('update:modelValue', newValue)
    setValid(isValid)
  }
)

watch(
  () => dateObject,
  (newValue) => {
    const { isValid, message } = validateObject(newValue)
    errorMessage.value = message
    setValid(isValid)
    if (isValid) {
      dateValue.value = composeDateValue()
    }
  },
  { deep: true }
)

const applyModelValue = (value: string): void => {
  if (!value) {
    dateValue.value = ''
    setDateObject('')
    errorMessage.value = ''
    setValid(validateInput('').isValid)
    return
  }

  const formatted = formatDateValue(value, props.type)
  if (!formatted || formatted === dateValue.value) {
    return
  }

  dateValue.value = formatted
  setDateObject(formatted)
}

watch(
  () => props.modelValue,
  (newValue) => applyModelValue(newValue)
)

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
      />
    </div>
    <input
      v-model="dateObject.year"
      placeholder="年"
      maxlength="4"
      type="text"
      :disabled="isDisabled"
      :class="$style.year"
    />/
    <input
      v-model="dateObject.month"
      placeholder="月"
      maxlength="2"
      type="text"
      :disabled="isDisabled"
    />
    <span v-if="type === 'date'">/</span>
    <input
      v-if="type === 'date'"
      v-model="dateObject.day"
      placeholder="日"
      maxlength="2"
      type="text"
      :disabled="isDisabled"
    />
    <ErrorMessage :errorMessages="errorMessage ? [errorMessage] : []" />
  </InputBox>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.icon {
  @include icon($color: var(--link-color));
  margin: auto;
  position: absolute;
  top: 0;
  left: var(--sp-small);
  bottom: 0;
}

.date_input {
  flex: 0 0 auto;
  position: relative;

  > input {
    width: calc(var(--icon-medium) + var(--sp-small) * 2);
    padding: var(--sp-medium) var(--sp-small);

    &[type='date'],
    &[type='month'] {
      opacity: 0;

      &::-webkit-calendar-picker-indicator {
        position: absolute;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
      }
    }
  }
}

.date_picker {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
  line-height: 1;

  > input {
    padding: var(--sp-medium);
    width: calc(var(--sp-medium) * 2 + 3ch);

    &.year {
      width: calc(var(--sp-medium) * 2 + 5ch);
    }

    &[type='text'] {
      flex: 0 0 auto;
    }
  }

  &.small {
    .icon {
      @include icon($color: var(--link-color), $size: var(--icon-small));
      left: var(--sp-small);
    }

    input {
      padding: var(--sp-min) var(--sp-small);
      font-size: var(--fs-small);
    }
  }
}
</style>
