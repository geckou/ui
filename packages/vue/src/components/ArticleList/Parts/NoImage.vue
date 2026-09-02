<script setup lang="ts">
import ImageIcon from '@/components/Icon/Image.vue'
</script>

<template>
  <div :class="$style.no_image">
    <ImageIcon />
    <span>No Image</span>
  </div>
</template>

<style lang="scss" module>
.no_image {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--sp-small);
  width: 100%;
  height: 100%;
  background-color: var(--light-gray);
  font-size: large;

  > svg {
    width: var(--sp-large);
    height: var(--sp-large);
    fill: var(--gray);
  }

  > span {
    color: var(--gray);
  }
}
</style>
