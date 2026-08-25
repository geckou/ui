# @geckou/ui-vue

Vue 3 用の再利用可能な UI コンポーネント集。
入力フォーム系のコンポーネントと、WordPress REST API の記事データをそのまま渡せる記事一覧コンポーネント（10 レイアウト）を収録しています。

バリデーション・日付処理などのロジックは [`@geckou/ui-core`](../core) が持ちます。
同じ core を [`@geckou/ui-react`](../react) も使うため、両者の挙動は一致します。

**デモサイト: https://ui.geckou.net/**

## Installation

```bash
yarn add @geckou/ui-vue
```

Vue 本体は同梱していません。プロジェクト側の Vue 3.0 以上を使います（`peerDependencies`）。

## Usage

```ts
import { createApp } from 'vue'
import GeckouUi from '@geckou/ui-vue'
import App from './App.vue'

createApp(App).use(GeckouUi).mount('#app')
```

```ts
// 個別インポート
import { TextBox, StandardList } from '@geckou/ui-vue'
```

デザイントークン（CSS カスタムプロパティ）の定義はリポジトリの [README](../../README.md#design-tokens) を参照してください。

## Components

### Form

`TextBox` / `TextArea` / `SelectBox` / `CheckBox` / `CheckBoxes` / `CheckButton` /
`LabeledCheckbox` / `LabeledFieldset` / `RadioButtons` / `ToggleButton` / `BasicButton` /
`TextButton` / `InputBox` / `InputGroup` / `TabUI` / `SlideDownUi` / `DropdownUi` /
`ModalBox` / `PopupBox` / `LoadingSpinner` / `ErrorMessage`

### Date

`DatePicker` / `DateRangePicker` / `DateSelector`

`FormValidationManager` を渡すと、フォーム内の各入力の検証結果をまとめて追跡できます。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { DatePicker, DateRangePicker, FormValidationManager } from '@geckou/ui-vue'

const manager = new FormValidationManager()
const startedOn = ref('')
const period = ref({ start: '', end: '' })
// manager.isAllValid.value / manager.invalidNames.value で状態を参照する
</script>

<template>
  <DatePicker
    v-model="startedOn"
    name="startedOn"
    :formValidationManager="manager"
    isRequired
  />
  <DateRangePicker
    v-model="period"
    name="period"
  />
  <button :disabled="!manager.isAllValid.value">送信</button>
</template>
```

| Component | modelValue | 主な props |
|-----------|-----------|-----------|
| `DatePicker` | `string`（`YYYY-MM-DD` / `type="month"` なら `YYYY-MM`） | `name` / `isRequired` / `isDisabled` / `minDate` / `maxDate` / `size` / `type` / `formValidationManager` |
| `DateRangePicker` | `{ start: string; end: string }` | `DatePicker` と同じ（開始日と終了日の min / max が自動連動） |
| `DateSelector` | `string`（`YYYY-MM-DD`） | `name` / `isRequired` / `type` / `formValidationManager` |

### Article List

`StandardList` / `RoundedList` / `ArtisticList` / `TileList` / `SimpleList` /
`RowList` / `NewsList` / `EntertainmentList` / `GalleryList` / `GridList`

WordPress REST API（`?_embed` 付き）のレスポンス配列をそのまま渡せます。

```vue
<script setup lang="ts">
import type { Category, ListSettings } from '@geckou/ui-vue'
import { StandardList } from '@geckou/ui-vue'

const settings: ListSettings = {
  domainToUse: 'example.com',
  postConfig : {
    article_page_path: '/article/',
    query_key_name   : 'article',
    useAuthor        : true,
    useCategory      : true,
    useTag           : true,
  },
  isEnabledPickUp: true,
}

const categories: Category[] = [{ id: '1', name: 'デザイン' }]
const articles = ref<any[]>([])
</script>

<template>
  <StandardList
    :articles="articles"
    :categories="categories"
    :settings="settings"
  />
</template>
```

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `articles` | `any[]` | ✅ | WordPress REST API のレスポンス配列 |
| `categories` | `Category[]` | ✅ | カテゴリ ID と表示名の対応 |
| `settings` | `ListSettings` | ✅ | 記事リンクの組み立て設定と表示オプション |
| `columnNumber` | `number` | `GridList` のみ ✅ | グリッドのカラム数 |

## Types

### `BorderStyle`

| Prop Name           | Type            | Required | Description                                                |
|---------------------|-----------------|----------|------------------------------------------------------------|
| `color`             | `string`        | ✅       | ボーダーの色                                               |
| `size`              | `string`        | ✅       | ボーダーの太さ                                             |
| `radius`            | `string`        | ✅       | 角丸の大きさ                                               |

### `InputBoxStyle`

| Prop Name           | Type            | Required | Description                                                |
|---------------------|-----------------|----------|------------------------------------------------------------|
| `textColor`         | `string`        | ❌       | テキストの色                                               |
| `placeholderColor`  | `string`        | ❌       | プレスホルダーの色                                         |
| `border`            | `BorderStyle`   | ❌       | ボーダーのスタイル                                         |
| `backgroundColor`   | `string`        | ❌       | 背景色                                                     |
| `boxShadow`         | `string`        | ❌       | 影のスタイル                                               |

### `InputBoxStyleForEachStatus`

| Prop Name | Type                   | Required | Description                                                |
|-----------|------------------------|----------|------------------------------------------------------------|
| `default` | `InputBoxStyle`        | ✅       | デフォルトのスタイル                                        |
| `error`   | `InputBoxStyle`        | ❌       | エラー時のスタイル                                         |
| `disabled`| `InputBoxStyle`        | ❌       | 非活性時のスタイル                                         |
| `valid`   | `InputBoxStyle`        | ❌       | 入力した値が有効な時のスタイル                             |
| `focus`   | `InputBoxStyle`        | ❌       | フォーカス時のスタイル                                     |

### `ButtonStyle`

| Prop Name          | Type            | Required | Description                                                |
|--------------------|-----------------|----------|------------------------------------------------------------|
| `textColor`        | `string`        | ❌       | Specifies the button text color.                          |
| `border`           | `BorderStyle`   | ❌       | Defines the border style for the button.                  |
| `backgroundColor`  | `string`        | ❌       | Specifies the button's background color.                  |
| `backgroundImage`  | `string`        | ❌       | Specifies the background image or gradient.               |
| `boxShadow`        | `string`        | ❌       | Specifies the box shadow for the button.                  |

### `ButtonStyleForEachStatus`

| Prop Name | Type            | Required | Description                                                |
|-----------|-----------------|----------|------------------------------------------------------------|
| `default` | `ButtonStyle`   | ✅      | The style applied in the default state.                   |
| `hover`   | `ButtonStyle`   | ❌       | The style applied when the button is hovered.             |
| `disabled`| `ButtonStyle`   | ❌       | The style applied when the button is disabled.            |

### `CheckBoxStyle`

| Prop Name          | Type            | Required | Description                                                |
|--------------------|-----------------|----------|------------------------------------------------------------|
| `border`           | `BorderStyle`   | ❌       | Defines the border style for the checkbox.                |
| `backgroundColor`  | `string`        | ❌       | Specifies the background color for the checkbox.          |

### `CheckBoxStyleForEachStatus`

| Prop Name | Type             | Required | Description                                                |
|-----------|------------------|----------|------------------------------------------------------------|
| `default` | `CheckBoxStyle`  | ✅      | The style applied in the default state.                   |
| `disabled`| `CheckBoxStyle`  | ❌       | The style applied when the checkbox is disabled.          |

### `RadioButtonStyle`

| Prop Name          | Type                           | Required | Description                                                |
|--------------------|--------------------------------|----------|------------------------------------------------------------|
| `border`           | `Omit<BorderStyle, 'radius'>` | ❌       | Defines the border style without a border radius.         |
| `backgroundColor`  | `string`                      | ❌       | Specifies the background color for the radio button.      |

### `RadioButtonStyleForEachStatus`

| Prop Name | Type                 | Required | Description                                                |
|-----------|----------------------|----------|------------------------------------------------------------|
| `default` | `RadioButtonStyle`   | ✅      | The style applied in the default state.                   |
| `disabled`| `RadioButtonStyle`   | ❌       | The style applied when the radio button is disabled.      |

### `Validates`

| Prop Name  | Type       | Required | Description                                                |
|------------|------------|----------|------------------------------------------------------------|
| `regex`    | `RegExp`   | ✅      | The regular expression used for validation.               |
| `message`  | `string`   | ✅      | The error message displayed when validation fails.        |

### `Category`

| Prop Name | Type     | Required | Description                    |
|-----------|----------|----------|--------------------------------|
| `id`      | `string` | ✅       | WordPress のカテゴリ ID        |
| `name`    | `string` | ✅       | 表示するカテゴリ名             |

### `PostConfig`

| Prop Name           | Type      | Required | Description                                          |
|---------------------|-----------|----------|------------------------------------------------------|
| `article_page_path` | `string`  | ✅       | 記事詳細ページのパス                                 |
| `query_key_name`    | `string`  | ✅       | 記事 ID を渡すクエリキー                             |
| `useAuthor`         | `boolean` | ❌       | 著者を表示するか                                     |
| `useCategory`       | `boolean` | ❌       | カテゴリを表示するか                                 |
| `useTag`            | `boolean` | ❌       | タグを表示するか                                     |

### `ListSettings`

| Prop Name         | Type         | Required | Description                                |
|-------------------|--------------|----------|--------------------------------------------|
| `domainToUse`     | `string`     | ✅       | 記事リンクに使うドメイン                   |
| `postConfig`      | `PostConfig` | ✅       | 記事詳細ページの組み立て設定               |
| `isEnabledPickUp` | `boolean`    | ✅       | 先頭の記事を大きく表示するか               |

## Component Props (Form)
### `TextBox`

| Prop Name          | Type                        | Required | Default            | Description                                    |
|--------------------|-----------------------------|----------|--------------------|------------------------------------------------|
| `modelValue`       | `string \| number`          | ✅       | -                  | テキストボックスの値                           |
| `name`             | `string`                    | ✅       | -                  | `name`属性                                     |
| `cssStyle`         | `InputBoxStyleForEachStatus`| ❌       | -                  | テキストボックスのスタイル                     |
| `type`             | `string`                    | ❌       | `text`             | テキストボックスのタイプ                       |
| `isDisabled`       | `boolean`                   | ❌       | `false`            | テキストボックスの活性/非活性                  |
| `isRequired`       | `boolean`                   | ❌       | `false`            | 必須項目かどうか                               |
| `maxLength`        | `number`                    | ❌       | `30`               | 最大入力文字数                                 |
| `autocomplete`     | `string`                    | ❌       | `off`              | `autocomplete`属性                             |
| `validates`        | `Validates[]`               | ❌       | `[]`               | バリデーションの設定                           |


## License

[MIT](../../LICENSE)
