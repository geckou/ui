<script setup lang="ts">
withDefaults(
  defineProps<{
    avatarUrls?: Record<string, string> | null
    name?: string
    direction?: 'row' | 'row-reverse'
    thumbnail?: {
      size?: 'small' | 'medium' | 'large'
      shape?: 'square' | 'circle'
    }
    text?: {
      color?: string
      fontSize?: string
      fontWeight?: string
      preposition?: string
    }
  }>(),
  {
    avatarUrls: null,
    name: '',
    direction: 'row',
    thumbnail: () => ({
      size: 'medium',
      shape: 'square',
    }),
    text: () => ({
      color: 'var(--gray)',
      fontSize: 'medium',
      fontWeight: 'normal',
      preposition: '',
    }),
  }
)
</script>

<template>
  <div
    :class="$style.author_info"
    :style="{
      '--author-info-direction': direction,
      '--author-name-color': text.color,
      '--author-name-font-size': text.fontSize,
      '--author-name-font-weight': text.fontWeight,
    }"
  >
    <img
      v-if="avatarUrls"
      :src="avatarUrls['96']"
      :srcset="`${avatarUrls['96']} 1024w,
        ${['48']} 640w`"
      :alt="`${name} thumbnail`"
      loading="lazy"
      :class="[$style.thumbnail, $style[thumbnail.shape ?? 'square']]"
      :style="{
        '--thumbnail-size':
          thumbnail.size === 'small'
            ? 'calc(var(--bv) * 3)'
            : thumbnail.size === 'large'
              ? 'calc(var(--bv) * 6)'
              : 'calc(var(--bv) * 4)',
      }"
    />
    <span v-if="name" :data-preposition="text.preposition">
      {{ name }}
    </span>
  </div>
</template>

<style lang="scss" module>
.author_info {
  display: inline-flex;
  flex-direction: var(--author-info-direction);
  align-items: center;
  word-wrap: normal;
  gap: var(--sp-small);

  .thumbnail {
    width: var(--thumbnail-size);
    height: var(--thumbnail-size);
    object-fit: cover;

    &.circle {
      border-radius: 50%;
    }
  }

  > span {
    margin: 0;
    padding: 0;
    color: var(--author-name-color);
    font-size: var(--author-name-font-size);
    font-weight: var(--author-name-font-weight);

    &::before {
      content: attr(data-preposition);
      margin-inline-end: var(--sp-min);
    }
  }
}
</style>
