<script setup lang="ts">
import type { ButtonStyleForEachStatus } from '@/types'
import { computed } from 'vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { COLOR } from '@/const'

const props = defineProps<{
  cssStyle?: ButtonStyleForEachStatus
  duration?: number
  isLoading?: boolean
  isDisabled?: boolean
  buttonType?: 'button' | 'submit' | 'reset'
}>()

const currentCssStyle = computed(() => {
  const cssStyle = props.isDisabled ? props.cssStyle?.disabled : props.cssStyle?.default

  return {
    ...{
      textColor      : COLOR.white,
      backgroundColor: props.isDisabled ? COLOR.darkGray : COLOR.blue,
      backgroundImage: 'none',
      border         : {
        color : props.isDisabled ? COLOR.darkGray : COLOR.blue,
        size  : '1px',
        radius: '.25rem',
      },
      boxShadow: '0 0 0 0 transparent',
    },
    ...cssStyle,
  }
})

const hoverStyle = props.cssStyle?.hover || {}
</script>

<template>
  <button
    :class="[
      $style.button,
      { [$style.loading] : isLoading },
    ]"
    :style="{
      '--text-color': currentCssStyle?.textColor,
      '--background-color': currentCssStyle?.backgroundColor,
      '--background-image': currentCssStyle?.backgroundImage,
      '--border-color': currentCssStyle?.border?.color,
      '--border-size': currentCssStyle?.border?.size,
      '--radius-size': currentCssStyle?.border?.radius,
      '--box-shadow': currentCssStyle?.boxShadow,
      '--hover-text-color': hoverStyle?.textColor || currentCssStyle?.textColor,
      '--hover-background-color': hoverStyle?.backgroundColor || currentCssStyle?.backgroundColor && `${currentCssStyle?.backgroundColor}cc`,
      '--hover-background-image': hoverStyle?.backgroundImage || currentCssStyle?.backgroundImage,
      '--hover-border-color': hoverStyle?.border?.color || currentCssStyle?.border?.color,
      '--hover-border-size': hoverStyle?.border?.size || currentCssStyle?.border?.size,
      '--hover-radius-size': hoverStyle?.border?.radius || currentCssStyle?.border?.radius,
      '--hover-box-shadow': hoverStyle?.boxShadow || currentCssStyle?.boxShadow,
      '--duration': `${duration || .3}s`,
    }"
    :type="buttonType || 'button'"
    :disabled="isDisabled || isLoading"
  >
    <div
      v-show="isLoading"
      :class="$style.loading_animation"
    >
      <slot
        v-if="$slots.loading"
        name="loading"
      />
      <LoadingSpinner v-else />
    </div>
    <div>
      <slot />
    </div>
  </button>
</template>

<style lang="scss" module>
:is(.button) {
  display         : inline-flex;
  justify-content : center;
  align-items     : center;
  inline-size     : max-content;
  padding         : 1rem 2rem;
  background-color: var(--background-color);
  box-shadow      :
    0 0 0 var(--border-size) var(--border-color) inset,
    var(--box-shadow);
  border          : none;
  border-radius   : var(--radius-size);
  color           : var(--text-color);
  line-height     : 1;
  transition      : all var(--duration);
  position        : relative;
  cursor          : pointer;

  @media (hover: hover) {
    &:where(:any-link, :enabled, summary):hover {
      background-color: var(--hover-background-color);
      box-shadow      :
        0 0 0 var(--hover-border-size) var(--hover-border-color) inset,
        var(--hover-box-shadow);
      border-radius   : var(--hover-radius-size);
      color           : var(--hover-text-color);
    }
  }

  &.loading,
  &:disabled {
    pointer-events: none !important;

    &::before {
      content       : '';
      position      : absolute;
      inset         : 0;
      pointer-events: all;
      cursor        : not-allowed !important;
    }
  }

  &.loading {
    > *:not(:is(.loading_animation)) {
      visibility: hidden;
    }
  }
}

:is(.loading_animation) {
  max-block-size: calc(100% - 1.5rem);
  color         : currentColor;
  fill          : currentColor;
  position      : absolute;
  margin        : auto;
  inset         : 0;

  * {
    max-block-size: 100%;
    color         : currentColor;
    fill          : currentColor;
  }
}
</style>