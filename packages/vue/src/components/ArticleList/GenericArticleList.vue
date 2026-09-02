<script setup lang="ts">
import type { Article, Category, ListSettings } from '@/types'
import { computed } from 'vue'
import { returnArticlePath, normalizePostConfig } from '@/scripts/utils'
import { LIST_THEME } from '@/const/list-theme'
import StandardCard from '@/components/ArticleList/Card/Standard.vue'
import RoundedCard from '@/components/ArticleList/Card/Rounded.vue'
import ArtisticCard from '@/components/ArticleList/Card/Artistic.vue'
import TileCard from '@/components/ArticleList/Card/Tile.vue'
import SimpleCard from '@/components/ArticleList/Card/Simple.vue'
import RowCard from '@/components/ArticleList/Card/Row.vue'
import NewsCard from '@/components/ArticleList/Card/News.vue'
import EntertainmentCard from '@/components/ArticleList/Card/Entertainment.vue'
import GalleryCard from '@/components/ArticleList/Card/Gallery.vue'

const props = defineProps<{
  articles: Article[]
  theme: keyof typeof LIST_THEME
  categories: Category[]
  columnNumber: number
  settings: ListSettings
}>()

// settings は親から動的に差し替えられるため computed で参照する
const domainToUse = computed(() => props.settings.domainToUse)
const isEnabledPickUp = computed(() => props.settings.isEnabledPickUp)
const postConfig = computed(() =>
  normalizePostConfig(props.settings.postConfig)
)

const listItem = computed(() => {
  switch (props.theme) {
    case 'standard':
      return StandardCard
    case 'rounded':
      return RoundedCard
    case 'artistic':
      return ArtisticCard
    case 'tile':
      return TileCard
    case 'simple':
      return SimpleCard
    case 'row':
      return RowCard
    case 'news':
      return NewsCard
    case 'gallery':
      return GalleryCard
    case 'entertainment':
      return EntertainmentCard
    default:
      return StandardCard
  }
})
</script>

<template>
  <ul
    :style="{
      ['--column-number']: columnNumber,
      ['--tablet-column-number']: columnNumber - 1 ? columnNumber - 1 : 1,
    }"
    :class="[$style.list, { [$style.pickup]: isEnabledPickUp }]"
  >
    <li
      v-for="(article, index) in articles"
      :key="article.id"
      :style="{ animationDelay: `${Number(index) * 0.1}s` }"
    >
      <component
        :is="listItem"
        :path="returnArticlePath(postConfig, domainToUse, article.id)"
        :article="article"
        :isPickUpItem="Number(index) === 0 && isEnabledPickUp"
        :postConfig="postConfig"
        :categories="categories"
      />
    </li>
  </ul>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.list {
  --list-gap: var(--sp-large);
  display: grid;
  grid-template-rows: 1fr;
  gap: var(--list-gap);
  width: 100%;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }

    to {
      opacity: 1;
    }
  }

  @include media('mobile') {
    grid-template-columns: repeat(auto-fit, 100%);
  }

  @include media('tablet') {
    grid-template-columns: repeat(
      auto-fit,
      calc(
        (100% - var(--list-gap) * (var(--tablet-column-number) - 1)) /
          var(--tablet-column-number)
      )
    );
  }

  @include media('desktop') {
    grid-template-columns: repeat(
      auto-fit,
      calc(
        (100% - var(--list-gap) * (var(--column-number) - 1)) /
          var(--column-number)
      )
    );
  }

  > li {
    opacity: 0;
    animation-name: fadeIn;
    animation-duration: 1s;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
  }

  &.pickup {
    > li {
      &:first-child {
        @include media('mobile') {
          grid-column: 1;
        }

        @include media('tablet') {
          grid-column: span var(--tablet-column-number);
        }

        @include media('desktop') {
          grid-column: span var(--column-number);
        }
      }
    }
  }
}
</style>
