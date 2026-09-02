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
  postConfig: PostConfig
  categories: Category[]
}>()
</script>

<template>
  <CardContainer v-if="article" :class="$style.container" :path="path">
    <ThumbnailImage
      :article="article"
      :aspectRatio="{
        desktop: '16/9',
        tablet: '4/3',
        mobile: '1/1',
      }"
      :class="$style.thumbnail"
      style="grid-area: thumbnail"
    />
    <PostedDate
      :date="article.date"
      :class="$style.date"
      formatString="yyyy.M.d"
      fontWeight="bold"
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
      style="grid-area: tag"
    />
    <AuthorInfo
      v-if="postConfig.author && returnAuthor(article)"
      :name="returnAuthor(article)?.name"
      :class="$style.author"
      :text="{
        color: 'var(--gray)',
        preposition: 'by',
      }"
      fontSize="small"
      style="grid-area: author"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: 28% auto auto;
  grid-template-rows: auto auto 1fr auto;
  grid-template-areas:
    'thumbnail date category'
    'thumbnail heading heading'
    'thumbnail excerpt excerpt'
    'thumbnail tag author';
  row-gap: var(--sp-small);
  column-gap: var(--sp-large);

  @include media('mobile') {
    grid-template-columns: 33% auto auto;
    column-gap: var(--sp-medium);
  }

  &:hover {
    .thumbnail {
      opacity: 0.8;
    }
  }
}

.thumbnail {
  transition: opacity var(--animation-duration);
}

.heading {
  @include textEllipsis();
}

.category,
.tag {
  li {
    @include media('mobile') {
      @include textEllipsis();
    }
  }
}

.category {
  justify-content: flex-end;
}

.excerpt {
  > p {
    @include media('mobile') {
      @include textEllipsis(2);
    }
  }
}

.author {
  justify-content: flex-end;
}
</style>
