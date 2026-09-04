<script setup lang="ts">
import type { Category } from '@/types'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import MetadataList from '@/components/ArticleList/Parts/MetadataList.vue'

const props = defineProps<{
  categoryIds: (string | number)[]
  categoryData: Category[]
  icon?: {
    color?: string
    size?: 'small' | 'medium'
  }
  label?: {
    backgroundColor?: string
    color?: string
    fontSize?: string
    fontWeight?: string
    shape?: 'square' | 'rounded'
  }
  delimiter?: string
}>()

// WP REST の ID は数値、Category[] を手で書くときは文字列になりがちで、
// 厳密等価だと例外も出さずに黙って空になる。文字列に寄せて比べる
const returnCatNameFromCatId = (
  categories: Category[],
  categoryId: string | number
) =>
  categories.length
    ? (categories.find((category) => String(category.id) === String(categoryId))
        ?.name ?? '')
    : ''
const categories: ComputedRef<string[]> = computed(() =>
  props.categoryIds.map((id: string | number) =>
    returnCatNameFromCatId(props.categoryData, id)
  )
)
</script>

<template>
  <MetadataList
    :metadata="categories"
    :icon="{
      name: icon?.color ? 'FolderIcon' : null,
      color: icon?.color,
      size: icon?.size,
    }"
    :label="label"
    :delimiter="delimiter"
  />
</template>
