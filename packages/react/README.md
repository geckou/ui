# @geckou/ui-react

Web（React 19 / Next.js）用の UI コンポーネント集。

ロジックは [`@geckou/ui-core`](../core) が持ち、このパッケージは DOM の記述だけを担当する。
同じ core を [`@geckou/ui-vue`](../vue) も使うため、バリデーション・日付処理の挙動は両者で一致する。

Mobile（Expo / NativeWind）では使えない（DOM 前提のため）。

## インストール

```bash
yarn add @geckou/ui-react
```

ビルド済みの JavaScript と型定義（`dist/`）を配布しています。トランスパイルの設定は要りません。

1. グローバル CSS に `@import '@geckou/ui-react/styles/tokens.css';` を追加（デザイントークン）
2. Tailwind を使う場合は、配布物をスキャン対象に加える

**Tailwind CSS v4 が必須です。** コンポーネントは `bg-(--background-color)`、
`rounded-(--radius-size)`、`flex-none!` のような v4 の記法を直書きしているため、
v3 ではこれらのクラスが生成されません。v4 はスキャン対象を CSS 側の `@source` で指定します。

```css
/* グローバル CSS */
@import 'tailwindcss';
@source '../node_modules/@geckou/ui-react/dist';

@import '@geckou/ui-react/styles/tokens.css';
```

`@source` のパスは、その CSS ファイルからの相対で書きます。

`'use client'` はビルド後も各ファイルの先頭に残るので、Next.js の App Router では
Server Component から直接 import できます（状態を持つコンポーネントだけが Client Component になります）。

> **0.1.1 以前から更新する場合**: ソース配布をやめたため、`next.config.ts` の
> `transpilePackages` から `'@geckou/ui-react'` を外し、Tailwind のスキャン対象を
> `src/**/*.{ts,tsx}` から `dist` に変えてください。`transpilePackages` は
> 残しても動きますが、スキャン対象が `src` のままだとクラスが検出されずスタイルが当たりません。

`tokens.css` は既定値です。上書きする変数の一覧はリポジトリの [README](../../README.md#design-tokens) を参照してください。

## 使い方

```tsx
import { TextBox, BasicButton, ModalBox } from '@geckou/ui-react'
```

### フォーム全体の検証状態

`useFormValidation` で各入力の検証結果を集約する。
Vue 版の `FormValidationManager` と同じストア（`@geckou/ui-core`）を使う。
**`store` を入力コンポーネントの `formValidationStore` に渡してください**（渡さない入力は集計されません）。
対応しているのは `DatePicker` / `DateRangePicker` / `DateSelector`。

```tsx
const { isAllValid, store } = useFormValidation()
const [startedOn, setStartedOn] = useState('')
const [period, setPeriod] = useState({ start: '', end: '' })

return (
  <form>
    <DatePicker
      name="startedOn"
      value={startedOn}
      onChange={setStartedOn}
      isRequired
      formValidationStore={store}
    />
    <DateRangePicker name="period" value={period} onChange={setPeriod} />
    <button disabled={!isAllValid}>送信</button>
  </form>
)
```

props は Vue 版（`@geckou/ui-vue`）と揃えている。`v-model` にあたるものが
`value` + `onChange` になるだけで、名前と意味は同じ。

| Component | value | 主な props |
|-----------|-------|-----------|
| `DatePicker` | `string`（`YYYY-MM-DD` / `type="month"` なら `YYYY-MM`） | `name` / `isRequired` / `isDisabled` / `minDate` / `maxDate` / `size` / `type` / `formValidationStore` |
| `DateRangePicker` | `{ start: string; end: string }` | `DatePicker` と同じ（開始日と終了日の min / max が自動連動）。各入力の name は `<name>Start` / `<name>End` |
| `DateSelector` | `string`（`YYYY-MM-DD` / `type="month"` なら `YYYY-MM`） | `name` / `isRequired` / `type` / `formValidationStore` |

## 収録コンポーネント

フォーム系 25 種（`TextBox` / `TextArea` / `SelectBox` / `SearchableSelectBox` / `CheckBox` 系 /
`RadioButtons` / `ToggleButton` / `DatePicker` / `DateRangePicker` / `DateSelector` /
`FileInput` / `ModalBox` / `PopupBox` / `DropdownUi` / `SlideDownUi` / `TabUI` ほか）とアイコン 5 種。

記事一覧（ArticleList）は Vue 版のみに収録している。

## テスト

```bash
yarn workspace @geckou/ui-react test
```

## License

[MIT](../../LICENSE)
