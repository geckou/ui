<script setup lang="ts">
import type { Article } from '@/types'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import MetadataList from '@/components/ArticleList/Parts/MetadataList.vue'
import { returnTagList } from '@/scripts/utils'

const props = defineProps<{
  article: Article
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

const tags: ComputedRef<string[]> = computed(() => returnTagList(props.article))
</script>

<template>
  <MetadataList
    v-if="tags.length"
    :metadata="tags"
    :icon="{
      name: icon?.color ? 'TagIcon' : null,
      color: icon?.color,
      size: icon?.size,
    }"
    :label="label"
    :delimiter="delimiter"
  />
</template>
