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
import { INPUT_BOX_DEFAULT_STYLES } from '@/const'

const props = defineProps<{
  cssStyle?: InputBoxStyleForEachStatus
  isErrored?: boolean
  isDisabled?: boolean
}>()

const inputBox = ref<HTMLElement | null>(null)

const cssStylesUsed = computed<InputBoxStyleForEachStatus>(() => ({
  ...INPUT_BOX_DEFAULT_STYLES,
  ...(props.cssStyle ?? {}),
}))

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

// isErrored の変化は focus / blur を伴わないため、明示的に再判定する
// （以前は次に focus か blur が起きるまでエラー配色にならなかった）
watch(() => props.isErrored, () => {
  if (props.isDisabled) return
  updateState()
})
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