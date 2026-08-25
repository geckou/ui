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
        tablet : isPickUpItem ? '16/9' : '4/3',
        mobile : isPickUpItem ? '4/3' : '4/3',
      }"
      :class="$style.thumbnail"
      style="grid-area: thumbnail;"
    />
    <CardHeading
      :heading="article.title.rendered"
      :class="$style.heading"
      color="var(--white)"
      style="grid-area: heading;"
    />
    <PostedDate
      :date="article.date"
      :class="$style.date"
      :fontSize="isPickUpItem ? 'medium' : 'small'" 
      formatString="yyyy.M.d"
      color="var(--white)"
      fontWeight="bold"
      style="grid-area: date;"
    />
    <AuthorInfo
      v-if="postConfig.author"
      :name="article._embedded.author[0].name"
      :class="$style.author"
      :text="{
        color : 'var(--white)',
        fontSize : isPickUpItem ? 'medium' : 'small',
        fontWeight: 'bold',
      }"
      style="grid-area: author;"
    />
    <CategoryList
      v-if="postConfig.category && article.categories"
      :categoryIds="article.categories"
      :categoryData="categories"
      :label="{
        color : 'var(--white)',
        fontSize: isPickUpItem ? 'medium': 'small',
      }"
      :class="$style.category"
      style="grid-area: category;"
    />
    <TagList
      v-if="postConfig.tag"
      :article="article"
      :label="{
        color : 'var(--white)',
        fontSize: isPickUpItem ? 'medium': 'small',
      }"
      :class="$style.tag"
      delimiter="/"
      style="grid-area: tag;"
    />
    <ExcerptText
      :excerpt="article.excerpt.rendered"
      :class="$style.excerpt"
      color="var(--white)"
      fontSize="small"
      :row="2"
      style="grid-area: excerpt;"
    />
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  grid-template-columns: auto 1fr;
  grid-template-rows   : 0 auto 1fr auto auto fit-content(20%);
  grid-template-areas  : 
    'thumbnail thumbnail'
    'heading heading'
    'date author'
    'category category'
    'tag tag'
    'excerpt excerpt';
  position    : relative;
  width       : 100%;
  aspect-ratio: 4/3;
  overflow    : hidden;

  &:hover {
    &::before {
      opacity: 0;
    }

    &::after {
      opacity: 1;
    }

    .thumbnail {
      img {
        filter: blur(2px);
        scale: 1.04;
      }
    }

    .category,
    .tag,
    .excerpt {
      opacity: 1;
    }
  }

  &::before,
  &::after {
    content       : '';
    display       : block;
    width         : 100%;
    height        : 100%;
    aspect-ratio  : 4/3;
    mix-blend-mode: hard-light;
    position      : absolute;
    top           : 0;
    left          : 0;
    transition    : all var(--animation-duration);
    z-index       : 2;
  }

  &::before {
    background-image: linear-gradient(
      to bottom,
      rgba(var(--black-rgb), .6) 0%,
      rgba(var(--black-rgb), 0) 62%,
      rgba(var(--black-rgb), 0) 100%
    );
    opacity: 1;
  }

  &::after {
    background-color: rgba(var(--black-rgb), .8);
    opacity         : 0;
  }

  > *:not(.thumbnail) {
    transition    : opacity var(--animation-duration);
    position      : relative;
    z-index       : 3;
    padding-inline: var(--sp-medium);
  }

  @include media('tablet') {
    &.pickup {
      aspect-ratio: 16/9;
      
      @include media('desktop') {
        aspect-ratio: 2.85/1;
      }

      > *:not(.thumbnail) {
        padding-left : var(--sp-large);
        padding-right: var(--sp-large);
      }

      &::before {
        aspect-ratio: 16/9;
        
        @include media('desktop') {
          aspect-ratio: 2.85/1;
        }
      }

      .heading {
        font-size: xx-large;
      }

      .tag {
        margin-block: var(--sp-medium) var(--sp-large);
      }

      .excerpt {
        padding: var(--sp-large);
      }
    }
  }
}

.thumbnail {
  position  : absolute;
  top       : 0;
  left      : 0;
  transition: filter var(--animation-duration);
  z-index   : 1;

  > img {
    transition: scale var(--animation-duration);
  }
}

.category,
.tag,
.excerpt {
  opacity: 0;
}

.heading {
  margin-block: var(--sp-medium);
}

.date,
.author {
  align-items: flex-start;
}

.author {
  padding-left: 0;
}

.category,
.tag {
  margin-block-end: var(--sp-medium);
}

.excerpt {
  padding-block     : var(--sp-medium);
  border-block-start: 1px solid var(--white);
}
</style>