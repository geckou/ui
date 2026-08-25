<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
} from 'vue'
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
const tabFocus = ref(0)
const changeTabs = (key: string) => activeTab.value = key

const handleKeydown = (event: KeyboardEvent) => {
  const key = event.key
  const lastIndex = props.tabs.length - 1

  if (key === 'ArrowLeft') {
    tabFocus.value = tabFocus.value > 0 ? tabFocus.value - 1 : lastIndex
  } else if (key === 'ArrowRight') {
    tabFocus.value = tabFocus.value < lastIndex ? tabFocus.value + 1 : 0
  }

  activeTab.value = props.tabs[tabFocus.value].key
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
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
    >
      <button
        v-for="(tab, index) in tabs"
        :id="tab.key"
        :key="tab.key"
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