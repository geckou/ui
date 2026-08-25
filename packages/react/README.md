# @geckou/ui-react

Web（React 19 / Next.js）用の UI コンポーネント集。

ロジックは [`@geckou/ui-core`](../core) が持ち、このパッケージは DOM の記述だけを担当する。
同じ core を [`@geckou/ui-vue`](../vue) も使うため、バリデーション・日付処理の挙動は両者で一致する。

Mobile（Expo / NativeWind）では使えない（DOM 前提のため）。

## インストール

```bash
yarn add @geckou/ui-react
```

ソースをそのまま配布しているため、利用側でトランスパイルの対象に含める。

1. `next.config.ts` の `transpilePackages` に `'@geckou/ui-react'` を追加
2. `tailwind.config.ts` の `content` に `'./node_modules/@geckou/ui-react/src/**/*.{ts,tsx}'` を追加
3. グローバル CSS に `@import '@geckou/ui-react/styles/tokens.css';` を追加（デザイントークン）

## 使い方

```tsx
import { TextBox, BasicButton, ModalBox } from '@geckou/ui-react'
```

### フォーム全体の検証状態

`useFormValidation` で各入力の検証結果を集約する。
Vue 版の `FormValidationManager` と同じストア（`@geckou/ui-core`）を使う。

```tsx
const { isAllValid, store } = useFormValidation()

return (
  <form>
    <DatePicker name="startedOn" isRequired />
    <button disabled={!isAllValid}>送信</button>
  </form>
)
```

## 収録コンポーネント

フォーム系 25 種（`TextBox` / `TextArea` / `SelectBox` / `SearchableSelectBox` / `CheckBox` 系 /
`RadioButtons` / `ToggleButton` / `DatePicker` / `DateRangePicker` / `DateSelector` /
`FileInput` / `ModalBox` / `PopupBox` / `DropdownUi` / `SlideDownUi` / `TabUI` ほか）とアイコン 5 種。

記事一覧（ArticleList）は Vue 版のみに収録している。

## テスト

```bash
yarn workspace @geckou/ui-react test
```
