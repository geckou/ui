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
    :class="[$style.container, { [$style.pickup]: isPickUpItem }]"
    :path="path"
  >
    <ThumbnailImage
      :article="article"
      :aspectRatio="{
        desktop: isPickUpItem ? '21/9' : '4/3',
        tablet: '4/3',
        mobile: '4/3',
      }"
      :class="$style.thumbnail"
      style="grid-area: thumbnail"
    />
    <PostedDate
      :date="article.date"
      formatString="yy.M.d"
      :class="$style.date"
      style="grid-area: date"
    />
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :label="{
        color: 'var(--main-color)',
        fontSize: 'small',
      }"
      :class="$style.category"
      style="grid-area: category"
    />
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      style="grid-area: heading"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      style="grid-area: excerpt"
    />
    <TagList
      v-if="postConfig.tag"
      :article="article"
      :label="{
        color: 'var(--gray)',
        fontSize: 'small',
      }"
      :class="$style.tag"
      delimiter="/"
      style="grid-area: tag"
    />
    <AuthorInfo
      v-if="postConfig.author && returnAuthor(article)"
      :name="returnAuthor(article)?.name"
      :class="$style.author"
      :text="{
        color: 'var(--gray)',
        fontWeight: 'bold',
        preposition: 'by',
      }"
      style="grid-area: author"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: auto 1fr;
  grid-template-rows: fit-content(55%) auto auto 1fr auto auto;
  grid-template-areas:
    'thumbnail thumbnail'
    'date category'
    'heading heading'
    'excerpt excerpt'
    'tag tag'
    'author author';
  box-shadow: 0 0 1px 0 rgba(var(--black-rgb), 0.4);
  height: 100%;
  transition: box-shadow var(--animation-duration);

  &:hover {
    box-shadow: 0 0 var(--sp-medium) 2px rgba(var(--black-rgb), 0.2);

    .thumbnail {
      opacity: 0.8;
    }
  }

  &.pickup {
    @include media('tablet') {
      grid-template-rows: auto auto 1fr auto auto;
      grid-template-columns: fit-content(50%) auto 1fr;
      grid-template-areas:
        'thumbnail date category'
        'thumbnail heading heading'
        'thumbnail excerpt excerpt'
        'thumbnail tag tag'
        'thumbnail author author';
    }

    @include media('desktop') {
      grid-template-columns: calc(66.666% - 2 * var(--sp-small)) auto 1fr;
    }
  }
}

.thumbnail {
  transition: opacity var(--animation-duration);
}

.heading,
.tag,
.excerpt,
.author {
  margin-block: var(--sp-small);
  padding-inline: var(--sp-large);
}

.date,
.category {
  padding: var(--sp-large);
  padding-bottom: 0;
}

.date {
  padding-right: var(--sp-min);
}

.category {
  padding-left: var(--sp-min);

  &::before {
    content: '/';
    color: var(--gray);
    font-size: small;
  }
}

.author {
  padding-bottom: var(--sp-large);
}
</style>
