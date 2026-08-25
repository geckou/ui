<script setup lang="ts">
defineProps<{ path: string }>()
</script>

<template>
  <a
    :href="path"
    :class="$style.container"
  >
    <slot />
  </a>
</template>

<style lang="scss" module>
.container {
  position        : relative;
  display         : grid;
  width           : 100%;
  height          : 100%;
  background-color: var(--base-color);
  text-decoration : none;
}
</style>