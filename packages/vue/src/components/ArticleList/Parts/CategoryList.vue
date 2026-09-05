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
// 引き当てられなかった ID は落とす。空文字のまま渡すと、その数だけ空の <li> が
// 描かれ（categoryData を渡し忘れると全記事で発生）、key も空文字で重複する
const categories: ComputedRef<string[]> = computed(() =>
  props.categoryIds
    .map((id: string | number) =>
      returnCatNameFromCatId(props.categoryData, id)
    )
    .filter((name) => name !== '')
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
