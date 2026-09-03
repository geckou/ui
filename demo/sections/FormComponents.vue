<script setup lang="ts">
import type { Validates } from '@/types'
import { ref } from 'vue'
import DemoSection from '~demo/components/DemoSection.vue'
import TextBox from '@/components/TextBox.vue'
import TextArea from '@/components/TextArea.vue'
import SelectBox from '@/components/SelectBox.vue'
import CheckBox from '@/components/CheckBox.vue'
import CheckBoxes from '@/components/CheckBoxes.vue'
import CheckButton from '@/components/CheckButton.vue'
import LabeledCheckbox from '@/components/LabeledCheckbox.vue'
import LabeledFieldset from '@/components/LabeledFieldset.vue'
import RadioButtons from '@/components/RadioButtons.vue'
import ToggleButton from '@/components/ToggleButton.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import DatePicker from '@/components/DatePicker.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import type { Option } from '@/types'
import DateSelector from '@/components/DateSelector.vue'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import { componentSource } from '~demo/data/repository'

const SELECT_BOX_OPTIONS: Array<Option | Record<string, Option[]>> = [
  { label: '未選択', value: '' },
  { label: 'デザイン', value: 'design' },
  { label: 'エンジニアリング', value: 'engineering' },
  {
    その他: [
      { label: '採用について', value: 'recruit' },
      { label: '取材について', value: 'press' },
    ],
  },
]

const CHECKBOXES_OPTIONS = [
  { label: 'メールで受け取る', value: 'mail' },
  { label: 'Slack で受け取る', value: 'slack' },
  { label: '受け取らない', value: 'none', isDisabled: true },
]

const RADIO_OPTIONS = [
  { label: '個人', value: 'personal' },
  { label: '法人', value: 'corporate' },
]

const VALIDATES: Validates = [
  { regex: /^[a-zA-Z_]+$/, message: '半角英字で入力してください' },
]

const text = ref('')
const textarea = ref('')
const select = ref('')
const check = ref(false)
const checkButton = ref(false)
const labeledCheck = ref(true)
const checks = ref<string[]>(['mail'])
const radios = ref('personal')
const toggle = ref(false)
const validationManager = new FormValidationManager()
const date = ref('')
const dateRange = ref({ start: '', end: '' })
const birthday = ref('')

const CODE = {
  textBox: `<TextBox
  v-model="text"
  name="textbox"
  placeholder="半角英字で入力"
  :validates="[{ regex: /^[a-zA-Z_]+$/, message: '半角英字で入力してください' }]"
  isRequired
/>`,
  textArea: `<TextArea
  v-model="textarea"
  name="textarea"
  :rows="3"
  autoAdjustHeight
/>`,
  selectBox: `<SelectBox
  v-model="select"
  name="selectBox"
  :options="[
    { label: 'デザイン', value: 'design' },
    { label: 'エンジニアリング', value: 'engineering' },
    { 'その他': [{ label: '採用について', value: 'recruit' }] },
  ]"
  isRequired
/>`,
  checkBox: `<CheckBox v-model="check" name="checkbox" />
<LabeledCheckbox v-model="check" name="labeled" label="規約に同意する" />
<CheckButton v-model="checkButton" name="checkButton" />`,
  checkBoxes: `<CheckBoxes
  v-model="checks"
  name="checkboxes"
  :options="[
    { label: 'メールで受け取る', value: 'mail' },
    { label: 'Slack で受け取る', value: 'slack' },
    { label: '受け取らない', value: 'none', isDisabled: true },
  ]"
/>`,
  radio: `<RadioButtons
  v-model="radios"
  :options="[
    { label: '個人', value: 'personal' },
    { label: '法人', value: 'corporate' },
  ]"
/>`,
  toggle: `<ToggleButton
  v-model="toggle"
  name="toggleButton"
  :label="{ on: '公開', off: '非公開' }"
/>`,
  fieldset: `<LabeledFieldset>
  <template #label>お問い合わせ内容</template>
  <TextArea v-model="textarea" name="textarea" />
</LabeledFieldset>`,
  datePicker: `<DatePicker
  v-model="date"
  name="startedOn"
  :formValidationManager="validationManager"
  isRequired
/>

<!-- 全入力が有効になったかどうか -->
<span>{{ validationManager.isAllValid.value }}</span>`,
  dateRange: `<DateRangePicker
  v-model="dateRange"
  name="period"
  size="small"
/>
<!-- modelValue は { start: string, end: string } -->`,
  dateSelector: `<DateSelector
  v-model="birthday"
  name="birthday"
  :formValidationManager="validationManager"
  isRequired
/>`,
  errorMessage: `<!-- ErrorMessage は position: absolute。基準にしたい要素を relative にしておく -->
<div style="position: relative;">
  <ErrorMessage :errorMessages="['必須項目です']" />
</div>`,
}
</script>

