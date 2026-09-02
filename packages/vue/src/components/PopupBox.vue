<script setup lang="ts">
import type { Ref } from 'vue'
import { ref } from 'vue'
withDefaults(
  defineProps<{
    position?: {
      x: 'left' | 'right' | 'center'
      y: 'top' | 'bottom' | 'center'
    }
  }>(),
  {
    position: () => ({ x: 'right', y: 'top' }),
  }
)

const isShown: Ref<boolean> = ref(false)

const showPopup = () => {
  isShown.value = true

  setTimeout(() => {
    isShown.value = false
  }, 3000)
}

defineExpose({
  showPopup,
})
</script>

<template>
  <teleport to="body">
    <div
      :class="[
        $style.popup,
        $style[`x-${position.x}`],
        $style[`y-${position.y}`],
        { [$style.show]: isShown },
      ]"
    >
      <slot />
    </div>
  </teleport>
</template>

<style lang="scss" module>
.x {
  &-left {
    left: max(calc((100vw - var(--contents-max-width)) / 2), var(--sp-medium));
  }

  &-right {
    right: max(calc((100vw - var(--contents-max-width)) / 2), var(--sp-medium));
  }

  &-center {
    inset: 0;
    margin: auto;
  }
}

.y {
  &-top {
    top: calc(var(--global-header-height) - var(--sp-small));
  }

  &-bottom {
    bottom: var(--sp-medium);
  }

  &-center {
    inset: 0;
    margin: auto;
  }
}

.popup {
  position: fixed;
  background-color: var(--white);
  border: 1px solid var(--primary-color);
  padding: var(--sp-medium);
  border-radius: var(--radius-small);
  inline-size: max-content;
  max-inline-size: calc(var(--lower-mobile-size) / 2);
  block-size: max-content;
  opacity: 0;
  transition: transform, opacity;
  transition-duration: var(--transition-duration);
  pointer-events: none;
  z-index: var(--z-index-overlay);

  &.show {
    opacity: 1;
  }
}
</style>
