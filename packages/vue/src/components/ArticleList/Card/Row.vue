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

// isPickUpItem は GenericArticleList が全カードへ渡す。宣言しないと
// ispickupitem 属性として <a> に落ちる
defineProps<{
  article: Article
  path: string
  isPickUpItem?: boolean
  postConfig: PostConfig
  categories: Category[]
}>()
</script>

<template>
  <CardContainer v-if="article" :class="$style.container" :path="path">
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :label="{
        color: 'var(--gray)',
        fontSize: 'clamp(24px, 0.55rem + 2.99vw, 40px)',
      }"
      :class="$style.category"
      style="grid-area: category"
    />
    <ThumbnailImage
      :article="article"
      :aspectRatio="{
        desktop: '21/9',
        tablet: '21/9',
        mobile: '21/9',
      }"
      :class="$style.thumbnail"
      style="grid-area: thumbnail"
    />
    <PostedDate
      :date="article.date"
      formatString="yy.M.d"
      :class="$style.date"
      color="var(--gray)"
      style="grid-area: date"
    />
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      style="grid-area: heading"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      fontSize="small"
      style="grid-area: excerpt"
    />
    <TagList
      v-if="postConfig.tag"
      :article="article"
      :label="{
        color: 'var(--text-color)',
        fontSize: 'small',
      }"
      :class="$style.tag"
      delimiter="/"
      style="grid-area: tag"
    />
    <AuthorInfo
      v-if="postConfig.author && returnAuthor(article)"
      :avatarUrls="returnAuthor(article)?.avatar_urls"
      :name="returnAuthor(article)?.name"
      :class="$style.author"
      :text="{
        fontSize: 'small',
        color: 'var(--gray)',
      }"
      style="grid-area: author"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: 50% 1fr auto;
  grid-template-rows: auto auto auto 1fr auto;
  grid-template-areas:
    'category category category'
    'thumbnail date date'
    'thumbnail heading heading'
    'thumbnail excerpt excerpt'
    'thumbnail tag author';
  column-gap: var(--sp-large);

  &::before {
    content: '';
    display: block;
    width: calc(100% + var(--sp-medium));
    height: 100%;
    background-color: var(--primary-color);
    mix-blend-mode: soft-light;
    position: absolute;
    top: var(--sp-small);
    left: calc(-1 * var(--sp-small));
    transition: opacity var(--animation-duration);
    opacity: 0;
    pointer-events: none;
  }

  &:hover {
    &::before {
      opacity: 0.1;
    }
  }

  @include media('mobile') {
    grid-template-columns: 1fr auto;
    grid-template-rows: auto auto auto auto 1fr auto;
    grid-template-areas:
      'category category'
      'thumbnail thumbnail'
      'date date'
      'heading heading'
      'excerpt excerpt'
      'tag author';
    column-gap: 0;
  }
}

.thumbnail {
  @include media('mobile') {
    margin-block-end: var(--sp-small);
  }
}

.excerpt {
  @include media('mobile') {
    margin-block-end: var(--sp-medium);
  }
}

.category {
  position: relative;
  top: var(--sp-small);
}

.heading {
  margin-block-end: var(--sp-medium);
}

.tag {
  padding-block: var(--sp-small);
}
</style>
