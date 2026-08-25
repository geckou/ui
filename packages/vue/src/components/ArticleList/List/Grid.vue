<script setup lang="ts">
import type {
  Article,
  Category,
  ListSettings,
} from '@/types'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { returnArticlePath, normalizePostConfig } from '@/scripts/utils'
import GridCard from '@/components/ArticleList/Card/Grid.vue'

const props = defineProps<{
  articles: Article[]
  categories: Category[]
  columnNumber: number
  settings: ListSettings
}>()

// settings は親から動的に差し替えられるため computed で参照する
const domainToUse = computed(() => props.settings.domainToUse)
const isEnabledPickUp = computed(() => props.settings.isEnabledPickUp)
const postConfig = computed(() => normalizePostConfig(props.settings.postConfig))

const listElement = ref<HTMLElement | null>(null)
const listWidth = ref(0)
const resizeTimeout = ref<number | null>(null)

const deviceColumnNumber = computed(() => {
  if (listWidth.value > 992) return props.columnNumber
  else if (listWidth.value >= 576 && listWidth.value <= 992) return props.columnNumber - 1
  else return 1
})

const returnRowNumber = (index: number): number => {
  const itemNum = index + 1
  const actualColumnNumber = Number(deviceColumnNumber.value) - 1
  return Math.ceil(itemNum / actualColumnNumber)
}

const returnColumnNumber = (index: number): number => {
  const itemNum = index + 1
  const columns = Number(deviceColumnNumber.value)
  if (itemNum < columns) return itemNum
  if (columns === 1) return 1
  const remainder = itemNum % (columns - 1)
  return remainder === 0 ? columns - 1 : remainder
}

const calcGridRowValue = (index: number): string | undefined => {
  if (deviceColumnNumber.value === 4) {
    const rowNum = returnRowNumber(index)
    const actualRowNumber = Array.from({ length: 49 }, (_, i) => i + 1)
      .find(n => rowNum <= n * 2) || 0
    const adjustedRowNum = rowNum - 1 + actualRowNumber

    return returnItemDirection(index) === 'vertical'
      ? `${Number(adjustedRowNum)}/${Number(adjustedRowNum) + 2}`
      : rowNum % 2
        ? `${Number(adjustedRowNum)}/${Number(adjustedRowNum) + 1}`
        : `${Number(adjustedRowNum) + 1}/${Number(adjustedRowNum) + 2}`
  } else if (deviceColumnNumber.value === 3) {
    const itemNum = index + 1
    const division = itemNum % 3
    const count = Math.floor(itemNum / 3)
    const actualRowNumber = division ? count * 2 + 1 : count * 2

    return returnItemDirection(index) === 'horizontal'
      ? `${Number(actualRowNumber)}/${Number(actualRowNumber) + 1}`
      : `${Number(actualRowNumber)}/${Number(actualRowNumber) + 2}`
  }
}

const calcGridColumnValue = (index: number): string => {
  const division = (index + 1) % 6

  const columns = Number(deviceColumnNumber.value)

  if (columns === 4) {
    const colNum = returnColumnNumber(index)
    switch (true) {
      case !index || division === 1:
        return '1/3'
      case !division:
        return '3/5'
      default:
        return returnRowNumber(index) % 2
          ? `${colNum + 1}/${colNum + 2}`
          : `${colNum}/${colNum + 1}`
    }
  } else if (columns === 3) {
    const endCount = returnItemDirection(index) === 'horizontal' ? 2 : 1
    switch (division) {
      case 1:
      case 3:
      case 4:
        return `1/${1 + endCount}`
      case 5:
      case 0:
        return `2/${2 + endCount}`
      case 2:
        return `3/${3 + endCount}`
      default:
        return ''
    }
  }

  return ''
}

const returnItemDirection = (index: number): 'horizontal' | 'vertical' => {
  if (deviceColumnNumber.value === 1) {
    return 'vertical'
  } else if (deviceColumnNumber.value === 3) {
    const itemNum = index + 1
    const division = itemNum % 6
    return division !== 2 && division !== 4 ? 'horizontal' : 'vertical'
  } else {
    const gridValue = calcGridColumnValue(index)
    if (!gridValue.includes('/')) return 'horizontal'
    const values = gridValue.split('/').map(Number)
    return values[1] - values[0] >= 2 ? 'horizontal' : 'vertical'
  }
}

onMounted(() => {
  const resizeObserver = new ResizeObserver(entries => {
    if (resizeTimeout.value) clearTimeout(resizeTimeout.value)
    resizeTimeout.value = setTimeout(() => {
      listWidth.value = entries[0].contentRect.width
    }, 100) as unknown as number
  })

  if (listElement.value) resizeObserver.observe(listElement.value)

  onUnmounted(() => {
    if (listElement.value) resizeObserver.unobserve(listElement.value)
    resizeObserver.disconnect()
    if (resizeTimeout.value) clearTimeout(resizeTimeout.value)
  })
})
</script>

<template>
  <ul
    ref="listElement"
    :style="{
      ['--column-number']: columnNumber,
      ['--tablet-column-number']: columnNumber - 1 ? columnNumber - 1 : 1,
    }"
    :class="$style.list"
  >
    <li
      v-for="(article, index) in articles"
      :key="article.id"
      :class="$style.item"
      :style="{ 
        animationDelay: `${Number(index) * .1}s`,
        gridRow: calcGridRowValue(Number(index)) || 'auto',
        gridColumn: calcGridColumnValue(Number(index)) || 'auto',
      }"
    >
      <GridCard
        :path="returnArticlePath(postConfig, domainToUse, article.id)"
        :article="article"
        :isPickUpItem="Number(index) === 0 && isEnabledPickUp"
        :postConfig="postConfig"
        :categories="categories"
        :direction="returnItemDirection(Number(index))"
      />
    </li>
  </ul>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.list {
  --list-gap        : var(--sp-medium);
  display           : grid;
  gap               : var(--list-gap);
  grid-template-rows: 1fr;
  width             : 100%;
  list-style        : none;
  grid-auto-flow    : dense;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @include media('mobile') {
    display       : flex;
    flex-direction: column;
    gap           : var(--sp-large);
  }

  @include media('tablet') {
    grid-template-columns : repeat(auto-fit, calc((100% - var(--list-gap) * (var(--tablet-column-number) - 1)) / var(--tablet-column-number)));
  }

  @include media('desktop') {
    grid-template-columns : repeat(auto-fit, calc((100% - var(--list-gap) * (var(--column-number) - 1)) / var(--column-number)));
  }

  > li {
    animation-name           : fadeIn;
    animation-duration       : 1s;
    animation-timing-function: ease-out;
    animation-fill-mode      : backwards;
  }
}
</style>