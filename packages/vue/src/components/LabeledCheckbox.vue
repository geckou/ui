<script setup lang="ts">
import type { CheckBoxStyleForEachStatus } from '@/types'
import { computed } from 'vue'
import CheckBox from '@/components/CheckBox.vue'
import { nextUniqueId } from '@/scripts/unique-id'
import { COLOR } from '@/const'

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: boolean): void
}>()

const props = withDefaults(
  defineProps<{
    name: string
    label: string
    /** ネイティブ送信で使う値（CheckBox へそのまま渡す） */
    value?: string | number
    modelValue?: boolean
    isDisabled?: boolean
    cssStyle?: CheckBoxStyleForEachStatus
    isDisableAnimation?: boolean
  }>(),
  {
    value: undefined,
    cssStyle: undefined,
  }
)

// <label> は <button> をラベル付けしないので、可視ラベルを明示的に指す。
// これをしないと CheckBox のアクセシブル名が name（機械名）になり、
// 画面の文言と読み上げが食い違う（WCAG 2.5.3 Label in Name）
const labelId = nextUniqueId('labeled_check_box_label')

const isChecked = computed<boolean>({
  get: () => props.modelValue ?? false,
  set: (newValue: boolean) => emit('update:modelValue', newValue),
})

const currentCssStyle = computed(() => {
  const cssStyle = props.isDisabled
    ? props.cssStyle?.disabled
    : props.cssStyle?.default

  return {
    ...{
      textColor: props.isDisabled ? COLOR.darkGray : COLOR.black,
      backgroundColor: props.isDisabled ? COLOR.darkGray : COLOR.blue,
    },
    ...(cssStyle ?? {}),
  }
})
</script>

<template>
  <label :class="$style.labeled_check_box">
    <CheckBox
      v-model="isChecked"
      :name="name"
      :value="value"
      :isDisabled="isDisabled"
      :cssStyle="cssStyle"
      :isDisableAnimation="isDisableAnimation"
      :ariaLabelledBy="labelId"
      style="pointer-events: none"
    />
    <span
      :id="labelId"
      :class="$style.label"
      :style="{
        '--text-color': currentCssStyle?.textColor,
        '--checked-color': currentCssStyle?.backgroundColor,
      }"
    >
      {{ label }}
    </span>
  </label>
</template>

<style lang="scss" module>
:is(.labeled_check_box) {
  display: inline-flex;
  align-items: center;
  gap: 0.5em;
  cursor: pointer;

  &:has(input:disabled) {
    cursor: auto;
  }

  .label {
    color: var(--checked-color);
  }

  &:has(input:checked) {
    .label {
      color: var(--text-color);
    }
  }
}
</style>
