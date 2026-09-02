<script setup lang="ts">
withDefaults(
  defineProps<{
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
  <div
    :class="$style.heading"
    :style="{
      '--heading-color': color,
      '--heading-font-size': fontSize,
      '--heading-font-weight': fontWeight,
    }"
  >
    <h2>
      {{ heading }}
    </h2>
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
