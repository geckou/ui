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
  <div :class="[$style.wrapper, { [$style.pickup]: isPickUpItem }]">
    <CardContainer v-if="article" :class="$style.container" :path="path">
      <ThumbnailImage
        :article="article"
        :aspectRatio="{
          desktop: isPickUpItem ? '21/9' : '4/3',
          tablet: isPickUpItem ? '21/9' : '4/3',
          mobile: '4/3',
        }"
        :class="$style.thumbnail"
        style="grid-area: thumbnail"
      />
      <div :class="$style.overlay">
        <ExcerptText
          :excerpt="article.excerpt.rendered"
          :class="$style.excerpt"
          color="var(--white)"
          style="grid-area: excerpt"
        />
      </div>
      <PostedDate
        :date="article.date"
        formatString="yy.M.d"
        :class="$style.date"
        style="grid-area: date"
      />
      <CardHeading
        :heading="article.title.rendered"
        :class="$style.heading"
        style="grid-area: heading"
      />
      <TagList
        v-if="postConfig.tag"
        :article="article"
        :label="{
          color: 'var(--text-color)',
          fontSize: 'smaller',
        }"
        :class="$style.tag"
        delimiter="/"
        style="grid-area: tag"
      />
      <AuthorInfo
        v-if="postConfig.author && returnAuthor(article)"
        :avatarUrls="returnAuthor(article)?.avatar_urls"
        :thumbnail="{
          size: 'large',
          shape: 'circle',
        }"
        :class="$style.author"
        style="grid-area: author"
      />
      <CategoryList
        v-if="postConfig.category && article.categories"
        :categoryIds="article.categories"
        :categoryData="categories"
        :label="{
          backgroundColor: 'var(--main-color)',
          color: 'var(--white)',
          fontSize: 'small',
        }"
        :class="$style.category"
        style="grid-area: category"
      />
    </CardContainer>
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

@mixin borderOnHover {
  content: '';
  display: block;
  background-color: var(--primary-color);
  position: absolute;
  transition: all var(--animation-duration);
}

.wrapper {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
  box-shadow: 0 0 var(--sp-medium) 0 rgba(var(--black-rgb), 0.1);

  &::before,
  &::after {
    @include borderOnHover;
    width: 0;
    height: 2px;
  }

  &::before {
    top: -2px;
    left: -2px;
  }

  &::after {
    bottom: -2px;
    right: -2px;
  }

  &:hover {
    &::before,
    &::after {
      width: calc(100% + 4px);
    }

    .container {
      &::before,
      &::after {
        height: calc(100% + 4px);
      }
    }

    .overlay,
    .excerpt {
      opacity: 1;
    }
  }

  &.pickup {
    @include media('tablet') {
      aspect-ratio: 21/9;

      .container {
        grid-template-rows: 0 0 0 auto auto 1fr 0;
        grid-template-areas:
          'excerpt'
          'category'
          'thumbnail'
          'heading'
          'date'
          'tag'
          'author';
      }

      .thumbnail {
        opacity: 0.4;
        position: absolute;
        top: 0;
        left: 0;
      }

      .heading,
      .date,
      .tag,
      .author,
      .category {
        position: relative;
        z-index: 2;
      }

      .category,
      .author {
        position: absolute;
      }

      .excerpt {
        display: flex;
        align-items: flex-end;
        padding-block-end: var(--sp-large);
      }

      .category {
        top: 0;
        left: 0;
      }

      .author {
        margin: 0;
        bottom: var(--sp-large);
        right: var(--sp-large);
      }

      .heading {
        padding-block-start: var(--sp-large);
        font-size: xx-large;
      }

      .tag {
        display: flex;
        align-items: flex-start;
        margin: 0;
      }
    }
  }
}

.container {
  grid-template-columns: 1fr;
  grid-template-rows: 0 fit-content(55%) auto auto 1fr auto auto;
  grid-template-areas:
    'excerpt'
    'thumbnail'
    'date'
    'heading'
    'tag'
    'author'
    'category';
  text-align: center;
  position: relative;
  height: 100%;

  &::before,
  &::after {
    @include borderOnHover;
    width: 2px;
    height: 0;
  }

  &::before {
    bottom: -2px;
    left: -2px;
  }

  &::after {
    top: -2px;
    right: -2px;
  }
}

.overlay,
.excerpt {
  width: 100%;
  max-height: 100%;
  position: absolute;
  opacity: 1;
  aspect-ratio: 4/3;

  @include media('desktop') {
    opacity: 0;
  }
}

.date {
  display: flex;
  justify-content: center;
  margin-block: calc(var(--bv) * 2) var(--bv);
}

.heading {
  padding: 0 calc(var(--bv) * 2);
}

.excerpt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0 calc(var(--bv) * 2);
  position: absolute;
  top: 0;
}

.author {
  justify-content: center;
  margin-block: var(--sp-large);
}

.category {
  display: flex;
  justify-content: center;
}

.overlay {
  background-image: linear-gradient(
    to bottom,
    rgb(var(--black-rgb), 0) 0%,
    rgba(var(--black-rgb), 0.5) 66%,
    rgba(var(--black-rgb), 0.8) 100%
  );
  backdrop-filter: blur(4px);
}

.tag {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-block: var(--sp-medium);
}
</style>
