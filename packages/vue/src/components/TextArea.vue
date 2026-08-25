<script lang="ts" setup>
import type {
  Validates,
  InputBoxStyleForEachStatus,
} from '@/types'
import {
  ref,
  computed,
  watch,
  nextTick,
  onMounted,
} from 'vue'
import InputBox from '@/components/InputBox.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

type InputValue = string | null

const emit = defineEmits<{ (e: 'update:modelValue', newValue: InputValue): void }>()

const props = withDefaults(defineProps<{
  name: string
  modelValue?: InputValue
  cssStyle?: InputBoxStyleForEachStatus | undefined
  placeholder?: string
  isDisabled? : boolean
  isRequired?: boolean
  rows?: number
  maxLength?: number
  autocomplete?: string
  validates?: Validates
  autoAdjustHeight?: boolean
}>(), {
  modelValue  : undefined,
  cssStyle    : undefined,
  isRequired  : false,
  placeholder : '入力してください',
  rows        : undefined,
  maxLength   : 100,
  isDisabled  : false,
  autocomplete: 'off',
  validates   : () => [],
})

const inputValue = computed<InputValue>({
  get: () => props.modelValue ?? '',
  set: (newValue: InputValue) => emit('update:modelValue', newValue),
})

const errorMessages = ref<string[]>([])
const textareaRef = ref<HTMLTextAreaElement | null>(null)

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

const adjustTextareaHeight = () => {
  if (!props.autoAdjustHeight) return

  nextTick(() => {
    if (textareaRef.value) {
      textareaRef.value.style.height = 'auto'
      textareaRef.value.style.height = `calc(${textareaRef.value.scrollHeight}px - 2rem)`
    }
  })
}

onMounted(adjustTextareaHeight)

watch(inputValue, () => {
  validateValue()
  adjustTextareaHeight()
},
{ immediate: !!props.modelValue, flush: 'post' })
</script>

<template>
  <InputBox
    :cssStyle="cssStyle"
    :class="$style.text_area"
    :isErrored="!!errorMessages.length"
    :isDisabled="isDisabled"
  >
    <textarea
      ref="textareaRef"
      v-model="inputValue"
      :name="name"
      :required="isRequired"
      :placeholder="placeholder"
      :disabled="isDisabled"
      :autocomplete="autocomplete"
      :rows="rows"
      :maxlength="maxLength"
      :aria-invalid="!!errorMessages.length ? 'true' : undefined"
      @blur="validateValue()"
    />
    <ErrorMessage
      :errorMessages="errorMessages"
      :cssStyle="{
        textColor: cssStyle?.error?.backgroundColor,
        backgroundColor: cssStyle?.error?.textColor,
      }"
    />
  </InputBox>
</template>

<style module>
:is(.text_area) {
  min-block-size: 4em;
}
</style>