<script setup lang="ts">
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
  direction: 'horizontal' | 'vertical'
}>()

</script>

<template>
  <CardContainer
    v-if="article"
    :class="[
      $style.container,
      { [$style.pickup]: isPickUpItem},
      $style[direction],
    ]"
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

    <div
      :class="$style.date"
      style="grid-area: date;"
    >
      <PostedDate
        :date="article.date"
        formatString="M.d"
        color="var(--white)"
        fontWeight="bold"
      />
      <PostedDate
        :date="article.date"
        formatString="yyyy"
        color="var(--white)"
        fontWeight="bold"
      />
    </div>
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      :fontSize="isPickUpItem ? 'large' : 'medium'"
      :color="isPickUpItem && direction === 'horizontal' ? 'var(--white)' : 'var(--text-color)'"
      style="grid-area: heading;"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      :row="2"
      fontSize="small"
      style="grid-area: excerpt;"
    />
    <AuthorInfo
      v-if="postConfig.author"
      :avatarUrls="article._embedded.author[0].avatar_urls"
      :thumbnail="{
        size : 'large',
        shape: 'square',
      }"
      :class="$style.author"
      style="grid-area: author;"
    />
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :label="{
        color : 'var(--gray)',
        fontSize: 'smaller',
      }"
      :class="$style.category"
      style="grid-area: category;"
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
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  --date-size: calc(var(--bv) * 7);
  grid-template-columns: auto 1fr auto;
  grid-template-rows   : fit-content(50%) auto 1fr auto auto;
  grid-template-areas  : 
    'thumbnail thumbnail thumbnail'
    'date heading heading'
    'excerpt excerpt excerpt'
    'category category author'
    'tag tag author';
  height    : 100%;
  box-shadow: 0 0 1px 0 rgba(var(--black-rgb), .4);
  transition: box-shadow var(--animation-duration) linear;

  &:hover {
    box-shadow: 0 0 var(--sp-small) 2px rgba(var(--black-rgb), .2);
  }

  @include media('tablet') {
    &.horizontal {
      grid-template-columns: fit-content(50%) auto 1fr auto;
      grid-template-rows   : auto 1fr auto auto;
      grid-template-areas  : 
        'thumbnail date heading heading'
        'thumbnail excerpt excerpt excerpt'
        'thumbnail category category author'
        'thumbnail tag tag author';
    }

    &.pickup {
      grid-template-columns: 1fr;
      grid-template-rows   : 1fr 0 0;
      grid-template-areas  : 
        'thumbnail'
        'heading'
        'date';
      text-align: left;

      .thumbnail {
        position: relative;

        &::before {
          content         : '';
          display         : block;
          width           : 100%;
          height          : 100%;
          background-color: rgba(var(--black-rgb), .6);
          mix-blend-mode  : multiply;
          pointer-events  : none;
          position        : absolute;
          top             : 0;
          left            : 0;
          z-index         : 1;
          transition      : all var(--animation-duration);
        }
      }

      .heading,
      .date {
        position: absolute;
        z-index : 2;
      }

      .heading {
        padding      : 0;
        padding-right: var(--sp-medium);
        left         : calc(var(--date-size) + var(--sp-medium) * 2);
        bottom       : var(--sp-medium);
      }

      .date {
        margin: 0;
        bottom: var(--sp-medium);
        left  : var(--sp-medium);
      }

      .excerpt,
      .category,
      .tag,
      .author {
        display: none;
      }
    }
  }
}

.date {
  display         : flex;
  flex-direction  : column;
  justify-content : center;
  align-items     : center;
  gap             : var(--sp-min);
  width           : var(--date-size);
  height          : var(--date-size);
  margin          : var(--sp-medium);
  background-color: var(--black);

  > * {
    letter-spacing: .1em;
    line-height   : 1;
  }
}

.heading {
  display             : flex;
  align-items         : center;
  padding             : var(--sp-medium);
  padding-inline-start: 0;

  > h2 {
    @include textEllipsis(2);
  }
}

.category,
.tag {
  margin-inline-start: var(--sp-medium);
  padding-block-end  : var(--sp-medium);
}

.category {
  align-items: flex-end;
}

.author {
  padding: var(--sp-medium);
}

.excerpt {
  padding: var(--sp-medium);
}
</style>