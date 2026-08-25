<script lang="ts" setup>
import type {
  Validates,
  InputBoxStyleForEachStatus,
} from '@/types'
import {
  ref,
  computed,
  watch,
} from 'vue'
import InputBox from '@/components/InputBox.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

type InputValue = string | number

const emit = defineEmits<{ (e: 'update:modelValue', newValue: InputValue): void }>()

const props = withDefaults(defineProps<{
  name: string
  modelValue?: InputValue
  cssStyle?: InputBoxStyleForEachStatus | undefined
  inputType? : string
  placeholder?: string
  isDisabled? : boolean
  isRequired?: boolean
  maxLength?: number
  autocomplete?: string
  validates?: Validates
}>(), {
  modelValue  : undefined,
  cssStyle    : undefined,
  inputType   : 'text',
  placeholder : '入力してください',
  maxLength   : 30,
  autocomplete: 'off',
  validates   : () => [],
})

const errorMessages = ref<string[]>([])

const inputValue = computed<InputValue>({
  get: () => props.modelValue ?? '',
  set: (newValue: InputValue) => {
    const convertedValue = typeof newValue === 'number'
      ? newValue
      : convertFullWidthToHalfWidth(String(newValue))

    emit('update:modelValue', convertedValue)
  },
})

const convertFullWidthToHalfWidth = (str: string): string => {
  const fullWidthRegEx = /[Ａ-Ｚａ-ｚ０-９]/g
  return str.replace(fullWidthRegEx, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
}

const validateValue = () => {
  errorMessages.value = []
  const value = inputValue.value
  
  if (!value && props.isRequired) errorMessages.value.push('必須項目です')
  else if (value && props.validates.length) {
    props.validates.forEach(validate => {
      if (!validate.regex.test(String(value))) errorMessages.value.push(validate.message)
    })
  }
}

watch(inputValue, () => validateValue(), { immediate: !!props.modelValue, flush: 'post' })
</script>

<template>
  <InputBox
    :cssStyle="cssStyle"
    :class="$style.text_box"
    :isErrored="!!errorMessages.length"
    :isDisabled="isDisabled"
  >
    <slot name="before" />
    <input
      v-model="inputValue"
      :type="inputType"
      :name="name"
      :required="isRequired"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :autocomplete="autocomplete"
      :maxlength="maxLength"
      :aria-invalid="!!errorMessages.length ? 'true' : undefined"
      @blur="validateValue()"
    >
    <slot name="after" />
    <ErrorMessage
      :errorMessages="errorMessages"
      :cssStyle="{
        textColor: cssStyle?.error?.backgroundColor,
        backgroundColor: cssStyle?.error?.textColor,
      }"
    />
  </InputBox>
</template>

<style lang="scss" module>
:is(.text_box) {
  display: inline-flex;

  > input {
    flex: 1 1 auto;
  }
}
</style>