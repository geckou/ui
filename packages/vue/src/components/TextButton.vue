<script setup lang="ts">
import { computed } from 'vue'
import { COLOR } from '@/const'

const props = withDefaults(
  defineProps<{
    text: string
    variant?: 'default' | 'caution'
    isDisabled?: boolean
  }>(),
  {
    variant: 'default',
    isDisabled: false,
  }
)

const textColor = computed(() =>
  props.variant === 'caution' ? COLOR.red : 'var(--link-color)'
)
</script>

<template>
  <button
    type="button"
    :class="$style.text_button"
    :disabled="isDisabled"
    :style="{ '--text-button-color': textColor }"
  >
    {{ text }}
  </button>
</template>

<style lang="scss" module>
.text_button {
  padding: 0;
  border: none;
  background-color: transparent;
  color: var(--text-button-color);
  font-size: inherit;
  line-height: 1;
  cursor: pointer;

  &:hover:not(:disabled) {
    text-decoration: underline;
  }

  &:disabled {
    color: var(--disable-text-color);
    cursor: not-allowed;
  }
}
</style>
