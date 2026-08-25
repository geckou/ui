<script setup lang="ts">
import type {
  Option,
  CheckBoxStyleForEachStatus,
} from '@/types'
import {
  computed,
  ref,
  watch,
} from 'vue'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { COLOR } from '@/const'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: string[]): void }>()

const props = withDefaults(defineProps<{
  name : string
  options: Array<Option>
  modelValue?: string[]
  isDisabled? : boolean
  isRequired?: boolean
  cssStyle?: CheckBoxStyleForEachStatus
}>(), {
  modelValue: undefined,
  cssStyle  : undefined,
})

const checkBoxes = ref(props.options.map(option => ({
  value  : option.value,
  label  : option.label,
  checked: props.modelValue?.includes(option.value) || false,
})))

const checkedValues = computed<string[]>(() => checkBoxes.value.filter(checkBox => checkBox.checked).map(checkBox => checkBox.value))
const errorMessage = ref('')
const validateInput = () => errorMessage.value = props.isRequired && checkedValues.value.length === 0 ? '必須項目です' : ''

watch(checkedValues, (newValue, oldValue) => {
  const isArraysEqual = (a: string[], b: string[]): boolean => a.length === b.length && a.every((val, index) => val === b[index])
  if (oldValue && isArraysEqual(newValue, oldValue)) return
  validateInput()
  emit('update:modelValue', newValue)
}, {
  deep     : true,
  immediate: !!props.modelValue?.length,
})

watch(() => props.modelValue, newValue => {
  if (!newValue) return
  checkBoxes.value.forEach(checkBox => checkBox.checked = newValue.includes(checkBox.value))
}, {
  deep     : true,
  immediate: true,
})

const errorColor = {
  ...(props.cssStyle?.error ?? {}),
  textColor      : COLOR.white,
  backgroundColor: COLOR.red,
  border         : {
    color : COLOR.red,
    size  : '1px',
    radius: '.25rem',
  },
}
</script>

<template>
  <div :class="$style.check_boxes">
    <template
      v-for="(checkBox, index) in checkBoxes"
      :key="checkBox.label"
    >
      <LabeledCheckbox
        v-model="checkBoxes[index].checked"
        :name="checkBox.label"
        :label="checkBox.label"
        :isDisabled="props.isDisabled"
        :cssStyle="props.cssStyle"
      />
    </template>
    <ErrorMessage
      :errorMessages="errorMessage ? [errorMessage] : []"
      :cssStyle="{
        textColor: errorColor.textColor,
        backgroundColor: errorColor.backgroundColor,
      }"
    />
  </div>
</template>

<style lang="scss" module>
.check_boxes {
  display  : flex;
  flex-wrap: wrap;
  gap      : 1rem 1.5rem;
  position : relative;
}
</style>
