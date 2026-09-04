<script setup lang="ts">
import type { CheckBoxStyleForEachStatus } from '@/types'
import { computed } from 'vue'
import CheckIcon from '@/components/Icon/CheckIcon.vue'
import { COLOR } from '@/const'

// 送信用の <input> を <button> の外へ出したため複数ルートになる。
// 属性は自動継承されないので、明示的に button へ渡す
defineOptions({ inheritAttrs: false })

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: boolean): void
}>()

const props = withDefaults(
  defineProps<{
    name: string
    /** ネイティブ送信で使う値。同じ name のグループで区別するために渡す */
    value?: string | number
    modelValue?: boolean
    isDisabled?: boolean
    cssStyle?: CheckBoxStyleForEachStatus
    isDisableAnimation?: boolean
    /**
     * アクセシブル名。可視ラベルがあるなら ariaLabelledBy でその要素を指すこと。
     * どちらも無いときだけ name を名前として使う（機械名でも無いよりはマシ）
     */
    ariaLabel?: string
    ariaLabelledBy?: string
  }>(),
  {
    value: undefined,
    cssStyle: undefined,
    ariaLabel: undefined,
    ariaLabelledBy: undefined,
  }
)

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
      textColor: props.isDisabled ? COLOR.darkGray : COLOR.blue,
      backgroundColor: props.isDisabled ? COLOR.lightGray : COLOR.white,
      border: {
        color: props.isDisabled ? COLOR.darkGray : COLOR.blue,
        size: '1px',
        radius: '.25rem',
      },
    },
    ...cssStyle,
  }
})
</script>

<template>
  <button
    v-bind="$attrs"
    :class="$style.check_box"
    :style="{
      '--text-color': currentCssStyle?.textColor,
      '--border-color': currentCssStyle?.border?.color,
      '--border-size': currentCssStyle?.border?.size,
      '--radius-size': currentCssStyle?.border?.radius,
      '--background-color': currentCssStyle?.backgroundColor,
      '--duration': isDisableAnimation ? '0s' : '.3s',
    }"
    type="button"
    role="checkbox"
    :disabled="isDisabled"
    :data-checked="isChecked"
    :aria-checked="isChecked"
    :aria-labelledby="ariaLabelledBy"
    :aria-label="ariaLabelledBy ? undefined : (ariaLabel ?? name)"
    @click.stop="!isDisabled ? (isChecked = !isChecked) : null"
  >
    <div :class="$style.check_container">
      <slot name="check" />
      <CheckIcon v-if="!$slots.check" />
    </div>
  </button>
  <!--
    値の送信専用。<button> の content model は interactive content を許さないので
    中に <input> は置けない。チェック時だけ hidden として外に出す
    （未チェックなら送られない、というネイティブの挙動はそのまま）
  -->
  <input
    v-if="isChecked"
    type="hidden"
    :name="name"
    :value="value ?? 'on'"
    :disabled="isDisabled"
  />
</template>

<style lang="scss" module>
@keyframes pop {
  0% {
    scale: 1;
  }

  10% {
    scale: 0.8;
  }

  50% {
    scale: 1.1;
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

  &:disabled {
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

  &[data-checked='true'] {
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
