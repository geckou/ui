<script setup lang="ts">
import type { Ref } from 'vue'
import { onBeforeUnmount, ref } from 'vue'
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
let hideTimer: ReturnType<typeof setTimeout> | null = null

const showPopup = () => {
  isShown.value = true

  // 連打されたら前のタイマーを捨てて数え直す（消えるまでの時間を毎回 3 秒にする）
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
  }

  hideTimer = setTimeout(() => {
    isShown.value = false
    hideTimer = null
  }, 3000)
}

// unmount 後に ref を触らないよう解除する
onBeforeUnmount(() => {
  if (hideTimer !== null) {
    clearTimeout(hideTimer)
  }
})

defineExpose({
  showPopup,
})
</script>

<template>
  <teleport to="body">
    <!--
      3 秒で消える通知。ライブリージョンにしないと支援技術に何も伝わらない
      （要素は常時 DOM にあり内容だけ差し替わるので、role だけで読み上げ対象になる）
    -->
    <div
      role="status"
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
    left: max(
      calc((100vw - var(--contents-max-width, 1440px)) / 2),
      var(--sp-medium)
    );
  }

  &-right {
    right: max(
      calc((100vw - var(--contents-max-width, 1440px)) / 2),
      var(--sp-medium)
    );
  }

  &-center {
    inset: 0;
    margin: auto;
  }
}

.y {
  &-top {
    top: calc(var(--global-header-height, 0px) - var(--sp-small));
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
  max-inline-size: calc(var(--mobile-lower-width, 430px) / 2);
  block-size: max-content;
  opacity: 0;
  transition: transform, opacity;
  transition-duration: var(--animation-duration, 0.3s);
  pointer-events: none;
  z-index: var(--z-index-overlay, 90);

  &.show {
    opacity: 1;
  }
}
</style>
