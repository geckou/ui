<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  createModalLayer,
  createScrollLock,
  handleTabKey,
} from '@geckou/ui-core'
import IconClose from '@/components/Icon/CloseIcon.vue'
import { nextUniqueId } from '@/scripts/unique-id'

const props = defineProps<{
  isShown: boolean
  size?: 'small' | 'medium' | 'large'
  /** header スロットを使わない場合のダイアログ名 */
  ariaLabel?: string
}>()

// React 版（ModalBox.tsx）と揃える。header があればそれを名前にする
const headerId = nextUniqueId('modal_header')
const dialog = ref<HTMLElement | null>(null)

// React 版（ModalBox.tsx の onClose）と揃える
const emit = defineEmits<{ (e: 'close'): void }>()

// ロック数を数える実装は @geckou/ui-core に置いて React 版と共有している
// （document の参照は呼び出し時なので SSR でも安全）
const scrollLock = createScrollLock()
const toggleScrollLock = (shouldLock: boolean) => scrollLock.toggle(shouldLock)

// 自発的に閉じたときだけ emit する。親が isShown=false にしたときや unmount 時に
// emit すると、親のハンドラが再入する
const requestClose = () => emit('close')

// 重なっているモーダルのうち、キー入力を処理してよいのは最前面のものだけ。
// 判定は @geckou/ui-core に置いて React 版と共有している
const modalLayer = createModalLayer()
const updateModalLayer = (isShown: boolean) =>
  modalLayer.toggle(isShown, dialog.value)

// スクロールロックと最前面判定は isShown の変化に追従させる（emit とは切り離す）
watch(
  () => props.isShown,
  (newVal) => {
    toggleScrollLock(newVal)
    updateModalLayer(newVal)
  }
)

// 開いたらダイアログへフォーカスを移し、閉じたら開く前の要素へ戻す
// （戻さないとフォーカスが body に落ち、キーボード操作の位置を見失う）
let lastFocused: HTMLElement | null = null

watch(
  () => props.isShown,
  async (newVal) => {
    if (!newVal) {
      lastFocused?.focus()
      lastFocused = null
      return
    }

    lastFocused =
      typeof document === 'undefined'
        ? null
        : (document.activeElement as HTMLElement | null)
    await nextTick()
    dialog.value?.focus()
  }
)

// inert は HTML の boolean 属性で、値に関係なく「存在すれば有効」。
// Vue は false を inert="false" として出すため、そのまま渡すと
// 表示中も中身を操作できない。属性ごと消すには undefined を渡す
const isInert = computed(() => !props.isShown || undefined)

// Escape で閉じ、Tab / Shift+Tab はダイアログ内で循環させる
// （role="dialog" は自前で実装する必要がある。背景は inert にしていないので、
//  トラップが無いと Tab で外のリンクやボタンへ抜ける）
const handleKeyDown = (event: KeyboardEvent) => {
  if (!props.isShown) {
    return
  }

  // 重ねたモーダルで内側の Escape が外側まで閉じていた。ハンドラは全部
  // document に付いていて実行順が当てにならないので、最前面かどうかで決める
  if (!modalLayer.isTopmost()) {
    return
  }

  // 子（SearchableSelectBox の候補リスト等）がキー入力を処理した印。
  // 尊重しないと、候補を閉じる Escape でダイアログまで閉じてしまう
  // （Tab も同様にスキップする。現状 Tab を握る子はいない）
  if (event.defaultPrevented) {
    return
  }

  if (event.key === 'Escape') {
    // 自分が処理した印を残す。これが無いと、外側で Escape を見ている
    // アプリ側のハンドラまで一緒に反応する
    event.preventDefault()
    requestClose()

    return
  }

  handleTabKey(dialog.value, event, document.activeElement)
}

onMounted(() => {
  toggleScrollLock(props.isShown)
  updateModalLayer(props.isShown)
  document.addEventListener('keydown', handleKeyDown)
})

onBeforeUnmount(() => {
  scrollLock.release()
  modalLayer.release()
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div
    :class="[$style.overlay, { [$style.display]: isShown }]"
    :aria-hidden="!isShown"
    :inert="isInert"
    @click.self="requestClose"
  >
    <div
      ref="dialog"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="$slots.header ? headerId : undefined"
      :aria-label="$slots.header ? undefined : (ariaLabel ?? 'ダイアログ')"
      :tabindex="-1"
      :class="[$style.container, $style[size ?? 'medium']]"
    >
      <header v-if="$slots.header" :id="headerId" :class="$style.header">
        <slot name="header" />
      </header>
      <div :class="$style.contents">
        <slot />
      </div>
      <footer v-if="$slots.footer" :class="$style.footer">
        <slot name="footer" />
      </footer>
      <button
        type="button"
        aria-label="閉じる"
        :class="$style.close_button"
        @click="requestClose"
      >
        <IconClose />
      </button>
    </div>
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  display: flex;
  flex-direction: column;
  inline-size: 100%;
  max-inline-size: var(--desktop-lower-width);
  max-block-size: 100%;
  background-color: var(--white);
  border-radius: var(--radius-small);
  cursor: auto;
  filter: drop-shadow(0 0 6px var(--shadow-color, rgba(21, 20, 58, 0.12)));
  position: relative;

  &.small {
    max-inline-size: var(--mobile-lower-width);
  }

  &.large {
    max-inline-size: var(--contents-max-width, 1440px);
  }
}

.header {
  padding: var(--sp-medium) var(--sp-large);
  border-block-end: 1px solid var(--light-border-color);

  > h2 {
    font-size: var(--fs-large);
    font-weight: bold;
  }

  @include media('mobile') {
    padding: var(--sp-medium);
  }
}

.contents {
  flex: 1 1 auto;
  overflow: auto;
  padding: var(--sp-large);

  @include media('mobile') {
    padding: var(--sp-medium);
  }
}

.footer {
  display: flex;
  justify-content: center;
  gap: var(--sp-large);
  padding: var(--sp-medium) var(--sp-large);
  border-block-start: 1px solid var(--light-border-color);

  @include media('mobile') {
    gap: var(--sp-medium);
    padding: var(--sp-medium);

    > * {
      flex: 1 1 auto;
    }
  }
}

.close_button {
  inline-size: var(--icon-medium);
  block-size: var(--icon-medium);
  color: var(--white);
  line-height: 1;
  cursor: pointer;
  position: absolute;
  bottom: 100%;
  left: 100%;

  > * {
    @include icon();
  }
}

.overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  inline-size: 100dvw;
  block-size: 100dvh;
  padding: var(--sp-larger);
  background: var(--overlay-color, rgba(0, 8, 26, 0.5));
  background-blend-mode: multiply;
  backdrop-filter: blur(4px);
  opacity: 0;
  transition: opacity 0.1s linear;
  pointer-events: none;
  position: fixed;
  z-index: var(--z-index-overlay, 90);
  top: 0;
  left: 0;
  cursor: pointer;
  overflow: hidden;

  @include media('mobile') {
    padding-inline: var(--sp-large);
  }

  &.display {
    opacity: 1;
    pointer-events: auto;
    z-index: calc(var(--z-index-nav, 70) + 1);
  }
}
</style>
