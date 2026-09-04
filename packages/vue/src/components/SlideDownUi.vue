<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, onMounted, onUpdated, watch } from 'vue'
import IconChevronDown from '@/components/Icon/KeyboardArrowDownIcon.vue'
import { useClickOutside } from '@/scripts/use-click-outside'
const props = withDefaults(
  defineProps<{
    isOpened?: boolean | null
    isHiddenArrow?: boolean
    isDisabled?: boolean
    isDisableClickOutside?: boolean
    duration?: number
  }>(),
  {
    isOpened: null,
    duration: 0.3,
  }
)

const isOpenedContents = ref(props.isOpened || false)
const root: Ref<HTMLElement | null> = ref(null)
const contents: Ref<HTMLElement | null> = ref(null)
const contentsHeight = ref(0)
const toggleBox = () => (isOpenedContents.value = !isOpenedContents.value)

const close = () => (isOpenedContents.value = false)

const closeDropDown = () => {
  if (!props.isDisableClickOutside) {
    close()
  }
}

const updateContentsHeight = () => {
  const contentsValue = contents.value
  if (contentsValue) {
    contentsHeight.value = contentsValue.clientHeight
  }
}

useClickOutside(root, () => closeDropDown())

onMounted(() => updateContentsHeight())
onUpdated(() => updateContentsHeight())
watch(
  () => props.isOpened,
  (newValue) => {
    if (typeof newValue === 'boolean') {
      isOpenedContents.value = newValue
    }
  }
)
// React 版（SlideDownUiHandle）と揃えて close も公開する。
// 外から閉じる用途なので isDisableClickOutside は見ない
defineExpose({ isOpenedContents, close })
</script>

<template>
  <div
    ref="root"
    :class="{ [$style.opened]: isOpenedContents }"
    :style="{ '--accordion-toggle-duration': `${props.duration}s` }"
  >
    <button
      :class="$style.trigger"
      :disabled="isDisabled"
      :aria-expanded="isOpenedContents"
      type="button"
      @click.prevent="toggleBox"
    >
      <div :class="$style.trigger_content">
        <slot name="trigger" />
      </div>
      <IconChevronDown v-if="!isHiddenArrow" :class="$style.icon" />
    </button>
    <div
      :style="{ height: isOpenedContents ? `${contentsHeight}px` : 0 }"
      :class="$style.contents"
      :inert="!isOpenedContents || undefined"
    >
      <div ref="contents" :class="$style.container">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

@keyframes overflow {
  0% {
    overflow: hidden;
  }

  99% {
    overflow: hidden;
  }

  100% {
    overflow: visible;
  }
}

.trigger_content {
  inline-size: 100%;
  text-align: start;
}

.trigger {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  inline-size: 100%;
  justify-items: start;
  cursor: pointer;
  position: relative;
  color: var(--link-color);
}

.icon {
  @include icon($color: var(--link-color));
  flex: 0 0 auto;
  transition: all 0.1s;
}

.contents {
  transition: height var(--accordion-toggle-duration);
  overflow: hidden;
}

.opened {
  .icon {
    transform: rotate(180deg);
  }

  .contents {
    animation: overflow var(--accordion-toggle-duration);
    animation-fill-mode: forwards;
  }
}
</style>
