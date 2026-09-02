<script setup lang="ts">
import { returnAuthor } from '@/scripts/utils'
import type { Article, Category, PostConfig } from '@/types'
import CardContainer from '@/components/ArticleList/Parts/CardContainer.vue'
import ThumbnailImage from '@/components/ArticleList/Parts/ThumbnailImage.vue'
import AuthorInfo from '@/components/ArticleList/Parts/AuthorInfo.vue'
import CardHeading from '@/components/ArticleList/Parts/CardHeading.vue'
import CategoryList from '@/components/ArticleList/Parts/CategoryList.vue'
import TagList from '@/components/ArticleList/Parts/TagList.vue'
import PostedDate from '@/components/ArticleList/Parts/PostedDate.vue'
import ExcerptText from '@/components/ArticleList/Parts/ExcerptText.vue'

defineProps<{
  article: Article
  path: string
  isPickUpItem: boolean
  postConfig: PostConfig
  categories: Category[]
}>()
</script>

<template>
  <CardContainer
    v-if="article"
    :path="path"
    :class="[$style.container, { [$style.pickup]: isPickUpItem }]"
  >
    <ThumbnailImage
      :article="article"
      :class="$style.thumbnail"
      style="grid-area: thumbnail"
    />
    <PostedDate
      :date="article.date"
      formatString="yy.M.d"
      color="var(--gray)"
      :class="$style.date"
      style="grid-area: date"
    />
    <AuthorInfo
      v-if="postConfig.author && returnAuthor(article)"
      :avatarUrls="returnAuthor(article)?.avatar_urls"
      :thumbnail="{
        shape: 'circle',
      }"
      :class="$style.author"
      direction="row-reverse"
      style="grid-area: author"
    />
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      style="grid-area: heading"
    />
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :icon="{ color: 'var(--main-color)' }"
      :label="{
        backgroundColor: 'var(--main-color)',
        color: 'var(--white)',
        fontSize: 'small',
        shape: 'rounded',
      }"
      :class="$style.category"
      style="grid-area: category"
    />
    <TagList
      v-if="postConfig.tag"
      :article="article"
      :icon="{ color: 'var(--sub-color)' }"
      :label="{
        backgroundColor: 'var(--sub-color)',
        color: 'var(--white)',
        fontSize: 'smaller',
        shape: 'rounded',
      }"
      :class="$style.tag"
      style="grid-area: tag"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      style="grid-area: excerpt"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: auto auto;
  grid-template-rows: auto auto auto auto auto 1fr;
  grid-template-areas:
    'thumbnail thumbnail'
    'date author'
    'heading heading'
    'category category'
    'tag tag'
    'excerpt excerpt';
  gap: var(--sp-small);

  &:hover {
    .thumbnail {
      opacity: 0.8;
    }
  }

  &.pickup {
    @include media('tablet') {
      grid-template-columns: calc((100% - var(--sp-larger) * 2) / 3) auto auto;
      grid-template-rows: auto auto auto auto 1fr;
      grid-template-areas:
        'thumbnail date author'
        'thumbnail heading heading'
        'thumbnail category category'
        'thumbnail tag tag'
        'thumbnail excerpt excerpt';
      column-gap: var(--sp-larger);

      .thumbnail {
        margin-inline-end: var(--sp-larger);
        margin-block-end: 0;
      }

      .heading {
        font-size: xx-large;
      }
    }
  }
}

.date {
  align-items: center;
}

.thumbnail {
  transition: opacity var(--animation-duration);
  margin-block-end: var(--sp-small);

  > * {
    border-radius: var(--bv);
  }
}

.heading {
  margin-block-end: var(--sp-small);
}
</style>
