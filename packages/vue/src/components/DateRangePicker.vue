<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { MESSAGES } from '@geckou/ui-core'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import DatePicker from '@/components/DatePicker.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'

type DateRange = {
  start: string
  end: string
}

const emit = defineEmits<{
  (e: 'update:modelValue', newValue: DateRange): void
}>()

const props = withDefaults(
  defineProps<{
    name: string
    modelValue?: DateRange
    isDisabled?: boolean
    isRequired?: boolean
    formValidationManager?: FormValidationManager | null
    minDate?: string
    maxDate?: string
    size?: 'small' | 'medium'
    type?: 'date' | 'month'
  }>(),
  {
    modelValue: () => ({ start: '', end: '' }),
    isDisabled: false,
    isRequired: false,
    formValidationManager: null,
    minDate: '',
    maxDate: '',
    size: 'medium',
    type: 'date',
  }
)

const startDate = computed(() => props.modelValue.start)
const endDate = computed(() => props.modelValue.end)

// minDate / maxDate はネイティブの入力にしか効かないので、年月日欄から
// 開始 > 終了 を入力しても弾かれない。ここで範囲そのものを検証する
const isRangeValid = computed(
  () => !(startDate.value && endDate.value && startDate.value > endDate.value)
)

const rangeName = computed(() => `${props.name}Range`)

watch(
  [isRangeValid, rangeName],
  ([valid, name], previous) => {
    const previousName = previous?.[1]

    if (previousName && previousName !== name) {
      props.formValidationManager?.remove(previousName)
    }

    props.formValidationManager?.setValid(name, valid)
  },
  { immediate: true }
)

onBeforeUnmount(() => props.formValidationManager?.remove(rangeName.value))

const updateStart = (newValue: string | null) =>
  emit('update:modelValue', { start: newValue ?? '', end: endDate.value })
const updateEnd = (newValue: string | null) =>
  emit('update:modelValue', { start: startDate.value, end: newValue ?? '' })
</script>

<template>
  <div :class="$style.date_range_picker">
    <DatePicker
      :name="`${name}Start`"
      :modelValue="startDate"
      :isDisabled="isDisabled"
      :isRequired="isRequired"
      :formValidationManager="formValidationManager"
      :minDate="minDate"
      :maxDate="endDate || maxDate"
      :size="size"
      :type="type"
      @update:modelValue="updateStart"
    />
    <div :class="$style.range">〜</div>
    <DatePicker
      :name="`${name}End`"
      :modelValue="endDate"
      :isDisabled="isDisabled"
      :isRequired="isRequired"
      :formValidationManager="formValidationManager"
      :minDate="startDate || minDate"
      :maxDate="maxDate"
      :size="size"
      :type="type"
      @update:modelValue="updateEnd"
    />
    <ErrorMessage
      :errorMessages="isRangeValid ? undefined : [MESSAGES.startAfterEnd]"
    />
  </div>
</template>

<style lang="scss" module>
.date_range_picker {
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--sp-small);
  flex-wrap: wrap;
}

.range {
  flex: 0 0 auto;
  color: var(--gray);
}
</style>
