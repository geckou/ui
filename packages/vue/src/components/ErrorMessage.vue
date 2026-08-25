<script lang="ts" setup>
import { COLOR } from '@/const'
const { red: cautionColor } = COLOR

defineProps<{
  cssStyle?: {
    textColor: string | undefined
    backgroundColor: string | undefined
  }
  errorMessages?: Array<string>
}>()
</script>

<template>
  <div
    v-show="errorMessages && errorMessages.length"
    :class="$style.error_messages"
    :style="{
      '--error-text-color': cssStyle?.textColor || '#fff',
      '--error-background-color': cssStyle?.backgroundColor || cautionColor,
    }"
  >
    <span
      v-for="message in errorMessages"
      :key="message"
    >
      {{ message }}
    </span>
  </div>
</template>

<style lang="scss" module>
:is(.error_messages) {
  inline-size: max-content;
  display: flex;
  flex-direction: column;
  gap: .5rem;
  padding: .5rem .75rem;
  font-size: small;
  color: var(--error-text-color);
  background-color: var(--error-background-color);
  box-shadow: 0 0 .5rem .25rem #33333322;
  border-radius: .25rem;
  line-height: 1;
  position: absolute;
  inset-block-start: calc(100% + .25rem);

  &::before {
    --tail-size: .85rem;
    content: '';
    display: block;
    background-color: var(--error-background-color);
    inline-size: var(--tail-size);
    block-size: calc(var(--tail-size) * .625);
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    position: absolute;
    bottom: calc(100% - 1px);
    inset-inline-start: .85rem;
  }
}
</style>