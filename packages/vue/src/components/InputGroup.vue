<template>
  <div :class="$style.input_group">
    <slot />
  </div>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.input_group {
  display: inline-flex;
  gap    : 1px;

  @include media('mobile') {
    flex-wrap: wrap;
  }

  @mixin childItem {
    flex         : 1 1 auto;
    border-radius: 0;
    
    &:first-child:not(:only-child) {
      border-top-left-radius   : var(--radius-small);
      border-bottom-left-radius: var(--radius-small);
    }
  
    &:last-child:not(:only-child) {
      border-top-right-radius   : var(--radius-small);
      border-bottom-right-radius: var(--radius-small);
    }
  }

  > * {
    @include childItem;
  }

  > button {
    flex: 0 0 auto;
  }
}
</style>
