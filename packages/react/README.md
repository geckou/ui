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

## License

[MIT](../../LICENSE)
