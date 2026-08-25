<script setup lang="ts">
import type { CheckBoxStyleForEachStatus } from '@/types'
import { computed } from 'vue'
import CheckBox from '@/components/CheckBox.vue'
import { COLOR } from '@/const'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: boolean): void }>()

const props = withDefaults(defineProps<{
  name: string
  label: string
  modelValue?: boolean
  isDisabled?: boolean
  cssStyle?: CheckBoxStyleForEachStatus
  isDisableAnimation?: boolean
}>(), {
  cssStyle: undefined,
})

const isChecked = computed<boolean>({
  get: () => props.modelValue ?? false,
  set: (newValue: boolean) => emit('update:modelValue', newValue),
})

const currentCssStyle = computed(() => {
  const cssStyle = props.isDisabled ? props.cssStyle?.disabled : props.cssStyle?.default

  return {
    ...{
      textColor      : props.isDisabled ? COLOR.darkGray : COLOR.black,
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
      :isDisabled="isDisabled"
      :cssStyle="cssStyle"
      :isDisableAnimation="isDisableAnimation"
      style="pointer-events: none;"
    />
    <span
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
  display    : inline-flex;
  align-items: center;
  gap        : .5em;
  cursor     : pointer;

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