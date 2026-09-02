<script setup lang="ts">
import { format, parseISO } from 'date-fns'

const props = withDefaults(
  defineProps<{
    date: string
    formatString?: string
    color?: string
    fontSize?: string
    fontWeight?: string
  }>(),
  {
    formatString: 'yyyy/mm/dd',
    color: 'var(--text-color)',
    fontSize: 'small',
    fontWeight: 'normal',
  }
)

const parsedDate = parseISO(props.date)
</script>

<template>
  <time
    :class="$style.posted_date"
    :style="{
      '--date-color': color,
      '--date-font-size': fontSize,
      '--date-font-weight': fontWeight,
    }"
  >
    {{ format(parsedDate, formatString) }}
  </time>
</template>

<style lang="scss" module>
.posted_date {
  display: inline-flex;
  align-items: flex-end;
  color: var(--date-color);
  font-size: var(--date-font-size);
  font-weight: var(--date-font-weight);
}
</style>
