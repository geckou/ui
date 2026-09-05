<script lang="ts" setup>
import { COLOR } from '@/const'
const { red: cautionColor } = COLOR

defineProps<{
  /** aria-describedby から参照させたいときに渡す */
  id?: string
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
    :id="id"
    role="alert"
    :class="$style.error_messages"
    :style="{
      '--error-text-color': cssStyle?.textColor || '#fff',
      '--error-background-color': cssStyle?.backgroundColor || cautionColor,
    }"
  >
    <!-- 同じ文言の validates を複数渡せるので、キーは位置で振る -->
    <span v-for="(message, index) in errorMessages" :key="index">
      {{ message }}
    </span>
  </div>
</template>

<style lang="scss" module>
:is(.error_messages) {
  inline-size: max-content;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: small;
  color: var(--error-text-color);
  background-color: var(--error-background-color);
  box-shadow: 0 0 0.5rem 0.25rem #33333322;
  border-radius: 0.25rem;
  line-height: 1;
  position: absolute;
  inset-block-start: calc(100% + 0.25rem);

  &::before {
    --tail-size: 0.85rem;
    content: '';
    display: block;
    background-color: var(--error-background-color);
    inline-size: var(--tail-size);
    block-size: calc(var(--tail-size) * 0.625);
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
    position: absolute;
    bottom: calc(100% - 1px);
    inset-inline-start: 0.85rem;
  }
}
</style>
