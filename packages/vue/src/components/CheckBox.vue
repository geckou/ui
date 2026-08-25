<script setup lang="ts">
import type { CheckBoxStyleForEachStatus } from '@/types'
import { computed } from 'vue'
import CheckIcon from '@/components/Icon/CheckIcon.vue'
import { COLOR } from '@/const'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: boolean): void }>()

const props = withDefaults(defineProps<{
  name: string
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
      textColor      : props.isDisabled ? COLOR.darkGray : COLOR.blue,
      backgroundColor: props.isDisabled ? COLOR.lightGray : COLOR.white,
      border         : {
        color : props.isDisabled ? COLOR.darkGray : COLOR.blue,
        size  : '1px',
        radius: '.25rem',
      },
    },
    ...cssStyle,
  }
})
</script>

<template>
  <button
    :class="$style.check_box"
    :style="{
      '--text-color': currentCssStyle?.textColor,
      '--border-color': currentCssStyle?.border?.color,
      '--border-size' : currentCssStyle?.border?.size,
      '--radius-size': currentCssStyle?.border?.radius,
      '--background-color': currentCssStyle?.backgroundColor,
      '--duration': isDisableAnimation ? '0s' : '.3s',
    }"
    type="button"
    @click.stop="!isDisabled ? isChecked = !isChecked : null"
  >
    <input 
      v-model="isChecked"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
    >
    <div :class="$style.check_container">
      <slot name="check" />
      <CheckIcon v-if="!$slots.check" />
    </div>
  </button>
</template>

<style lang="scss" module>
@keyframes pop {
  0% {
    scale  : 1;
  }

  10% {
    scale  : .8;
  }

  50% {
    scale  : 1.1;
  }

  100% {
    scale: 1;
  }
}

:is(.check_box) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  box-shadow: 0 0 0 var(--border-size) var(--border-color) inset;
  border-radius: var(--radius-size);
  background-color: var(--background-color);
  cursor: pointer;

  > input {
    display: none;
  }

  &:has(input:disabled) {
    pointer-events: none !important;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: all;
      cursor: not-allowed !important;
    }
  }

  &:has(input:checked) {
    background-color: var(--border-color);
    animation: pop var(--duration) ease-out;

    :is(.check_container) {
      color: var(--background-color);
    }
  }
}

:is(.check_container) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  color: var(--border-color);

  > * {
    color: currentColor;
    fill: currentColor;
  }
}
</style>