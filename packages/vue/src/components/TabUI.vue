<script setup lang="ts">
import { ref } from 'vue'
import { COLOR } from '@/const'

const props = withDefaults(defineProps<{
  tabs: {
    key: string
    label: string
  }[]
  color?: {
    active: string
    background: string
    text: string
  }
  cssStyle?: {
    textColor: string
    backgroundColor: string
    border: {
      color: string
      size: string
      radius: string
    }
  }
  type?: 'tab' | 'button' | 'border'
  initialIndex?: number
}>(), {
  color       : undefined,
  cssStyle    : undefined,
  type        : 'tab',
  initialIndex: 0,
})

const activeTab = ref(props.tabs[props.initialIndex].key)
const tabRefs = ref<HTMLButtonElement[]>([])
const changeTabs = (key: string) => activeTab.value = key

const activateTab = (index: number) => {
  activeTab.value = props.tabs[index].key
  tabRefs.value[index]?.focus()
}

// 以前は window 全体に keydown を張っていたため、フォーカス位置と無関係にタブが
// 切り替わり、1 画面に複数設置すると互いに競合した。
// タブリストにフォーカスがあるときだけ矢印キーで移動する（WAI-ARIA Tabs パターン）
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return

  const currentIndex = props.tabs.findIndex(tab => tab.key === activeTab.value)
  if (currentIndex === -1) return

  event.preventDefault()
  const lastIndex = props.tabs.length - 1

  if (event.key === 'ArrowLeft') {
    activateTab(currentIndex > 0 ? currentIndex - 1 : lastIndex)
  } else {
    activateTab(currentIndex < lastIndex ? currentIndex + 1 : 0)
  }
}
</script>

<template>
  <div>
    <div
      :class="$style.tabs"
      :style="{
        '--active-color': color?.active || COLOR.blue,
        '--background-color': color?.background || 'transparent',
      }"
      role="tablist"
      @keydown="handleKeydown"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="tab.key"
        :key="tab.key"
        :ref="el => { if (el) tabRefs[index] = el as HTMLButtonElement }"
        role="tab"
        :aria-controls="`${tab.key}_${index}`"
        :aria-selected="activeTab === tab.key"
        :tabindex="activeTab === tab.key ? 0 : -1"
        :class="{ [$style.active]: activeTab === tab.key }"
        @click="changeTabs(tab.key)"
      >
        <slot :name="tab.key" />
        <template v-if="!$slots[tab.key]">
          {{ tab.label }}
        </template>
      </button>
    </div>
    <div
      v-for="(tab, index) in tabs"
      v-show="activeTab === tab.key"
      :id="`${tab.key}_${index}`"
      :key="`${tab.key}_panel`"
      role="tabpanel"
      :aria-labelledby="tab.key"
    >
      <slot :name="`${tab.key}Contents`" />
    </div>
  </div>
</template>

<style lang="scss" module>
.tabs {
  display         : flex;
  background-color: var(--background-color);

  > button {
    &[role="tab"] {
      border          : none;
      background-color: transparent;
      font-size       : 1rem;
      padding         : .5rem 1rem;
      cursor          : pointer;

      &.active {
        cursor: auto;
      }
    }
  }
}
</style>