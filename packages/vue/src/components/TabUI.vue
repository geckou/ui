<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { COLOR } from '@/const'
import { nextUniqueId } from '@/scripts/unique-id'

const props = withDefaults(
  defineProps<{
    tabs: {
      key: string
      label: string
    }[]
    color?: {
      active: string
      background: string
      text: string
    }
    initialIndex?: number
    /**
     * 選択中のタブの key。`v-model:activeKey` で双方向に使える。
     * 省略すると内部の状態だけで動く（従来どおり）
     */
    activeKey?: string
  }>(),
  {
    color: undefined,
    initialIndex: 0,
    activeKey: undefined,
  }
)

const emit = defineEmits<{
  'update:activeKey': [key: string]
}>()

// 1 画面に複数置いても DOM id が衝突しないよう、インスタンスごとの接頭辞を付ける
const uid = nextUniqueId('tabs')
const tabId = (key: string) => `${uid}_tab_${key}`
const panelId = (key: string) => `${uid}_panel_${key}`

// initialIndex が範囲外でも落とさない（React 版と揃える）
const initialTab = props.tabs[props.initialIndex] ?? props.tabs[0]
const selectedKey = ref(initialTab?.key ?? '')
const tabRefs = ref<HTMLButtonElement[]>([])

// tabs が後から差し替わって選択中の key が消えると、どのパネルも出なくなる。
// 描画のたびに実在する key へ寄せる
const activeTab = computed(() => {
  const key = props.activeKey ?? selectedKey.value

  return props.tabs.some((tab) => tab.key === key)
    ? key
    : (props.tabs[0]?.key ?? '')
})

const changeTabs = (key: string) => {
  selectedKey.value = key
  emit('update:activeKey', key)
}

// 上の computed は描画を守るだけで、親の v-model は古い key のまま。
// tabs の差し替えで key が消えたときは親にも伝える
watch(
  () => props.tabs,
  (tabs) => {
    const key = props.activeKey ?? selectedKey.value

    if (tabs.some((tab) => tab.key === key)) {
      return
    }

    changeTabs(tabs[0]?.key ?? '')
  }
)

const activateTab = (index: number) => {
  const tab = props.tabs[index]

  if (!tab) {
    return
  }

  changeTabs(tab.key)
  tabRefs.value[index]?.focus()
}

// 以前は window 全体に keydown を張っていたため、フォーカス位置と無関係にタブが
// 切り替わり、1 画面に複数設置すると互いに競合した。
// タブリストにフォーカスがあるときだけ矢印キーで移動する（WAI-ARIA Tabs パターン）
const handleKeydown = (event: KeyboardEvent) => {
  const lastIndex = props.tabs.length - 1

  if (lastIndex < 0) {
    return
  }

  // APG の Tabs パターンは Home / End で端のタブへ飛べることを求める
  if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    activateTab(event.key === 'Home' ? 0 : lastIndex)

    return
  }

  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return
  }

  const currentIndex = props.tabs.findIndex(
    (tab) => tab.key === activeTab.value
  )
  if (currentIndex === -1) {
    return
  }

  event.preventDefault()

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
        '--text-color': color?.text || 'inherit',
      }"
      role="tablist"
      @keydown="handleKeydown"
    >
      <button
        v-for="(tab, index) in tabs"
        :id="tabId(tab.key)"
        :key="tab.key"
        :ref="
          (el) => {
            if (el) tabRefs[index] = el as HTMLButtonElement
          }
        "
        type="button"
        role="tab"
        :aria-controls="panelId(tab.key)"
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
      v-for="tab in tabs"
      v-show="activeTab === tab.key"
      :id="panelId(tab.key)"
      :key="`${tab.key}_panel`"
      role="tabpanel"
      :aria-labelledby="tabId(tab.key)"
      :tabindex="0"
    >
      <slot :name="`${tab.key}Contents`" />
    </div>
  </div>
</template>

<style lang="scss" module>
.tabs {
  display: flex;
  background-color: var(--background-color);

  > button {
    &[role='tab'] {
      border: none;
      background-color: transparent;
      color: var(--text-color);
      font-size: 1rem;
      padding: 0.5rem 1rem;
      cursor: pointer;

      &.active {
        color: var(--active-color);
        cursor: auto;
      }
    }
  }
}
</style>
