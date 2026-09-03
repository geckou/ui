<script setup lang="ts">
import type { Option, SelectValue, CheckBoxStyleForEachStatus } from '@/types'
import { computed, ref, watch } from 'vue'
import { MESSAGES } from '@geckou/ui-core'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import { COLOR } from '@/const'

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: SelectValue[]): void
}>()

const props = withDefaults(
  defineProps<{
    name: string
    options: Array<Option>
    modelValue?: SelectValue[]
    isDisabled?: boolean
    isRequired?: boolean
    cssStyle?: CheckBoxStyleForEachStatus
  }>(),
  {
    modelValue: undefined,
    cssStyle: undefined,
  }
)

const checkBoxes = ref(
  props.options.map((option) => ({
    value: option.value,
    label: option.label,
    checked: props.modelValue?.includes(option.value) || false,
  }))
)

const checkedValues = computed<SelectValue[]>(() =>
  checkBoxes.value
    .filter((checkBox) => checkBox.checked)
    .map((checkBox) => checkBox.value)
)
const errorMessage = ref('')
const validateInput = () =>
  (errorMessage.value =
    props.isRequired && checkedValues.value.length === 0
      ? MESSAGES.required
      : '')

watch(
  checkedValues,
  (newValue, oldValue) => {
    const isArraysEqual = (a: SelectValue[], b: SelectValue[]): boolean =>
      a.length === b.length && a.every((val, index) => val === b[index])
    if (oldValue && isArraysEqual(newValue, oldValue)) {
      return
    }
    validateInput()
    emit('update:modelValue', newValue)
  },
  {
    deep: true,
    immediate: !!props.modelValue?.length,
  }
)

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      return
    }
    checkBoxes.value.forEach(
      (checkBox) => (checkBox.checked = newValue.includes(checkBox.value))
    )
  },
  {
    deep: true,
    immediate: true,
  }
)

// options を初期化時に一度だけ読むと、API から取ってから渡す形（後から差し替わる）で
// 何も描画されない。差し替わったら作り直し、checked は現在の選択から引き直す
watch(
  () => props.options,
  (newOptions) => {
    const checked = new Set(checkedValues.value)

    checkBoxes.value = newOptions.map((option) => ({
      value: option.value,
      label: option.label,
      checked: props.modelValue
        ? props.modelValue.includes(option.value)
        : checked.has(option.value),
    }))
  },
  { deep: true }
)

const errorColor = {
  ...(props.cssStyle?.error ?? {}),
  textColor: COLOR.white,
  backgroundColor: COLOR.red,
  border: {
    color: COLOR.red,
    size: '1px',
    radius: '.25rem',
  },
}
</script>

<template>
  <div :class="$style.check_boxes">
    <!-- key / name にラベルを使うとラベル重複で衝突する。
         name はグループ共通にし、区別は value で行う（ネイティブ送信の作法） -->
    <template v-for="(checkBox, index) in checkBoxes" :key="checkBox.value">
      <LabeledCheckbox
        v-model="checkBoxes[index].checked"
        :name="name"
        :value="checkBox.value"
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
  display: flex;
  flex-wrap: wrap;
  gap: 1rem 1.5rem;
  position: relative;
}
</style>
