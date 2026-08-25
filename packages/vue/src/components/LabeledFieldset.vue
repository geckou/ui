<script setup lang="ts">
defineProps<{ isDisabled?: boolean }>()
</script>

<template>
  <div :class="$style.fieldset">
    <fieldset :disabled="isDisabled">
      <legend
        v-if="$slots.label"
        :class="$style.legend"
      >
        <slot name="label" />
      </legend>
      <div :class="$style.input">
        <slot />
      </div>
    </fieldset>
  </div>
</template>

<style lang="scss" module>
:is(.fieldset) {
  display: grid;
  gap: .5rem;

  > fieldset {
    display: contents;
  }
}

:is(.legend) {
  display: flex;
  align-items: center;
}

:is(.input) {
  > * {
    inline-size: 100%;
  }
}
</style>