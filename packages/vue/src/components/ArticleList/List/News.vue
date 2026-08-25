<script setup lang="ts">
import type {
  Article,
  Category,
  ListSettings,
} from '@/types'
import GenericArticleList from '@/components/ArticleList/GenericArticleList.vue'

defineProps<{
  articles: Article[]
  categories: Category[]
  settings: ListSettings
}>()
</script>

<template>
  <GenericArticleList
    theme="news"
    :columnNumber="1"
    :articles="articles"
    :categories="categories"
    :settings="settings"
  />
</template>