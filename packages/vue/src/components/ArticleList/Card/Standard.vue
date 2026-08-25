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
        desktop: isPickUpItem ? '2.85/1' : '4/3',
        tablet : isPickUpItem ? '2.85/1' : '4/3',
        mobile : '4/3',
      }"
      :class="$style.thumbnail"
      style="grid-area: thumbnail;"
    />
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      style="grid-area: heading;"
    />
    <TagList
      v-if="postConfig.tag"
      :article="article"
      :label="{
        color : 'var(--gray)',
        fontSize: 'smaller',
      }"
      :class="$style.tag"
      style="grid-area: tag;"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      style="grid-area: excerpt;"
    />
    <PostedDate
      :date="article.date"
      :class="$style.date"
      formatString="yy.M.d"
      color="var(--gray)"
      style="grid-area: date;"
    />
    <AuthorInfo
      v-if="postConfig.author && returnAuthor(article)"
      :avatarUrls="returnAuthor(article)?.avatar_urls"
      :name="returnAuthor(article)?.name"
      :class="$style.author"
      style="grid-area: author;"
    />
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :label="{
        backgroundColor: 'var(--main-color)',
        color : 'var(--white)',
        fontSize : 'small',
      }"
      :class="$style.category"
      style="grid-area: category;"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: 1fr 1fr;
  grid-template-rows   : 0 auto auto auto 1fr auto auto;
  grid-template-areas  :
    'category category'
    'thumbnail thumbnail'
    'heading heading'
    'tag tag'
    'excerpt excerpt'
    'date author';
    
  &:hover {
    .thumbnail {
      opacity: .8;
    }
  }

  &.pickup {
    @include media('tablet') {
      grid-template-rows: auto 0 1fr auto auto auto auto;
      aspect-ratio      : 2.85/1;
      position          : relative;

      > * {
        &:not(.thumbnail):not(.category) {
          position      : relative;
          padding-inline: var(--sp-medium);
        }
      }

      .date,
      .author {
        padding-block-end: var(--sp-medium);
      }

      .thumbnail {
        width   : 100%;
        position: absolute;
        top     : 0;
        left    : 0;
        margin  : 0;

        &::after {
          content         : '';
          display         : block;
          width           : 100%;
          height          : 100%;
          position        : absolute;
          top             : 0;
          left            : 0;
          mix-blend-mode  : screen;
          background-image: linear-gradient(
            to bottom,
            rgba(255, 255, 255, 0) 38%,
            rgba(255, 255, 255, .9) 100%
          );
        }
      }

      .heading {
        align-self: end;
        font-size : xx-large;
      }
    }
  }
}

.thumbnail {
  margin-block-end: var(--sp-medium);
  transition      : opacity var(--animation-duration);
}

.category {
  position: absolute;
  top     : 0;
  left    : 0;
}

.heading {
  margin-block-end: var(--sp-min);
}

.excerpt {
  margin-block-start: var(--sp-medium);
}

.author {
  justify-content: flex-end;
}

.date,
.author {
  margin-block-start: var(--sp-medium);
}
</style>