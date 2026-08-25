<script setup lang="ts">
import { returnAuthor } from '@/scripts/utils'
import type {
  Article,
  Category,
  PostConfig,
} from '@/types'
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
    :class="[$style.container, { [$style.pickup]: isPickUpItem} ]"
    :path="path"
  >
    <ThumbnailImage
      :article="article"
      :aspectRatio="{
        desktop: isPickUpItem ? '21/9' : '4/3',
        tablet : isPickUpItem ? '21/9' : '4/3',
        mobile : '4/3',
      }"
      :class="$style.thumbnail"
      style="grid-area: thumbnail;"
    />
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      color="var(--text-color)"
      style="grid-area: heading;"
    />
    <AuthorInfo
      v-if="postConfig.author && returnAuthor(article)"
      :name="returnAuthor(article)?.name"
      :class="$style.author"
      :text="{
        color : 'var(--gray)',
        preposition: 'by',
      }"
      style="grid-area: author;"
    />
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :label="{
        color : 'var(--gray)',
        fontSize : 'small',
        fontWeight: 'bold',
      }"
      :class="$style.category"
      style="grid-area: category;"
    />
    <TagList
      v-if="postConfig.tag"
      :article="article"
      :label="{
        color : 'var(--gray)',
        fontSize : 'small',
        fontWeight: 'bold',
      }"
      :class="$style.tag"
      style="grid-area: tag;"
    />
    <PostedDate
      :date="article.date"
      formatString="yy.M.d"
      color="var(--gray)"
      :class="$style.date"
      style="grid-area: date;"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      style="grid-area: excerpt;"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: auto 1fr;
  grid-template-rows   : fit-content(62%) auto auto auto 1fr auto;
  grid-template-areas  :
    'thumbnail thumbnail'
    'category tag'
    'heading heading'
    'excerpt excerpt'
    'author date';
  gap   : var(--sp-small);
  height: 100%;

  &:hover {
    .thumbnail {
      img {
        filter: grayscale(20%);
      }
    }
  }

  &.pickup {
    @include media('tablet') {
      grid-template-columns: 1fr;
      grid-template-rows   : 0 1fr auto;
      grid-template-areas  : 
        'thumbnail'
        'heading'
        'date';
      gap         : 0;
      aspect-ratio: 21/9;

      .thumbnail {
        position: absolute;
        top     : 0;
        left    : 0;

        &::before {
          content         : '';
          display         : block;
          width           : 100%;
          height          : 100%;
          background-color: var(--gray);
          mix-blend-mode  : multiply;
          position        : absolute;
          top             : 0;
          left            : 0;
          z-index         : 1;
          transition      : opacity var(--animation-duration);
          opacity         : .3;
          pointer-events  : none;
        }
      }

      &:hover {
        .thumbnail {

          &::before {
            opacity: .1;
          }
        }
      }

      .heading,
      .date {
        position: relative;
        z-index : 2;
      }

      .heading {
        display           : flex;
        justify-content   : flex-start;
        align-items       : flex-end;
        margin-block-start: var(--sp-medium);
        margin-inline     : var(--sp-large);
        font-size         : xx-large;
      }

      .date {
        display        : flex;
        justify-content: flex-start;
        align-items    : flex-end;
        margin-block   : var(--sp-medium) var(--sp-large);
        margin-inline  : var(--sp-large);
        font-size      : medium;
        color          : var(--text-color);
      }

      .excerpt,
      .category,
      .tag,
      .author {
        display: none;
      }
    }
  }

  .thumbnail {
    img {
      transition: filter var(--animation-duration);
      filter    : grayscale(90%);
    }
  }

  .tag {
    grid-column       : 1 / 3;
    margin-block-start: var(--sp-small);
  }

  .category {
    margin-block-start: var(--sp-small);

    & + .tag {
      grid-column: 2 / 3;

      &::before {
        content  : '/';
        color    : var(--gray);
        font-size: small;
      }
    }
  }

  .heading {
    margin-block-start: var(--sp-small);
  }

  .excerpt {
    margin-block-end: var(--sp-small);
  }

  .date {
    justify-content: flex-end;
  }
}
</style>