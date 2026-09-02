<script setup lang="ts">
import type { Category } from '@/types'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import MetadataList from '@/components/ArticleList/Parts/MetadataList.vue'

const props = defineProps<{
  categoryIds: string[]
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

const returnCatNameFromCatId = (categories: Category[], categoryId: string) =>
  categories.length
    ? (categories.find((category) => category.id === categoryId)?.name ?? '')
    : ''
const categories: ComputedRef<string[]> = computed(() =>
  props.categoryIds.map((id: string) =>
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
