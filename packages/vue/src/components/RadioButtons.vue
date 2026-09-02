<script lang="ts">
// name を省略したときの既定値に使う連番。
// <script setup> の中はインスタンスごとに実行されるため、モジュールスコープはこちらに置く
let groupSequence = 0
</script>

<script setup lang="ts">
import type { Option, RadioButtonStyleForEachStatus } from '@/types'
import { ref, watch, computed } from 'vue'
import { isEmptyValue } from '@geckou/ui-core'
import { COLOR } from '@/const'

type SelectValue = string | number

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: SelectValue): void
}>()

const props = withDefaults(
  defineProps<{
    modelValue: SelectValue
    options: Array<Option>
    name?: string
    isDisabled?: boolean
    isRequired?: boolean
    cssStyle?: RadioButtonStyleForEachStatus
    isDisableAnimation?: boolean
  }>(),
  {
    name: undefined,
    cssStyle: undefined,
  }
)

// name を省略したときの一意な既定値。
// vue 3.5 の useId は peerDependencies（^3.0.0）を満たさないため使わない
const groupName = props.name ?? `radio_group_${++groupSequence}`

const errorMessages = ref<Array<string>>([])

const selectedValue = computed({
  get: () => props.modelValue ?? '',
  set: (newValue: SelectValue) => emit('update:modelValue', newValue),
})

const currentCssStyle = computed(() => {
  const cssStyle = props.isDisabled
    ? props.cssStyle?.disabled
    : props.cssStyle?.default

  return {
    ...{
      textColor: props.isDisabled ? COLOR.darkGray : COLOR.black,
      backgroundColor: props.isDisabled ? COLOR.lightGray : COLOR.white,
      border: {
        color: props.isDisabled ? COLOR.darkGray : COLOR.blue,
        size: '1px',
      },
    },
    ...(cssStyle ?? {}),
  }
})

const validateValue = () => {
  errorMessages.value = []
  // 未選択の判定は truthy ではなく「空かどうか」で行う。
  // SelectValue は string | number なので、0 は正当な選択値
  if (isEmptyValue(selectedValue.value) && props.isRequired) {
    errorMessages.value.push('必須項目です')
  }
}

watch(
  () => selectedValue.value,
  () => validateValue(),
  { immediate: !isEmptyValue(props.modelValue) }
)
</script>

<template>
  <div :class="$style.radios">
    <label
      v-for="option in options"
      :key="option.value"
      :class="$style.radio"
      :style="{
        '--border-color': currentCssStyle?.border?.color,
        '--border-size': currentCssStyle?.border?.size,
        '--background-color': currentCssStyle?.backgroundColor,
        '--duration': isDisableAnimation ? '0s' : '.3s',
      }"
    >
      <input
        v-model="selectedValue"
        type="radio"
        :name="groupName"
        :value="option.value"
        :disabled="isDisabled"
        :required="isRequired"
        :checked="option.value === selectedValue"
      />
      <span>
        {{ option.label }}
      </span>
    </label>
  </div>
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
    scale: 1.2;
  }

  100% {
    scale: 1;
  }
}

:is(.radios) {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

:is(.radio) {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem;
  color: var(--border-color);
  cursor: pointer;

  &::before {
    content: '';
    display: inline-block;
    aspect-ratio: 1 / 1;
    width: 1rem;
    box-shadow: 0 0 0 1px var(--border-color) inset;
    background-color: var(--background-color);
    border-radius: 50%;
    transition: all var(--duration) linear;
  }

  &:has(input:checked) {
    color: var(--text-color);

    &::before {
      box-shadow:
        0 0 0 2px var(--background-color) inset,
        0 0 0 1px var(--border-color);
      background-color: var(--border-color);
      animation: pop var(--duration) ease-out;
    }
  }

  &:has(input:disabled) {
    cursor: not-allowed !important;
  }

  > input {
    display: none;
  }
}
</style>
