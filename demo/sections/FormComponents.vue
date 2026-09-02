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
import BasicButton from '@/components/BasicButton.vue'
import TabUI from '@/components/TabUI.vue'
import ErrorMessage from '@/components/ErrorMessage.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import SlideDownUi from '@/components/SlideDownUi.vue'
import DropdownUi from '@/components/DropdownUi.vue'
import ModalBox from '@/components/ModalBox.vue'
import DatePicker from '@/components/DatePicker.vue'
import DateRangePicker from '@/components/DateRangePicker.vue'
import DateSelector from '@/components/DateSelector.vue'
import TextButton from '@/components/TextButton.vue'
import { FormValidationManager } from '@/scripts/form-validation-manager'
import { componentSource } from '~demo/data/repository'

const SELECT_BOX_OPTIONS = [
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
const isLoading = ref(false)
const validationManager = new FormValidationManager()
const date = ref('')
const dateRange = ref({ start: '', end: '' })
const birthday = ref('')
const isModalShown = ref(false)

const submit = () => {
  isLoading.value = true
  window.setTimeout(() => {
    isLoading.value = false
  }, 1200)
}

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
  button: `<BasicButton
  buttonType="submit"
  :isLoading="isLoading"
  @click="submit"
>
  送信
</BasicButton>`,
  fieldset: `<LabeledFieldset>
  <template #label>お問い合わせ内容</template>
  <TextArea v-model="textarea" name="textarea" />
</LabeledFieldset>`,
  tab: `<TabUI
  :tabs="[
    { key: 'tabA', label: '入力値' },
    { key: 'tabB', label: 'JSON' },
  ]"
  type="tab"
>
  <template #tabAContents>...</template>
  <template #tabBContents>...</template>
</TabUI>`,
  slideDown: `<SlideDownUi>
  <template #trigger>配送について</template>
  <p>ご注文から 3 営業日以内に発送します。</p>
</SlideDownUi>`,
  dropdown: `<DropdownUi contentAlignment="left" contentsWidth="16rem">
  <template #trigger>メニュー</template>
  <template #contents>
    <ul><li>プロフィール</li><li>設定</li></ul>
  </template>
</DropdownUi>`,
  modal: `<ModalBox
  :isShown="isModalShown"
  size="small"
  @closeModal="isModalShown = false"
>
  <template #header><h4>確認</h4></template>
  <p>この内容で送信します。</p>
</ModalBox>`,
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
  textButton: `<TextButton
  text="削除"
  variant="caution"
  @click="reset"
/>`,
  misc: `<!-- ErrorMessage は position: absolute。基準にしたい要素を relative にしておく -->
<div style="position: relative;">
  <ErrorMessage :errorMessages="['必須項目です']" />
</div>

<!-- LoadingSpinner はサイズを持たないので親で指定する -->
<span style="display: block; inline-size: 2rem; fill: var(--primary-color);">
  <LoadingSpinner />
</span>`,
}

