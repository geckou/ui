<script setup lang="ts">
import { ref, onMounted, onUpdated } from 'vue'
import IconChevronDown from '@/components/Icon/KeyboardArrowDownIcon.vue'
withDefaults(defineProps<{
  isHiddenArrow?: boolean,
  contentAlignment?: 'left' | 'center' | 'right',
  isDisabled?: boolean
  contentsWidth?: string
}>(), {
  isHiddenArrow   : false,
  contentAlignment: 'left',
  isDisabled      : false,
  contentsWidth   : 'auto',
})

const isContentsOpened = ref(false)
const contents = ref<HTMLElement | null>(null)
const contentsHeight = ref(0)
const toggleBox = () => isContentsOpened.value = !isContentsOpened.value
const closeDropDown = () => isContentsOpened.value = false

const updateContentsHeight = () => {
  const contentsValue = contents.value
  if (contentsValue) {
    contentsHeight.value = contentsValue.clientHeight
  }
}

onMounted(()=> updateContentsHeight())
onUpdated(() => updateContentsHeight())
defineExpose({ isContentsOpened })
</script>

<template>
  <div
    v-click-outside="closeDropDown"
    :class="$style.drop_down_box"
  >
    <button
      :class="$style.button"
      :disabled="isDisabled"
      type="button"
      :style="{
        '--trigger-color': isDisabled || !$slots.contents ? 'var(--text-color)' : 'var(--link-color)',
        cursor: isDisabled || !$slots.contents ? 'auto' : 'pointer',
      }"
      @click.prevent="toggleBox"
    >
      <slot name="trigger" />
      <IconChevronDown
        v-if="!(isHiddenArrow || !$slots.contents || isDisabled)"
        :class="[$style.icon, { [$style.open]: isContentsOpened }]"
      />
    </button>
    <div
      v-if="$slots.contents"
      :class="$style.contents"
      :style="{
        boxShadow: isContentsOpened ? 'var(--box-shadow)' : 'none',
        blockSize: isContentsOpened ? `${contentsHeight}px` : 0,
        inlineSize: contentsWidth,
        right: contentAlignment === 'right' ? 'calc(var(--bv) * -0.5)' : 'auto',
        left: contentAlignment === 'left' ? 'calc(var(--bv) * -0.5)' : 'auto',
        zIndex: '2',
      }"
    >
      <div
        ref="contents"
        @click="closeDropDown"
      >
        <slot name="contents" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.drop_down_box {
  position: relative;
}

.button {
  display    : flex;
  align-items: center;
  inline-size: 100%;
  block-size : 100%;
  gap        : var(--sp-small);
  color      : var(--trigger-color);
}

.icon {
  @include icon($size: var(--icon-small));
  flex      : 0 0 auto;
  transition: all .1s;

  &.open {
    transform: rotate(180deg);
  }
}

.contents {
  border-radius: var(--radius-small);
  position     : absolute;
  top          : calc(100% - var(--sp-min));
  transition   : block-size .1s;
  overflow     : hidden;
  cursor       : pointer;
  
  > div {
    max-block-size  : calc(var(--bv) * 48);
    min-inline-size : calc(var(--bv) * 20);
    background-color: var(--white);
    overflow        : auto;
  }
}
</style>
