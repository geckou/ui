<script setup lang="ts">
import type {
  StateVariation,
  InputBoxStyle,
  InputBoxStyleForEachStatus,
} from '@/types'
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'
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

const currentCssStyle = computed<InputBoxStyle>(
  () =>
    cssStylesUsed.value[currentState.value as StateVariation] ??
    cssStylesUsed.value.default
)
const currentState = ref<StateVariation>('default')

type FormControl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement

// 最初の 1 要素だけで判定すると、複数のコントロールを持つ入力
// （DatePicker の隠し date input + 年月日欄、DateSelector の 3 つの select）で
// 配色が誤る。全てのコントロールを集めて判定する
const checkElementState = (controls: FormControl[]) => {
  if (controls.length === 0) {
    return (currentState.value = 'default')
  }
  if (controls.every((control) => control.matches(':disabled'))) {
    return (currentState.value = 'disabled')
  }
  if (controls.some((control) => control.matches(':focus'))) {
    return (currentState.value = 'focus')
  }
  if (
    props.isErrored ||
    controls.some((control) => control.matches(':invalid'))
  ) {
    return (currentState.value = 'error')
  }
  // 充足の判定に :placeholder-shown は使えない（date / select は
  // placeholder を持たないため、空でも「入力済み」と見なされる）
  if (controls.every((control) => control.value !== '')) {
    return (currentState.value = 'valid')
  }
  return (currentState.value = 'default')
}

const updateState = () => {
  checkElementState(
    Array.from(
      inputBox.value?.querySelectorAll<FormControl>(
        'input, textarea, select'
      ) ?? []
    )
  )
}

let observer: MutationObserver | null = null

onMounted(() => {
  if (!inputBox.value) {
    return
  }
  observer = new MutationObserver(updateState)
  observer.observe(inputBox.value, { childList: true, subtree: true })
  inputBox.value.addEventListener('focusin', updateState, true)
  inputBox.value.addEventListener('blur', updateState, true)
})

// onUnmounted の時点では inputBox.value が null で解除が走らない。
// observer も disconnect していなかったので、onBeforeUnmount で確実に片付ける
onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null

  if (!inputBox.value) {
    return
  }
  inputBox.value.removeEventListener('focusin', updateState, true)
  inputBox.value.removeEventListener('blur', updateState, true)
})

watch(
  () => props.isDisabled,
  () => (currentState.value = props.isDisabled ? 'disabled' : 'default'),
  { immediate: true }
)

// isErrored の変化は focus / blur を伴わないため、明示的に再判定する
// （以前は次に focus か blur が起きるまでエラー配色にならなかった）
watch(
  () => props.isErrored,
  () => {
    if (props.isDisabled) {
      return
    }
    updateState()
  }
)
</script>

<template>
  <div
    ref="inputBox"
    :class="$style.input_box"
    :style="{
      '--text-color': currentCssStyle.textColor,
      '--placeholder-color': currentCssStyle.placeholderColor,
      '--background-color': currentCssStyle.backgroundColor,
      '--border-style': `0 0 0 ${currentCssStyle.border?.size || '1px'} ${currentCssStyle.border?.color} inset`,
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
  box-shadow: var(--border-style), var(--box-shadow);
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
