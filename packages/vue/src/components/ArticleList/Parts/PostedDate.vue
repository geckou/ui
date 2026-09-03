<script setup lang="ts">
import { computed } from 'vue'
import { format, isValid, parseISO } from 'date-fns'

const props = withDefaults(
  defineProps<{
    date: string
    formatString?: string
    color?: string
    fontSize?: string
    fontWeight?: string
  }>(),
  {
    // date-fns の mm は「分」。日付の書式は MM（月）
    formatString: 'yyyy/MM/dd',
    color: 'var(--text-color)',
    fontSize: 'small',
    fontWeight: 'normal',
  }
)

// date が差し替わったら追従させる
const parsedDate = computed(() => parseISO(props.date))

// 無効な date（空文字や取得元の欠損）を format に渡すと date-fns が
// RangeError を投げ、一覧全体が描画されなくなる
const formattedDate = computed(() =>
  isValid(parsedDate.value) ? format(parsedDate.value, props.formatString) : ''
)
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
    {{ formattedDate }}
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
