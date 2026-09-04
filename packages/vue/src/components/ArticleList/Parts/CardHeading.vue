<script setup lang="ts">
withDefaults(
  defineProps<{
    /**
     * 見出し。**HTML 文字列として描画する**（WordPress の `title.rendered` は
     * `&amp;` などにエンコード済みなので、テキストのまま出すとエンティティが見えてしまう）。
     * WP 以外から渡す場合は、埋め込む前にサニタイズすること
     */
    heading: string
    color?: string
    fontSize?: string
    fontWeight?: string
  }>(),
  {
    color: 'var(--primary-color)',
    fontSize: 'larger',
    fontWeight: 'bold',
  }
)
</script>

<template>
  <!-- eslint-disable vue/no-v-html -- WordPress の title.rendered は HTML エンティティを含む（サニタイズ済み）ため、excerpt と同じく HTML として描画する -->
  <div
    :class="$style.heading"
    :style="{
      '--heading-color': color,
      '--heading-font-size': fontSize,
      '--heading-font-weight': fontWeight,
    }"
  >
    <h2 v-html="heading" />
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.heading {
  @include textEllipsis(2);
  block-size: max-content;

  > h2 {
    color: var(--heading-color);
    font-size: var(--heading-font-size);
    font-weight: var(--heading-font-weight);
    margin: 0;
  }
}
</style>
