<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import IconChevronDown from '@/components/Icon/KeyboardArrowDownIcon.vue'
import { useClickOutside } from '@/scripts/use-click-outside'
import { nextUniqueId } from '@/scripts/unique-id'
withDefaults(
  defineProps<{
    isHiddenArrow?: boolean
    contentAlignment?: 'left' | 'center' | 'right'
    isDisabled?: boolean
    contentsWidth?: string
  }>(),
  {
    isHiddenArrow: false,
    contentAlignment: 'left',
    isDisabled: false,
    contentsWidth: 'auto',
  }
)

const isContentsOpened = ref(false)
const root = ref<HTMLElement | null>(null)
const contents = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const contentsHeight = ref(0)

// aria-controls でトリガーとパネルを結ぶための id
const panelId = nextUniqueId('dropdown') + '_panel'

const toggleBox = () => (isContentsOpened.value = !isContentsOpened.value)
const closeDropDown = () => (isContentsOpened.value = false)

// Escape で閉じ、トリガーへフォーカスを戻す。戻さないと、閉じた瞬間に
// フォーカスが body へ落ちてキーボード操作の位置を見失う
const closeAndRefocus = (event: KeyboardEvent) => {
  if (!isContentsOpened.value) {
    return
  }

  // 自分が処理した印を残す。ModalBox の中に置いたとき、
  // ダイアログまで一緒に閉じるのを防ぐ
  event.preventDefault()
  closeDropDown()
  trigger.value?.focus()
}

const updateContentsHeight = () => {
  const contentsValue = contents.value
  if (contentsValue) {
    contentsHeight.value = contentsValue.clientHeight
  }
}

useClickOutside(root, () => closeDropDown())

// onUpdated はこのコンポーネントが再描画されたときしか走らない。
// スロットの中の子コンポーネントが自前の状態で伸縮すると高さがずれるため、
// 要素そのものを ResizeObserver で見る
let observer: ResizeObserver | null = null

onMounted(() => {
  updateContentsHeight()

  const contentsValue = contents.value

  if (!contentsValue || typeof ResizeObserver === 'undefined') {
    return
  }

  observer = new ResizeObserver(updateContentsHeight)
  observer.observe(contentsValue)
})

onBeforeUnmount(() => observer?.disconnect())
// React 版（DropdownUiHandle）と揃えて close も公開する
defineExpose({ isContentsOpened, close: closeDropDown })
</script>

<template>
  <div
    ref="root"
    :class="$style.drop_down_box"
    @keydown.escape="closeAndRefocus"
  >
    <button
      ref="trigger"
      :class="$style.button"
      :disabled="isDisabled"
      :aria-expanded="isContentsOpened"
      aria-haspopup="true"
      :aria-controls="$slots.contents ? panelId : undefined"
      type="button"
      :style="{
        '--trigger-color':
          isDisabled || !$slots.contents
            ? 'var(--text-color)'
            : 'var(--link-color)',
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
      :id="panelId"
      :class="$style.contents"
      :inert="!isContentsOpened || undefined"
      :style="{
        boxShadow: isContentsOpened ? 'var(--box-shadow)' : 'none',
        blockSize: isContentsOpened ? `${contentsHeight}px` : 0,
        inlineSize: contentsWidth,
        right: contentAlignment === 'right' ? 'calc(var(--bv) * -0.5)' : 'auto',
        left: contentAlignment === 'left' ? 'calc(var(--bv) * -0.5)' : 'auto',
        zIndex: '2',
      }"
    >
      <div ref="contents" @click="closeDropDown">
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
  display: flex;
  align-items: center;
  inline-size: 100%;
  block-size: 100%;
  gap: var(--sp-small);
  color: var(--trigger-color);
}

.icon {
  @include icon($size: var(--icon-small));
  flex: 0 0 auto;
  transition: all 0.1s;

  &.open {
    transform: rotate(180deg);
  }
}

.contents {
  border-radius: var(--radius-small);
  position: absolute;
  top: calc(100% - var(--sp-min));
  transition: block-size 0.1s;
  overflow: hidden;
  cursor: pointer;

  > div {
    max-block-size: calc(var(--bv) * 48);
    min-inline-size: calc(var(--bv) * 20);
    background-color: var(--white);
    overflow: auto;
  }
}
</style>
