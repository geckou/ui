<script setup lang="ts">
import type {
  Option,
  InputBoxStyleForEachStatus,
} from '@/types'
import {
  ref,
  computed,
  watch,
} from 'vue'
import InputBox from '@/components/InputBox.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import KeyboardArrowDownIcon from '@/components/Icon/KeyboardArrowDownIcon.vue'

type SelectValue = string | number

const emit = defineEmits<{ (e: 'update:modelValue', newValue: SelectValue): void }>()

const props = withDefaults(defineProps<{
  options : Array<Option | Record<string, Option[]>>
  name: string
  modelValue?: SelectValue
  cssStyle?: InputBoxStyleForEachStatus | undefined
  placeholder?: string
  canOmitSelect?: boolean
  isDisabled? : boolean
  isRequired?: boolean
}>(), {
  modelValue : undefined,
  cssStyle   : undefined,
  placeholder: '選択してください',
})

const errorMessages = ref<Array<string>>([])

const selectedValue = computed<SelectValue>({
  get: () => props.modelValue ?? '',
  set: (newValue: SelectValue) => emit('update:modelValue', newValue),
})

const isOption = (obj: unknown): obj is Option => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'label' in obj && typeof obj.label === 'string' &&
    'value' in obj
  )
}

const validateValue = () => {
  errorMessages.value = []
  if (!selectedValue.value && props.isRequired) errorMessages.value.push('必須項目です')
}

watch(() => selectedValue.value, () => validateValue(), { immediate: !!props.modelValue, flush: 'post' })
</script>

<template>
  <InputBox
    :cssStyle="cssStyle"
    :class="$style.select_box"
    :isDisabled="isDisabled"
  >
    <select
      v-model="selectedValue"
      :disabled="isDisabled"
      :required="isRequired"
      :class="$style.select"
      @blur="validateValue()"
    >
      <option
        v-if="canOmitSelect"
        value=""
      >
        {{ placeholder || '選択しない' }}
      </option>
      <option
        v-else
        disabled
        selected
        value=""
      >
        {{ placeholder || '選択してください' }}
      </option>
      <option
        v-if="['0', 'NA'].includes(selectedValue.toString()) && isDisabled"
        disabled
        selected
        :value="selectedValue"
      >
        {{ placeholder || '選択してください' }}
      </option>
      <template
        v-for="option in options"
        :key="isOption(option) ? option.value : Object.keys(option)[0]"
      >
        <option
          v-if="isOption(option)"
          :value="option.value"
          :disabled="option.isDisabled"
        >
          {{ option.label }}
        </option>
        <template v-else>
          <optgroup
            v-for="(opt, key) in option"
            :key="key"
            :label="key"
          >
            <option
              v-for="o in opt"
              :key="o.value"
              :value="o.value"
              :disabled="o.isDisabled"
            >
              {{ o.label }}
            </option>
          </optgroup>
          <hr>
        </template>
      </template>
    </select>
    <div :class="$style.arrow_container">
      <slot name="arrow" />
      <KeyboardArrowDownIcon
        v-if="!$slots.arrow"
        :class="$style.arrow"
      />
    </div>
    <ErrorMessage
      :errorMessages="errorMessages"
      :cssStyle="{
        textColor: cssStyle?.error?.backgroundColor,
        backgroundColor: cssStyle?.error?.textColor,
      }"
    />
  </InputBox>
</template>

<style lang="scss" module>
:is(.select_box) {
  display: inline-flex;

  > select {
    flex              : 1 1 auto;
    padding-inline-end: 2rem;
    cursor            : pointer;
  }
}

:is(.arrow_container) {
  display         : flex;
  align-items     : center;
  position        : absolute;
  margin          : auto;
  inset-inline-end: .5rem;
  inset-block     : 0;
  pointer-events  : none;

  > * {
    color     : currentColor;
    fill      : currentColor;
    block-size: 1rem;
  }
}
</style>