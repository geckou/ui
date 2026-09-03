<script setup lang="ts">
import type { Ref } from 'vue'
import { ref, computed, onBeforeUnmount, watch, watchEffect } from 'vue'
import { daysInMonth, splitDate } from '@geckou/ui-core'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import InputBox from '@/components/InputBox.vue'
import KeyboardArrowDownIcon from '@/components/Icon/KeyboardArrowDownIcon.vue'
import TextButton from '@/components/TextButton.vue'

const emit = defineEmits<{ (e: 'update:modelValue', newValue: string): void }>()

// グローバルの Date を型空間で隠さないよう DateParts にする
type DateParts = {
  year: string
  month: string
  day?: string
}
const props = withDefaults(
  defineProps<{
    name: string
    modelValue: string
    isRequired?: boolean
    formValidationManager?: FormValidationManager | null
    type?: 'date' | 'month'
  }>(),
  {
    formValidationManager: null,
    type: 'date',
  }
)

const birthday: Ref<DateParts> = ref({
  year: '',
  month: '',
  day: '',
})

const yearsOptions = computed(() => {
  const today = new Date()
  const maxYear = today.getFullYear() - 100
  const currentYear = today.getFullYear() - 14
  const years = Array.from({ length: currentYear - maxYear + 1 }, (_, i) =>
    (maxYear + i).toString()
  )
  return years.map((year) => ({ label: year, value: year }))
})

const monthOptions = computed(() => {
  return Array.from({ length: 12 }, (_, i) => {
    const month = (i + 1).toString()
    return {
      label: month,
      value: month.padStart(2, '0'),
    }
  })
})

const daysInSelectedMonth = computed(() => {
  const month = Number(birthday.value?.month)
  if (!month) {
    return 31
  }

  // 年が未選択のときは閏年を含む最大日数になるよう 2000 年を使う
  const year = Number(birthday.value?.year) || 2000
  return daysInMonth(year, month)
})

const dayOptions = computed(() => {
  const days = []
  const daysInMouth = daysInSelectedMonth.value

  for (let day = 1; day <= daysInMouth; day++) {
    const dayString = day.toString()
    days.push(dayString)
  }

  return days.map((day) => ({
    label: day,
    value: String(day).padStart(2, '0'),
  }))
})

const openDropdown = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const select = target.firstElementChild as HTMLSelectElement
  if (select) {
    select.click()
  }
}

const selectItem = (event: Event, key: 'year' | 'day' | 'month') => {
  const target = event.target as HTMLSelectElement
  const { value } = target
  birthday.value = { ...birthday.value, [key]: value }
}

// 月や年を変えて日が存在しなくなった場合は、その月の末日に丸める
watch(daysInSelectedMonth, (days) => {
  const day = Number(birthday.value.day)
  if (day && day > days) {
    birthday.value = { ...birthday.value, day: String(days).padStart(2, '0') }
  }
})

const EMPTY_BIRTHDAY = { year: '', month: '', day: '' }

// value が空に戻されたときもリセットする（以前は前の選択が残っていた）
watchEffect(() => {
  birthday.value = props.modelValue
    ? splitDate(props.modelValue)
    : { ...EMPTY_BIRTHDAY }
})

const setValid = (isValid: boolean): void => {
  if (props.formValidationManager) {
    props.formValidationManager.setValid(props.name, isValid)
  }
}

// 初期値の判定にも使う。watch だけに置くと、登録の時点（初回）は発火せず、
// 初期値の入った必須項目が「無効」のまま残っていた
const judgeValid = (value: DateParts): boolean => {
  const isFilled = Boolean(
    value.year && value.month && (props.type === 'month' || value.day)
  )
  const isEmpty = !value.year && !value.month && !value.day

  return props.isRequired ? isFilled : isFilled || isEmpty
}

setValid(judgeValid(birthday.value))

watch(
  () => birthday.value,
  (newValue) => {
    const isFilled = Boolean(
      newValue.year &&
      newValue.month &&
      (props.type === 'month' || newValue.day)
    )
    const isEmpty = !newValue.year && !newValue.month && !newValue.day

    setValid(judgeValid(newValue))

    if (isEmpty) {
      emit('update:modelValue', '')
    } else if (!isFilled) {
      return
    } else {
      const parts =
        props.type === 'month'
          ? [newValue.year, newValue.month]
          : [newValue.year, newValue.month, newValue.day]
      emit('update:modelValue', parts.filter(Boolean).join('-'))
    }
  },
  { deep: true }
)

// アンマウント後も無効判定が残らないように登録を解除する
onBeforeUnmount(() => props.formValidationManager?.remove(props.name))
</script>

<template>
  <InputBox :class="$style.date_selector">
    <div :class="[$style.selector_wrapper]" @click="openDropdown($event)">
      <select
        :value="birthday.year"
        :name="`${name}-year`"
        :aria-label="`${name}の年`"
        :required="isRequired"
        :class="$style.year"
        @change="selectItem($event, 'year')"
      >
        <option disabled selected value="">年</option>
        <option
          v-for="year in yearsOptions"
          :key="year.value"
          :value="year.value"
        >
          {{ year.label }}
        </option>
      </select>
      <KeyboardArrowDownIcon />
    </div>
    <div :class="[$style.selector_wrapper]" @click="openDropdown($event)">
      <select
        :value="birthday.month"
        :name="`${name}-month`"
        :aria-label="`${name}の月`"
        :required="isRequired"
        @change="selectItem($event, 'month')"
      >
        <option disabled selected value="">月</option>
        <option
          v-for="month in monthOptions"
          :key="month.value"
          :value="month.value"
        >
          {{ month.label }}
        </option>
      </select>
      <KeyboardArrowDownIcon />
    </div>
    <div
      v-if="type === 'date'"
      :class="[$style.selector_wrapper]"
      @click="openDropdown($event)"
    >
      <select
        :value="birthday.day"
        :name="`${name}-day`"
        :aria-label="`${name}の日`"
        :required="isRequired"
        @change="selectItem($event, 'day')"
      >
        <option disabled selected value="">日</option>
        <option v-for="day in dayOptions" :key="day.value" :value="day.value">
          {{ day.label }}
        </option>
      </select>
      <KeyboardArrowDownIcon />
    </div>
    <TextButton
      text="削除"
      variant="caution"
      :class="$style.delete_button"
      @click="birthday = { year: '', month: '', day: '' }"
    />
  </InputBox>
</template>

<style lang="scss" module>
@use '@/assets/scss/mixin' as *;

.date_selector {
  width: max-content;
  display: flex;
  align-items: center;
  position: relative;

  > * {
    &:not(:last-of-type) {
      &:after {
        content: '/';
      }
    }
  }
}

.selector_wrapper {
  position: relative;
  width: max-content;

  > svg {
    @include icon($color: var(--link-color));
    position: absolute;
    margin: auto;
    top: 0;
    right: var(--sp-small);
    bottom: 0;
    pointer-events: none;
  }

  &:has(select:focus) {
    svg {
      rotate: 180deg;
    }
  }

  > select {
    width: calc(3ch + (var(--sp-medium) * 2) + var(--icon-medium));
    padding: var(--sp-medium);
    padding-inline-end: calc((var(--sp-small) * 2) + var(--icon-medium));
    cursor: pointer;

    &.year {
      width: calc(5ch + (var(--sp-medium) * 2) + var(--icon-medium));
    }
  }
}

.delete_button {
  margin-inline: var(--sp-medium);
  font-size: var(--fs-small);
}
</style>
