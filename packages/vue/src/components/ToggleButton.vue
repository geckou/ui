<script setup lang="ts">
import type {
  StateVariation,
  BaseStyle,
} from '@/types'
import { computed } from 'vue'
import { COLOR } from '@/const'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: boolean): void }>()

const props = withDefaults(defineProps<{
  name: string
  label?: Record<'on' | 'off', string>
  modelValue?: boolean
  isDisabled?: boolean
  cssStyle?: Record<StateVariation, {
    on: BaseStyle
    off: BaseStyle
  }>
}>(), {
  label   : () => ({ on: 'ON', off: 'OFF' }),
  cssStyle: undefined,
})

const isChecked = computed<boolean>({
  get: () => props.modelValue ?? false,
  set: (newValue: boolean) => emit('update:modelValue', newValue),
})

const maxTextLength = computed<number>(() => {
  const onLength = props.label.on.length
  const offLength = props.label.off.length

  return onLength > offLength ? onLength : offLength
})

const currentCssStyle = computed(() => {
  const cssStyle = props.isDisabled ? props.cssStyle?.disabled : props.cssStyle?.default

  return {
    on: {
      ...{
        textColor      : props.isDisabled ? COLOR.lightGray : COLOR.white,
        backgroundColor: props.isDisabled ? COLOR.gray : COLOR.blue,
        border         : {
          color : props.isDisabled ? COLOR.gray : COLOR.blue,
          size  : '1px',
          radius: '.25rem',
        },
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
      },
      ...cssStyle?.on,
    },
    off: {
      ...{
        textColor      : props.isDisabled ? COLOR.gray : COLOR.white,
        backgroundColor: props.isDisabled ? COLOR.lightGray : COLOR.darkGray,
        border         : {
          color : props.isDisabled ? COLOR.gray : COLOR.darkGray,
          size  : '1px',
          radius: '.25rem',
        },
        boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
      },
      ...cssStyle?.off,
    },
  }[isChecked.value ? 'on' : 'off']
})
</script>

<template>
  <button
    :class="$style.toggle_button"
    :style="{
      '--text-color': currentCssStyle?.textColor,
      '--border-color': currentCssStyle?.border?.color,
      '--border-size' : currentCssStyle?.border?.size,
      '--radius-size': currentCssStyle?.border?.radius,
      '--background-color': currentCssStyle?.backgroundColor,
      '--box-shadow': currentCssStyle?.boxShadow,
      '--inline-size': `${maxTextLength * 2}ch`,
    }"
    type="button"
    :disabled="isDisabled"
    @click.stop="!isDisabled ? isChecked = !isChecked : null"
  >
    <input 
      v-model="isChecked"
      type="checkbox"
      :name="name"
      :disabled="isDisabled"
    >
    <div
      :class="[$style.text, {[$style.on]: isChecked}]"
      :data-on="label.on"
      :data-off="label.off"
    />
    <div :class="$style.handle" />
  </button>
</template>

<style lang="scss" module>
:is(.toggle_button) {
  --handle-size: 1.5rem;
  --padding-size: calc(var(--border-size) + 2px);
  --duration: .15s;
  inline-size: calc(var(--inline-size) + var(--handle-size) + (var(--padding-size) * 2));
  position: relative;
  display: inline-block;
  padding: var(--padding-size);
  background-color: var(--background-color);
  box-shadow:
    0 0 0 var(--border-size) var(--border-color) inset,
    var(--box-shadow)
  ;
  border: none;
  border-radius: var(--radius-size);
  cursor: pointer;

  > input {
    display: none;
  }
}

:is(.text) {
  position: absolute;
  inline-size: 100%;
  block-size: 100%;
  text-transform: uppercase;
  color: var(--text-color);
  top: 0;
  left: 0;

  &::before,
  &::after {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    block-size: 100%;
    inline-size: calc(100% - var(--handle-size) - var(--padding-size));
    margin: auto;
    line-height: 1;
    position: absolute;
    transition: opacity var(--duration) ease-out;
  }

  &::before {
    content: attr(data-off);
    right: 0;
  }

  &::after {
    content: attr(data-on);
    left: 0;
    opacity: 0;
  }

  &.on {
    &:before { opacity: 0; }
    &:after { opacity: 1; }

    + .handle {
      left: calc(100% - var(--handle-size));
    }
  }
}

:is(.handle) {
  inline-size: var(--handle-size);
  aspect-ratio: 1 / 1;
  margin: 0;
  background-color: var(--text-color);
  border-radius: calc(var(--radius-size) - (var(--padding-size) / 2));
  box-shadow: var(--box-shadow);
  position: relative;
  left: 0;
  transition: left var(--duration) ease-out;
}
</style>