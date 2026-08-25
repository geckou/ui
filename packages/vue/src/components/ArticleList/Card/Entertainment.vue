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
    <div :class="$style.date">
      <PostedDate
        :date="article.date"
        :class="$style.year"
        formatString="yyyy"
        fontSize="medium"
        fontWeight="bold"
        color="var(--text-color)"
      />
      <PostedDate
        :date="article.date"
        :class="$style.month"
        formatString="M"
        fontSize="xxx-large"
        fontWeight="bold"
        color="var(--text-color)"
      />
      <PostedDate
        :date="article.date"
        :class="$style.day"
        formatString="d"
        fontSize="xxx-large"
        fontWeight="bold"
        color="var(--text-color)"
      />
    </div>
    <ThumbnailImage
      :article="article"
      :aspectRatio="{
        desktop: isPickUpItem ? '21/9' : '4/3',
        tablet : isPickUpItem ? '16/9' : '4/3',
        mobile : isPickUpItem ? '4/3' : '4/3',
      }"
      :class="$style.thumbnail"
    />
    <div :class="$style.contents">
      <CategoryList
        v-if="postConfig.category && article.categories"
        :categoryIds="article.categories"
        :categoryData="categories"
        :label="{
          color : 'var(--main-color)',
          fontSize: 'small',
          fontWeight: 'bold',
        }"
        :class="$style.category"
      />
      <CardHeading
        :heading="article.title.rendered"
        :class="$style.heading"
      />
      <div :class="$style.row">
        <TagList
          v-if="postConfig.tag"
          :article="article"
          :label="{
            color : 'var(--text-color)',
            fontSize: 'small',
          }"
          :class="$style.tag"
          delimiter="/"
        />
        <AuthorInfo
          v-if="postConfig.author"
          :avatarUrls="article._embedded.author[0].avatar_urls"
          :class="$style.author"
          :thumbnail="{
            size: 'medium',
            shape: 'circle',
          }"
        />
      </div>
      <ExcerptText
        :excerpt="article.excerpt.rendered"
        :class="$style.excerpt"
      />
    </div>
  </CardContainer>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.thumbnail {
  margin-top: calc(-1 * (var(--bv) * 2));
  overflow  : hidden;
  
  img {
    transition: scale var(--animation-duration);
  }
}

.date {
  display          : flex;
  align-items      : flex-start;
  justify-content  : flex-end;
  gap              : var(--sp-small);
  margin-inline-end: var(--sp-medium);
  position         : relative;
  z-index          : 2;
}

.year {
  margin-block-start: var(--sp-small);
}

.month,
.day {
  line-height: 1;
}

.month {
  display    : flex;
  align-items: center;

  &::after {
    content            : '';
    position           : relative;
    margin-inline-start: var(--sp-small);
    display            : block;
    width              : 1px;
    height             : calc(1em - var(--sp-medium));
    background-color   : var(--text-color);
  }
}

.contents {
  display         : flex;
  flex-grow       : 1;
  flex-direction  : column;
  height          : auto;
  margin          : calc(-1 * var(--sp-large)) var(--sp-medium) 0;
  background-color: var(--white);
  position        : relative;
  z-index         : 1;
}

.category {
  padding: var(--sp-medium);
}

.heading {
  flex-grow: 1;
  padding  : 0 var(--sp-medium);
}

.row {
  display: flex;
  gap    : var(--bv);
  padding: var(--sp-medium);
  justify-content: flex-end;
}

.author {
  margin-inline-start: auto;
}

.excerpt {
  --line-height: 1.8;
  flex              : 0 0 auto;
  line-height       : var(--line-height);
  height            : calc(var(--line-height) * 3 * 1em + var(--sp-medium) * 2);
  padding           : var(--sp-medium);
  border-block-start: 1px solid var(--border-color);
}

.container {
  display       : flex;
  flex-direction: column;
  width         : 100%;
  height        : 100%;
  position      : relative;

  &:hover {
    .thumbnail {
      img {
        scale: 1.1;
      }
    }
  }

  &.pickup {
    @include media('tablet') {
      aspect-ratio   : 16/9;
      justify-content: center;
      align-items    : flex-end;

      .thumbnail {
        margin  : 0;
        position: absolute;
        top     : 0;
        left    : 0;
      }

      .contents {
        flex              : 0 0 auto;
        margin            : 0;
        margin-block-start: calc(-1 * var(--sp-medium));
        background-color  : rgba(255, 255, 255, .7);
      }

      .heading {
        > h2 {
          font-size: xx-large;
        }
      }
    }

    @include media('desktop') {
      aspect-ratio: 21/9;
    }
  }
}
</style>