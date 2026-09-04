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

Vue 本体は同梱していません。プロジェクト側の Vue 3.5 以上を使います（`peerDependencies`）。
3.5 未満では `onScopeDispose(fn, true)` と `useId()` が無いため動きません。

⚠️ **1 ページに複数の Vue アプリをマウントする場合は、アプリごとに
`app.config.idPrefix` を変えてください。** DOM id と `RadioButtons` のグループ
`name` は `useId()` で採番しており（SSR と client で一致させるため）、既定の
prefix はどのアプリでも同じです。分けないと、別アプリのラジオグループが同じ
`name` になって片方を選ぶともう片方の選択が外れます。`RadioButtons` に `name` を
明示すれば個別に回避できます。

```ts
const app = createApp(App)
app.config.idPrefix = 'checkout'
```

## Usage

```ts
import { createApp } from 'vue'
import GeckouUi from '@geckou/ui-vue'
import '@geckou/ui-vue/style.css'
import App from './App.vue'

createApp(App).use(GeckouUi).mount('#app')
```

**スタイルの読み込みが必要です。** コンポーネントの `<style module>` はビルド時に
`dist/style.css` へまとめて出しているため、`@geckou/ui-vue/style.css` を 1 度読み込んでください
（ソース配布だった 0.3.1 以前は不要でした）。

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

`DatePicker` / `DateSelector` の年月日欄の読み上げ名は、既定では `name` から作られます
（`name="startedOn"` なら「startedOnの年」）。`CheckBox` と同じ `ariaLabel` / `ariaLabelledBy`
を渡すと、そちらを土台に「の年」「の月」「の日」を繋げます。可視ラベルがあるなら
`ariaLabelledBy` でその要素を指してください（WCAG 2.5.3 Label in Name）。

```vue
<DatePicker v-model="startedOn" name="startedOn" ariaLabel="開始日" />
<DatePicker v-model="startedOn" name="startedOn" :ariaLabelledBy="labelId" />
```

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
| `DateSelector` | `string`（`YYYY-MM-DD` / `type="month"` なら `YYYY-MM`） | `name` / `isRequired` / `type` / `formValidationManager` |

React 版（`@geckou/ui-react`）も同じ props 構成です（`v-model` が `value` + `onChange` になります）。

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

| Prop Name | Type               | Required | Description                                          |
|-----------|--------------------|----------|------------------------------------------------------|
| `id`      | `string \| number` | ✅       | WordPress のカテゴリ ID（REST の数値 ID もそのまま可）|
| `name`    | `string`           | ✅       | 表示するカテゴリ名                                   |

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
| `inputType`        | `string`                    | ❌       | `text`             | `input` の `type` 属性                         |
| `isDisabled`       | `boolean`                   | ❌       | `false`            | テキストボックスの活性/非活性                  |
| `isRequired`       | `boolean`                   | ❌       | `false`            | 必須項目かどうか                               |
| `maxLength`        | `number`                    | ❌       | `30`               | 最大入力文字数                                 |
| `autocomplete`     | `string`                    | ❌       | `off`              | `autocomplete`属性                             |
| `validates`        | `Validates[]`               | ❌       | `[]`               | バリデーションの設定                           |


## Design tokens

**トークンの一覧はルートの [README](../../README.md#design-tokens) が正。**
ここに挙げるのは、そのうちフォールバックを持つもの（未定義でも壊れない）だけ。

⚠️ `--sp-*` / `--white` / `--gray` / `--radius-small` / `--icon-medium` などは
**フォールバックを持たない**。未定義だと padding が消える等、普通に崩れるので、
`:root` で定義すること。

| トークン | 既定値 | 使う場所 |
|---|---|---|
| `--overlay-color` | `rgba(0, 8, 26, 0.5)` | ModalBox の背面 |
| `--shadow-color` | `rgba(21, 20, 58, 0.12)` | ModalBox の drop-shadow |
| `--z-index-overlay` | `90` | ModalBox / PopupBox の重なり |
| `--z-index-nav` | `70` | ModalBox の閉じるボタン（+1 で重ねる） |
| `--contents-max-width` | `1440px` | ModalBox の最大幅、PopupBox の左右位置 |
| `--global-header-height` | `0px` | PopupBox の上端 |
| `--mobile-lower-width` | `430px` | PopupBox の最大幅 |
| `--small-icon-size` | `0.9375rem` | ArticleList のアイコン |
| `--medium-icon-size` | `1.125rem` | アイコン全般（`mixin.scss` の既定） |

定義例はデモの `demo/styles/base.scss` を参照。

## 0.7.0 の変更

- `DatePicker` / `DateSelector` が `ariaLabel` / `ariaLabelledBy` を受ける
  （未指定なら従来どおり `name` から読み上げ名を作る）
- `CheckBox` / `ToggleButton` が `<button>` の中に `<input>` を置かなくなった。
  状態は `<button>` の `data-checked` / `disabled` で表し、送信用の入力は
  チェック時だけ `<input type="hidden">` として `<button>` の外に描かれる。
  `:has(input:checked)` などで見た目を上書きしていた場合は追従が要る
- `CheckBox` が `isDisabled` のとき `<button disabled>` を出す（Tab で止まらなくなる）
- `ArticleList` の `CardHeading` が `heading` を HTML として描画する
  （WordPress の `title.rendered` のエンティティがそのまま出ていた）。
  WP 以外から渡す場合は埋め込む前にサニタイズすること
- `ModalBox` が開いている間、Tab / Shift+Tab をダイアログ内で循環させる（フォーカストラップ）

## 0.6.0 の破壊的変更

- `ModalBox` のイベント名が `closeModal` → `close`（React の `onClose` と揃えた）。
  親が `isShown=false` にしたときと unmount 時には emit しなくなった
- `TabUI` の `cssStyle` prop を削除（宣言のみで未使用だった）。`color.text` は配線した
- `CheckBox` / `ToggleButton` のロールが `aria-pressed` から
  `role="checkbox" + aria-checked` / `role="switch" + aria-checked` に変わった。
  アクセシブル名は `ariaLabel` / `ariaLabelledBy` で渡せる（未指定なら従来どおり `name`）
- id の採番が `useId()` になり、Vue 3.5 未満では動かない（→ Installation）
- `dist` が `preserveModules` 構成になった（`import '@geckou/ui-vue/style.css'` は引き続き必要）
- `DateSelector` に `minYear` / `maxYear` を追加（既定は従来どおり「今年 -100 〜 今年 -14」）
- `DateRangePicker` が範囲（開始 > 終了）を検証し、`<name>Range` という名前で
  `FormValidationManager` に登録する。`invalidNames` を見ている場合は増える

## License

[MIT](../../LICENSE)