<template>
  <div :class="$style.page">
    <DemoSection
      id="textbox"
      :sources="[{ label: 'TextBox', path: componentSource('TextBox') }]"
      title="TextBox"
      description="バリデーション（正規表現 + メッセージ）と必須指定に対応したテキスト入力。"
      :code="CODE.textBox"
    >
      <div :class="$style.narrow">
        <TextBox
          v-model="text"
          name="textbox"
          placeholder="半角英字で入力"
          :validates="VALIDATES"
          isRequired
        />
      </div>
    </DemoSection>

    <DemoSection
      id="textarea"
      :sources="[{ label: 'TextArea', path: componentSource('TextArea') }]"
      title="TextArea"
      description="autoAdjustHeight を付けると入力量に応じて高さが伸びる。"
      :code="CODE.textArea"
    >
      <div :class="$style.narrow">
        <TextArea
          v-model="textarea"
          name="textarea"
          :rows="3"
          placeholder="お問い合わせ内容"
          autoAdjustHeight
        />
      </div>
    </DemoSection>

    <DemoSection
      id="selectbox"
      :sources="[{ label: 'SelectBox', path: componentSource('SelectBox') }]"
      title="SelectBox"
      description="optgroup 形式（キーに group 名、値に Option 配列）もそのまま渡せる。"
      :code="CODE.selectBox"
    >
      <div :class="$style.narrow">
        <SelectBox
          v-model="select"
          name="selectBox"
          :options="SELECT_BOX_OPTIONS"
          placeholder="お問い合わせ種別"
          isRequired
        />
      </div>
    </DemoSection>

    <DemoSection
      id="checkbox"
      :sources="[
        { label: 'CheckBox', path: componentSource('CheckBox') },
        { label: 'LabeledCheckbox', path: componentSource('LabeledCheckbox') },
        { label: 'CheckButton', path: componentSource('CheckButton') },
      ]"
      title="CheckBox / LabeledCheckbox / CheckButton"
      description="単体のチェックボックス、ラベル付き、ボタン型の 3 種類。"
      :code="CODE.checkBox"
    >
      <div :class="$style.row">
        <CheckBox v-model="check" name="checkbox" />
        <LabeledCheckbox
          v-model="labeledCheck"
          name="labeledCheckbox"
          label="規約に同意する"
        />
        <CheckButton v-model="checkButton" name="checkButton" />
      </div>
    </DemoSection>

    <DemoSection
      id="checkboxes"
      :sources="[{ label: 'CheckBoxes', path: componentSource('CheckBoxes') }]"
      title="CheckBoxes"
      description="Option 配列から複数選択。isDisabled 付きの選択肢も指定できる。"
      :code="CODE.checkBoxes"
    >
      <CheckBoxes
        v-model="checks"
        name="checkboxes"
        :options="CHECKBOXES_OPTIONS"
      />
    </DemoSection>

    <DemoSection
      id="radiobuttons"
      :sources="[
        { label: 'RadioButtons', path: componentSource('RadioButtons') },
      ]"
      title="RadioButtons"
      :code="CODE.radio"
    >
      <RadioButtons v-model="radios" :options="RADIO_OPTIONS" />
    </DemoSection>

    <DemoSection
      id="togglebutton"
      :sources="[
        { label: 'ToggleButton', path: componentSource('ToggleButton') },
      ]"
      title="ToggleButton"
      description="on / off それぞれのラベルを指定できる。"
      :code="CODE.toggle"
    >
      <ToggleButton
        v-model="toggle"
        name="toggleButton"
        :label="{ on: '公開', off: '非公開' }"
      />
    </DemoSection>

    <DemoSection
      id="labeledfieldset"
      :sources="[
        { label: 'LabeledFieldset', path: componentSource('LabeledFieldset') },
      ]"
      title="LabeledFieldset"
      description="label スロットと入力欄をまとめて配置するためのラッパー。"
      :code="CODE.fieldset"
    >
      <div :class="$style.narrow">
        <LabeledFieldset>
          <template #label> お問い合わせ内容 </template>
          <TextArea v-model="textarea" name="fieldsetTextarea" :rows="2" />
        </LabeledFieldset>
      </div>
    </DemoSection>

    <DemoSection
      id="datepicker"
      :sources="[{ label: 'DatePicker', path: componentSource('DatePicker') }]"
      title="DatePicker"
      description="ネイティブの日付入力と年 / 月 / 日の直接入力を併用。FormValidationManager に検証結果を通知する。"
      :code="CODE.datePicker"
    >
      <div :class="$style.narrow">
        <DatePicker
          v-model="date"
          name="startedOn"
          :formValidationManager="validationManager"
          isRequired
        />
        <p :class="$style.note">
          modelValue: {{ date || '—' }} / フォーム全体の有効状態:
          {{ validationManager.isAllValid.value }}
        </p>
      </div>
    </DemoSection>

    <DemoSection
      id="daterangepicker"
      :sources="[
        { label: 'DateRangePicker', path: componentSource('DateRangePicker') },
      ]"
      title="DateRangePicker"
      description="開始日と終了日の組。互いの min / max が自動で連動する。"
      :code="CODE.dateRange"
    >
      <DateRangePicker v-model="dateRange" name="period" size="small" />
      <p :class="$style.note">
        modelValue: {{ dateRange.start || '—' }} 〜 {{ dateRange.end || '—' }}
      </p>
    </DemoSection>

    <DemoSection
      id="dateselector"
      :sources="[
        { label: 'DateSelector', path: componentSource('DateSelector') },
      ]"
      title="DateSelector"
      description="年 / 月 / 日をプルダウンで選ぶ形式。生年月日など過去日の入力向け。"
      :code="CODE.dateSelector"
    >
      <DateSelector
        v-model="birthday"
        name="birthday"
        :formValidationManager="validationManager"
        isRequired
      />
      <p :class="$style.note">modelValue: {{ birthday || '—' }}</p>
    </DemoSection>

    <DemoSection
      id="errormessage"
      :sources="[
        { label: 'ErrorMessage', path: componentSource('ErrorMessage') },
      ]"
      title="ErrorMessage"
      description="position: absolute の吹き出しなので、基準にしたい要素を position: relative にした中に置く。"
      :code="CODE.errorMessage"
    >
      <div :class="$style.errorAnchor">
        <ErrorMessage
          :errorMessages="['必須項目です', '半角英字で入力してください']"
        />
      </div>
    </DemoSection>
  </div>
</template>

<style lang="scss" module>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.narrow {
  max-width: 28rem;
}

.errorAnchor {
  position: relative;
  inline-size: 18rem;
  block-size: 1.5rem;
  margin-block-end: 3.5rem;
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.note {
  margin: var(--sp-medium) 0 0;
  color: var(--gray);
  font-size: var(--fs-smaller);
}
</style>