const formState = () =>
  JSON.stringify(
    {
      text: text.value,
      textarea: textarea.value,
      select: select.value,
      check: check.value,
      labeledCheck: labeledCheck.value,
      checks: checks.value,
      radios: radios.value,
      toggle: toggle.value,
    },
    null,
    2
  )
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
      id="basicbutton"
      :sources="[
        { label: 'BasicButton', path: componentSource('BasicButton') },
      ]"
      title="BasicButton"
      description="isLoading でスピナー表示に切り替わる（クリックで 1.2 秒間ローディング）。"
      :code="CODE.button"
    >
      <BasicButton buttonType="button" :isLoading="isLoading" @click="submit">
        送信
      </BasicButton>
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
      id="tabui"
      :sources="[{ label: 'TabUI', path: componentSource('TabUI') }]"
      title="TabUI"
      description="tabs の key に対応する #<key>Contents スロットに中身を書く。"
      :code="CODE.tab"
    >
      <TabUI
        :tabs="[
          { key: 'tabA', label: '入力値' },
          { key: 'tabB', label: 'JSON' },
        ]"
      >
        <template #tabAContents>
          <dl :class="$style.state">
            <div>
              <dt>TextBox</dt>
              <dd>{{ text || '—' }}</dd>
            </div>
            <div>
              <dt>TextArea</dt>
              <dd>{{ textarea || '—' }}</dd>
            </div>
            <div>
              <dt>SelectBox</dt>
              <dd>{{ select || '—' }}</dd>
            </div>
            <div>
              <dt>CheckBoxes</dt>
              <dd>{{ checks.join(', ') || '—' }}</dd>
            </div>
            <div>
              <dt>RadioButtons</dt>
              <dd>{{ radios }}</dd>
            </div>
            <div>
              <dt>ToggleButton</dt>
              <dd>{{ toggle }}</dd>
            </div>
          </dl>
        </template>
        <template #tabBContents>
          <pre :class="$style.json">{{ formState() }}</pre>
        </template>
      </TabUI>
    </DemoSection>

    <DemoSection
      id="slidedownui"
      :sources="[
        { label: 'SlideDownUi', path: componentSource('SlideDownUi') },
      ]"
      title="SlideDownUi"
      description="アコーディオン。summary スロットが見出し、デフォルトスロットが中身。"
      :code="CODE.slideDown"
    >
      <div :class="$style.narrow">
        <SlideDownUi>
          <template #trigger> 配送について </template>
          <p :class="$style.plain">
            ご注文から 3
            営業日以内に発送します。離島の場合は追加で日数をいただきます。
          </p>
        </SlideDownUi>
      </div>
    </DemoSection>

    <DemoSection
      id="dropdownui"
      :sources="[{ label: 'DropdownUi', path: componentSource('DropdownUi') }]"
      title="DropdownUi"
      description="トリガーをクリックすると中身を表示する。contentAlignment で表示位置を調整。"
      :code="CODE.dropdown"
    >
      <DropdownUi contentAlignment="left" contentsWidth="16rem">
        <template #trigger> メニュー </template>
        <template #contents>
          <ul :class="$style.menu">
            <li>プロフィール</li>
            <li>設定</li>
            <li>ログアウト</li>
          </ul>
        </template>
      </DropdownUi>
    </DemoSection>

    <DemoSection
      id="modalbox"
      :sources="[{ label: 'ModalBox', path: componentSource('ModalBox') }]"
      title="ModalBox"
      description="isShown で表示を制御し、closeModal イベントで閉じる。表示中は背面のスクロールをロック。"
      :code="CODE.modal"
    >
      <BasicButton buttonType="button" @click="isModalShown = true">
        モーダルを開く
      </BasicButton>
      <ModalBox
        :isShown="isModalShown"
        size="small"
        @closeModal="isModalShown = false"
      >
        <template #header>
          <h4 :class="$style.modalHeading">確認</h4>
        </template>
        <p :class="$style.plain">この内容で送信します。よろしいですか？</p>
        <template #footer>
          <BasicButton buttonType="button" @click="isModalShown = false">
            閉じる
          </BasicButton>
        </template>
      </ModalBox>
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
      id="textbutton"
      :sources="[{ label: 'TextButton', path: componentSource('TextButton') }]"
      title="TextButton"
      description="枠のないテキストリンク調のボタン。variant を caution にすると警告色になる。"
      :code="CODE.textButton"
    >
      <div :class="$style.row">
        <TextButton text="編集" />
        <TextButton
          text="削除"
          variant="caution"
          @click="
            () => {
              date = ''
              birthday = ''
              dateRange = { start: '', end: '' }
            }
          "
        />
        <TextButton text="無効" isDisabled />
      </div>
    </DemoSection>

    <DemoSection
      id="misc"
      :sources="[
        { label: 'ErrorMessage', path: componentSource('ErrorMessage') },
        { label: 'LoadingSpinner', path: componentSource('LoadingSpinner') },
      ]"
      title="ErrorMessage / LoadingSpinner"
      description="ErrorMessage は position: absolute の吹き出しなので position: relative な親の中に置く。LoadingSpinner はサイズを持たない SVG なので、親要素で大きさと色を指定する。"
      :code="CODE.misc"
    >
      <div :class="$style.row">
        <div :class="$style.errorAnchor">
          <ErrorMessage
            :errorMessages="['必須項目です', '半角英字で入力してください']"
          />
        </div>
        <span :class="$style.spinner">
          <LoadingSpinner />
        </span>
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

.spinner {
  display: block;
  inline-size: 2rem;
  block-size: 2rem;
  fill: var(--primary-color);
}

.row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.state {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  font-size: var(--fs-small);

  > div {
    display: grid;
    grid-template-columns: 10rem 1fr;
    gap: 0.5rem;
  }

  dt {
    color: var(--gray);
  }

  dd {
    margin: 0;
    word-break: break-word;
  }
}

.json {
  overflow: auto;
  margin: 0;
  padding: 0.75rem;
  border-radius: var(--radius-size);
  background-color: var(--code-background);
  color: var(--code-text);
  font-size: var(--fs-smaller);
}

.plain {
  margin: 0;
  font-size: var(--fs-small);
}

.note {
  margin: var(--sp-medium) 0 0;
  color: var(--gray);
  font-size: var(--fs-smaller);
}

.menu {
  padding: 0.5rem 0;

  > li {
    padding: 0.4rem 0.75rem;
    cursor: pointer;

    &:hover {
      background-color: var(--sub-color);
    }
  }
}

.modalHeading {
  margin: 0;
  font-size: 1rem;
}
</style>
