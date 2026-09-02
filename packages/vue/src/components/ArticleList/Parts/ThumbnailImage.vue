<script setup lang="ts">
import type { Article } from '@/types'
import { computed } from 'vue'
import NoImage from '@/components/ArticleList/Parts/NoImage.vue'

const props = withDefaults(
  defineProps<{
    article: Article
    aspectRatio?: {
      desktop?: string
      tablet?: string
      mobile?: string
    }
  }>(),
  {
    aspectRatio: () => ({
      desktop: '4/3',
      tablet: '4/3',
      mobile: '4/3',
    }),
  }
)

const thumbnailSrcset = computed(
  () =>
    `${returnThumbnailSrc('full')} 1024w, ${returnThumbnailSrc('thumbnail')} 640w`
)
const articleMedia = computed(
  () => props.article?.['_embedded']?.['wp:featuredmedia']?.[0] || {}
)
const returnThumbnailSrc = (type: 'full' | 'thumbnail') =>
  articleMedia.value.media_details?.sizes?.[type].source_url ?? ''
</script>

<template>
  <div
    :style="{
      '--desktop-aspect--ratio': aspectRatio.desktop,
      '--tablet-aspect--ratio': aspectRatio.tablet,
      '--mobile-aspect--ratio': aspectRatio.mobile,
    }"
    :class="$style.container"
  >
    <img
      v-if="returnThumbnailSrc('full')"
      :srcset="thumbnailSrcset"
      sizes="(min-width: 640px) 50vw, 100vw"
      :alt="articleMedia?.alt_text ?? '記事サムネイル'"
      loading="lazy"
      :class="$style.image"
    />
    <NoImage v-else />
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.container {
  width: 100%;

  @include media('mobile') {
    aspect-ratio: var(--mobile-aspect--ratio);
  }

  @include media('tablet') {
    aspect-ratio: var(--tablet-aspect--ratio);
  }

  @include media('desktop') {
    aspect-ratio: var(--desktop-aspect--ratio);
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    @include media('mobile') {
      aspect-ratio: var(--mobile-aspect--ratio);
    }

    @include media('tablet') {
      aspect-ratio: var(--tablet-aspect--ratio);
    }

    @include media('desktop') {
      aspect-ratio: var(--desktop-aspect--ratio);
    }
  }
}
</style>
