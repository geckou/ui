<script setup lang="ts">
import type {
  StateVariation,
  InputBoxStyle,
  InputBoxStyleForEachStatus,
} from '@/types'
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
  watch,
} from 'vue'
import { COLOR } from '@/const'

const props = defineProps<{
  cssStyle?: InputBoxStyleForEachStatus
  isErrored?: boolean
  isDisabled?: boolean
}>()

const {
  black    : TEXT_COLOR,
  darkGray : PLACEHOLDER_COLOR,
  gray     : BORDER_COLOR,
  lightGray: DISABLED_COLOR,
  red      : CAUTION_COLOR,
  green    : VALID_COLOR,
  blue     : FOCUS_COLOR,
} = COLOR

const BORDER = {
  color : BORDER_COLOR,
  size  : '1px',
  radius: '.25rem',
}

const inputBox = ref<HTMLElement | null>(null)

const cssStylesUsed = computed<InputBoxStyleForEachStatus>(() => {
  return {
    ...{
      default: {
        textColor       : TEXT_COLOR,
        placeholderColor: PLACEHOLDER_COLOR,
        backgroundColor : 'inherit',
        border          : BORDER,
        boxShadow       : '0 0 0 0 rgba(0, 0, 0, 0)',
      },
      disabled: {
        textColor       : PLACEHOLDER_COLOR,
        placeholderColor: PLACEHOLDER_COLOR,
        backgroundColor : DISABLED_COLOR,
        border          : BORDER,
        boxShadow       : '0 0 0 0 rgba(0, 0, 0, 0)',
      },
      focus: {
        textColor       : TEXT_COLOR,
        placeholderColor: PLACEHOLDER_COLOR,
        backgroundColor : 'inherit',
        border          : {
          ...BORDER,
          color: FOCUS_COLOR,
        },
        boxShadow: `0 0 .1rem .1rem ${FOCUS_COLOR}55`,
      },
      error: {
        textColor       : TEXT_COLOR,
        placeholderColor: PLACEHOLDER_COLOR,
        backgroundColor : `${CAUTION_COLOR}11`,
        border          : {
          ...BORDER,
          color: CAUTION_COLOR,
        },
        boxShadow: `0 0 .1rem .1rem ${CAUTION_COLOR}55`,
      },
      valid: {
        textColor       : TEXT_COLOR,
        placeholderColor: PLACEHOLDER_COLOR,
        backgroundColor : `${VALID_COLOR}11`,
        border          : {
          ...BORDER,
          color: VALID_COLOR,
        },
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
      },
    },
    ...props.cssStyle,
  }
})

const currentCssStyle = computed<InputBoxStyle>(() => cssStylesUsed.value[currentState.value as StateVariation] ?? cssStylesUsed.value.default)
const currentState = ref<StateVariation>('default')

const checkElementState = (el: Element | null | undefined) => {
  if (!el) return currentState.value = 'default'
  if (el.matches(':disabled')) return currentState.value = 'disabled'
  if (el.matches(':focus')) return currentState.value = 'focus'
  if (el.tagName.toLowerCase() === 'select') return currentState.value = ((el as HTMLSelectElement).required && !(el as HTMLSelectElement).value) ? 'error' : 'valid'
  if (props.isErrored || el.matches(':invalid')) return currentState.value = 'error'
  if (el.matches(':valid') && el.matches(':not(:placeholder-shown)') && el.matches(':not(:invalid)')) return currentState.value = 'valid'
  return currentState.value = 'default'
}

const updateState = () => {
  const el = inputBox.value?.querySelector('input, textarea, select')
  checkElementState(el)
}

onMounted(() => {
  if (!inputBox.value) return
  const observer = new MutationObserver(updateState)
  observer.observe(inputBox.value, { childList: true, subtree: true })
  inputBox.value.addEventListener('focusin', updateState, true)
  inputBox.value.addEventListener('blur', updateState, true)
})

onUnmounted(() => {
  if (!inputBox.value) return
  inputBox.value.removeEventListener('focusin', updateState, true)
  inputBox.value.removeEventListener('blur', updateState, true)
})

watch(() => props.isDisabled, () => currentState.value = props.isDisabled ? 'disabled' : 'default', { immediate: true })
</script>

<template>
  <div
    ref="inputBox"
    :class="$style.input_box"
    :style="{
      '--text-color': currentCssStyle.textColor,
      '--placeholder-color': currentCssStyle.placeholderColor,
      '--background-color': currentCssStyle.backgroundColor,
      '--border-style': `0 0 0 ${ currentCssStyle.border?.size || '1px' } ${ currentCssStyle.border?.color } inset`,
      '--radius-size': currentCssStyle.border?.radius || '.25rem',
      '--box-shadow': currentCssStyle.boxShadow || '0 0 0 0 rgba(0, 0, 0, 0)',
    }"
  >
    <slot />
  </div>
</template>

<style lang="scss" module>
:is(.input_box) {
  display: inline-flex;
  max-inline-size: 100%;
  background-color: var(--background-color);
  box-shadow:
    var(--border-style),
    var(--box-shadow);
  border-radius: var(--radius-size);
  color: var(--text-color);
  position: relative;

  input,
  textarea,
  select {
    inline-size: 100%;
    padding: 1rem;
    background-color: transparent;
    border: none;
    outline: none;
    appearance: none;
  }

  *::placeholder {
    color: var(--placeholder-color);
    font-weight: normal;
  }

  *:focus,
  *:focus:not(:focus-visible) {
    outline: none;
  }

  &:has(> *:disabled) {
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
}
</style>