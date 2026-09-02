<script setup lang="ts">
import { computed } from 'vue'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import DatePicker from '@/components/DatePicker.vue'

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
  </div>
</template>

<style lang="scss" module>
.date_range_picker {
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
