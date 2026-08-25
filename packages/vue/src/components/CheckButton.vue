<script setup lang="ts">
import type { CheckBoxStyleForEachStatus } from '@/types'
import {
  ref,
  computed,
  watch,
} from 'vue'
import CheckIcon from '@/components/Icon/CheckIcon.vue'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: boolean): void }>()

const props = withDefaults(defineProps<{
  name: string
  modelValue?: boolean
  isDisabled?: boolean
  cssStyle?: CheckBoxStyleForEachStatus
  isDisableAnimation?: boolean
}>(), {
  cssStyle: () => ({ default: {} }),
})

const isChecked = ref(props.modelValue ?? false)

const currentCssStyle = computed(() => {
  if (props.isDisabled) return props.cssStyle.disabled
  else return props.cssStyle.default
})

watch(() => isChecked.value, newValue => emit('update:modelValue', newValue))
watch(() => props.modelValue, newValue => isChecked.value = newValue, { immediate: true })
</script>

<template>
  <span
    :class="$style.check_box"
    :style="{
      '--border-color': currentCssStyle?.border?.color || 'blue',
      '--border-size' : currentCssStyle?.border?.size || '1px',
      '--radius-size': currentCssStyle?.border?.radius || '0.25rem',
      '--background-color': currentCssStyle?.backgroundColor || '#fff',
      '--duration': isDisableAnimation ? '0s' : '.3s',
    }"
    @click="isChecked = !isChecked"
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
  </span>
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
  display         : flex;
  align-items     : center;
  justify-content : center;
  width           : 1.5rem;
  height          : 1.5rem;
  box-shadow      : 0 0 0 var(--border-size) var(--border-color) inset;
  border-radius   : var(--radius-size);
  background-color: var(--background-color);
  cursor          : pointer;

  > input {
    display : none;
  }

  &:has(input:disabled) {
    pointer-events: none !important;

    &::before {
      content       : '';
      position      : absolute;
      inset         : 0;
      pointer-events: all;
      cursor        : not-allowed !important;
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
  display        : flex;
  align-items    : center;
  justify-content: center;
  width          : 1rem;
  height         : 1rem;
  color          : var(--border-color);

  > * {
    color: currentColor;
    fill : currentColor;
  }
}
</style>